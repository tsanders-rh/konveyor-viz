import {
  DrawerPanelContent,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
  Title,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Label,
  Card,
  CardBody,
  Grid,
  GridItem
} from '@patternfly/react-core';
import IssueList from './IssueList';

const ComponentDetail = ({ component, onClose }) => {
  if (!component) return null;

  const issuesBySeverity = {
    critical: component.issues.filter((i) => i.severity === 'critical').length,
    warning: component.issues.filter((i) => i.severity === 'warning').length,
    info: component.issues.filter((i) => i.severity === 'info').length,
  };

  const statusEmoji = {
    eol: '🔴',
    outdated: '🟡',
    current: '🟢',
  };

  return (
    <DrawerPanelContent widths={{ default: 'width_50', lg: 'width_33' }}>
      <DrawerHead>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <Title headingLevel="h2" size="xl">
            {component.name}
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Label color="blue">{component.type}</Label>
            <span style={{ fontSize: '0.875rem', color: '#6a6e73' }}>
              {component.linesOfCode.toLocaleString()} lines of code
            </span>
          </div>
        </div>
        <DrawerActions>
          <DrawerCloseButton onClick={onClose} />
        </DrawerActions>
      </DrawerHead>

      <div style={{ padding: '16px' }}>
        {/* Issue Summary */}
        <div style={{ marginBottom: '24px' }}>
          <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
            Issue Summary
          </Title>
          <Grid hasGutter>
            <GridItem span={4}>
              <Card style={{
                background: 'var(--pf-v5-global--palette--red-50)',
                borderLeft: '4px solid var(--pf-v5-global--danger-color--100)'
              }}>
                <CardBody>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: 'var(--pf-v5-global--danger-color--200)'
                  }}>
                    {issuesBySeverity.critical}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--pf-v5-global--danger-color--100)'
                  }}>
                    Critical
                  </div>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem span={4}>
              <Card style={{
                background: 'var(--pf-v5-global--palette--gold-50)',
                borderLeft: '4px solid var(--pf-v5-global--warning-color--100)'
              }}>
                <CardBody>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: 'var(--pf-v5-global--warning-color--200)'
                  }}>
                    {issuesBySeverity.warning}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--pf-v5-global--warning-color--100)'
                  }}>
                    Warning
                  </div>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem span={4}>
              <Card style={{
                background: '#f5f5f5',
                borderLeft: '4px solid var(--pf-v5-global--BorderColor--100)'
              }}>
                <CardBody>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                  }}>
                    {issuesBySeverity.info}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6a6e73'
                  }}>
                    Info
                  </div>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </div>

        {/* Technology Stack */}
        <div style={{ marginBottom: '24px' }}>
          <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
            Technology Stack
          </Title>
          <Card>
            <CardBody>
              <DescriptionList>
                {component.technology.language && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Language</DescriptionListTerm>
                    <DescriptionListDescription>
                      {component.technology.language}
                      {component.technology.version && ` ${component.technology.version}`}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {component.technology.framework && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Framework</DescriptionListTerm>
                    <DescriptionListDescription>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{component.technology.framework}</span>
                        {component.technology.frameworkStatus && (
                          <span>{statusEmoji[component.technology.frameworkStatus]}</span>
                        )}
                      </div>
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {component.technology.type && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Type</DescriptionListTerm>
                    <DescriptionListDescription>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>
                          {component.technology.type}
                          {component.technology.version && ` ${component.technology.version}`}
                        </span>
                        {component.technology.status && (
                          <span>{statusEmoji[component.technology.status]}</span>
                        )}
                      </div>
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
              </DescriptionList>
            </CardBody>
          </Card>
        </div>

        {/* Issues List */}
        <div>
          <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
            Issues ({component.issues.length})
          </Title>
          <IssueList issues={component.issues} />
        </div>
      </div>
    </DrawerPanelContent>
  );
};

export default ComponentDetail;
