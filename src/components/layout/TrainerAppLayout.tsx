import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useGym } from '../../context/GymContext';
import { 
  Activity, 
  Dumbbell, 
  Users, 
  Utensils, 
  Calendar, 
  Bell, 
  LogOut, 
  UserPlus, 
  Sparkles,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const TrainerAppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { employees, appUserAccount, notifications, markNotificationRead, signOutApp } = useGym();
  
  const currentTrainer = employees.find(e => e.id === appUserAccount?.linkedId || e.role === 'Trainer') || employees[0];
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifications = notifications.filter(n => !n.read);

  const handleSignOut = async () => {
    await signOutApp();
    navigate('/app/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#090C13] text-slate-100 flex flex-col justify-between selection:bg-[#4F7CFF] selection:text-white">
      
      {/* ── TRAINER APP HEADER (DESKTOP ONLY) ── */}
      <header className="hidden md:block sticky top-0 z-50 bg-[#0E131F]/95 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand & Trainer Tag */}
          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-purple-500 p-[2px] shadow-lg shadow-[#4F7CFF]/20">
              <div className="w-full h-full bg-[#0E131F] rounded-[10px] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-[#4F7CFF]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  SMART <span className="text-[#4F7CFF]">TRAINER</span>
                </span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30">
                  TRAINER APP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Client Training Plans, Macro Diets & Performance Studio
              </p>
            </div>
          </div>

          {/* Trainer Profile, Notifications & Sign Out */}
          <div className="flex items-center gap-3">
            
            {/* Trainer Profile Badge */}
            <div className="flex items-center gap-2.5 bg-[#141B2D] border border-white/10 px-3 py-1.5 rounded-2xl">
              <img
                src={currentTrainer?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentTrainer?.name || 'Trainer')}`}
                alt={currentTrainer?.name || 'Trainer'}
                className="w-7 h-7 rounded-xl object-cover border border-[#4F7CFF]/50"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-black text-white leading-tight">{currentTrainer?.name || 'Vikram Rajput'}</div>
                <div className="text-[9px] text-[#4F7CFF] font-bold leading-none">{currentTrainer?.specialization || 'Master Strength Coach'}</div>
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-[#141B2D] hover:bg-[#1C253D] border border-white/10 rounded-xl text-slate-300 transition-all"
                title="Trainer Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#141B2D] border border-white/15 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#4F7CFF]" />
                      <h4 className="font-bold text-white text-xs">Training Alerts</h4>
                    </div>
                    <span className="text-[9px] font-bold bg-[#4F7CFF]/20 text-[#4F7CFF] px-2 py-0.5 rounded-full">
                      {unreadNotifications.length} New
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-center py-4 text-slate-400">No training alerts.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            !n.read ? 'bg-[#1E2842] border-[#4F7CFF]/40 text-white' : 'bg-[#0F1424] border-white/5 text-slate-400'
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

            {/* Trainer Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all"
              title="Sign Out of Trainer App"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

          </div>

        </div>
      </header>

      {/* ── TRAINER MAIN VIEW ── */}
      <main className="w-full flex-1 max-w-7xl mx-auto p-0 md:px-4 lg:px-8 md:py-6" id="trainer-app-main">
        <Outlet />
      </main>

      {/* ── TRAINER FOOTER (DESKTOP ONLY) ── */}
      <footer className="hidden md:block border-t border-white/10 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <span>Smart Gym Trainer Mobile Suite © 2026</span>
          <div className="flex items-center gap-4 text-[#4F7CFF]">
            <span className="flex items-center gap-1 font-semibold">
              ● Trainer Authorization: Active (Financial Admin Restriced)
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};
