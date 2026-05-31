import React from 'react';
import { Status } from '../../types';

interface ProgressMeterProps {
  progress: number;
  status: Status;
  size?: number;
  strokeWidth?: number;
}

export const ProgressMeter: React.FC<ProgressMeterProps> = ({
  progress,
  status,
  size = 200,
  strokeWidth = 12,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cappedProgress = Math.min(progress, 100);
  const strokeDashoffset = circumference - (cappedProgress / 100) * circumference;

  const getStatusColor = () => {
    switch (status) {
      case 'on-track':
        return '#00f5ff';
      case 'behind':
        return '#fbbf24';
      case 'goal-reached':
      case 'surplus':
        return '#10b981';
      case 'overdue':
        return '#ef4444';
      default:
        return '#00f5ff';
    }
  };

  const color = getStatusColor();

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="progress-ring"
      >
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          filter="url(#glow)"
          style={{
            transition: 'stroke-dashoffset 0.5s ease-out',
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold font-mono glow-text"
          style={{ color }}
        >
          {Math.round(cappedProgress)}%
        </span>
        <span className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
          Progress
        </span>
      </div>
    </div>
  );
};
