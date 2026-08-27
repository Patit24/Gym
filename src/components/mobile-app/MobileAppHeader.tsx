import React from 'react';
import { Activity, Bell, LogOut, Building2, User, ChevronLeft } from 'lucide-react';
import { Role } from '../../types/gym';

interface MobileAppHeaderProps {
  title?: string;
  subtitle?: string;
  role: Role | string;
  userName?: string;
  userPhoto?: string;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  onSignOut?: () => void;
  backAction?: () => void;
  backTitle?: string;
  accentColor?: string; // e.g. '#4F7CFF' for Admin/Trainer, '#27D980' for Member
}

export const MobileAppHeader: React.FC<MobileAppHeaderProps> = ({
  title = 'Smart Gym',
  subtitle,
  role,
  userName,
  userPhoto,
  unreadCount = 0,
  onOpenNotifications,
  onSignOut,
  backAction,
  backTitle,
  accentColor = '#00D4FF'
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#070A12]/80 backdrop-blur-2xl border-b border-white/[0.08] px-4 py-3 shrink-0 shadow-[0_8px_32px_rgba(0,0,0,0.4)] select-none">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        
        {/* Left Side: Back Button OR Logo + Greeting */}
        {backAction ? (
          <div className="flex items-center gap-2.5">
            <button
              onClick={backAction}
              className="p-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:scale-90 text-white flex items-center gap-1.5 transition-all border border-white/[0.08] shadow-md"
              aria-label="Go Back"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
              <span className="text-xs font-bold">{backTitle || 'Back'}</span>
            </button>
            {title && (
              <span className="text-sm font-black text-white truncate max-w-[200px] tracking-tight">
                {title}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {userPhoto ? (
              <div className="relative">
                <img
                  src={userPhoto}
                  alt={userName || 'User'}
                  className="w-10 h-10 rounded-2xl object-cover border-2 shadow-[0_0_15px_rgba(0,212,255,0.25)]"
                  style={{ borderColor: accentColor }}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00F5A0] border-2 border-[#070A12]" />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-2xl p-[1.5px] shadow-[0_0_18px_rgba(0,212,255,0.3)] flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${accentColor}, #8B5CF6)` }}
              >
                <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                  <Activity className="w-5 h-5" style={{ color: accentColor }} />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                  Good Morning,
                </span>
                <span
                  className="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider"
                  style={{
                    backgroundColor: `${accentColor}18`,
                    color: accentColor,
                    borderColor: `${accentColor}35`
                  }}
                >
                  {role}
                </span>
              </div>
              <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1">
                <span>{userName || 'Member'}</span>
                <span className="animate-wave">👋</span>
              </h3>
            </div>
          </div>
        )}

        {/* Right Side: Quick Action Icons (Notifications + Sign Out) */}
        <div className="flex items-center gap-2">
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:scale-90 text-slate-300 hover:text-white transition-all border border-white/[0.08] shadow-md cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-200" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF5C5C] text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-[0_0_10px_#FF5C5C]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-2.5 rounded-2xl bg-[#FF5C5C]/10 hover:bg-[#FF5C5C]/20 active:scale-90 text-[#FF5C5C] border border-[#FF5C5C]/30 text-xs font-bold transition-all shadow-md cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
