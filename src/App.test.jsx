import { Card, CardBody } from '@patternfly/react-core';

function AppTest() {
  return (
    <div style={{ padding: '2rem' }}>
      <Card>
        <CardBody>
          <h1>PatternFly Test</h1>
          <p>If you can see this, PatternFly is working!</p>
        </CardBody>
      </Card>
    </div>
  );
}

export default AppTest;
