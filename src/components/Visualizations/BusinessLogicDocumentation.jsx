import {
  Card,
  CardTitle,
  CardBody,
  Title,
  Label,
  Alert,
  Grid,
  GridItem,
  List,
  ListItem
} from '@patternfly/react-core';

const BusinessLogicDocumentation = ({ businessLogic }) => {
  if (!businessLogic || businessLogic.length === 0) {
    return null;
  }

  const getComplexityColor = (complexity) => {
    switch (complexity?.toLowerCase()) {
      case 'low':
        return 'green';
      case 'medium':
        return 'orange';
      case 'high':
        return 'red';
      default:
        return 'grey';
    }
  };

  return (
    <Card>
      <CardTitle>
        <Title headingLevel="h2" size="xl">
          📊 Discovered Business Logic
        </Title>
      </CardTitle>
      <CardBody>
        <div style={{ marginBottom: '24px', color: '#6a6e73' }}>
          Reverse-engineered business capabilities from legacy code analysis. This documentation helps teams with zero domain knowledge understand what the application does.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {businessLogic.map((domain, idx) => (
            <Card key={idx} isCompact>
              <CardBody>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <Title headingLevel="h3" size="lg">
                      {domain.domain}
                    </Title>
                    <div style={{ fontSize: '0.875rem', color: '#6a6e73', marginTop: '4px' }}>
                      {domain.description}
                    </div>
                  </div>
                  <Label color={getComplexityColor(domain.complexity)}>
                    {domain.complexity} Complexity
                  </Label>
                </div>

                <Grid hasGutter style={{ marginBottom: '16px' }}>
                  {/* Business Operations */}
                  {domain.operations && domain.operations.length > 0 && (
                    <GridItem md={6}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px' }}>
                          🔧 Business Operations
                        </div>
                        <List isPlain>
                          {domain.operations.map((op, i) => (
                            <ListItem key={i} style={{ fontSize: '0.875rem' }}>
                              • {op}
                            </ListItem>
                          ))}
                        </List>
                      </div>
                    </GridItem>
                  )}

                  {/* Business Entities */}
                  {domain.entities && domain.entities.length > 0 && (
                    <GridItem md={6}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px' }}>
                          📦 Domain Entities
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {domain.entities.map((entity, i) => (
                            <Label key={i} color="blue" isCompact>
                              {entity}
                            </Label>
                          ))}
                        </div>
                      </div>
                    </GridItem>
                  )}
                </Grid>

                {/* Business Rules */}
                {domain.rules && domain.rules.length > 0 && (
                  <Alert variant="warning" isInline title="⚠️ Business Rules & Validations" style={{ marginBottom: '16px' }}>
                    <List isPlain>
                      {domain.rules.map((rule, i) => (
                        <ListItem key={i} style={{ fontSize: '0.875rem' }}>
                          → {rule}
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                )}

                {/* Critical Logic */}
                {domain.criticalLogic && (
                  <Alert variant="danger" isInline title="🔥 Critical Logic (Must Preserve)" style={{ marginBottom: '16px' }}>
                    {domain.criticalLogic}
                  </Alert>
                )}

                {/* Migration Mapping */}
                <Grid hasGutter style={{ paddingTop: '16px', borderTop: '1px solid var(--pf-v5-global--BorderColor--100)' }}>
                  <GridItem md={6}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px' }}>
                        📂 Source Components
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {domain.sourceComponents.map((comp, i) => (
                          <Label key={i} isCompact>
                            <code>{comp}</code>
                          </Label>
                        ))}
                      </div>
                    </div>
                  </GridItem>

                  <GridItem md={6}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px' }}>
                        🎯 Target Microservice
                      </div>
                      <Label color="green">
                        {domain.targetService}
                      </Label>
                    </div>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>
          ))}
        </div>

        <Alert variant="info" isInline title="💡 Migration Guidance" style={{ marginTop: '24px' }}>
          Use this business logic documentation to ensure all critical functionality is preserved when migrating from monolith to microservices. Each domain represents a bounded context that should be implemented in its target microservice.
        </Alert>
      </CardBody>
    </Card>
  );
};

export default BusinessLogicDocumentation;
