import { useState, useEffect } from 'react';
import llmService from '../../services/llmService';
import { getActiveProvider, LLM_PROVIDERS } from '../../config/llmConfig';

const AIInsights = ({ data }) => {
  const [expanded, setExpanded] = useState(true);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const activeProvider = getActiveProvider();

  // Analyze the data and generate insights
  const generateInsights = () => {
    const insights = {
      priority: [],
      patterns: [],
      risks: [],
      roadmap: [],
      quickWins: []
    };

    // 1. PRIORITY ANALYSIS - Which components to fix first
    const componentsByRisk = data.components
      .map(c => ({
        ...c,
        riskScore: (c.issues.filter(i => i.severity === 'critical').length * 3) +
                   (c.issues.filter(i => i.severity === 'warning').length * 1)
      }))
      .sort((a, b) => b.riskScore - a.riskScore);

    const highestRisk = componentsByRisk[0];
    if (highestRisk && highestRisk.riskScore > 10) {
      insights.priority.push({
        type: 'critical',
        title: `Focus on ${highestRisk.name} first`,
        description: `This component has ${highestRisk.issues.length} issues (${highestRisk.issues.filter(i => i.severity === 'critical').length} critical). Its ${data.dependencies.filter(d => d.source === highestRisk.id).length} dependencies mean fixing it will unblock other components.`,
        component: highestRisk.name
      });
    }

    // 2. PATTERN DETECTION - Common issue types
    const issueTypeCount = {};
    data.components.forEach(c => {
      c.issues.forEach(issue => {
        issueTypeCount[issue.type] = (issueTypeCount[issue.type] || 0) + 1;
      });
    });

    const sortedIssueTypes = Object.entries(issueTypeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (sortedIssueTypes.length > 0) {
      const [topType, count] = sortedIssueTypes[0];
      insights.patterns.push({
        type: 'info',
        title: `${topType} issues are most common`,
        description: `${count} out of ${data.summary.totalIssues} total issues (${Math.round(count/data.summary.totalIssues*100)}%) are related to ${topType}. Consider addressing these systematically across all components.`,
        category: topType,
        count: count
      });
    }

    // 3. RISK ASSESSMENT - Technology EOL/Outdated
    const eolTech = [];
    const outdatedTech = [];
    data.components.forEach(c => {
      if (c.technology.frameworkStatus === 'eol') {
        eolTech.push(`${c.technology.framework} in ${c.name}`);
      } else if (c.technology.frameworkStatus === 'outdated') {
        outdatedTech.push(`${c.technology.framework} in ${c.name}`);
      }
    });

    if (eolTech.length > 0) {
      insights.risks.push({
        type: 'critical',
        title: 'End-of-life technologies detected',
        description: `${eolTech.length} component(s) use EOL technologies that no longer receive security updates: ${eolTech.slice(0, 2).join(', ')}${eolTech.length > 2 ? '...' : ''}. This poses security and compliance risks.`,
        technologies: eolTech
      });
    }

    // 4. MIGRATION ROADMAP - Suggested order
    const leafComponents = data.components.filter(c =>
      !data.dependencies.some(d => d.target === c.id)
    );

    const coreComponents = data.components.filter(c =>
      data.dependencies.filter(d => d.source === c.id).length >= 2
    );

    if (leafComponents.length > 0) {
      insights.roadmap.push({
        phase: 1,
        title: 'Start with leaf components',
        description: `Begin migration with ${leafComponents.map(c => c.name).join(', ')} as they have no downstream dependencies. This minimizes risk and allows early validation.`,
        components: leafComponents.map(c => c.name)
      });
    }

    if (coreComponents.length > 0) {
      insights.roadmap.push({
        phase: 2,
        title: 'Tackle core components',
        description: `After leaf nodes, focus on ${coreComponents[0]?.name} which has multiple dependencies. This will unblock the most downstream work.`,
        components: coreComponents.map(c => c.name)
      });
    }

    // 5. QUICK WINS - Low-hanging fruit
    const lowEffortComponents = data.components.filter(c =>
      c.issues.length > 0 && c.issues.length <= 3 &&
      c.issues.every(i => i.severity !== 'critical')
    );

    if (lowEffortComponents.length > 0) {
      insights.quickWins.push({
        type: 'success',
        title: 'Quick wins available',
        description: `${lowEffortComponents.length} component(s) have fewer than 3 non-critical issues: ${lowEffortComponents.map(c => c.name).join(', ')}. These are good candidates for quick migration to build momentum.`,
        components: lowEffortComponents.map(c => c.name)
      });
    }

    return insights;
  };

  // Fetch AI-powered insights if provider is available
  useEffect(() => {
    const fetchAIInsights = async () => {
      console.log('useAI state:', useAI);
      console.log('activeProvider:', activeProvider);
      console.log('LLM_PROVIDERS.NONE:', LLM_PROVIDERS.NONE);

      if (activeProvider === LLM_PROVIDERS.NONE || !useAI) {
        console.log('Skipping AI fetch - provider:', activeProvider, 'useAI:', useAI);
        return;
      }

      console.log('Fetching AI insights...');
      setLoading(true);
      try {
        const aiResult = await llmService.generateInsights(data);
        console.log('AI result:', aiResult);
        if (aiResult) {
          setAiInsights(aiResult);
        }
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
        // Fall back to rule-based insights
      } finally {
        setLoading(false);
      }
    };

    fetchAIInsights();
  }, [data, useAI, activeProvider]);

  // Use AI insights if available, otherwise use rule-based
  const insights = aiInsights || generateInsights();
  const totalInsights = (insights.priority?.length || 0) + (insights.patterns?.length || 0) +
                       (insights.risks?.length || 0) + (insights.roadmap?.length || 0) +
                       (insights.quickWins?.length || 0);

  const getTypeIcon = (type) => {
    switch(type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '💡';
    }
  };

  const getTypeBadge = (type) => {
    const classes = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      info: 'bg-blue-100 text-blue-800 border-blue-300',
      success: 'bg-green-100 text-green-800 border-green-300'
    };
    return classes[type] || classes.info;
  };

  const getProviderLabel = () => {
    switch(activeProvider) {
      case LLM_PROVIDERS.ANTHROPIC: return 'Claude';
      case LLM_PROVIDERS.OPENAI: return 'GPT';
      case LLM_PROVIDERS.OLLAMA: return 'Ollama';
      default: return 'Rule-based';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-800">
            🤖 {useAI && aiInsights ? 'AI-Generated' : 'Smart Analysis'} Insights
          </h2>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            {totalInsights} recommendations
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            activeProvider !== LLM_PROVIDERS.NONE
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {getProviderLabel()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {activeProvider !== LLM_PROVIDERS.NONE && (
            <button
              onClick={() => setUseAI(!useAI)}
              disabled={loading}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                useAI
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Loading...' : useAI ? 'AI Mode' : 'Use AI'}
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Priority Recommendations */}
          {insights.priority.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">🎯 Priority Actions</h3>
              {insights.priority.map((insight, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${getTypeBadge(insight.type)} mb-2`}>
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">{getTypeIcon(insight.type)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm mt-1 opacity-90">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pattern Detection */}
          {insights.patterns.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">🔍 Patterns Detected</h3>
              {insights.patterns.map((insight, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${getTypeBadge(insight.type)} mb-2`}>
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">{getTypeIcon(insight.type)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm mt-1 opacity-90">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Risk Assessment */}
          {insights.risks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">⚠️ Risk Assessment</h3>
              {insights.risks.map((insight, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${getTypeBadge(insight.type)} mb-2`}>
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">{getTypeIcon(insight.type)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm mt-1 opacity-90">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Migration Roadmap */}
          {insights.roadmap.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">🗺️ Suggested Migration Roadmap</h3>
              {insights.roadmap.map((insight, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-blue-300 bg-blue-50 mb-2">
                  <div className="flex items-start space-x-2">
                    <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold">
                      Phase {insight.phase}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">{insight.title}</h4>
                      <p className="text-sm mt-1 text-blue-800">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Wins (rule-based only) */}
          {insights.quickWins && insights.quickWins.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">⚡ Quick Wins</h3>
              {insights.quickWins.map((insight, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${getTypeBadge(insight.type)} mb-2`}>
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">{getTypeIcon(insight.type)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm mt-1 opacity-90">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsights;
