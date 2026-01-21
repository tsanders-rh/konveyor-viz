const BusinessLogicDocumentation = ({ businessLogic }) => {
  if (!businessLogic || businessLogic.length === 0) {
    return null;
  }

  const getComplexityColor = (complexity) => {
    switch (complexity?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📊 Discovered Business Logic
        </h2>
        <p className="text-gray-600 text-sm">
          Reverse-engineered business capabilities from legacy code analysis. This documentation helps teams with zero domain knowledge understand what the application does.
        </p>
      </div>

      <div className="space-y-6">
        {businessLogic.map((domain, idx) => (
          <div key={idx} className="border border-gray-300 rounded-lg p-5 hover:shadow-lg transition-shadow bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{domain.domain}</h3>
                <p className="text-sm text-gray-600 mt-1">{domain.description}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getComplexityColor(domain.complexity)}`}>
                {domain.complexity} Complexity
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Business Operations */}
              {domain.operations && domain.operations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">🔧 Business Operations</p>
                  <ul className="space-y-1">
                    {domain.operations.map((op, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {op}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Business Entities */}
              {domain.entities && domain.entities.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">📦 Domain Entities</p>
                  <div className="flex flex-wrap gap-2">
                    {domain.entities.map((entity, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded border border-blue-300">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Business Rules */}
            {domain.rules && domain.rules.length > 0 && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs font-semibold text-yellow-900 mb-2">⚠️ Business Rules & Validations</p>
                <ul className="space-y-1">
                  {domain.rules.map((rule, i) => (
                    <li key={i} className="text-sm text-yellow-800">
                      → {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Critical Logic */}
            {domain.criticalLogic && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
                <p className="text-xs font-semibold text-red-900 mb-1">🔥 Critical Logic (Must Preserve)</p>
                <p className="text-sm text-red-800">{domain.criticalLogic}</p>
              </div>
            )}

            {/* Migration Mapping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">📂 Source Components</p>
                <div className="flex flex-wrap gap-1">
                  {domain.sourceComponents.map((comp, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-mono">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">🎯 Target Microservice</p>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded border border-green-300 font-medium">
                  {domain.targetService}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">💡 Migration Guidance:</span> Use this business logic documentation to ensure all critical functionality is preserved when migrating from monolith to microservices. Each domain represents a bounded context that should be implemented in its target microservice.
        </p>
      </div>
    </div>
  );
};

export default BusinessLogicDocumentation;
