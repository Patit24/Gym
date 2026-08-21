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
  accentColor = '#4F7CFF'
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 shrink-0 shadow-lg select-none">
      <div className="flex items-center justify-between gap-3">
        
        {/* Left Side: Back Button OR Logo + Greeting */}
        {backAction ? (
          <div className="flex items-center gap-2.5">
            <button
              onClick={backAction}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white flex items-center gap-1 transition-all border border-white/10"
              aria-label="Go Back"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
              <span className="text-xs font-bold">{backTitle || 'Back'}</span>
            </button>
            {title && (
              <span className="text-sm font-black text-white truncate max-w-[200px]">
                {title}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userName || 'User'}
                className="w-10 h-10 rounded-xl object-cover border-2 shadow-md"
                style={{ borderColor: accentColor }}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl p-[2px] shadow-md flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${accentColor}, #9333EA)` }}
              >
                <div className="w-full h-full bg-[#0B0F19] rounded-[9px] flex items-center justify-center">
                  <Activity className="w-5 h-5" style={{ color: accentColor }} />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-white">
                  {title}
                </span>
                <span
                  className="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider"
                  style={{
                    backgroundColor: `${accentColor}20`,
                    color: accentColor,
                    borderColor: `${accentColor}40`
                  }}
                >
                  {role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[220px]">
                {subtitle || (userName ? `Welcome, ${userName}` : 'Gym Management OS')}
              </p>
            </div>
          </div>
        )}

        {/* Right Side: Quick Action Icons (Notifications + Sign Out) */}
        <div className="flex items-center gap-2">
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white transition-all border border-white/10"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-400 border border-red-500/30 text-xs font-bold transition-all"
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
