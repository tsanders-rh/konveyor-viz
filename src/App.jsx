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
  Title
} from '@patternfly/react-core';
import { BarsIcon, ChartPieIcon, CubeIcon, SearchIcon, CogIcon, BrainIcon, WrenchIcon } from '@patternfly/react-icons';
import Dashboard from './components/Dashboard/Dashboard';
import sampleData from './data/sampleData.json';

function App() {
  const [selectedNav, setSelectedNav] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const masthead = (
    <Masthead>
      <MastheadToggle>
        <PageToggleButton
          variant="plain"
          aria-label="Global navigation"
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        >
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
      <MastheadMain>
        <MastheadBrand>
          <Brand style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--sm)' }}>
            <WrenchIcon size="md" />
            <Title headingLevel="h1" size="xl">Konveyor Visual Analysis</Title>
          </Brand>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--lg)', fontSize: 'var(--pf-v5-global--FontSize--sm)', color: 'var(--pf-v5-global--Color--light-100)' }}>
          {sampleData?.applicationName && (
            <span><strong>Application:</strong> {sampleData.applicationName}</span>
          )}
          {sampleData?.analysisDate && (
            <span><strong>Analyzed:</strong> {new Date(sampleData.analysisDate).toLocaleDateString()}</span>
          )}
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
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--sm)' }}>
                <ChartPieIcon />
                <span>Overview</span>
              </span>
            </NavItem>
            <NavItem
              itemId="components"
              isActive={selectedNav === 'components'}
              onClick={() => setSelectedNav('components')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--sm)' }}>
                <CubeIcon />
                <span>Components</span>
              </span>
            </NavItem>
            <NavItem
              itemId="analysis"
              isActive={selectedNav === 'analysis'}
              onClick={() => setSelectedNav('analysis')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--sm)' }}>
                <SearchIcon />
                <span>Analysis</span>
              </span>
            </NavItem>
            <NavItem
              itemId="microservices"
              isActive={selectedNav === 'microservices'}
              onClick={() => setSelectedNav('microservices')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--sm)' }}>
                <CogIcon />
                <span>Microservices</span>
              </span>
            </NavItem>
            <NavItem
              itemId="ai-insights"
              isActive={selectedNav === 'ai-insights'}
              onClick={() => setSelectedNav('ai-insights')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--sm)' }}>
                <BrainIcon />
                <span>AI Insights</span>
              </span>
            </NavItem>
          </NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );

  return (
    <Page masthead={masthead} sidebar={sidebar}>
      <Dashboard data={sampleData} activeView={selectedNav} />
    </Page>
  );
}

export default App;
