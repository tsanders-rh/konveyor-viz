import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardTitle, CardBody, Title } from '@patternfly/react-core';

const IssueBreakdown = ({ issuesByType }) => {
  // Transform data for recharts
  const data = Object.entries(issuesByType).map(([type, count]) => ({
    type,
    count,
  }));

  return (
    <Card isRounded style={{ boxShadow: 'var(--pf-v5-global--BoxShadow--sm)' }}>
      <CardTitle>
        <Title headingLevel="h2" size="xl" style={{ fontWeight: 'var(--pf-v5-global--FontWeight--bold)' }}>
          Issues by Type
        </Title>
      </CardTitle>
      <CardBody>
        <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="type"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#3b82f6" name="Issues" radius={[8, 8, 0, 0]} />
        </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default IssueBreakdown;
