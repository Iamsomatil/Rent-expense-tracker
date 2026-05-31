import React from 'react';
import { Status } from '../../types';
import { CheckCircle, AlertTriangle, Target, Clock, TrendingUp } from 'lucide-react';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getConfig = () => {
    switch (status) {
      case 'on-track':
        return {
          label: 'On Track',
          icon: TrendingUp,
          className: 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/50 shadow-glow-cyan',
        };
      case 'behind':
        return {
          label: 'Behind',
          icon: AlertTriangle,
          className: 'bg-neon-amber/20 text-neon-amber border-neon-amber/50 shadow-glow-amber',
        };
      case 'goal-reached':
        return {
          label: 'Goal Reached',
          icon: CheckCircle,
          className: 'bg-neon-emerald/20 text-neon-emerald border-neon-emerald/50 shadow-glow-emerald',
        };
      case 'overdue':
        return {
          label: 'Overdue',
          icon: Clock,
          className: 'bg-neon-red/20 text-neon-red border-neon-red/50 shadow-glow-red',
        };
      case 'surplus':
        return {
          label: 'Surplus',
          icon: Target,
          className: 'bg-neon-purple/20 text-neon-purple border-neon-purple/50 shadow-glow-purple',
        };
      default:
        return {
          label: 'Unknown',
          icon: AlertTriangle,
          className: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'status-badge text-xs px-3 py-1',
    md: 'status-badge text-sm px-4 py-1.5',
    lg: 'status-badge text-base px-5 py-2',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border ${config.className} ${sizeClasses[size]}`}
    >
      <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      <span className="font-semibold uppercase tracking-wider">{config.label}</span>
    </div>
  );
};
