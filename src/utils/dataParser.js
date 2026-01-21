// Parse Konveyor data into graph format for force-directed visualization
export const parseGraphData = (konveyorData) => {
  const nodes = konveyorData.components.map(component => ({
    id: component.id,
    name: component.name,
    type: component.type,
    issues: component.issues.length,
    linesOfCode: component.linesOfCode,
    technology: component.technology,
    fullData: component,
  }));

  const links = konveyorData.dependencies.map(dep => ({
    source: dep.source,
    target: dep.target,
    type: dep.type,
  }));

  return { nodes, links };
};

// Calculate metrics from Konveyor data
export const calculateMetrics = (konveyorData) => {
  let critical = 0;
  let warning = 0;
  let info = 0;
  let totalIssues = 0;

  konveyorData.components.forEach(component => {
    component.issues.forEach(issue => {
      totalIssues++;
      if (issue.severity === 'critical') critical++;
      else if (issue.severity === 'warning') warning++;
      else if (issue.severity === 'info') info++;
    });
  });

  // Calculate health score (0-100)
  // Formula: 100 - (critical * 2 + warning * 1 + info * 0.5) / totalComponents
  const totalComponents = konveyorData.components.length;
  const penalty = (critical * 2 + warning * 1 + info * 0.5) / totalComponents;
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  return {
    totalIssues,
    critical,
    warning,
    info,
    healthScore,
  };
};

// Group issues by type
export const getIssuesByType = (konveyorData) => {
  const issueTypes = {};

  konveyorData.components.forEach(component => {
    component.issues.forEach(issue => {
      if (!issueTypes[issue.type]) {
        issueTypes[issue.type] = 0;
      }
      issueTypes[issue.type]++;
    });
  });

  return issueTypes;
};

// Get issues by component for heatmap
export const getIssuesByComponent = (konveyorData) => {
  return konveyorData.components.map(component => ({
    component: component.name,
    issues: component.issues.length,
    severity: component.issues.length > 20 ? 'critical' :
              component.issues.length > 5 ? 'warning' : 'good',
  }));
};

// Get all technologies with their status
export const getTechnologies = (konveyorData) => {
  const technologies = [];

  konveyorData.components.forEach(component => {
    const tech = component.technology;

    if (tech.language) {
      technologies.push({
        name: `${tech.language}${tech.version ? ' ' + tech.version : ''}`,
        status: tech.frameworkStatus || tech.status || 'current',
        component: component.name,
      });
    }

    if (tech.framework) {
      technologies.push({
        name: tech.framework,
        status: tech.frameworkStatus || 'current',
        component: component.name,
      });
    }

    if (tech.type) {
      technologies.push({
        name: `${tech.type}${tech.version ? ' ' + tech.version : ''}`,
        status: tech.status || 'current',
        component: component.name,
      });
    }
  });

  return technologies;
};
