import {
  Card,
  CardBody,
  Gallery,
  GalleryItem
} from '@patternfly/react-core';

const MetricCard = ({ label, value, color }) => {
  // Map colors to PatternFly-compatible styles
  const colorStyles = {
    blue: {
      background: 'var(--pf-v5-global--palette--blue-50)',
      borderColor: 'var(--pf-v5-global--palette--blue-200)',
      textColor: 'var(--pf-v5-global--palette--blue-600)',
      valueColor: 'var(--pf-v5-global--palette--blue-700)'
    },
    red: {
      background: 'var(--pf-v5-global--palette--red-50)',
      borderColor: 'var(--pf-v5-global--palette--red-200)',
      textColor: 'var(--pf-v5-global--danger-color--100)',
      valueColor: 'var(--pf-v5-global--danger-color--200)'
    },
    yellow: {
      background: 'var(--pf-v5-global--palette--gold-50)',
      borderColor: 'var(--pf-v5-global--palette--gold-200)',
      textColor: 'var(--pf-v5-global--warning-color--100)',
      valueColor: 'var(--pf-v5-global--warning-color--200)'
    },
    green: {
      background: 'var(--pf-v5-global--palette--green-50)',
      borderColor: 'var(--pf-v5-global--palette--green-200)',
      textColor: 'var(--pf-v5-global--success-color--100)',
      valueColor: 'var(--pf-v5-global--success-color--200)'
    },
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <Card
      style={{
        background: style.background,
        borderLeft: `4px solid ${style.borderColor}`,
      }}
    >
      <CardBody>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontSize: 'var(--pf-v5-global--FontSize--sm)',
            fontWeight: 'var(--pf-v5-global--FontWeight--semi-bold)',
            color: style.textColor,
            marginBottom: 'var(--pf-v5-global--spacer--sm)'
          }}>
            {label}
          </span>
          <span style={{
            fontSize: '2rem',
            fontWeight: 'var(--pf-v5-global--FontWeight--bold)',
            color: style.valueColor
          }}>
            {value}
          </span>
        </div>
      </CardBody>
    </Card>
  );
};

const MetricsOverview = ({ metrics }) => {
  return (
    <Gallery hasGutter minWidths={{ md: '250px' }}>
      <GalleryItem>
        <MetricCard
          label="Total Issues"
          value={metrics.totalIssues}
          color="blue"
        />
      </GalleryItem>
      <GalleryItem>
        <MetricCard
          label="Critical"
          value={metrics.critical}
          color="red"
        />
      </GalleryItem>
      <GalleryItem>
        <MetricCard
          label="Warning"
          value={metrics.warning}
          color="yellow"
        />
      </GalleryItem>
      <GalleryItem>
        <MetricCard
          label="Health Score"
          value={`${metrics.healthScore}/100`}
          color="green"
        />
      </GalleryItem>
    </Gallery>
  );
};

export default MetricsOverview;
