import React from 'react';

interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  activeColor?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  activeColor = 'cyan',
}) => {
  const colorMap: Record<string, string> = {
    cyan: 'bg-cyber-cyan/30 text-cyber-cyan border-cyber-cyan/50',
    emerald: 'bg-neon-emerald/30 text-neon-emerald border-neon-emerald/50',
    red: 'bg-neon-red/30 text-neon-red border-neon-red/50',
    amber: 'bg-neon-amber/30 text-neon-amber border-neon-amber/50',
  };

  return (
    <div className="segmented-control">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`segmented-option ${
            value === option.value ? colorMap[activeColor] : 'text-gray-400 hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
