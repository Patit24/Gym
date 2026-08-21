import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { AppUser, Role } from '../../types/gym';
import {
  Shield, UserPlus, Users, Dumbbell, CreditCard, Copy, Check, Eye, EyeOff,
  TrendingUp, DollarSign, Building2, Activity, ChevronRight, X, Sparkles,
  UserCheck, Lock, Key, Mail, Phone, Calendar, Award, BarChart3,
  CheckCircle2, AlertCircle, RefreshCw, Plus, Settings, Zap
} from 'lucide-react';

// Helper: auto-generate username
const generateUsername = (name: string): string => {
  const clean = name.toLowerCase().replace(/\s+/g, '.');
  return `${clean}.sg${new Date().getFullYear()}`;
};

// Helper: auto-generate password
const generatePassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pwd = 'SG@';
  for (let i = 0; i < 4; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
};

type AdminTab = 'dashboard' | 'create-member' | 'create-trainer' | 'users' | 'trainers';

export const AdminMobileConsole: React.FC = () => {
  const { members, employees, plans, branches, selectedBranchId, addMember, currentRole, addAppUser, addEmployee, appUsers } = useGym();

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [newCredential, setNewCredential] = useState<AppUser | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  // Create Member form state
  const [memberForm, setMemberForm] = useState({
    name: '', mobile: '', email: '', dob: '2000-01-01', gender: 'Male' as 'Male' | 'Female' | 'Other',
    heightCm: 170, weightKg: 70, startWeightKg: 70,
    planId: plans[0]?.id || '',
    goal: 'Muscle Building' as any,
    medicalHistory: '', address: '',
  });

  // Create Trainer form state
  const [trainerForm, setTrainerForm] = useState({
    name: '', mobile: '', email: '', joiningDate: new Date().toISOString().split('T')[0],
    baseSalary: 20000, shift: 'Morning 6AM-2PM',
    canViewMembers: true, canEditWorkouts: true, canEditDiets: false,
    canViewDashboard: true, canManageFinance: false, canAccessAdmin: false,
  });

  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const selectedPlan = plans.find(p => p.id === memberForm.planId) || plans[0];
  const branchMembers = members.filter(m => m.branchId === selectedBranchId);
  const branchTrainers = employees.filter(e => e.branchId === selectedBranchId && e.role === 'Trainer');

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // === CREATE MEMBER ===
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const plan = plans.find(p => p.id === memberForm.planId) || plans[0];
    const startDate = new Date().toISOString().split('T')[0];
    const endDateObj = new Date();
    endDateObj.setMonth(endDateObj.getMonth() + plan.durationMonths);
    const endDate = endDateObj.toISOString().split('T')[0];
    const bmi = parseFloat((memberForm.weightKg / ((memberForm.heightCm / 100) ** 2)).toFixed(1));

    try {
      const newMem = await addMember({
        name: memberForm.name, mobile: memberForm.mobile, email: memberForm.email,
        dob: memberForm.dob, gender: memberForm.gender,
        heightCm: memberForm.heightCm, weightKg: memberForm.weightKg,
        startWeightKg: memberForm.startWeightKg, bmi,
        chestCm: 0, waistCm: 0, armsCm: 0, thighsCm: 0,
        bloodGroup: 'O+', emergencyContactName: '', emergencyMobile: '',
        address: memberForm.address, medicalHistory: memberForm.medicalHistory,
        goal: memberForm.goal, referralSource: 'Admin Created',
        branchId: selectedBranchId, planId: plan.id, planName: plan.name,
        startDate, endDate, expiryDate: endDate,
        faceEnrolled: false, photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberForm.name}`,
        pendingDues: 0, lockerNumber: undefined,
      });

      const uname = generateUsername(memberForm.name);
      const pwd = generatePassword();

      const user: AppUser = {
        id: `USR-${Date.now()}`, username: uname, password: pwd,
        role: 'Member', linkedId: newMem.id, linkedName: newMem.name,
        branchId: selectedBranchId, createdAt: new Date().toISOString(),
        createdByAdminId: 'admin-1', isActive: true,
        permissions: {
          canViewDashboard: true, canEditWorkouts: false, canEditDiets: false,
          canViewMembers: false, canManageFinance: false, canAccessAdmin: false,
        },
      };
      await addAppUser(user);
      setNewCredential(user);
      setTab('users');
    } catch (err) {
      console.error("Error creating member:", err);
    }
  };

  // === CREATE TRAINER ===
  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    const uname = generateUsername(trainerForm.name);
    const pwd = generatePassword();
    const trainerId = `EMP-${Date.now()}`;

    try {
      // 1. Create Employee/Trainer record
      await addEmployee({
        id: trainerId,
        name: trainerForm.name,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${trainerForm.name}`,
        role: 'Trainer',
        mobile: trainerForm.mobile,
        email: trainerForm.email,
        branchId: selectedBranchId,
        baseSalary: trainerForm.baseSalary,
        ptCommissionRate: 15,
        ptSessionsCompleted: 0,
        joiningDate: trainerForm.joiningDate,
        shift: trainerForm.shift,
        attendanceDays: 0
      });

      // 2. Create User account
      const user: AppUser = {
        id: `USR-${Date.now()}`, username: uname, password: pwd,
        role: 'Trainer', linkedId: trainerId, linkedName: trainerForm.name,
        branchId: selectedBranchId, createdAt: new Date().toISOString(),
        createdByAdminId: 'admin-1', isActive: true,
        permissions: {
          canViewDashboard: trainerForm.canViewDashboard,
          canEditWorkouts: trainerForm.canEditWorkouts,
          canEditDiets: trainerForm.canEditDiets,
          canViewMembers: trainerForm.canViewMembers,
          canManageFinance: trainerForm.canManageFinance,
          canAccessAdmin: trainerForm.canAccessAdmin,
        },
      };
      await addAppUser(user);
      setNewCredential(user);
      setTab('users');
    } catch (err) {
      console.error("Error creating trainer:", err);
    }
  };

  const isAdmin = currentRole === 'Super Admin' || currentRole === 'Owner' || currentRole === 'Branch Manager';

  return (
    <div className="space-y-4 animate-in fade-in duration-300 text-xs">
      
      {/* Admin Header */}
      <div className="p-4 rounded-[26px] bg-gradient-to-br from-[#1A0A3D] via-[#120728] to-[#0A0416] border-2 border-purple-400 shadow-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Admin Console
          </span>
          <h2 className="text-base font-black text-white mt-0.5">{currentBranch.name}</h2>
          <p className="text-[11px] text-purple-200 font-semibold">{currentRole} Access</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#2D1060] border-2 border-purple-400 flex items-center justify-center shadow-xl">
          <Shield className="w-6 h-6 text-purple-300" />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="grid grid-cols-5 gap-1.5">
        {[
          { id: 'dashboard', icon: BarChart3, label: 'Stats' },
          { id: 'create-member', icon: UserPlus, label: 'Add User' },
          { id: 'create-trainer', icon: Dumbbell, label: 'Add Trainer' },
          { id: 'trainers', icon: Users, label: 'Trainers' },
          { id: 'users', icon: Key, label: 'Accounts' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id as AdminTab)}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl font-extrabold transition-all text-center ${
              tab === id
                ? 'bg-gradient-to-b from-purple-500 to-purple-700 text-white shadow-lg border border-purple-300'
                : 'bg-[#161C2E] text-slate-300 border border-white/10 hover:border-purple-400/40'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[9px] leading-none">{label}</span>
          </button>
        ))}
      </div>

      {/* ── DASHBOARD TAB ── */}
      {tab === 'dashboard' && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Branch Performance Dashboard</h3>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0F3630] to-[#071714] border-2 border-[#27D980]/60 space-y-1">
              <div className="text-[10px] font-bold text-[#27D980] uppercase flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Active Members
              </div>
              <div className="text-2xl font-black text-white">{currentBranch.activeMembers}</div>
              <div className="text-[9px] text-slate-300">in {currentBranch.name}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1A2338] to-[#0B1220] border-2 border-cyan-400/60 space-y-1">
              <div className="text-[10px] font-bold text-cyan-300 uppercase flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Live Inside
              </div>
              <div className="text-2xl font-black text-cyan-400">{currentBranch.currentCheckIns}</div>
              <div className="text-[9px] text-slate-300">checked in now</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#2E2412] to-[#120D05] border-2 border-amber-400/60 space-y-1">
              <div className="text-[10px] font-bold text-amber-300 uppercase flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Monthly Revenue
              </div>
              <div className="text-lg font-black text-white">₹{(currentBranch.monthlyRevenue / 100000).toFixed(1)}L</div>
              <div className="text-[9px] text-slate-300">this month</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1E1138] to-[#100821] border-2 border-purple-400/60 space-y-1">
              <div className="text-[10px] font-bold text-purple-300 uppercase flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5" /> Active Trainers
              </div>
              <div className="text-2xl font-black text-purple-400">{branchTrainers.length}</div>
              <div className="text-[9px] text-slate-300">trainers assigned</div>
            </div>
          </div>

          {/* All Branches Overview */}
          <h4 className="text-[11px] font-black text-white uppercase tracking-wider pt-1">All Branches Overview</h4>
          {branches.map(branch => (
            <div key={branch.id} className="p-3.5 rounded-2xl bg-[#161C2E] border border-white/15 flex items-center justify-between">
              <div>
                <div className="font-black text-white text-xs">{branch.name}</div>
                <div className="text-[10px] text-slate-300 font-medium">{branch.city} • {branch.activeMembers} members</div>
              </div>
              <div className="text-right">
                <div className="font-black text-[#27D980] text-xs">₹{(branch.monthlyRevenue / 100000).toFixed(1)}L</div>
                <div className="text-[10px] text-cyan-300">{branch.currentCheckIns} live</div>
              </div>
            </div>
          ))}

          {/* App Users Summary */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#1A0A3D] to-[#0A0416] border-2 border-purple-400/60 flex items-center justify-between">
            <div>
              <div className="font-black text-white text-xs flex items-center gap-1.5">
                <Key className="w-4 h-4 text-purple-400" />
                App Accounts Created
              </div>
              <div className="text-[10px] text-purple-200 mt-0.5">via Admin Console this session</div>
            </div>
            <div className="text-2xl font-black text-purple-300">{appUsers.length}</div>
          </div>
        </div>
      )}

      {/* ── CREATE MEMBER TAB ── */}
      {tab === 'create-member' && (
        <form onSubmit={handleCreateMember} className="space-y-3">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-cyan-400" />
            Create New Member Profile
          </h3>

          {[
            { label: 'Full Name *', type: 'text', field: 'name', placeholder: 'Rahul Sharma', required: true },
            { label: 'Mobile Number *', type: 'tel', field: 'mobile', placeholder: '+91 98765 43210', required: true },
            { label: 'Email Address', type: 'email', field: 'email', placeholder: 'rahul@email.com', required: false },
            { label: 'Date of Birth', type: 'date', field: 'dob', placeholder: '', required: false },
            { label: 'Home Address', type: 'text', field: 'address', placeholder: '12, MG Road, Mumbai', required: false },
          ].map(({ label, type, field, placeholder, required }) => (
            <div key={field}>
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide mb-1">{label}</label>
              <input
                type={type}
                required={required}
                placeholder={placeholder}
                value={(memberForm as any)[field]}
                onChange={e => setMemberForm(prev => ({ ...prev, [field]: e.target.value }))}
                className="w-full bg-[#121622] border-2 border-white/20 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-white text-xs font-semibold placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Gender</label>
              <select value={memberForm.gender} onChange={e => setMemberForm(prev => ({ ...prev, gender: e.target.value as any }))}
                className="w-full bg-[#121622] border-2 border-white/20 rounded-xl px-3 py-2.5 text-white text-xs font-semibold outline-none">
                {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Fitness Goal</label>
              <select value={memberForm.goal} onChange={e => setMemberForm(prev => ({ ...prev, goal: e.target.value as any }))}
                className="w-full bg-[#121622] border-2 border-white/20 rounded-xl px-3 py-2.5 text-white text-xs font-semibold outline-none">
                {['Weight Loss','Muscle Building','Body Recomposition','Endurance & Cardio','Rehab & Mobility'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Height (cm)</label>
              <input type="number" value={memberForm.heightCm} onChange={e => setMemberForm(prev => ({ ...prev, heightCm: +e.target.value }))}
                className="w-full bg-[#121622] border-2 border-white/20 rounded-xl px-3 py-2.5 text-white text-xs font-semibold outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Weight (kg)</label>
              <input type="number" value={memberForm.weightKg} onChange={e => setMemberForm(prev => ({ ...prev, weightKg: +e.target.value, startWeightKg: +e.target.value }))}
                className="w-full bg-[#121622] border-2 border-white/20 rounded-xl px-3 py-2.5 text-white text-xs font-semibold outline-none" />
            </div>
          </div>

          {/* Subscription Plan Selector */}
          <div>
            <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide mb-1">Select Subscription Plan *</label>
            <div className="space-y-2">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => setMemberForm(prev => ({ ...prev, planId: plan.id }))}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    memberForm.planId === plan.id
                      ? 'border-[#27D980] bg-[#0F3630] shadow-lg shadow-[#27D980]/20'
                      : 'border-white/15 bg-[#121622] hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-white text-xs">{plan.name}</div>
                      <div className="text-[10px] text-slate-300 font-medium">{plan.durationMonths} months • {plan.includedAddons.slice(0, 2).join(' • ')}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-[#27D980] text-sm">₹{plan.totalPrice.toLocaleString('en-IN')}</div>
                      {memberForm.planId === plan.id && <CheckCircle2 className="w-4 h-4 text-[#27D980] ml-auto mt-0.5" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Plan Preview */}
          {selectedPlan && (
            <div className="p-3 rounded-2xl bg-[#0F3630] border border-[#27D980]/40 text-[10px] space-y-1">
              <div className="font-black text-[#27D980] text-xs">📋 Subscription Details Preview</div>
              <div className="text-slate-200"><span className="text-slate-400">Plan:</span> {selectedPlan.name}</div>
              <div className="text-slate-200"><span className="text-slate-400">Duration:</span> {selectedPlan.durationMonths} months</div>
              <div className="text-slate-200"><span className="text-slate-400">Price:</span> ₹{selectedPlan.totalPrice.toLocaleString('en-IN')} (incl. GST)</div>
              <div className="text-slate-200"><span className="text-slate-400">Start Date:</span> {new Date().toISOString().split('T')[0]}</div>
              <div className="text-slate-200"><span className="text-slate-400">End Date:</span> {(() => { const d = new Date(); d.setMonth(d.getMonth() + selectedPlan.durationMonths); return d.toISOString().split('T')[0]; })()}</div>
              <div className="text-slate-200"><span className="text-slate-400">Perks:</span> {selectedPlan.includedAddons.join(', ')}</div>
            </div>
          )}

          <button type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-[#27D980] text-gym-dark font-black text-xs shadow-xl flex items-center justify-center gap-2">
            <UserPlus className="w-5 h-5" />
            Create Member + Auto-Generate Login Credentials
          </button>
        </form>
      )}

      {/* ── CREATE TRAINER TAB ── */}
      {tab === 'create-trainer' && (
        <form onSubmit={handleCreateTrainer} className="space-y-3">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-amber-400" />
            Create Trainer Profile
          </h3>

          {[
            { label: 'Trainer Full Name *', type: 'text', field: 'name', placeholder: 'Arjun Mehta', required: true },
            { label: 'Mobile Number *', type: 'tel', field: 'mobile', placeholder: '+91 97777 11111', required: true },
            { label: 'Email Address *', type: 'email', field: 'email', placeholder: 'arjun@smartgym.in', required: true },
            { label: 'Joining Date', type: 'date', field: 'joiningDate', placeholder: '', required: false },
            { label: 'Shift Timing', type: 'text', field: 'shift', placeholder: 'Morning 6AM-2PM', required: false },
          ].map(({ label, type, field, placeholder, required }) => (
            <div key={field}>
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide mb-1">{label}</label>
              <input
                type={type}
                required={required}
                placeholder={placeholder}
                value={(trainerForm as any)[field]}
                onChange={e => setTrainerForm(prev => ({ ...prev, [field]: e.target.value }))}
                className="w-full bg-[#121622] border-2 border-white/20 focus:border-amber-400 rounded-xl px-3 py-2.5 text-white text-xs font-semibold placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Base Monthly Salary (₹)</label>
            <input type="number" value={trainerForm.baseSalary} onChange={e => setTrainerForm(prev => ({ ...prev, baseSalary: +e.target.value }))}
              className="w-full bg-[#121622] border-2 border-white/20 rounded-xl px-3 py-2.5 text-white text-xs font-semibold outline-none" />
          </div>

          {/* Permissions Panel */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-amber-300 uppercase tracking-wide">
              🔐 Grant App Permissions to Trainer
            </label>
            <div className="bg-[#121622] rounded-2xl border border-white/15 divide-y divide-white/10">
              {[
                { key: 'canViewDashboard', label: 'View Branch Dashboard', desc: 'See stats & KPIs' },
                { key: 'canEditWorkouts', label: 'Assign & Edit Workouts', desc: 'Set member workout plans' },
                { key: 'canEditDiets', label: 'Assign Diet Plans', desc: 'Set member diet plans' },
                { key: 'canViewMembers', label: 'View All Members', desc: 'Browse member profiles' },
                { key: 'canManageFinance', label: 'View Finance Reports', desc: 'See revenue & transactions' },
                { key: 'canAccessAdmin', label: '⚠️ Full Admin Access', desc: 'CAUTION: Full admin powers' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between px-3 py-2.5">
                  <div>
                    <div className="font-extrabold text-white text-[11px]">{label}</div>
                    <div className="text-[9px] text-slate-400">{desc}</div>
                  </div>
                  <button type="button"
                    onClick={() => setTrainerForm(prev => ({ ...prev, [key]: !(prev as any)[key] }))}
                    className={`w-10 h-5 rounded-full transition-all relative ${(trainerForm as any)[key] ? 'bg-[#27D980]' : 'bg-slate-700'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${(trainerForm as any)[key] ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-gym-dark font-black text-xs shadow-xl flex items-center justify-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Create Trainer Profile + Auto-Generate Login
          </button>
        </form>
      )}

      {/* ── TRAINERS LIST TAB ── */}
      {tab === 'trainers' && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-amber-400" />
            Trainer Profiles — {currentBranch.name}
          </h3>

          {branchTrainers.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#161C2E] border border-white/10 text-center space-y-2">
              <Dumbbell className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-slate-400 font-bold text-xs">No trainers assigned yet</div>
              <button onClick={() => setTab('create-trainer')} className="px-4 py-2 rounded-xl bg-amber-400 text-gym-dark font-black text-xs">
                + Create First Trainer
              </button>
            </div>
          ) : branchTrainers.map(trainer => (
            <div key={trainer.id} className="p-3.5 rounded-2xl bg-[#161C2E] border border-amber-400/30 space-y-2">
              <div className="flex items-center gap-3">
                <img src={trainer.photoUrl} className="w-10 h-10 rounded-xl object-cover border-2 border-amber-400" alt={trainer.name} />
                <div className="flex-1">
                  <div className="font-black text-white text-xs">{trainer.name}</div>
                  <div className="text-[10px] text-amber-300 font-bold">PT Trainer • {trainer.shift}</div>
                  <div className="text-[9px] text-slate-400">{trainer.mobile}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-[#27D980] text-xs">₹{trainer.baseSalary.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-400">{trainer.ptSessionsCompleted} PT Sessions</div>
                </div>
              </div>

              {/* Login credentials for this trainer if available */}
              {appUsers.filter(u => u.linkedName === trainer.name).map(u => (
                <div key={u.id} className="p-2 rounded-xl bg-[#0F1420] border border-purple-400/30 text-[10px] space-y-0.5">
                  <div className="font-black text-purple-300 text-[9px] uppercase">App Login Credentials</div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">User: <strong className="text-white">{u.username}</strong></span>
                    <button onClick={() => handleCopy(u.username, `uname-${u.id}`)} className="text-cyan-400">
                      {copiedField === `uname-${u.id}` ? <Check className="w-3 h-3 text-[#27D980]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Pass: <strong className="text-amber-300">{u.password || '••••••'}</strong></span>
                    <button onClick={() => handleCopy(u.password || '', `pwd-${u.id}`)} className="text-cyan-400">
                      {copiedField === `pwd-${u.id}` ? <Check className="w-3 h-3 text-[#27D980]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── APP USERS / ACCOUNTS TAB ── */}
      {tab === 'users' && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" />
            App Login Accounts
          </h3>

          {/* Newly Created Credentials Banner */}
          {newCredential && (
            <div className="p-4 rounded-[22px] bg-gradient-to-br from-[#0F3630] via-[#071714] to-[#040E0C] border-2 border-[#27D980] shadow-2xl space-y-3 animate-in zoom-in-95">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#27D980]" />
                <div>
                  <h4 className="font-black text-white text-xs">✅ Account Created Successfully!</h4>
                  <p className="text-[10px] text-[#27D980] font-semibold">Share these credentials with {newCredential.linkedName}</p>
                </div>
                <button onClick={() => setNewCredential(null)} className="ml-auto text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Username Field */}
              <div className="bg-[#0A0D14] p-3 rounded-xl border border-[#27D980]/40 space-y-1">
                <div className="text-[9px] font-black text-[#27D980] uppercase tracking-wider">App Username</div>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-black text-white bg-black/40 px-2 py-1 rounded-lg flex-1">{newCredential.username}</code>
                  <button onClick={() => handleCopy(newCredential.username, 'new-uname')}
                    className="p-2 rounded-xl bg-[#27D980] text-gym-dark font-black shadow-md flex items-center gap-1 text-[10px]">
                    {copiedField === 'new-uname' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedField === 'new-uname' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Password Field */}
              <div className="bg-[#0A0D14] p-3 rounded-xl border border-amber-400/40 space-y-1">
                <div className="text-[9px] font-black text-amber-300 uppercase tracking-wider">App Password</div>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-black text-amber-200 bg-black/40 px-2 py-1 rounded-lg flex-1">
                    {showPwd ? newCredential.password : '●●●●●●'}
                  </code>
                  <div className="flex gap-1">
                    <button onClick={() => setShowPwd(p => !p)}
                      className="p-2 rounded-xl bg-[#1A2030] text-slate-300 border border-white/20">
                      {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => handleCopy(newCredential.password || '', 'new-pwd')}
                      className="p-2 rounded-xl bg-amber-400 text-gym-dark font-black shadow-md flex items-center gap-1 text-[10px]">
                      {copiedField === 'new-pwd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedField === 'new-pwd' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-[9px] text-slate-400">Role</div>
                  <div className="font-black text-white text-[11px]">{newCredential.role}</div>
                </div>
                <div className="flex-1 p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-[9px] text-slate-400">Name</div>
                  <div className="font-black text-white text-[11px] truncate">{newCredential.linkedName}</div>
                </div>
                <div className="flex-1 p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-[9px] text-slate-400">Status</div>
                  <div className="font-black text-[#27D980] text-[11px]">Active</div>
                </div>
              </div>
            </div>
          )}

          {/* All Users List */}
          {appUsers.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#161C2E] border border-white/10 text-center space-y-2">
              <Key className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-slate-400 font-bold text-xs">No accounts created yet</div>
              <div className="text-[10px] text-slate-500">Create a member or trainer to auto-generate login credentials</div>
            </div>
          ) : appUsers.map(user => (
            <div key={user.id} className="p-3.5 rounded-2xl bg-[#161C2E] border border-purple-400/30 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-black text-white text-xs flex items-center gap-1.5">
                    {user.role === 'Trainer' ? <Dumbbell className="w-3.5 h-3.5 text-amber-400" /> : <UserCheck className="w-3.5 h-3.5 text-cyan-400" />}
                    {user.linkedName}
                  </div>
                  <div className="text-[10px] text-purple-300 font-bold">{user.role} • {user.branchId.replace('branch-', 'Branch ')}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${user.isActive ? 'bg-[#27D980]/20 text-[#27D980] border border-[#27D980]/40' : 'bg-red-500/20 text-red-400'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#0A0D14] p-2 rounded-xl border border-white/10">
                  <div className="text-[9px] text-slate-400">Username</div>
                  <div className="font-black text-white text-[10px] truncate">{user.username}</div>
                </div>
                <div className="bg-[#0A0D14] p-2 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] text-slate-400">Password</div>
                    <div className="font-black text-amber-300 text-[10px]">••••••</div>
                  </div>
                  <button onClick={() => handleCopy(user.password || '', user.id)} className="text-cyan-400">
                    {copiedField === user.id ? <Check className="w-3.5 h-3.5 text-[#27D980]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
