import {
  Card,
  CardBody,
  Gallery,
  GalleryItem
} from '@patternfly/react-core';
import { ExclamationTriangleIcon, ExclamationCircleIcon, InfoCircleIcon, CheckCircleIcon } from '@patternfly/react-icons';

const MetricCard = ({ label, value, color, icon: Icon }) => {
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
      isRounded
      style={{
        background: style.background,
        borderLeft: `4px solid ${style.borderColor}`,
        boxShadow: 'var(--pf-v5-global--BoxShadow--sm)',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardBody style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--pf-v5-global--spacer--md)' }}>
          <span style={{
            fontSize: 'var(--pf-v5-global--FontSize--sm)',
            fontWeight: 'var(--pf-v5-global--FontWeight--semi-bold)',
            color: style.textColor,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {label}
          </span>
          {Icon && (
            <Icon
              size="lg"
              style={{ color: style.textColor, opacity: 0.5 }}
            />
          )}
        </div>
        <span style={{
          fontSize: '2.5rem',
          fontWeight: 'var(--pf-v5-global--FontWeight--bold)',
          color: style.valueColor,
          lineHeight: 1
        }}>
          {value}
        </span>
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
          icon={InfoCircleIcon}
        />
      </GalleryItem>
      <GalleryItem>
        <MetricCard
          label="Critical"
          value={metrics.critical}
          color="red"
          icon={ExclamationCircleIcon}
        />
      </GalleryItem>
      <GalleryItem>
        <MetricCard
          label="Warning"
          value={metrics.warning}
          color="yellow"
          icon={ExclamationTriangleIcon}
        />
      </GalleryItem>
      <GalleryItem>
        <MetricCard
          label="Health Score"
          value={`${metrics.healthScore}/100`}
          color="green"
          icon={CheckCircleIcon}
        />
      </GalleryItem>
    </Gallery>
  );
};

export default MetricsOverview;
