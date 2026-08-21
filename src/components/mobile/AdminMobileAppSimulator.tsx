import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Member, Role, BranchId, GoalType } from '../../types/gym';

type Gender = 'Male' | 'Female' | 'Other';
import { PrivilegePassCard } from '../shared/PrivilegePassCard';
import {
  Home,
  Users,
  Dumbbell,
  DollarSign,
  Calendar,
  Activity,
  UserPlus,
  Plus,
  TrendingUp,
  CreditCard,
  Building2,
  Bell,
  Wifi,
  Battery,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  ShoppingBag,
  Lock,
  LogOut,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Copy,
  Clock,
  Phone,
  Mail,
  Scale,
  Flame,
  Award
} from 'lucide-react';

type AdminScreen = 
  | 'home'
  | 'members'
  | 'trainers'
  | 'finance'
  | 'more'
  | 'add-member'
  | 'member-profile'
  | 'add-trainer'
  | 'add-expense'
  | 'broadcast'
  | 'member-created-success';

export const AdminMobileAppSimulator: React.FC = () => {
  const {
    members,
    employees,
    plans,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    currentRole,
    transactions,
    expenses,
    attendance,
    addExpense,
    addMember,
    addEmployee,
    sendBulkNotification,
    signOutApp
  } = useGym();

  // Screen navigation state (ALL IN-APP, ZERO POPUPS)
  const [currentScreen, setCurrentScreen] = useState<AdminScreen>('home');
  const [previousScreen, setPreviousScreen] = useState<AdminScreen>('home');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newlyCreatedMember, setNewlyCreatedMember] = useState<Member | null>(null);
  const [searchMember, setSearchMember] = useState('');

  // ── Form States ──

  // Add Member form state
  const [memName, setMemName] = useState('');
  const [memMobile, setMemMobile] = useState('');
  const [memEmail, setMemEmail] = useState('');
  const [memGender, setMemGender] = useState<Gender>('Male');
  const [memGoal, setMemGoal] = useState<GoalType>('Muscle Building');
  const [memPlanId, setMemPlanId] = useState(plans[0]?.id || 'plan-annual-vip');
  const [memHeight, setMemHeight] = useState(175);
  const [memWeight, setMemWeight] = useState(75);
  const [memTrainerId, setMemTrainerId] = useState('');
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  // Add Trainer form state
  const [trName, setTrName] = useState('');
  const [trMobile, setTrMobile] = useState('');
  const [trEmail, setTrEmail] = useState('');
  const [trSalary, setTrSalary] = useState(25000);
  const [trSpecialization, setTrSpecialization] = useState('Strength & Conditioning');
  const [isSubmittingTrainer, setIsSubmittingTrainer] = useState(false);

  // Add Expense form state
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<string>('Maintenance');
  const [expAmount, setExpAmount] = useState(1500);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  // Broadcast form state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSuccess, setNotifSuccess] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Financial calculations
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const activeMembersCount = members.filter(m => m.status === 'Active').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayStr);

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.membershipNo.toLowerCase().includes(searchMember.toLowerCase())
  );

  const trainers = employees.filter(e => e.role === 'Trainer' || e.role === 'Dietitian');

  // Navigation helpers
  const navigateTo = (screen: AdminScreen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (['add-member', 'member-profile', 'member-created-success'].includes(currentScreen)) {
      setCurrentScreen('members');
    } else if (currentScreen === 'add-trainer') {
      setCurrentScreen('trainers');
    } else if (currentScreen === 'add-expense') {
      setCurrentScreen('finance');
    } else {
      setCurrentScreen(previousScreen || 'home');
    }
  };

  // ── Action Handlers ──

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName.trim() || !memMobile.trim()) return;
    setIsSubmittingMember(true);

    const plan = plans.find(p => p.id === memPlanId) || plans[0];
    const startDate = new Date().toISOString().split('T')[0];
    const endDateObj = new Date();
    endDateObj.setMonth(endDateObj.getMonth() + (plan?.durationMonths || 12));
    const endDate = endDateObj.toISOString().split('T')[0];
    const bmi = parseFloat((memWeight / ((memHeight / 100) ** 2)).toFixed(1));

    try {
      const created = await addMember({
        name: memName.trim(),
        mobile: memMobile.trim(),
        email: memEmail.trim() || `${memName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        dob: '1998-05-15',
        gender: memGender,
        heightCm: memHeight,
        weightKg: memWeight,
        startWeightKg: memWeight,
        bmi,
        chestCm: 100,
        waistCm: 84,
        armsCm: 37,
        thighsCm: 56,
        bloodGroup: 'O+',
        emergencyContactName: 'Family',
        emergencyMobile: memMobile,
        address: 'City Center',
        medicalHistory: 'None',
        goal: memGoal,
        referralSource: 'Mobile App Direct Entry',
        branchId: selectedBranchId,
        planId: plan.id,
        planName: plan.name,
        startDate,
        endDate,
        expiryDate: endDate,
        faceEnrolled: false,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(memName)}`,
        pendingDues: 0,
        assignedTrainerId: memTrainerId || undefined,
      });

      setNewlyCreatedMember(created);
      setMemName('');
      setMemMobile('');
      setMemEmail('');
      setCurrentScreen('member-created-success');
    } finally {
      setIsSubmittingMember(false);
    }
  };

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trName.trim()) return;
    setIsSubmittingTrainer(true);

    try {
      await addEmployee({
        id: `EMP-${Date.now()}`,
        name: trName.trim(),
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trName)}`,
        role: 'Trainer',
        mobile: trMobile.trim() || '+91 98765 00000',
        email: trEmail.trim() || `${trName.toLowerCase().replace(/\s+/g, '.')}@smartgym.com`,
        branchId: selectedBranchId,
        baseSalary: trSalary,
        ptCommissionRate: 15,
        ptSessionsCompleted: 0,
        joiningDate: new Date().toISOString().split('T')[0],
        shift: 'Morning 6AM - 2PM',
        attendanceDays: 0,
        specialization: trSpecialization,
      });
      setTrName('');
      setTrMobile('');
      setTrEmail('');
      setCurrentScreen('trainers');
    } finally {
      setIsSubmittingTrainer(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expAmount) return;
    setIsSubmittingExpense(true);

    try {
      await addExpense({
        name: expTitle.trim(),
        category: expCategory,
        amount: expAmount,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        status: 'Paid',
        branchId: selectedBranchId,
      });
      setExpTitle('');
      setExpAmount(1500);
      setCurrentScreen('finance');
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    setIsSendingBroadcast(true);

    try {
      await sendBulkNotification('all', `[Admin Announcement]: ${notifTitle}`, notifMessage);
      setNotifSuccess('Broadcast sent to all gym members & coaches!');
      setNotifTitle('');
      setNotifMessage('');
      setTimeout(() => {
        setNotifSuccess('');
        setCurrentScreen('home');
      }, 2000);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  // Determine if top header should show back button
  const isSubPage = [
    'add-member',
    'member-profile',
    'add-trainer',
    'add-expense',
    'broadcast',
    'member-created-success'
  ].includes(currentScreen);

  return (
    <div className="w-full flex items-center justify-center p-0 md:py-2 animate-in fade-in duration-300">
      
      {/* ── ADMIN MOBILE APP FRAME (Full Screen on Mobile / App, Phone Bezel on Desktop) ── */}
      <div className="relative w-full min-h-screen md:min-h-0 md:w-[410px] md:h-[840px] bg-[#0A0D14] md:border-[10px] md:border-[#1E2330] md:rounded-[56px] md:shadow-[0_0_60px_rgba(0,0,0,0.85)] md:ring-2 md:ring-white/20 flex flex-col justify-between overflow-hidden">
        
        {/* 1. Status Bar & Dynamic Island (Desktop Simulator Only) */}
        <div className="hidden md:flex relative z-30 pt-3 px-7 pb-2 items-center justify-between text-xs text-white bg-[#0A0D14] border-b border-white/10 shrink-0">
          <span className="font-extrabold text-xs tracking-tight text-white">9:41</span>
          
          <div className="w-28 h-6 bg-black rounded-full flex items-center justify-between px-3 text-[10px] text-[#4F7CFF] font-mono border border-white/20 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#4F7CFF] animate-ping" />
            <span className="font-black tracking-wider text-white">ADMIN OS</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-white" />
            <Battery className="w-4 h-4 text-[#4F7CFF]" />
          </div>
        </div>

        {/* 2. In-App Navigation Header */}
        <div className="px-4 py-2.5 bg-[#121622] border-b border-white/10 flex items-center justify-between z-20 shadow-md shrink-0">
          {isSubPage ? (
            <div className="flex items-center gap-2">
              <button
                onClick={goBack}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center gap-1 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-[11px] font-bold">Back</span>
              </button>
              <span className="text-xs font-black text-white capitalize">
                {currentScreen === 'add-member' && 'New Admission'}
                {currentScreen === 'member-profile' && 'Member Details'}
                {currentScreen === 'add-trainer' && 'New Coach'}
                {currentScreen === 'add-expense' && 'Record Expense'}
                {currentScreen === 'broadcast' && 'Broadcast Push'}
                {currentScreen === 'member-created-success' && 'Pass Generated'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#27D980] p-[2px] shadow-md">
                <div className="w-full h-full bg-[#0A0D14] rounded-[8px] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-[#4F7CFF]" />
                </div>
              </div>
              <div>
                <h3 className="text-xs font-black text-white leading-none">Smart Gym Admin</h3>
                <span className="text-[9px] font-bold text-[#4F7CFF] bg-[#4F7CFF]/15 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                  {currentRole}
                </span>
              </div>
            </div>
          )}

          {/* Quick Header Action Buttons */}
          {!isSubPage && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigateTo('add-member')}
                className="p-1.5 rounded-xl bg-[#4F7CFF] hover:bg-[#3D69EB] text-white shadow-md transition-all flex items-center gap-1"
                title="Add Member"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black hidden sm:inline">+ Member</span>
              </button>
              <button
                onClick={() => navigateTo('broadcast')}
                className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
                title="Broadcast Alert"
              >
                <Bell className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 3. Main In-App Scrollable Screen Area (ALL PAGES RENDER HERE) */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-none text-xs">
          
          {/* ════════ PAGE 1: HOME DASHBOARD ════════ */}
          {currentScreen === 'home' && (
            <div className="space-y-3.5 animate-in fade-in">
              
              {/* Financial KPI Banner */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-[#121622] to-[#181F30] border border-white/10 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Net Operating Profit</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                    netProfit >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {netProfit >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {netProfit >= 0 ? 'Profitable' : 'Deficit'}
                  </span>
                </div>

                <div className="text-2xl font-black text-white">
                  ₹{netProfit.toLocaleString('en-IN')}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px]">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Total Collections</span>
                    <strong className="text-emerald-400 font-extrabold">₹{totalRevenue.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Total Expenses</span>
                    <strong className="text-red-400 font-extrabold">₹{totalExpenses.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Quick Operational Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div 
                  onClick={() => navigateTo('members')}
                  className="p-3 rounded-2xl bg-[#121622] border border-white/10 text-center space-y-0.5 cursor-pointer hover:border-[#4F7CFF]/50 transition-all"
                >
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Active</span>
                  <span className="text-base font-black text-emerald-400">{activeMembersCount}</span>
                  <span className="text-[8px] text-slate-500 block">Members →</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 text-center space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Today</span>
                  <span className="text-base font-black text-[#4F7CFF]">{todayAttendance.length}</span>
                  <span className="text-[8px] text-slate-500 block">Check-ins</span>
                </div>
                <div 
                  onClick={() => navigateTo('trainers')}
                  className="p-3 rounded-2xl bg-[#121622] border border-white/10 text-center space-y-0.5 cursor-pointer hover:border-purple-500/50 transition-all"
                >
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Trainers</span>
                  <span className="text-base font-black text-purple-400">{trainers.length}</span>
                  <span className="text-[8px] text-slate-500 block">Coaches →</span>
                </div>
              </div>

              {/* In-App Quick Action Shortcuts */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">Management Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigateTo('add-member')}
                    className="p-3 rounded-2xl bg-[#141B2D] border border-white/10 hover:border-[#4F7CFF] transition-all text-left space-y-1 group"
                  >
                    <div className="w-7 h-7 rounded-xl bg-[#4F7CFF]/20 text-[#4F7CFF] flex items-center justify-center font-bold">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div className="font-black text-white text-xs">+ Add Member</div>
                    <div className="text-[9px] text-slate-400">Enroll new student</div>
                  </button>

                  <button
                    onClick={() => navigateTo('add-trainer')}
                    className="p-3 rounded-2xl bg-[#141B2D] border border-white/10 hover:border-purple-500 transition-all text-left space-y-1 group"
                  >
                    <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div className="font-black text-white text-xs">+ Add Trainer</div>
                    <div className="text-[9px] text-slate-400">Register gym coach</div>
                  </button>

                  <button
                    onClick={() => navigateTo('add-expense')}
                    className="p-3 rounded-2xl bg-[#141B2D] border border-white/10 hover:border-red-500 transition-all text-left space-y-1 group"
                  >
                    <div className="w-7 h-7 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="font-black text-white text-xs">+ Record Expense</div>
                    <div className="text-[9px] text-slate-400">Add operational cost</div>
                  </button>

                  <button
                    onClick={() => navigateTo('broadcast')}
                    className="p-3 rounded-2xl bg-[#141B2D] border border-white/10 hover:border-emerald-500 transition-all text-left space-y-1 group"
                  >
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="font-black text-white text-xs">📢 Push Broadcast</div>
                    <div className="text-[9px] text-slate-400">Notify entire gym</div>
                  </button>
                </div>
              </div>

              {/* Recent Admissions Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Recent Members</span>
                  <button onClick={() => navigateTo('members')} className="text-[10px] text-[#4F7CFF] font-bold">
                    View All →
                  </button>
                </div>

                <div className="space-y-1.5">
                  {members.slice(0, 3).map((mem) => (
                    <div
                      key={mem.id}
                      onClick={() => {
                        setSelectedMember(mem);
                        navigateTo('member-profile');
                      }}
                      className="p-2.5 rounded-2xl bg-[#121622] border border-white/10 hover:border-[#4F7CFF]/50 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={mem.photoUrl} alt={mem.name} className="w-8 h-8 rounded-xl object-cover border border-[#4F7CFF]" />
                        <div>
                          <div className="font-bold text-white text-xs leading-tight">{mem.name}</div>
                          <div className="text-[9px] text-slate-400">{mem.membershipNo} • {mem.planName}</div>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        mem.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                      }`}>
                        {mem.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ════════ PAGE 2: MEMBERS LIST ════════ */}
          {currentScreen === 'members' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-white text-sm">Members ({members.length})</h4>
                <button
                  onClick={() => navigateTo('add-member')}
                  className="px-2.5 py-1.5 rounded-xl bg-[#4F7CFF] text-white text-[10px] font-black flex items-center gap-1 shadow-md hover:bg-[#3D69EB] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name or ID..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full bg-[#121622] border border-white/10 rounded-2xl pl-8 pr-3 py-2 text-white text-xs outline-none focus:border-[#4F7CFF]"
                />
              </div>

              {/* Members List */}
              <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
                {filteredMembers.map((mem) => (
                  <div
                    key={mem.id}
                    onClick={() => {
                      setSelectedMember(mem);
                      navigateTo('member-profile');
                    }}
                    className="p-3 rounded-2xl bg-[#121622] border border-white/10 hover:border-[#4F7CFF]/50 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={mem.photoUrl} alt={mem.name} className="w-9 h-9 rounded-xl object-cover border border-[#4F7CFF]" />
                        <div>
                          <h5 className="font-black text-white text-xs">{mem.name}</h5>
                          <span className="text-[10px] text-slate-400 font-mono">{mem.membershipNo}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        mem.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                      }`}>
                        {mem.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-white/5">
                      <span>Plan: <strong className="text-slate-200">{mem.planName}</strong></span>
                      <span>Expires: <strong className="text-[#27D980]">{mem.expiryDate || mem.endDate}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ PAGE 3: ADD MEMBER (IN-APP NATIVE PAGE) ════════ */}
          {currentScreen === 'add-member' && (
            <form onSubmit={handleCreateMember} className="space-y-3 animate-in fade-in">
              <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 space-y-2.5">
                <div className="text-[10px] font-black text-[#4F7CFF] uppercase tracking-wide flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>1. Member Personal Information</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Vikram Sharma"
                    value={memName}
                    onChange={(e) => setMemName(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#4F7CFF]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-300">Mobile Number *</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={memMobile}
                      onChange={(e) => setMemMobile(e.target.value)}
                      className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#4F7CFF]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-300">Gender</label>
                    <select
                      value={memGender}
                      onChange={(e) => setMemGender(e.target.value as Gender)}
                      className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-2 py-2 text-white text-xs outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-300">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="member@gmail.com"
                    value={memEmail}
                    onChange={(e) => setMemEmail(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#4F7CFF]"
                  />
                </div>
              </div>

              {/* Physical Measurements */}
              <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 space-y-2.5">
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>2. Biometrics & Goal</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-300">Height (cm)</label>
                    <input
                      type="number"
                      value={memHeight}
                      onChange={(e) => setMemHeight(parseInt(e.target.value) || 170)}
                      className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-300">Weight (kg)</label>
                    <input
                      type="number"
                      value={memWeight}
                      onChange={(e) => setMemWeight(parseFloat(e.target.value) || 70)}
                      className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-300">Primary Fitness Goal</label>
                  <select
                    value={memGoal}
                    onChange={(e) => setMemGoal(e.target.value as GoalType)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-2 py-2 text-white text-xs outline-none"
                  >
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Body Recomposition">Body Recomposition</option>
                    <option value="Endurance & Cardio">Endurance & Cardio</option>
                    <option value="Rehab & Mobility">Rehab & Mobility</option>
                  </select>
                </div>
              </div>

              {/* Plan & Trainer Assignment */}
              <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 space-y-2.5">
                <div className="text-[10px] font-black text-purple-400 uppercase tracking-wide flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>3. Plan & Coach Assignment</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-300">Membership Package</label>
                  <select
                    value={memPlanId}
                    onChange={(e) => setMemPlanId(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-2 py-2 text-white text-xs outline-none"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{(p.totalPrice || p.basePrice || 0).toLocaleString('en-IN')} ({p.durationMonths} Mo)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-300">Assign Coach (Optional)</label>
                  <select
                    value={memTrainerId}
                    onChange={(e) => setMemTrainerId(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-2 py-2 text-white text-xs outline-none"
                  >
                    <option value="">No Dedicated Trainer</option>
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.specialization || 'Trainer'})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingMember}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#27D980] to-emerald-400 hover:brightness-110 text-black font-black text-xs shadow-lg shadow-[#27D980]/20 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>{isSubmittingMember ? 'Creating...' : 'Enroll & Auto-Generate Digital Pass 🚀'}</span>
              </button>
            </form>
          )}

          {/* ════════ PAGE 4: PASS CREATED SUCCESS (IN-APP) ════════ */}
          {currentScreen === 'member-created-success' && newlyCreatedMember && (
            <div className="space-y-4 animate-in fade-in text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center">
                <Check className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-black text-white">Member Enrolled Successfully!</h3>
                <p className="text-xs text-slate-400">Digital Access Pass is activated and gate access is enabled.</p>
              </div>

              {/* Obsidian Gold Privilege Pass */}
              <div className="flex justify-center scale-95">
                <PrivilegePassCard member={newlyCreatedMember} priorityText="VIP ACCESS" showFlipButton={false} />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedMember(newlyCreatedMember);
                    setCurrentScreen('member-profile');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#4F7CFF] text-white font-bold text-xs"
                >
                  View Profile
                </button>
                <button
                  onClick={() => setCurrentScreen('members')}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20"
                >
                  Members Directory
                </button>
              </div>
            </div>
          )}

          {/* ════════ PAGE 5: MEMBER PROFILE (IN-APP NATIVE PAGE) ════════ */}
          {currentScreen === 'member-profile' && selectedMember && (
            <div className="space-y-4 animate-in fade-in">
              {/* Obsidian Gold Card */}
              <div className="flex justify-center scale-95 -my-2">
                <PrivilegePassCard member={selectedMember} priorityText="VIP ACCESS" showFlipButton={false} />
              </div>

              {/* Member Details Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Plan</span>
                  <strong className="text-white text-xs">{selectedMember.planName}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Status</span>
                  <strong className="text-emerald-400 text-xs">{selectedMember.status} (Valid)</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Expiry Date</span>
                  <strong className="text-[#27D980] text-xs">{selectedMember.expiryDate || selectedMember.endDate}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Goal & BMI</span>
                  <strong className="text-cyan-400 text-xs">{selectedMember.goal} ({selectedMember.bmi} BMI)</strong>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 space-y-2">
                <div className="text-[10px] font-black text-slate-400 uppercase">Contact Information</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Mobile:</span>
                  <strong className="text-white">{selectedMember.mobile}</strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Email:</span>
                  <strong className="text-white">{selectedMember.email}</strong>
                </div>
              </div>
            </div>
          )}

          {/* ════════ PAGE 6: TRAINERS ROSTER ════════ */}
          {currentScreen === 'trainers' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-white text-sm">Gym Trainers ({trainers.length})</h4>
                <button
                  onClick={() => navigateTo('add-trainer')}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-600 text-white text-[10px] font-black flex items-center gap-1 shadow-md hover:bg-purple-700 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Trainer</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
                {trainers.map((tr) => (
                  <div
                    key={tr.id}
                    className="p-3.5 rounded-2xl bg-[#121622] border border-white/10 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={tr.photoUrl} alt={tr.name} className="w-10 h-10 rounded-xl object-cover border border-purple-500" />
                        <div>
                          <h5 className="font-black text-white text-xs">{tr.name}</h5>
                          <span className="text-[10px] text-purple-400 font-bold">{tr.specialization || 'Fitness Coach'}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                        Active Staff
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#0A0D14] p-2 rounded-xl border border-white/5">
                      <div>
                        <span className="text-slate-400 block">Base Salary:</span>
                        <strong className="text-white">₹{tr.baseSalary?.toLocaleString('en-IN')}/mo</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">PT Sessions:</span>
                        <strong className="text-[#27D980]">{tr.ptSessionsCompleted || 120} Done</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ PAGE 7: ADD TRAINER (IN-APP NATIVE PAGE) ════════ */}
          {currentScreen === 'add-trainer' && (
            <form onSubmit={handleCreateTrainer} className="space-y-3 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
                <div className="text-[10px] font-black text-purple-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Coach Details</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-300">Coach Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Verma"
                    value={trName}
                    onChange={(e) => setTrName(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-300">Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Strength & Bodybuilding"
                    value={trSpecialization}
                    onChange={(e) => setTrSpecialization(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-300">Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 00000"
                      value={trMobile}
                      onChange={(e) => setTrMobile(e.target.value)}
                      className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-300">Salary (₹/mo)</label>
                    <input
                      type="number"
                      value={trSalary}
                      onChange={(e) => setTrSalary(parseFloat(e.target.value) || 20000)}
                      className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingTrainer}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-lg transition-all"
                >
                  {isSubmittingTrainer ? 'Saving...' : 'Create Coach Account'}
                </button>
              </div>
            </form>
          )}

          {/* ════════ PAGE 8: FINANCE & P&L ════════ */}
          {currentScreen === 'finance' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-white text-sm">Finance & Expenses</h4>
                <button
                  onClick={() => navigateTo('add-expense')}
                  className="px-2.5 py-1.5 rounded-xl bg-red-500 text-white text-[10px] font-black flex items-center gap-1 shadow-md hover:bg-red-600 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Expense</span>
                </button>
              </div>

              {/* Profit & Loss Card */}
              <div className="p-3.5 rounded-2xl bg-[#121622] border border-white/10 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Financial Summary</div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div className="p-2 rounded-xl bg-[#0A0D14] border border-white/5">
                    <span className="text-[8px] text-slate-400 block">Revenue</span>
                    <strong className="text-emerald-400 font-black text-xs">₹{totalRevenue.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0A0D14] border border-white/5">
                    <span className="text-[8px] text-slate-400 block">Expenses</span>
                    <strong className="text-red-400 font-black text-xs">₹{totalExpenses.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0A0D14] border border-white/5">
                    <span className="text-[8px] text-slate-400 block">Net P&L</span>
                    <strong className="text-white font-black text-xs">₹{netProfit.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Expense List */}
              <div className="space-y-2">
                <div className="text-[10px] font-black text-slate-400 uppercase px-1">Recorded Expenses</div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {expenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-2.5 rounded-2xl bg-[#121622] border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white text-[11px]">{exp.name}</div>
                        <span className="text-[9px] text-slate-400">{exp.category} • {exp.date}</span>
                      </div>
                      <strong className="text-red-400 font-black">-₹{exp.amount.toLocaleString('en-IN')}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ PAGE 9: ADD EXPENSE (IN-APP NATIVE PAGE) ════════ */}
          {currentScreen === 'add-expense' && (
            <form onSubmit={handleAddExpense} className="space-y-3 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
                <div className="text-[10px] font-black text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Record Gym Expense</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-300">Expense Description *</label>
                  <input
                    type="text"
                    placeholder="e.g. AC Maintenance & Gas Refill"
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-300">Category</label>
                    <select
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value)}
                      className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-2 py-2 text-white text-xs outline-none"
                    >
                      <option value="Rent">Rent</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Salaries">Salaries</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Cleaning">Cleaning</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-300">Amount (₹) *</label>
                    <input
                      type="number"
                      value={expAmount}
                      onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-red-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs shadow-lg transition-all"
                >
                  {isSubmittingExpense ? 'Saving...' : 'Save Expense Record'}
                </button>
              </div>
            </form>
          )}

          {/* ════════ PAGE 10: BROADCAST ALERT (IN-APP NATIVE PAGE) ════════ */}
          {currentScreen === 'broadcast' && (
            <form onSubmit={handleSendBroadcast} className="space-y-3 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" />
                  <span>Send Gym Announcement</span>
                </div>

                {notifSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                    {notifSuccess}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-300">Notification Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Gym Timings & Weekend Special Workout"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-300">Message Body *</label>
                  <textarea
                    rows={4}
                    placeholder="Type announcement message to broadcast to all members & staff..."
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingBroadcast}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs shadow-lg transition-all"
                >
                  {isSendingBroadcast ? 'Sending Push...' : 'Send Broadcast Push Alert 🚀'}
                </button>
              </div>
            </form>
          )}

          {/* ════════ PAGE 11: MORE / SYSTEM SETTINGS ════════ */}
          {currentScreen === 'more' && (
            <div className="space-y-3 animate-in fade-in">
              <h4 className="font-black text-white text-sm">Admin System Management</h4>

              <div className="space-y-2">
                {/* Branch Switcher */}
                <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#4F7CFF]" />
                    <span>Active Gym Branch</span>
                  </div>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value as BranchId)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none font-semibold"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                    ))}
                  </select>
                </div>

                {/* Packages count */}
                <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[#27D980]" />
                    <span className="font-bold text-white text-xs">Membership Packages</span>
                  </div>
                  <span className="text-xs text-[#27D980] font-black">{plans.length} Active</span>
                </div>

                {/* Sign Out */}
                <button
                  onClick={signOutApp}
                  className="w-full py-2.5 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all mt-4"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Admin OS</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* 4. Bottom Mobile App Navigation Bar */}
        <div className="px-3 py-2 bg-[#101422] border-t border-white/10 flex items-center justify-around z-20 shrink-0">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'trainers', label: 'Trainers', icon: Dumbbell },
            { id: 'finance', label: 'Finance', icon: DollarSign },
            { id: 'more', label: 'More', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentScreen === tab.id || (
              ['add-member', 'member-profile', 'member-created-success'].includes(currentScreen) && tab.id === 'members'
            ) || (
              currentScreen === 'add-trainer' && tab.id === 'trainers'
            ) || (
              currentScreen === 'add-expense' && tab.id === 'finance'
            );

            return (
              <button
                key={tab.id}
                onClick={() => setCurrentScreen(tab.id as AdminScreen)}
                className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-[#4F7CFF] font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'scale-110 text-[#4F7CFF]' : ''}`} />
                <span className="text-[9px] font-bold tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
};
