import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface MobileNavTab {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
}

interface MobileBottomNavProps {
  tabs: MobileNavTab[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  accentColor?: string; // Default: '#4F7CFF'
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  tabs,
  activeTab,
  onSelectTab,
  accentColor = '#4F7CFF'
}) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 shadow-2xl pb-[max(0.375rem,env(safe-area-inset-bottom))]"
      role="navigation"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive ? 'font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{
                color: isActive ? accentColor : undefined
              }}
            >
              {/* Active Background Glow Pill */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-2xl opacity-15"
                  style={{ backgroundColor: accentColor }}
                />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}
                  style={{ color: isActive ? accentColor : 'currentColor' }}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] font-black flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] tracking-tight mt-0.5 ${
                  isActive ? 'font-black' : 'font-semibold'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
