/**
 * Shared Konveyor Kantra Analysis Transformer
 * Works in both Node.js (backend) and browser (frontend) environments
 */

import yaml from 'js-yaml';

/**
 * Parse YAML content into JavaScript object
 * @param {string} yamlContent - Raw YAML content
 * @returns {Array} Parsed kantra rulesets
 */
export function parseKantraYaml(yamlContent) {
  try {
    return yaml.load(yamlContent);
  } catch (error) {
    throw new Error(`Failed to parse YAML: ${error.message}`);
  }
}

/**
 * Map kantra category to visualization severity
 * @param {string} category - Kantra category (mandatory/optional/potential)
 * @returns {string} Severity level (critical/warning/info)
 */
export function mapSeverity(category) {
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

/**
 * Extract file path from file:// URI
 * @param {string} uri - File URI from kantra incident
 * @returns {string} Extracted file path
 */
export function extractFilePath(uri) {
  if (!uri) return '';
  const match = uri.match(/file:\/\/(.+)/);
  return match ? match[1] : uri;
}

/**
 * Extract component name from file path
 * @param {string} filePath - Full file path
 * @returns {string} Component name
 */
export function extractComponentFromPath(filePath) {
  const parts = filePath.split('/');

  // Check for common directory patterns
  if (parts.includes('model')) return 'model';
  if (parts.includes('service')) return 'service';
  if (parts.includes('rest') || parts.includes('api')) return 'rest';
  if (parts.includes('persistence') || parts.includes('dao') || parts.includes('repository')) return 'persistence';
  if (parts.includes('utils') || parts.includes('util')) return 'utils';
  if (parts.includes('webapp') || parts.includes('web') || filePath.match(/\.(html|jsp|css|js)$/)) return 'webapp';
  if (filePath.includes('pom.xml') || filePath.includes('build.gradle') || filePath.includes('package.json')) return 'build-config';
  if (parts.includes('config') || parts.includes('configuration')) return 'config';
  if (parts.includes('controller')) return 'controller';

  return 'core';
}

/**
 * Determine component type from component name
 * @param {string} componentName - Component identifier
 * @returns {string} Component type
 */
export function determineComponentType(componentName) {
  switch (componentName) {
    case 'webapp':
    case 'web':
      return 'frontend';
    case 'rest':
    case 'api':
    case 'controller':
      return 'middleware';
    case 'build-config':
    case 'config':
      return 'infrastructure';
    case 'model':
    case 'service':
    case 'persistence':
    case 'utils':
    case 'core':
    default:
      return 'backend';
  }
}

/**
 * Detect language from file path
 * @param {string} filePath - File path
 * @returns {string} Programming language
 */
export function detectLanguage(filePath) {
  if (filePath.endsWith('.java')) return 'Java';
  if (filePath.endsWith('.xml')) return 'XML';
  if (filePath.endsWith('.js')) return 'JavaScript';
  if (filePath.endsWith('.ts')) return 'TypeScript';
  if (filePath.endsWith('.py')) return 'Python';
  if (filePath.endsWith('.go')) return 'Go';
  if (filePath.endsWith('.rb')) return 'Ruby';
  if (filePath.endsWith('.cs')) return 'C#';
  if (filePath.match(/\.(yml|yaml)$/)) return 'YAML';
  if (filePath.match(/\.(html|jsp)$/)) return 'HTML';
  return 'Other';
}

/**
 * Extract framework information from ruleset labels and rule IDs
 * @param {Array} labels - Violation labels
 * @param {string} ruleId - Rule identifier
 * @returns {Object} Framework info
 */
export function extractFramework(labels = [], ruleId = '') {
  let framework = 'Unknown';
  let frameworkStatus = 'current';

  // Check labels for source/target frameworks
  for (const label of labels) {
    if (label.includes('konveyor.io/source=')) {
      const source = label.replace('konveyor.io/source=', '');
      if (source.includes('eap7') || source.includes('java-ee7')) {
        framework = 'Java EE 7 / JBoss EAP 7.4';
        frameworkStatus = 'outdated';
      } else if (source.includes('eap6') || source.includes('java-ee6')) {
        framework = 'Java EE 6 / JBoss EAP 6.x';
        frameworkStatus = 'eol';
      } else if (source.includes('springboot')) {
        framework = 'Spring Boot';
        frameworkStatus = 'current';
      }
    }
  }

  // Infer from rule ID if labels didn't provide info
  if (framework === 'Unknown') {
    if (ruleId.includes('eap7') || ruleId.includes('java-ee')) {
      framework = 'Java EE 7 / JBoss EAP 7.4';
      frameworkStatus = 'outdated';
    } else if (ruleId.includes('springboot')) {
      framework = 'Spring Boot';
      frameworkStatus = 'current';
    } else if (ruleId.includes('quarkus')) {
      framework = 'Quarkus';
      frameworkStatus = 'current';
    }
  }

  return { framework, frameworkStatus };
}

/**
 * Extract issue type from violation data
 * @param {Object} violation - Violation object
 * @param {string} ruleId - Rule identifier
 * @returns {string} Issue type category
 */
export function extractIssueType(violation, ruleId) {
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

/**
 * Create dependency graph based on component relationships
 * @param {Map} componentsMap - Map of component objects
 * @returns {Array} Dependency relationships
 */
export function createDependencies(componentsMap) {
  const dependencies = [];
  const componentNames = Array.from(componentsMap.keys());

  // Java EE/Backend pattern: Main application flow
  if (componentsMap.has('webapp') && componentsMap.has('rest')) {
    dependencies.push({ source: 'webapp', target: 'rest', type: 'http' });
  }
  if (componentsMap.has('rest') && componentsMap.has('service')) {
    dependencies.push({ source: 'rest', target: 'service', type: 'internal' });
  }
  if (componentsMap.has('service') && componentsMap.has('model')) {
    dependencies.push({ source: 'service', target: 'model', type: 'internal' });
  }
  if (componentsMap.has('service') && componentsMap.has('persistence')) {
    dependencies.push({ source: 'service', target: 'persistence', type: 'internal' });
  }
  if (componentsMap.has('persistence') && componentsMap.has('model')) {
    dependencies.push({ source: 'persistence', target: 'model', type: 'internal' });
  }

  // Frontend pattern: webapp → core (for React/Angular apps without backend layers)
  if (componentsMap.has('webapp') && componentsMap.has('core') && !componentsMap.has('rest')) {
    dependencies.push({ source: 'webapp', target: 'core', type: 'internal' });
  }

  // Core connections - foundational component used by others
  if (componentsMap.has('core')) {
    // Backend uses core
    if (componentsMap.has('service')) {
      dependencies.push({ source: 'service', target: 'core', type: 'internal' });
    }
    if (componentsMap.has('rest')) {
      dependencies.push({ source: 'rest', target: 'core', type: 'internal' });
    }
    // If no backend layers, connect other components to core
    if (!componentsMap.has('service') && !componentsMap.has('rest')) {
      componentNames.forEach(name => {
        if (name !== 'core' && name !== 'utils' && name !== 'config' && name !== 'build-config') {
          dependencies.push({ source: name, target: 'core', type: 'internal' });
        }
      });
    }
  }

  // Utils connections - shared utilities used by multiple components
  if (componentsMap.has('utils')) {
    // Connect major components to utils
    const majorComponents = ['webapp', 'service', 'rest', 'persistence', 'core'].filter(c =>
      componentsMap.has(c) && c !== 'utils'
    );

    majorComponents.forEach(comp => {
      dependencies.push({ source: comp, target: 'utils', type: 'internal' });
    });

    // If no major components, connect all to utils
    if (majorComponents.length === 0) {
      componentNames.forEach(name => {
        if (name !== 'utils' && name !== 'config' && name !== 'build-config') {
          dependencies.push({ source: name, target: 'utils', type: 'internal' });
        }
      });
    }
  }

  // Config connections - configuration used by other components
  const configComponents = componentNames.filter(name =>
    name === 'config' || name === 'build-config'
  );

  configComponents.forEach(configName => {
    // Connect config to main entry points
    const entryPoints = ['webapp', 'service', 'rest'].filter(c => componentsMap.has(c));

    if (entryPoints.length > 0) {
      entryPoints.forEach(entry => {
        dependencies.push({ source: configName, target: entry, type: 'build' });
      });
    } else if (componentsMap.has('core')) {
      // If no entry points, connect to core
      dependencies.push({ source: configName, target: 'core', type: 'build' });
    }
  });

  return dependencies;
}

/**
 * Transform kantra analysis data to visualization format
 * @param {Array} kantraData - Parsed kantra rulesets
 * @param {Object} options - Transformation options
 * @returns {Object} Transformed data in sampleData.json format
 */
export function transformToVizFormat(kantraData, options = {}) {
  const {
    applicationName = 'Konveyor Analysis',
    analysisDate = new Date().toISOString().split('T')[0]
  } = options;

  const components = new Map();
  const allIssues = [];
  let issueIdCounter = 1;

  // Process each ruleset
  kantraData.forEach(ruleset => {
    if (!ruleset.violations) return;

    Object.entries(ruleset.violations).forEach(([ruleId, violation]) => {
      if (!violation.incidents || violation.incidents.length === 0) return;

      const severity = mapSeverity(violation.category);
      const effort = violation.effort || 1;

      violation.incidents.forEach((incident) => {
        const filePath = extractFilePath(incident.uri);
        const componentName = extractComponentFromPath(filePath);

        // Create or update component
        if (!components.has(componentName)) {
          const language = detectLanguage(filePath);
          const { framework, frameworkStatus } = extractFramework(violation.labels, ruleId);

          components.set(componentName, {
            id: componentName,
            name: componentName.charAt(0).toUpperCase() + componentName.slice(1),
            type: determineComponentType(componentName),
            linesOfCode: 0,
            technology: {
              language,
              framework,
              frameworkStatus
            },
            issues: [],
            dependencies: []
          });
        }

        const component = components.get(componentName);

        // Extract base filename from path
        const pathParts = filePath.split('/');
        const fileName = pathParts[pathParts.length - 1] || filePath;

        // Create issue
        const issue = {
          id: `issue-${issueIdCounter++}`,
          title: violation.description || `${ruleId} violation`,
          type: extractIssueType(violation, ruleId),
          severity: severity,
          description: incident.message || violation.description || '',
          location: `${fileName}${incident.lineNumber ? `:${incident.lineNumber}` : ''}`,
          effort: effort,
          ruleId: ruleId
        };

        component.issues.push(issue);
        allIssues.push(issue);
      });
    });
  });

  // Calculate lines of code estimates (rough estimate based on issues)
  components.forEach(component => {
    // Rough estimate: 100 LOC per issue + base 1000
    component.linesOfCode = 1000 + (component.issues.length * 100);
  });

  // Create dependencies
  const dependencies = createDependencies(components);

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
  return {
    applicationName,
    analysisDate,
    summary,
    components: componentsArray,
    dependencies
  };
}

/**
 * Main transformation function - parse YAML and transform in one step
 * @param {string} yamlContent - Raw YAML content from output.yaml
 * @param {Object} options - Transformation options
 * @returns {Object} Transformed visualization data
 */
export function transformKantraReport(yamlContent, options = {}) {
  const kantraData = parseKantraYaml(yamlContent);
  return transformToVizFormat(kantraData, options);
}
