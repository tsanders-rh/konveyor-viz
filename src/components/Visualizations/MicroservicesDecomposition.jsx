import { useState, useEffect } from 'react';
import llmService from '../../services/llmService';
import { getActiveProvider, LLM_PROVIDERS } from '../../config/llmConfig';
import MicroservicesTierDiagram from './MicroservicesTierDiagram';
import BusinessLogicDocumentation from './BusinessLogicDocumentation';

const MicroservicesDecomposition = ({ data }) => {
  const [decomposition, setDecomposition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const activeProvider = getActiveProvider();

  const generateDecomposition = async () => {
    if (activeProvider === LLM_PROVIDERS.NONE) {
      setError('AI provider required for microservices decomposition. Please configure an API key.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await llmService.generateMicroservicesDecomposition(data);
      if (result) {
        setDecomposition(result);
      } else {
        setError('Failed to generate decomposition. Please try again.');
      }
    } catch (err) {
      console.error('Decomposition error:', err);
      setError(err.message || 'Failed to generate decomposition');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎯 Microservices Decomposition Strategy
        </h2>
        <p className="text-gray-600 text-sm">
          AI-powered analysis using Kubernetes best practices to suggest how to break down your monolith into microservices.
        </p>
      </div>

      {!decomposition && !loading && (
        <div className="text-center py-12">
          <div className="mb-6">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready to Modernize Your Architecture?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Generate a microservices decomposition strategy based on your application's current architecture,
            dependencies, and Kubernetes best practices.
          </p>
          <button
            onClick={generateDecomposition}
            disabled={activeProvider === LLM_PROVIDERS.NONE}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {activeProvider === LLM_PROVIDERS.NONE ? 'Configure AI Provider First' : 'Generate Microservices Strategy'}
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
          <p className="text-gray-600">Analyzing architecture and generating microservices strategy...</p>
          <p className="text-sm text-gray-500 mt-2">This may take 15-30 seconds</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-medium">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {decomposition && !loading && (
        <div className="space-y-6">
          {/* Strategy Overview */}
          {decomposition.overview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Strategy Overview</h3>
              <p className="text-blue-800">{decomposition.overview}</p>
            </div>
          )}

          {/* Business Logic Documentation */}
          {decomposition.businessLogic && decomposition.businessLogic.length > 0 && (
            <BusinessLogicDocumentation businessLogic={decomposition.businessLogic} />
          )}

          {/* Tiered Architecture Diagram */}
          {decomposition.microservices && decomposition.microservices.length > 0 && (
            <MicroservicesTierDiagram microservices={decomposition.microservices} />
          )}

          {/* Proposed Microservices */}
          {decomposition.microservices && decomposition.microservices.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔨 Proposed Microservices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {decomposition.microservices.map((service, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {service.type || 'Service'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>

                    {service.components && service.components.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Components:</p>
                        <div className="flex flex-wrap gap-1">
                          {service.components.map((comp, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {service.responsibilities && service.responsibilities.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Responsibilities:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {service.responsibilities.slice(0, 3).map((resp, i) => (
                            <li key={i}>• {resp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {service.patterns && service.patterns.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Patterns Applied:</p>
                        <div className="flex flex-wrap gap-1">
                          {service.patterns.map((pattern, i) => (
                            <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded border border-indigo-200">
                              🏛️ {pattern}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {service.communication && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Communication:</p>
                        <p className="text-xs text-gray-600">{service.communication}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Migration Strategy */}
          {decomposition.migrationStrategy && decomposition.migrationStrategy.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Migration Strategy</h3>
              <div className="space-y-3">
                {decomposition.migrationStrategy.map((phase, idx) => (
                  <div key={idx} className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {phase.phase || idx + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-900 mb-1">{phase.title}</h4>
                        <p className="text-sm text-purple-800">{phase.description}</p>
                        {phase.patterns && phase.patterns.length > 0 && (
                          <div className="mt-2 mb-2">
                            <p className="text-xs font-medium text-purple-700 mb-1">Patterns:</p>
                            <div className="flex flex-wrap gap-1">
                              {phase.patterns.map((pattern, i) => (
                                <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded border border-indigo-300">
                                  📐 {pattern}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {phase.services && phase.services.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-purple-700 mb-1">Services:</p>
                            <div className="flex flex-wrap gap-1">
                              {phase.services.map((svc, i) => (
                                <span key={i} className="px-2 py-1 bg-purple-200 text-purple-900 text-xs rounded">
                                  {svc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kubernetes Recommendations */}
          {decomposition.kubernetesRecommendations && decomposition.kubernetesRecommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">☸️ Kubernetes Best Practices</h3>
              <div className="space-y-3">
                {decomposition.kubernetesRecommendations.map((rec, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    {rec.implementation && (
                      <div className="bg-white border border-gray-200 rounded p-2">
                        <p className="text-xs font-mono text-gray-700">{rec.implementation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Considerations */}
          {decomposition.dataStrategy && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">💾 Data Management Strategy</h3>
              <div className="text-yellow-800 text-sm leading-relaxed space-y-3">
                {decomposition.dataStrategy.split('. ').map((sentence, idx) => {
                  if (!sentence.trim()) return null;
                  const text = sentence.trim() + (sentence.endsWith('.') ? '' : '.');
                  return (
                    <p key={idx} className="pl-4 border-l-2 border-yellow-300">
                      {text}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regenerate Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={generateDecomposition}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              🔄 Regenerate Strategy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MicroservicesDecomposition;
