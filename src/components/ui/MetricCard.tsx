import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  iconColor = 'text-cyber-cyan',
  trend,
  className = '',
}) => {
  const trendColors = {
    up: 'text-neon-emerald',
    down: 'text-neon-red',
    neutral: 'text-gray-400',
  };

  return (
    <div className={`metric-card ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-xl font-bold font-mono ${trend ? trendColors[trend] : 'text-white'}`}>
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl bg-space-600/30 ${iconColor}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};
