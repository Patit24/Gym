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
  accentColor = '#00D4FF'
}) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1.5 pointer-events-none"
      role="navigation"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="max-w-md mx-auto pointer-events-auto bg-[#070A12]/85 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.6)] flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3.5 rounded-2xl transition-all duration-300 active:scale-90 cursor-pointer ${
                isActive ? 'font-black' : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{
                color: isActive ? accentColor : undefined
              }}
            >
              {/* Active Background Glow Pill */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-2xl transition-all duration-300"
                  style={{
                    backgroundColor: `${accentColor}18`,
                    border: `1px solid ${accentColor}40`,
                    boxShadow: `0 0 20px ${accentColor}30`
                  }}
                />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? 'scale-110' : 'opacity-70'
                  }`}
                  style={{
                    color: isActive ? accentColor : 'currentColor',
                    filter: isActive ? `drop-shadow(0 0 8px ${accentColor}80)` : undefined
                  }}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 px-1 min-w-4 h-4 bg-[#FF5C5C] text-white rounded-full text-[8px] font-black flex items-center justify-center shadow-[0_0_8px_#FF5C5C]">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] tracking-tight mt-1 transition-all duration-200 ${
                  isActive ? 'font-black text-white' : 'font-semibold text-slate-400'
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
