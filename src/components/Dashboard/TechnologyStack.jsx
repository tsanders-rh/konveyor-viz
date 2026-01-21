const TechnologyStack = ({ technologies }) => {
  const statusConfig = {
    eol: {
      emoji: '🔴',
      label: 'EOL',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
    },
    outdated: {
      emoji: '🟡',
      label: 'Outdated',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
    },
    current: {
      emoji: '🟢',
      label: 'Current',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
    },
  };

  // Group technologies by status
  const techByStatus = {
    eol: [],
    outdated: [],
    current: [],
  };

  technologies.forEach((tech) => {
    if (techByStatus[tech.status]) {
      techByStatus[tech.status].push(tech);
    }
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Technology Stack Status
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status}>
            <div
              className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-4`}
            >
              <div className="flex items-center mb-3">
                <span className="text-xl mr-2">{config.emoji}</span>
                <span className={`font-semibold ${config.textColor}`}>
                  {config.label}
                </span>
              </div>
              <div className="space-y-2">
                {techByStatus[status].length > 0 ? (
                  techByStatus[status].map((tech, idx) => (
                    <div
                      key={idx}
                      className="text-sm bg-white rounded px-2 py-1 border border-gray-200"
                    >
                      <div className="font-medium text-gray-900">{tech.name}</div>
                      <div className="text-xs text-gray-500">{tech.component}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic">None</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnologyStack;
