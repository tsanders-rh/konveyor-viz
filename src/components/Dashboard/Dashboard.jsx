import { useState } from 'react';
import {
  PageSection,
  PageSectionVariants,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Title
} from '@patternfly/react-core';
import MetricsOverview from './MetricsOverview';
import TechnologyStack from './TechnologyStack';
import AIInsights from './AIInsights';
import ArchitectureGraph from '../Visualizations/ArchitectureGraph';
import IssueBreakdown from '../Visualizations/IssueBreakdown';
import MicroservicesDecomposition from '../Visualizations/MicroservicesDecomposition';
import ComponentDetail from '../DetailPanel/ComponentDetail';
import {
  parseGraphData,
  calculateMetrics,
  getIssuesByType,
  getTechnologies,
} from '../../utils/dataParser';

const Dashboard = ({ data, activeView }) => {
  const [selectedComponent, setSelectedComponent] = useState(null);

  // Parse and calculate data for visualizations
  const graphData = parseGraphData(data);
  const metrics = calculateMetrics(data);
  const issuesByType = getIssuesByType(data);
  const technologies = getTechnologies(data);

  const handleNodeClick = (component) => {
    setSelectedComponent(component);
  };

  const handleCloseDetail = () => {
    setSelectedComponent(null);
  };

  const panelContent = (
    <ComponentDetail
      component={selectedComponent}
      onClose={handleCloseDetail}
    />
  );

  const mainContent = (
    <>
      {/* Overview View */}
      {activeView === 'overview' && (
        <>
          <PageSection variant={PageSectionVariants.light}>
            <Title headingLevel="h1">Application Overview</Title>
            <p style={{ color: 'var(--pf-v5-global--Color--200)', marginTop: 'var(--pf-v5-global--spacer--sm)' }}>
              Comprehensive analysis of your application's architecture, issues, and migration readiness.
            </p>
          </PageSection>
          <PageSection variant={PageSectionVariants.light}>
            <MetricsOverview metrics={metrics} />
          </PageSection>
          <PageSection>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--pf-v5-global--spacer--lg)' }}>
              <ArchitectureGraph data={graphData} onNodeClick={handleNodeClick} />
              <IssueBreakdown issuesByType={issuesByType} />
            </div>
          </PageSection>
        </>
      )}

      {/* Components View - Placeholder for future implementation */}
      {activeView === 'components' && (
        <>
          <PageSection variant={PageSectionVariants.light}>
            <Title headingLevel="h1">Components</Title>
            <p style={{ color: 'var(--pf-v5-global--Color--200)', marginTop: 'var(--pf-v5-global--spacer--sm)' }}>
              Browse and filter all application components with detailed analysis.
            </p>
          </PageSection>
          <PageSection>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                This view will show a table of all components
              </p>
            </div>
          </PageSection>
        </>
      )}

      {/* Analysis View */}
      {activeView === 'analysis' && (
        <>
          <PageSection variant={PageSectionVariants.light}>
            <Title headingLevel="h1">Analysis</Title>
            <p style={{ color: 'var(--pf-v5-global--Color--200)', marginTop: 'var(--pf-v5-global--spacer--sm)' }}>
              Detailed breakdown of issues and technology stack analysis.
            </p>
          </PageSection>
          <PageSection variant={PageSectionVariants.light}>
            <IssueBreakdown issuesByType={issuesByType} />
          </PageSection>
          <PageSection>
            <TechnologyStack technologies={technologies} />
          </PageSection>
        </>
      )}

      {/* Microservices View */}
      {activeView === 'microservices' && (
        <>
          <PageSection variant={PageSectionVariants.light}>
            <Title headingLevel="h1">Microservices Decomposition</Title>
            <p style={{ color: 'var(--pf-v5-global--Color--200)', marginTop: 'var(--pf-v5-global--spacer--sm)' }}>
              AI-powered analysis to break down your monolith into microservices using Kubernetes best practices.
            </p>
          </PageSection>
          <PageSection>
            <MicroservicesDecomposition data={data} />
          </PageSection>
        </>
      )}

      {/* AI Insights View */}
      {activeView === 'ai-insights' && (
        <>
          <PageSection variant={PageSectionVariants.light}>
            <Title headingLevel="h1">AI Insights</Title>
            <p style={{ color: 'var(--pf-v5-global--Color--200)', marginTop: 'var(--pf-v5-global--spacer--sm)' }}>
              Intelligent recommendations for migration priorities, patterns, risks, and quick wins.
            </p>
          </PageSection>
          <PageSection>
            <AIInsights data={data} />
          </PageSection>
        </>
      )}
    </>
  );

  return (
    <Drawer isExpanded={selectedComponent !== null} isInline>
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBody>
          {mainContent}
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default Dashboard;
