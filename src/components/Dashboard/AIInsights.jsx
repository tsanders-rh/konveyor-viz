import { useState, useEffect } from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  CardExpandableContent,
  Button,
  Label,
  Spinner,
  Title
} from '@patternfly/react-core';
import { AngleDownIcon, AngleUpIcon } from '@patternfly/react-icons';
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
      if (activeProvider === LLM_PROVIDERS.NONE || !useAI) {
        return;
      }

      setLoading(true);
      try {
        const aiResult = await llmService.generateInsights(data);
        if (aiResult) {
          setAiInsights(aiResult);
        }
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
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

  const getProviderLabel = () => {
    switch(activeProvider) {
      case LLM_PROVIDERS.ANTHROPIC: return 'Claude';
      case LLM_PROVIDERS.OPENAI: return 'GPT';
      case LLM_PROVIDERS.OLLAMA: return 'Ollama';
      default: return 'Rule-based';
    }
  };

  const InsightCard = ({ insight }) => (
    <Card isCompact style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
      <CardBody>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--pf-v5-global--spacer--sm)' }}>
          <span style={{ fontSize: '1.25rem' }}>{getTypeIcon(insight.type)}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'var(--pf-v5-global--FontWeight--semi-bold)', marginBottom: 'var(--pf-v5-global--spacer--xs)' }}>
              {insight.title}
            </div>
            <div style={{ fontSize: 'var(--pf-v5-global--FontSize--sm)', color: 'var(--pf-v5-global--Color--200)' }}>
              {insight.description}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const RoadmapCard = ({ insight }) => (
    <Card isCompact style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
      <CardBody>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--pf-v5-global--spacer--sm)' }}>
          <Label color="blue" isCompact>
            Phase {insight.phase}
          </Label>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'var(--pf-v5-global--FontWeight--semi-bold)', marginBottom: 'var(--pf-v5-global--spacer--xs)' }}>
              {insight.title}
            </div>
            <div style={{ fontSize: 'var(--pf-v5-global--FontSize--sm)', color: 'var(--pf-v5-global--Color--200)' }}>
              {insight.description}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <Card isExpanded={expanded}>
      <CardTitle>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--sm)' }}>
            <Title headingLevel="h2" size="lg">
              🤖 {useAI && aiInsights ? 'AI-Generated' : 'Smart Analysis'} Insights
            </Title>
            <Label color="purple" isCompact>
              {totalInsights} recommendations
            </Label>
            <Label color={activeProvider !== LLM_PROVIDERS.NONE ? 'green' : 'grey'} isCompact>
              {getProviderLabel()}
            </Label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--sm)' }}>
            {activeProvider !== LLM_PROVIDERS.NONE && (
              <Button
                variant={useAI ? 'primary' : 'secondary'}
                onClick={() => setUseAI(!useAI)}
                isDisabled={loading}
                isSmall
              >
                {loading ? <Spinner size="sm" /> : null}
                {loading ? ' Loading...' : useAI ? 'AI Mode' : 'Use AI'}
              </Button>
            )}
            <Button
              variant="plain"
              onClick={() => setExpanded(!expanded)}
              icon={expanded ? <AngleUpIcon /> : <AngleDownIcon />}
              aria-label={expanded ? 'Collapse' : 'Expand'}
            />
          </div>
        </div>
      </CardTitle>
      <CardExpandableContent>
        <CardBody>
          {/* Priority Recommendations */}
          {insights.priority && insights.priority.length > 0 && (
            <div style={{ marginBottom: 'var(--pf-v5-global--spacer--md)' }}>
              <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                🎯 Priority Actions
              </Title>
              {insights.priority.map((insight, idx) => (
                <InsightCard key={idx} insight={insight} />
              ))}
            </div>
          )}

          {/* Pattern Detection */}
          {insights.patterns && insights.patterns.length > 0 && (
            <div style={{ marginBottom: 'var(--pf-v5-global--spacer--md)' }}>
              <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                🔍 Patterns Detected
              </Title>
              {insights.patterns.map((insight, idx) => (
                <InsightCard key={idx} insight={insight} />
              ))}
            </div>
          )}

          {/* Risk Assessment */}
          {insights.risks && insights.risks.length > 0 && (
            <div style={{ marginBottom: 'var(--pf-v5-global--spacer--md)' }}>
              <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                ⚠️ Risk Assessment
              </Title>
              {insights.risks.map((insight, idx) => (
                <InsightCard key={idx} insight={insight} />
              ))}
            </div>
          )}

          {/* Migration Roadmap */}
          {insights.roadmap && insights.roadmap.length > 0 && (
            <div style={{ marginBottom: 'var(--pf-v5-global--spacer--md)' }}>
              <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                🗺️ Suggested Migration Roadmap
              </Title>
              {insights.roadmap.map((insight, idx) => (
                <RoadmapCard key={idx} insight={insight} />
              ))}
            </div>
          )}

          {/* Quick Wins */}
          {insights.quickWins && insights.quickWins.length > 0 && (
            <div>
              <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                ⚡ Quick Wins
              </Title>
              {insights.quickWins.map((insight, idx) => (
                <InsightCard key={idx} insight={insight} />
              ))}
            </div>
          )}
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};

export default AIInsights;
