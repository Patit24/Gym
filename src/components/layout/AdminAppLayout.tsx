import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useGym } from '../../context/GymContext';
import { Role, BranchId } from '../../types/gym';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Bell, 
  ChevronDown, 
  Activity, 
  Layers, 
  Lock, 
  LogOut, 
  User,
  Smartphone
} from 'lucide-react';

export const AdminAppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentRole, 
    setCurrentRole, 
    selectedBranchId, 
    setSelectedBranchId, 
    branches, 
    notifications, 
    markNotificationRead, 
    appUserAccount,
    signOutApp
  } = useGym();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const isSuperAdminOrOwner = appUserAccount?.role === 'Super Admin' || appUserAccount?.role === 'Owner';
  const roles: Role[] = [
    'Super Admin',
    'Owner',
    'Branch Manager',
    'Receptionist',
    'Trainer',
    'Dietitian',
    'Accountant',
    'Employee'
  ];

  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleSignOut = async () => {
    await signOutApp();
    navigate('/app/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-slate-100 flex flex-col justify-between selection:bg-[#4F7CFF] selection:text-white">
      
      {/* ── ADMIN ERP HEADER (DESKTOP ONLY) ── */}
      <header className="hidden md:block sticky top-0 z-50 bg-[#0B0D12]/95 backdrop-blur-xl border-b border-gym-border/80 px-4 lg:px-8 py-3 transition-all" role="banner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand Logo & Admin Console Title */}
          <div className="flex items-center justify-between md:justify-start gap-4">
            <Link to="/app/admin/dashboard" className="flex items-center gap-3 select-none">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#27D980] p-[2px] shadow-lg shadow-gym-accentGlow">
                <div className="w-full h-full bg-[#0B0D12] rounded-[10px] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#4F7CFF]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    SMART <span className="text-[#4F7CFF]">GYM</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30">
                    ADMIN ERP v4.5
                  </span>
                </div>
                <p className="text-xs text-gym-subtext hidden sm:block">
                  Executive Management, P&L, Members & POS Console
                </p>
              </div>
            </Link>
          </div>

          {/* Branch Picker, Role Switcher, Notifications & Sign Out */}
          <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
            
            {/* Branch Selector */}
            <div className="flex items-center gap-2 bg-[#14171F] px-3 py-1.5 rounded-xl border border-gym-border text-xs text-slate-300">
              <Building2 className="w-4 h-4 text-[#4F7CFF]" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value as BranchId)}
                aria-label="Select Gym Branch"
                className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-[#14171F] text-slate-200">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Switcher for Super Admin */}
            <div className="relative">
              {isSuperAdminOrOwner ? (
                <>
                  <button
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    aria-expanded={showRoleDropdown}
                    className="flex items-center gap-2 bg-[#14171F] hover:bg-[#1B202C] px-3 py-1.5 rounded-xl border border-gym-border text-xs font-medium text-slate-200 transition-all"
                  >
                    <UserCheck className="w-4 h-4 text-[#4F7CFF]" />
                    <span>Role: <strong className="text-white">{currentRole}</strong></span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showRoleDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#14171F] border border-gym-border rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-gym-subtext uppercase tracking-wider border-b border-gym-border/50">
                        Switch Staff Role View
                      </div>
                      {roles.map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            setCurrentRole(r);
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                            currentRole === r
                              ? 'bg-[#4F7CFF]/15 text-[#4F7CFF] font-semibold'
                              : 'text-slate-300 hover:bg-[#1E2330]'
                          }`}
                        >
                          <span>{r}</span>
                          {currentRole === r && <span className="w-1.5 h-1.5 rounded-full bg-[#4F7CFF]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 bg-[#14171F] px-3 py-1.5 rounded-xl border border-gym-border text-xs font-medium text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-[#4F7CFF]" />
                  <span>Role: <strong className="text-white">{currentRole}</strong></span>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-[#14171F] hover:bg-[#1B202C] border border-gym-border rounded-xl text-slate-300 transition-all"
                title="Admin Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#14171F] border border-gym-border rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-gym-border">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#4F7CFF]" />
                      <h4 className="font-bold text-white text-sm">System Notifications</h4>
                    </div>
                    <span className="text-[10px] font-bold bg-[#4F7CFF]/15 text-[#4F7CFF] px-2 py-0.5 rounded-full">
                      {unreadNotifications.length} New
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-center py-6 text-gym-subtext">No notifications.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            !n.read ? 'bg-[#1E2330] border-[#4F7CFF]/30 text-white' : 'bg-[#12151C] border-gym-border text-gym-subtext'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold">{n.title}</span>
                            <span className="text-[10px] text-gym-subtext">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-all"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

          </div>

        </div>
      </header>

      {/* ── ADMIN MAIN CONTENT ── */}
      <main className="w-full flex-1 max-w-7xl mx-auto p-0 md:px-4 lg:px-8 md:py-6" id="admin-app-main">
        <Outlet />
      </main>

      {/* ── ADMIN FOOTER (DESKTOP ONLY) ── */}
      <footer className="hidden md:block border-t border-gym-border/60 py-4 px-6 text-center text-xs text-gym-subtext" role="contentinfo">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Smart Gym Enterprise ERP © 2026 Admin Management Systems</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-[#4F7CFF] flex items-center gap-1 font-semibold">
              ● Server-Side Authorization: Active
            </span>
            <span>Gate Terminal Sync: Validated</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
