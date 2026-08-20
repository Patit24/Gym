import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useGym } from '../../context/GymContext';
import { 
  Activity, 
  User, 
  Bell, 
  LogOut, 
  CreditCard, 
  Dumbbell, 
  Utensils, 
  QrCode, 
  FileText, 
  Sparkles,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export const UserAppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { activeMember, appUserAccount, signOutApp, notifications, markNotificationRead } = useGym();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleSignOut = async () => {
    await signOutApp();
    navigate('/app/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col justify-between selection:bg-[#27D980] selection:text-black">
      
      {/* ── USER APP HEADER (MEMBERS ONLY) ── */}
      <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo & Member Tag */}
          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#27D980] p-[2px] shadow-lg shadow-[#27D980]/20">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#27D980]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  SMART <span className="text-[#27D980]">GYM</span>
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30">
                  MEMBER APP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Digital Pass, Workouts, Macro Diets & Biometrics
              </p>
            </div>
          </div>

          {/* Member Profile Badge, Notifications & Sign Out */}
          <div className="flex items-center gap-3">
            
            {/* Active Member Identity Badge */}
            <div className="flex items-center gap-2.5 bg-[#121826] border border-white/10 px-3 py-1.5 rounded-2xl">
              <img
                src={activeMember?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeMember?.name || 'Member')}`}
                alt={activeMember?.name || 'Member'}
                className="w-7 h-7 rounded-xl object-cover border border-[#27D980]/50"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-black text-white leading-tight">{activeMember?.name || 'Alex Morgan'}</div>
                <div className="text-[9px] font-mono text-[#27D980] leading-none">{activeMember?.membershipNo || 'SG-90210'}</div>
              </div>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-[#121826] hover:bg-[#1A2234] border border-white/10 rounded-xl text-slate-300 transition-all"
                title="Member Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#121826] border border-white/15 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#27D980]" />
                      <h4 className="font-bold text-white text-xs">My Notifications</h4>
                    </div>
                    <span className="text-[9px] font-bold bg-[#27D980]/20 text-[#27D980] px-2 py-0.5 rounded-full">
                      {unreadNotifications.length} New
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-center py-4 text-slate-400">No notifications.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            !n.read ? 'bg-[#1C253B] border-[#27D980]/40 text-white' : 'bg-[#0E131F] border-white/5 text-slate-400'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="font-bold text-[11px]">{n.title}</span>
                            <span className="text-[9px] text-slate-500">{n.timestamp}</span>
                          </div>
                          <p className="text-[10px] text-slate-300 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Member Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all"
              title="Sign Out of Member App"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

          </div>

        </div>
      </header>

      {/* ── USER MAIN CONTENT AREA ── */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 w-full flex-1" id="user-app-main">
        <Outlet />
      </main>

      {/* ── USER FOOTER ── */}
      <footer className="border-t border-white/10 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <span>Smart Gym Member App OS © 2026</span>
          <div className="flex items-center gap-4 text-[#27D980]">
            <span className="flex items-center gap-1 font-semibold">
              ● 24/7 Gate Pass Security: Active
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};
