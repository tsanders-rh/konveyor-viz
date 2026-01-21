import {
  Grid,
  GridItem,
  Card,
  CardTitle,
  CardBody,
  Title
} from '@patternfly/react-core';

const TechnologyStack = ({ technologies }) => {
  const statusConfig = {
    eol: {
      emoji: '🔴',
      label: 'End of Life',
      color: 'red',
    },
    outdated: {
      emoji: '🟡',
      label: 'Outdated',
      color: 'orange',
    },
    current: {
      emoji: '🟢',
      label: 'Current',
      color: 'green',
    },
  };

  // Group technologies by status
  const techByStatus = {
    eol: [],
    outdated: [],
    current: [],
  };

  technologies.forEach((tech) => {
    if (techByStatus[tech.status]) {
      techByStatus[tech.status].push(tech);
    }
  });

  return (
    <Card>
      <CardTitle>
        <Title headingLevel="h2" size="lg">
          Technology Stack Status
        </Title>
      </CardTitle>
      <CardBody>
        <Grid hasGutter>
          {Object.entries(statusConfig).map(([status, config]) => (
            <GridItem key={status} md={4}>
              <Card isCompact>
                <CardTitle>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.25rem' }}>{config.emoji}</span>
                    <span>{config.label}</span>
                  </div>
                </CardTitle>
                <CardBody>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {techByStatus[status].length > 0 ? (
                      techByStatus[status].map((tech, idx) => (
                        <Card key={idx} isFlat isCompact>
                          <CardBody>
                            <div style={{
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}>
                              {tech.name}
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#6a6e73'
                            }}>
                              {tech.component}
                            </div>
                          </CardBody>
                        </Card>
                      ))
                    ) : (
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6a6e73',
                        fontStyle: 'italic'
                      }}>
                        None
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>
      </CardBody>
    </Card>
  );
};

export default TechnologyStack;
