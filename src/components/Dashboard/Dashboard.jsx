import { useState } from 'react';
import { PageSection, PageSectionVariants, Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
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
            <MetricsOverview metrics={metrics} />
          </PageSection>
          <PageSection>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div>
                <ArchitectureGraph data={graphData} onNodeClick={handleNodeClick} />
              </div>
              <div>
                <IssueBreakdown issuesByType={issuesByType} />
              </div>
            </div>
          </PageSection>
        </>
      )}

      {/* Components View - Placeholder for future implementation */}
      {activeView === 'components' && (
        <PageSection>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>Components List View</h2>
            <p style={{ color: '#6c757d' }}>This view will show a table of all components</p>
          </div>
        </PageSection>
      )}

      {/* Analysis View */}
      {activeView === 'analysis' && (
        <>
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
        <PageSection>
          <MicroservicesDecomposition data={data} />
        </PageSection>
      )}

      {/* AI Insights View */}
      {activeView === 'ai-insights' && (
        <PageSection>
          <AIInsights data={data} />
        </PageSection>
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
