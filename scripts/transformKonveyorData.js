#!/usr/bin/env node
/**
 * Transforms Konveyor analysis output.yaml to the visualization format
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// Read the Konveyor output.yaml
const analysisPath = process.argv[2] || '../coolstore-analysis/output.yaml';
const outputPath = process.argv[3] || './src/data/sampleData.json';

console.log(`Reading Konveyor analysis from: ${analysisPath}`);
const yamlContent = fs.readFileSync(analysisPath, 'utf8');
const data = yaml.load(yamlContent);

// Map severity from category
function mapSeverity(category) {
  if (!category) return 'info';
  switch (category.toLowerCase()) {
    case 'mandatory':
      return 'critical';
    case 'potential':
      return 'warning';
    case 'optional':
      return 'info';
    default:
      return 'info';
  }
}

// Extract file path from URI
function extractFilePath(uri) {
  if (!uri) return '';
  const match = uri.match(/file:\/\/(.+)/);
  return match ? match[1] : uri;
}

// Extract component name from file path
function extractComponentFromPath(filePath) {
  // Extract meaningful component from path
  // e.g., /path/to/src/main/java/com/redhat/coolstore/service/OrderService.java -> service
  const parts = filePath.split('/');

  if (parts.includes('model')) return 'model';
  if (parts.includes('service')) return 'service';
  if (parts.includes('rest')) return 'rest';
  if (parts.includes('persistence')) return 'persistence';
  if (parts.includes('utils')) return 'utils';
  if (parts.includes('webapp') || filePath.includes('.html') || filePath.includes('.js') || filePath.includes('.css')) return 'webapp';
  if (filePath.includes('pom.xml')) return 'build-config';

  return 'core';
}

// Process the Konveyor data
const components = new Map();
const allIssues = [];
let issueIdCounter = 1;

// Process each ruleset
data.forEach(ruleset => {
  if (!ruleset.violations) return;

  Object.entries(ruleset.violations).forEach(([ruleId, violation]) => {
    if (!violation.incidents || violation.incidents.length === 0) return;

    const severity = mapSeverity(violation.category);
    const effort = violation.effort || 1;

    violation.incidents.forEach((incident, idx) => {
      const filePath = extractFilePath(incident.uri);
      const componentName = extractComponentFromPath(filePath);

      // Create or update component
      if (!components.has(componentName)) {
        components.set(componentName, {
          id: componentName,
          name: componentName.charAt(0).toUpperCase() + componentName.slice(1),
          type: componentName === 'webapp' ? 'frontend' :
                componentName === 'rest' ? 'middleware' :
                componentName === 'build-config' ? 'infrastructure' : 'backend',
          linesOfCode: 0,
          technology: {
            language: filePath.endsWith('.java') ? 'Java' :
                     filePath.endsWith('.xml') ? 'XML' :
                     filePath.endsWith('.js') ? 'JavaScript' : 'Other',
            framework: 'Java EE 7 / JBoss EAP 7.4',
            frameworkStatus: 'outdated'
          },
          issues: [],
          dependencies: []
        });
      }

      const component = components.get(componentName);

      // Create issue
      const issue = {
        id: `issue-${issueIdCounter++}`,
        title: violation.description || `${ruleId} violation`,
        type: extractIssueType(violation, ruleId),
        severity: severity,
        description: incident.message || violation.description || '',
        location: `${path.basename(filePath)}${incident.lineNumber ? `:${incident.lineNumber}` : ''}`,
        effort: effort,
        ruleId: ruleId
      };

      component.issues.push(issue);
      allIssues.push(issue);
    });
  });
});

// Extract issue type from violation
function extractIssueType(violation, ruleId) {
  const description = (violation.description || '').toLowerCase();
  const labels = violation.labels || [];

  // Check rule ID patterns first for more specific categorization
  if (ruleId.includes('hibernate')) {
    return 'Hibernate/Persistence';
  }
  if (ruleId.includes('persistence')) {
    return 'Persistence';
  }
  if (ruleId.includes('cdi-to-quarkus')) {
    return 'CDI Changes';
  }
  if (ruleId.includes('ee-to-quarkus') || ruleId.includes('ejb')) {
    return 'Java EE to CDI';
  }
  if (ruleId.includes('jms-to-reactive')) {
    return 'Messaging';
  }
  if (ruleId.includes('jaxrs')) {
    return 'REST/JAX-RS';
  }
  if (ruleId.includes('pom-to-quarkus') || ruleId.includes('maven')) {
    return 'Build Configuration';
  }
  if (ruleId.includes('security')) {
    return 'Security';
  }

  // Then check description content
  if (description.includes('security')) {
    return 'Security';
  }
  if (description.includes('deprecated') || description.includes('outdated')) {
    return 'Deprecated APIs';
  }
  if (description.includes('performance')) {
    return 'Performance';
  }
  if (description.includes('stateless') || description.includes('stateful')) {
    return 'Java EE to CDI';
  }
  if (description.includes('persistence') || description.includes('hibernate') || description.includes('entitymanager')) {
    return 'Hibernate/Persistence';
  }
  if (description.includes('cdi') || description.includes('inject') || description.includes('produces')) {
    return 'CDI Changes';
  }

  // Generic Quarkus migration as fallback
  if (labels.some(l => l.includes('quarkus'))) {
    return 'Quarkus Migration';
  }

  return 'Code Quality';
}

// Calculate lines of code estimates (rough estimate based on issues)
components.forEach(component => {
  // Rough estimate: 100 LOC per issue + base 1000
  component.linesOfCode = 1000 + (component.issues.length * 100);
});

// Create dependencies based on typical architecture
const dependencies = [];
const componentIds = Array.from(components.keys());

// Main application flow
if (components.has('webapp') && components.has('rest')) {
  dependencies.push({ source: 'webapp', target: 'rest', type: 'http' });
}
if (components.has('rest') && components.has('service')) {
  dependencies.push({ source: 'rest', target: 'service', type: 'internal' });
}
if (components.has('service') && components.has('model')) {
  dependencies.push({ source: 'service', target: 'model', type: 'internal' });
}
if (components.has('service') && components.has('persistence')) {
  dependencies.push({ source: 'service', target: 'persistence', type: 'internal' });
}
if (components.has('persistence') && components.has('model')) {
  dependencies.push({ source: 'persistence', target: 'model', type: 'internal' });
}

// Utils connections - typically used by service layer
if (components.has('service') && components.has('utils')) {
  dependencies.push({ source: 'service', target: 'utils', type: 'internal' });
}
if (components.has('persistence') && components.has('utils')) {
  dependencies.push({ source: 'persistence', target: 'utils', type: 'internal' });
}

// Core connections - foundational component
if (components.has('core')) {
  if (components.has('service')) {
    dependencies.push({ source: 'service', target: 'core', type: 'internal' });
  }
  if (components.has('rest')) {
    dependencies.push({ source: 'rest', target: 'core', type: 'internal' });
  }
}

// Build config - connect to main entry point to keep it visible in the graph
// Even though it's not a runtime dependency, it's important for migration
if (components.has('build-config') && components.has('webapp')) {
  dependencies.push({ source: 'build-config', target: 'webapp', type: 'build' });
}

// Calculate summary metrics
const componentsArray = Array.from(components.values());
const summary = {
  totalComponents: componentsArray.length,
  totalIssues: allIssues.length,
  linesOfCode: componentsArray.reduce((sum, c) => sum + c.linesOfCode, 0),
  critical: allIssues.filter(i => i.severity === 'critical').length,
  warning: allIssues.filter(i => i.severity === 'warning').length,
  info: allIssues.filter(i => i.severity === 'info').length
};

// Create final output
const output = {
  applicationName: 'Coolstore (Konveyor Analysis)',
  analysisDate: new Date().toISOString().split('T')[0],
  summary: summary,
  components: componentsArray,
  dependencies: dependencies
};

// Write output
console.log(`\nAnalysis Summary:`);
console.log(`  Components: ${summary.totalComponents}`);
console.log(`  Total Issues: ${summary.totalIssues}`);
console.log(`    - Critical: ${summary.critical}`);
console.log(`    - Warning: ${summary.warning}`);
console.log(`    - Info: ${summary.info}`);
console.log(`  Estimated LOC: ${summary.linesOfCode.toLocaleString()}`);

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`\nTransformed data written to: ${outputPath}`);
