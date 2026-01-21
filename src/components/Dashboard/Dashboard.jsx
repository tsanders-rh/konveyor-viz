import { useState } from 'react';
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

const Dashboard = ({ data }) => {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Metrics Overview */}
        <MetricsOverview metrics={metrics} />

        {/* AI Insights */}
        <AIInsights data={data} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Architecture Graph - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ArchitectureGraph data={graphData} onNodeClick={handleNodeClick} />
          </div>

          {/* Issue Breakdown - Takes 1 column */}
          <div>
            <IssueBreakdown issuesByType={issuesByType} />
          </div>
        </div>

        {/* Technology Stack */}
        <TechnologyStack technologies={technologies} />

        {/* Microservices Decomposition */}
        <MicroservicesDecomposition data={data} />

        {/* Component Detail Panel */}
        <ComponentDetail
          component={selectedComponent}
          onClose={handleCloseDetail}
        />
      </div>
    </div>
  );
};

export default Dashboard;
