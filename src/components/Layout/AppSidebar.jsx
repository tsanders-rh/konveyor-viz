import { PageSidebar, PageSidebarBody, Nav, NavList, NavItem } from '@patternfly/react-core';
import {
  ChartPieIcon,
  CubeIcon,
  SearchIcon,
  CogIcon,
  BrainIcon
} from '@patternfly/react-icons';

export default function AppSidebar({ activeItem, onSelect }) {
  return (
    <PageSidebar>
      <PageSidebarBody>
        <Nav>
          <NavList>
            <NavItem
              itemId="overview"
              isActive={activeItem === 'overview'}
              onClick={() => onSelect('overview')}
            >
              <ChartPieIcon /> Overview
            </NavItem>
            <NavItem
              itemId="components"
              isActive={activeItem === 'components'}
              onClick={() => onSelect('components')}
            >
              <CubeIcon /> Components
            </NavItem>
            <NavItem
              itemId="analysis"
              isActive={activeItem === 'analysis'}
              onClick={() => onSelect('analysis')}
            >
              <SearchIcon /> Analysis
            </NavItem>
            <NavItem
              itemId="microservices"
              isActive={activeItem === 'microservices'}
              onClick={() => onSelect('microservices')}
            >
              <CogIcon /> Microservices
            </NavItem>
            <NavItem
              itemId="ai-insights"
              isActive={activeItem === 'ai-insights'}
              onClick={() => onSelect('ai-insights')}
            >
              <BrainIcon /> AI Insights
            </NavItem>
          </NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );
}
