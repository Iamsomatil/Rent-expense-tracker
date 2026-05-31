import React from 'react';
import { Milestone } from '../../types';
import { Rocket, Flag, Target, Trophy, LucideIcon } from 'lucide-react';

interface MilestoneBadgesProps {
  milestones: Milestone[];
}

const iconMap: Record<string, LucideIcon> = {
  rocket: Rocket,
  flag: Flag,
  target: Target,
  trophy: Trophy,
};

export const MilestoneBadges: React.FC<MilestoneBadgesProps> = ({ milestones }) => {
  return (
    <div className="flex justify-center gap-3 flex-wrap">
      {milestones.map((milestone) => {
        const Icon = iconMap[milestone.icon] || Target;
        return (
          <div
            key={milestone.percentage}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300 ${
              milestone.reached
                ? 'bg-neon-emerald/20 border border-neon-emerald/40'
                : 'bg-space-700/30 border border-space-500/20 opacity-50'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                milestone.reached
                  ? 'bg-neon-emerald/30 text-neon-emerald shadow-glow-emerald'
                  : 'bg-space-600/50 text-gray-500'
              }`}
            >
              <Icon size={20} />
            </div>
            <span
              className={`text-xs font-semibold ${
                milestone.reached ? 'text-neon-emerald' : 'text-gray-500'
              }`}
            >
              {milestone.percentage}%
            </span>
            <span
              className={`text-[10px] ${
                milestone.reached ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {milestone.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
