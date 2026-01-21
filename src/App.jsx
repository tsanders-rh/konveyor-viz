import { useState } from 'react';
import {
  Page,
  Masthead,
  MastheadToggle,
  MastheadMain,
  MastheadBrand,
  MastheadContent,
  PageToggleButton,
  PageSidebar,
  PageSidebarBody,
  Nav,
  NavList,
  NavItem,
  Brand,
  Title,
  Label,
  Alert,
  AlertActionCloseButton
} from '@patternfly/react-core';
import { BarsIcon, ChartPieIcon, CubeIcon, SearchIcon, CogIcon, BrainIcon, WrenchIcon } from '@patternfly/react-icons';
import Dashboard from './components/Dashboard/Dashboard';
import LoadReportButton from './components/LoadReport/LoadReportButton';
import LoadReportModal from './components/LoadReport/LoadReportModal';
import sampleData from './data/sampleData.json';

function App() {
  const [selectedNav, setSelectedNav] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [analysisData, setAnalysisData] = useState(sampleData);
  const [dataSource, setDataSource] = useState('sample'); // 'sample' or 'custom'
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const masthead = (
    <Masthead>
      <MastheadToggle>
        <PageToggleButton
          variant="plain"
          aria-label="Global navigation"
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        >
          <BarsIcon style={{ color: '#d2d2d2' }} />
        </PageToggleButton>
      </MastheadToggle>
      <MastheadMain>
        <MastheadBrand>
          <Brand style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <WrenchIcon size="md" style={{ color: '#d2d2d2' }} />
            <Title headingLevel="h1" size="lg" style={{ color: '#ffffff', fontWeight: '500', margin: 0 }}>
              Konveyor Visual Analysis
            </Title>
          </Brand>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.875rem', color: '#d2d2d2' }}>
          {analysisData?.applicationName && (
            <span>
              <strong>Project:</strong> {analysisData.applicationName}
            </span>
          )}
          {analysisData?.analysisDate && (
            <span>
              <strong>Analyzed:</strong> {new Date(analysisData.analysisDate).toLocaleDateString()}
            </span>
          )}
          {dataSource === 'custom' && (
            <Label color="green">Custom Report</Label>
          )}
          {dataSource === 'sample' && (
            <Label color="grey">Sample Data</Label>
          )}
          <LoadReportButton onClick={() => setIsLoadModalOpen(true)} />
        </div>
      </MastheadContent>
    </Masthead>
  );

  const sidebar = (
    <PageSidebar isSidebarOpen={isSidebarOpen}>
      <PageSidebarBody>
        <Nav aria-label="Application navigation">
          <NavList>
            <NavItem
              itemId="overview"
              isActive={selectedNav === 'overview'}
              onClick={() => setSelectedNav('overview')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ChartPieIcon />
                <span>Overview</span>
              </span>
            </NavItem>
            <NavItem
              itemId="components"
              isActive={selectedNav === 'components'}
              onClick={() => setSelectedNav('components')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CubeIcon />
                <span>Components</span>
              </span>
            </NavItem>
            <NavItem
              itemId="analysis"
              isActive={selectedNav === 'analysis'}
              onClick={() => setSelectedNav('analysis')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SearchIcon />
                <span>Analysis</span>
              </span>
            </NavItem>
            <NavItem
              itemId="microservices"
              isActive={selectedNav === 'microservices'}
              onClick={() => setSelectedNav('microservices')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CogIcon />
                <span>Microservices</span>
              </span>
            </NavItem>
            <NavItem
              itemId="ai-insights"
              isActive={selectedNav === 'ai-insights'}
              onClick={() => setSelectedNav('ai-insights')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BrainIcon />
                <span>AI Insights</span>
              </span>
            </NavItem>
          </NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );

  const handleLoadSuccess = (data) => {
    setAnalysisData(data);
    setDataSource('custom');
    setSuccessMessage(`Successfully loaded report: ${data.applicationName}`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleLoadError = (error) => {
    console.error('Failed to load report:', error);
  };

  return (
    <Page masthead={masthead} sidebar={sidebar}>
      {successMessage && (
        <Alert
          variant="success"
          title={successMessage}
          actionClose={<AlertActionCloseButton onClose={() => setSuccessMessage(null)} />}
          style={{
            margin: '1rem',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
          }}
        />
      )}
      <Dashboard data={analysisData} activeView={selectedNav} />
      <LoadReportModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
      />
    </Page>
  );
}

export default App;
