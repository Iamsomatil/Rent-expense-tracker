import React from 'react';
import { LucideIcon, LayoutDashboard, PlusCircle, List, BarChart3, Settings } from 'lucide-react';

export type NavView = 'dashboard' | 'add' | 'transactions' | 'insights' | 'settings';

interface NavItem {
  id: NavView;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'add', label: 'Add', icon: PlusCircle },
  { id: 'transactions', label: 'History', icon: List },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface BottomNavProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card rounded-b-none border-t border-space-500/30 z-40">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`nav-item ${isActive ? 'nav-item-active' : 'text-gray-400 hover:text-white'}`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
