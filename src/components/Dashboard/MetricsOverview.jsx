import {
  Card,
  CardBody,
  Gallery,
  GalleryItem
} from '@patternfly/react-core';
import { ExclamationTriangleIcon, ExclamationCircleIcon, InfoCircleIcon, CheckCircleIcon } from '@patternfly/react-icons';

const MetricCard = ({ label, value, color, icon: Icon }) => {
  // Simple, clean color scheme
  const colorStyles = {
    blue: {
      iconColor: '#0066cc',
      valueColor: '#0066cc'
    },
    red: {
      iconColor: '#c9190b',
      valueColor: '#c9190b'
    },
    yellow: {
      iconColor: '#f0ab00',
      valueColor: '#f0ab00'
    },
    green: {
      iconColor: '#3e8635',
      valueColor: '#3e8635'
    },
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <Card isCompact>
      <CardBody style={{ textAlign: 'center', padding: '16px' }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{
            fontSize: '0.875rem',
            color: '#6a6e73',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: '500'
          }}>
            {label}
          </span>
        </div>
        {Icon && (
          <div style={{ marginBottom: '4px' }}>
            <Icon
              size="md"
              style={{ color: style.iconColor }}
            />
          </div>
        )}
        <div style={{
          fontSize: '2rem',
          fontWeight: '600',
          color: style.valueColor,
          lineHeight: 1
        }}>
          {value}
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
