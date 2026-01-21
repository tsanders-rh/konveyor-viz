// Severity color mapping
export const severityColors = {
  critical: '#ff6b6b',
  warning: '#ffd93d',
  info: '#6c757d',
  good: '#95e1d3',
};

// Get color based on issue count
export const getNodeColor = (issueCount) => {
  if (issueCount > 20) return severityColors.critical;
  if (issueCount > 5) return severityColors.warning;
  return severityColors.good;
};

// Get color based on severity level
export const getSeverityColor = (severity) => {
  return severityColors[severity] || severityColors.info;
};

// Get technology status color
export const getTechnologyStatusColor = (status) => {
  const statusColors = {
    eol: severityColors.critical,
    outdated: severityColors.warning,
    current: severityColors.good,
  };
  return statusColors[status] || severityColors.info;
};

// Get severity badge class for Tailwind
export const getSeverityBadgeClass = (severity) => {
  const classes = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  return classes[severity] || classes.info;
};
