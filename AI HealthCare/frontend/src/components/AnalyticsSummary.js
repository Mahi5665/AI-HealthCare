import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function AnalyticsSummary({ title, metrics }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <MetricItem key={index} {...metric} />
        ))}
      </div>
    </div>
  );
}

function MetricItem({ label, current, previous, unit, goal }) {
  const change = current - previous;
  const changePercent = ((change / previous) * 100).toFixed(1);
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const getTrendIcon = () => {
    if (isNeutral) return <Minus size={16} className="text-gray-500" />;
    if (isPositive) return <TrendingUp size={16} className="text-green-600" />;
    return <TrendingDown size={16} className="text-red-600" />;
  };

  const getTrendColor = () => {
    if (isNeutral) return 'text-gray-600';
    if (isPositive) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-2xl font-bold text-gray-900">
            {current}{unit}
          </span>
          <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{Math.abs(changePercent)}%</span>
          </div>
        </div>
        {goal && (
          <p className="text-xs text-gray-500 mt-1">
            Goal: {goal}{unit}
          </p>
        )}
      </div>
    </div>
  );
}

export default AnalyticsSummary;