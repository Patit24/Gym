import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Role, BranchId } from '../../types/gym';
import {
  Building2,
  Smartphone,
  ShieldCheck,
  UserCheck,
  Bell,
  ChevronDown,
  Activity,
  Layers,
  Lock,
  LogOut,
  User
} from 'lucide-react';

interface TopNavigationProps {
  onSignOut?: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ onSignOut }) => {
  const {
    perspective,
    setPerspective,
    currentRole,
    setCurrentRole,
    selectedBranchId,
    setSelectedBranchId,
    branches,
    notifications,
    markNotificationRead,
    appUserAccount
  } = useGym();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const isSuperAdminOrOwner = appUserAccount?.role === 'Super Admin' || appUserAccount?.role === 'Owner';
  const isMember = appUserAccount?.role === 'Member';
  const isStaff = !isMember;

  const roles: Role[] = [
    'Super Admin',
    'Owner',
    'Branch Manager',
    'Receptionist',
    'Trainer',
    'Dietitian',
    'Accountant',
    'Employee',
    'Member'
  ];

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <header className="sticky top-0 z-50 bg-[#0B0D12]/90 backdrop-blur-xl border-b border-gym-border/80 px-4 lg:px-8 py-3 transition-all" role="banner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand Logo & Perspective Toggle */}
        <div className="flex items-center justify-between md:justify-start gap-6">
          <div 
            className="flex items-center gap-3 cursor-pointer select-none" 
            onClick={() => setPerspective(isMember ? 'mobile' : 'erp')}
            role="button"
            tabIndex={0}
            aria-label="Smart Gym Home"
            onKeyDown={(e) => e.key === 'Enter' && setPerspective(isMember ? 'mobile' : 'erp')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#27D980] p-[2px] shadow-lg shadow-gym-accentGlow">
              <div className="w-full h-full bg-[#0B0D12] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#27D980]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  SMART <span className="text-[#27D980]">GYM</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30">
                  App OS v4.5
                </span>
              </div>
              <p className="text-xs text-gym-subtext hidden sm:block">
                {isMember ? 'Member Mobile App' : 'Mobile App Ecosystem & Web ERP'}
              </p>
            </div>
          </div>

          {/* Perspective Selector Buttons (Visible for staff/admins) */}
          {isStaff && (
            <nav className="flex items-center bg-[#14171F] p-1 rounded-xl border border-gym-border" aria-label="System Perspectives">
              <button
                onClick={() => setPerspective('mobile')}
                aria-label="Switch to Mobile App View"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  perspective === 'mobile'
                    ? 'bg-[#27D980] text-gym-dark shadow-md shadow-[#27D980]/30 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-[#27D980]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile App OS</span>
              </button>
              <button
                onClick={() => setPerspective('erp')}
                aria-label="Switch to Web ERP View"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  perspective === 'erp'
                    ? 'bg-[#4F7CFF] text-white shadow-md shadow-[#4F7CFF]/30'
                    : 'text-slate-400 hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-[#4F7CFF]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Web ERP</span>
              </button>
              <button
                onClick={() => setPerspective('hardware')}
                aria-label="Switch to Door Terminal View"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  perspective === 'hardware'
                    ? 'bg-amber-500 text-gym-dark shadow-md shadow-amber-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-amber-400'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Door Terminal</span>
              </button>
            </nav>
          )}
        </div>

        {/* Branch Selector, Role Badge / Switcher, Notifications & Sign Out */}
        <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
          
          {/* Branch Picker */}
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

          {/* Role Display / Switcher */}
          <div className="relative">
            {isSuperAdminOrOwner ? (
              <>
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  aria-expanded={showRoleDropdown}
                  aria-label="Switch active role"
                  className="flex items-center gap-2 bg-[#14171F] hover:bg-[#1B202C] px-3 py-1.5 rounded-xl border border-gym-border text-xs font-medium text-slate-200 transition-all focus-visible:ring-2 focus-visible:ring-[#27D980]"
                >
                  <UserCheck className="w-4 h-4 text-[#27D980]" />
                  <span>Role: <strong className="text-white">{currentRole}</strong></span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#14171F] border border-gym-border rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gym-subtext uppercase tracking-wider border-b border-gym-border/50">
                      Switch Role Preview
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
                            ? 'bg-[#27D980]/15 text-[#27D980] font-semibold'
                            : 'text-slate-300 hover:bg-[#1E2330]'
                        }`}
                      >
                        <span>{r}</span>
                        {currentRole === r && <span className="w-1.5 h-1.5 rounded-full bg-[#27D980]" />}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 bg-[#14171F] px-3 py-1.5 rounded-xl border border-gym-border text-xs font-medium text-slate-200">
                {isMember ? <User className="w-4 h-4 text-[#27D980]" /> : <ShieldCheck className="w-4 h-4 text-[#4F7CFF]" />}
                <span>Role: <strong className="text-white">{currentRole}</strong></span>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={`Notifications (${unreadNotifications.length} unread)`}
              className="relative p-2 bg-[#14171F] hover:bg-[#1B202C] border border-gym-border rounded-xl text-slate-300 transition-all focus-visible:ring-2 focus-visible:ring-[#4F7CFF]"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#14171F] border border-gym-border rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                    <p className="text-xs text-center py-6 text-gym-subtext">No notifications right now.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          !n.read
                            ? 'bg-[#1E2330] border-[#4F7CFF]/30 text-white'
                            : 'bg-[#12151C] border-gym-border text-gym-subtext hover:text-slate-300'
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

          {/* Sign Out Button */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              aria-label="Sign out of Smart Gym"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
