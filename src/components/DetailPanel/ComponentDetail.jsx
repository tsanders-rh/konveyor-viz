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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pf-v5-global--spacer--sm)', flex: 1 }}>
          <Title headingLevel="h2" size="xl">
            {component.name}
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--sm)' }}>
            <Label color="blue">{component.type}</Label>
            <span style={{ fontSize: 'var(--pf-v5-global--FontSize--sm)', color: 'var(--pf-v5-global--Color--200)' }}>
              {component.linesOfCode.toLocaleString()} lines of code
            </span>
          </div>
        </div>
        <DrawerActions>
          <DrawerCloseButton onClick={onClose} />
        </DrawerActions>
      </DrawerHead>

      <div style={{ padding: 'var(--pf-v5-global--spacer--md)' }}>
        {/* Issue Summary */}
        <div style={{ marginBottom: 'var(--pf-v5-global--spacer--lg)' }}>
          <Title headingLevel="h3" size="lg" style={{ marginBottom: 'var(--pf-v5-global--spacer--md)' }}>
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
                    fontWeight: 'var(--pf-v5-global--FontWeight--bold)',
                    color: 'var(--pf-v5-global--danger-color--200)'
                  }}>
                    {issuesBySeverity.critical}
                  </div>
                  <div style={{
                    fontSize: 'var(--pf-v5-global--FontSize--sm)',
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
                    fontWeight: 'var(--pf-v5-global--FontWeight--bold)',
                    color: 'var(--pf-v5-global--warning-color--200)'
                  }}>
                    {issuesBySeverity.warning}
                  </div>
                  <div style={{
                    fontSize: 'var(--pf-v5-global--FontSize--sm)',
                    color: 'var(--pf-v5-global--warning-color--100)'
                  }}>
                    Warning
                  </div>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem span={4}>
              <Card style={{
                background: 'var(--pf-v5-global--BackgroundColor--200)',
                borderLeft: '4px solid var(--pf-v5-global--BorderColor--100)'
              }}>
                <CardBody>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'var(--pf-v5-global--FontWeight--bold)',
                  }}>
                    {issuesBySeverity.info}
                  </div>
                  <div style={{
                    fontSize: 'var(--pf-v5-global--FontSize--sm)',
                    color: 'var(--pf-v5-global--Color--200)'
                  }}>
                    Info
                  </div>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </div>

        {/* Technology Stack */}
        <div style={{ marginBottom: 'var(--pf-v5-global--spacer--lg)' }}>
          <Title headingLevel="h3" size="lg" style={{ marginBottom: 'var(--pf-v5-global--spacer--md)' }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--sm)' }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--sm)' }}>
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
          <Title headingLevel="h3" size="lg" style={{ marginBottom: 'var(--pf-v5-global--spacer--md)' }}>
            Issues ({component.issues.length})
          </Title>
          <IssueList issues={component.issues} />
        </div>
      </div>
    </DrawerPanelContent>
  );
};

export default ComponentDetail;
