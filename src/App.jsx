import { useState } from 'react';
import {
  Page,
  Masthead,
  MastheadToggle,
  MastheadMain,
  MastheadBrand,
  PageToggleButton,
  PageSidebar,
  PageSidebarBody,
  Nav,
  NavList,
  NavItem
} from '@patternfly/react-core';
import { BarsIcon, ChartPieIcon, CubeIcon, SearchIcon, CogIcon, BrainIcon } from '@patternfly/react-icons';
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
          🔧 Konveyor Visual Analysis
        </MastheadBrand>
      </MastheadMain>
    </Masthead>
  );

  const sidebar = (
    <PageSidebar isSidebarOpen={isSidebarOpen}>
      <PageSidebarBody>
        <Nav>
          <NavList>
            <NavItem
              itemId="overview"
              isActive={selectedNav === 'overview'}
              onClick={() => setSelectedNav('overview')}
            >
              <ChartPieIcon /> Overview
            </NavItem>
            <NavItem
              itemId="components"
              isActive={selectedNav === 'components'}
              onClick={() => setSelectedNav('components')}
            >
              <CubeIcon /> Components
            </NavItem>
            <NavItem
              itemId="analysis"
              isActive={selectedNav === 'analysis'}
              onClick={() => setSelectedNav('analysis')}
            >
              <SearchIcon /> Analysis
            </NavItem>
            <NavItem
              itemId="microservices"
              isActive={selectedNav === 'microservices'}
              onClick={() => setSelectedNav('microservices')}
            >
              <CogIcon /> Microservices
            </NavItem>
            <NavItem
              itemId="ai-insights"
              isActive={selectedNav === 'ai-insights'}
              onClick={() => setSelectedNav('ai-insights')}
            >
              <BrainIcon /> AI Insights
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
