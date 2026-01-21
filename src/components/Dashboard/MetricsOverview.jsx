const MetricCard = ({ label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
  };

  const textColorClasses = {
    blue: 'text-blue-900',
    red: 'text-red-900',
    yellow: 'text-yellow-900',
    green: 'text-green-900',
  };

  const labelColorClasses = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${labelColorClasses[color]} mb-2`}>
          {label}
        </span>
        <span className={`text-3xl font-bold ${textColorClasses[color]}`}>
          {value}
        </span>
      </div>
    </div>
  );
};

const MetricsOverview = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <MetricCard
        label="Total Issues"
        value={metrics.totalIssues}
        color="blue"
      />
      <MetricCard
        label="Critical"
        value={metrics.critical}
        color="red"
      />
      <MetricCard
        label="Warning"
        value={metrics.warning}
        color="yellow"
      />
      <MetricCard
        label="Health Score"
        value={`${metrics.healthScore}/100`}
        color="green"
      />
    </div>
  );
};

export default MetricsOverview;
