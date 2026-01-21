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
import ComponentsTable from './ComponentsTable';
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

  // Microservices decomposition state (persists across navigation)
  const [decomposition, setDecomposition] = useState(null);
  const [decompositionLoading, setDecompositionLoading] = useState(false);
  const [decompositionError, setDecompositionError] = useState(null);

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
            <Title headingLevel="h1" size="2xl">Application Overview</Title>
          </PageSection>
          <PageSection variant={PageSectionVariants.light}>
            <MetricsOverview metrics={metrics} />
          </PageSection>
          <PageSection>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              <ArchitectureGraph data={graphData} onNodeClick={handleNodeClick} />
              <IssueBreakdown issuesByType={issuesByType} />
            </div>
          </PageSection>
        </>
      )}

      {/* Components View */}
      {activeView === 'components' && (
        <>
          <PageSection variant={PageSectionVariants.light}>
            <Title headingLevel="h1" size="2xl">Components</Title>
          </PageSection>
          <PageSection>
            <ComponentsTable data={data} onComponentClick={handleNodeClick} />
          </PageSection>
        </>
      )}

      {/* Analysis View */}
      {activeView === 'analysis' && (
        <>
          <PageSection variant={PageSectionVariants.light}>
            <Title headingLevel="h1" size="2xl">Analysis</Title>
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
            <Title headingLevel="h1" size="2xl">Microservices Decomposition</Title>
          </PageSection>
          <PageSection>
            <MicroservicesDecomposition
              data={data}
              decomposition={decomposition}
              setDecomposition={setDecomposition}
              loading={decompositionLoading}
              setLoading={setDecompositionLoading}
              error={decompositionError}
              setError={setDecompositionError}
            />
          </PageSection>
        </>
      )}

      {/* AI Insights View */}
      {activeView === 'ai-insights' && (
        <>
          <PageSection variant={PageSectionVariants.light}>
            <Title headingLevel="h1" size="2xl">AI Insights</Title>
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
