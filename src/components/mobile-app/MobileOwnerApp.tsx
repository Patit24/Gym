import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Member, Role, BranchId, GoalType } from '../../types/gym';
import { MobileAppHeader } from './MobileAppHeader';
import { MobileBottomNav, MobileNavTab } from './MobileBottomNav';
import { PrivilegePassCard } from '../shared/PrivilegePassCard';
import {
  Home,
  Users,
  DollarSign,
  Bell,
  Layers,
  UserPlus,
  TrendingUp,
  CreditCard,
  Building2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  LogOut,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Phone,
  Mail,
  Scale,
  Flame,
  Award,
  ChevronRight,
  Check,
  Calendar,
  ShieldCheck,
  Send,
  Plus
} from 'lucide-react';

type Gender = 'Male' | 'Female' | 'Other';
type OwnerScreen = 
  | 'home'
  | 'members'
  | 'finance'
  | 'alerts'
  | 'more'
  | 'add-member'
  | 'member-profile'
  | 'add-trainer'
  | 'add-expense'
  | 'broadcast'
  | 'member-created-success';

export const MobileOwnerApp: React.FC = () => {
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
    signOutApp,
    notifications,
    markNotificationRead
  } = useGym();

  const [currentScreen, setCurrentScreen] = useState<OwnerScreen>('home');
  const [previousScreen, setPreviousScreen] = useState<OwnerScreen>('home');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newlyCreatedMember, setNewlyCreatedMember] = useState<Member | null>(null);
  const [searchMember, setSearchMember] = useState('');
  const [goalFilter, setGoalFilter] = useState<string>('all');

  // Add Member Form
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

  // Add Trainer Form
  const [trName, setTrName] = useState('');
  const [trMobile, setTrMobile] = useState('');
  const [trEmail, setTrEmail] = useState('');
  const [trSpecialization, setTrSpecialization] = useState('Strength & Conditioning');
  const [trSalary, setTrSalary] = useState(35000);
  const [isSubmittingTrainer, setIsSubmittingTrainer] = useState(false);

  // Add Expense Form
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<'Rent' | 'Electricity' | 'Maintenance' | 'Equipment' | 'Salary' | 'Marketing' | 'Supplements' | 'Software' | 'Other'>('Electricity');
  const [expAmount, setExpAmount] = useState<number>(2500);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  // Broadcast Notification Form
  const [notifTarget, setNotifTarget] = useState<'all' | 'active' | 'expired'>('all');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSuccess, setNotifSuccess] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const trainers = employees.filter((e) => e.role === 'Trainer' || e.role === 'Dietitian');
  const unreadNotifs = notifications.filter((n) => !n.read);

  // Financial Calculations
  const branchTransactions = transactions.filter((t) => t.branchId === selectedBranchId);
  const branchExpenses = expenses.filter((e) => e.branchId === selectedBranchId);
  const totalCollections = branchTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalExpenseAmount = branchExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalCollections - totalExpenseAmount;
  const isProfitPositive = netProfit >= 0;

  // Attendance
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckins = attendance.filter((a) => a.date === todayStr);

  const navigateTo = (screen: OwnerScreen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setCurrentScreen(previousScreen === currentScreen ? 'home' : previousScreen);
  };

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.membershipNo.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.mobile.includes(searchMember);
    const matchesGoal = goalFilter === 'all' || m.goal === goalFilter;
    return matchesSearch && matchesGoal;
  });

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName.trim() || !memMobile.trim()) return;
    setIsSubmittingMember(true);

    try {
      const selectedPlan = plans.find((p) => p.id === memPlanId) || plans[0];
      const today = new Date();
      const expiry = new Date();
      expiry.setDate(today.getDate() + (selectedPlan?.durationDays || 30));

      const created = await addMember({
        name: memName.trim(),
        mobile: memMobile.trim(),
        email: memEmail.trim() || `${memName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(memName)}`,
        gender: memGender,
        dob: '2000-01-01',
        heightCm: memHeight,
        weightKg: memWeight,
        startWeightKg: memWeight,
        bmi: Number((memWeight / ((memHeight / 100) * (memHeight / 100))).toFixed(1)),
        chestCm: 95,
        waistCm: 80,
        armsCm: 35,
        thighsCm: 55,
        bloodGroup: 'O+',
        emergencyContactName: 'Emergency Contact',
        emergencyMobile: memMobile.trim(),
        address: 'Downtown Metro',
        medicalHistory: 'None',
        goal: memGoal,
        referralSource: 'Mobile App Admission',
        branchId: selectedBranchId,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        startDate: today.toISOString().split('T')[0],
        endDate: expiry.toISOString().split('T')[0],
        expiryDate: expiry.toISOString().split('T')[0],
        paymentStatus: 'Paid',
        assignedTrainerId: memTrainerId || (trainers[0]?.id || 'emp-trainer-1'),
        pendingDues: 0,
        paidAmount: selectedPlan?.totalPrice || selectedPlan?.basePrice || 1500,
        totalPlanAmount: selectedPlan?.totalPrice || selectedPlan?.basePrice || 1500,
        faceEnrolled: false,
        lockerNumber: `L-${Math.floor(10 + Math.random() * 90)}`,
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
      setCurrentScreen('more');
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
      setExpAmount(2500);
      setCurrentScreen('finance');
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    setIsSendingBroadcast(true);

    try {
      await sendBulkNotification(notifTarget === 'active' ? 'all' : notifTarget, notifTitle.trim(), notifMessage.trim());
      setNotifSuccess('Push Broadcast sent to all target members successfully!');
      setNotifTitle('');
      setNotifMessage('');
      setTimeout(() => setNotifSuccess(''), 3000);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const isSubPage = [
    'add-member',
    'member-profile',
    'add-trainer',
    'add-expense',
    'broadcast',
    'member-created-success'
  ].includes(currentScreen);

  const bottomNavTabs: MobileNavTab[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'members', label: 'Members', icon: Users, badge: members.length },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadNotifs.length > 0 ? unreadNotifs.length : undefined },
    { id: 'more', label: 'More', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between selection:bg-[#4F7CFF] selection:text-white">
      
      {/* ── 1. COMPACT NATIVE MOBILE HEADER ── */}
      <MobileAppHeader
        title={isSubPage ? undefined : 'Smart Gym'}
        subtitle={isSubPage ? undefined : `${currentBranch?.name} (${currentBranch?.city})`}
        role={currentRole}
        accentColor="#4F7CFF"
        unreadCount={unreadNotifs.length}
        onOpenNotifications={() => navigateTo('alerts')}
        onSignOut={signOutApp}
        backAction={isSubPage ? goBack : undefined}
        backTitle={
          currentScreen === 'add-member' ? 'Admission Form' :
          currentScreen === 'member-profile' ? 'Member Profile' :
          currentScreen === 'add-trainer' ? 'New Coach' :
          currentScreen === 'add-expense' ? 'Record Expense' :
          currentScreen === 'broadcast' ? 'Broadcast Push' :
          currentScreen === 'member-created-success' ? 'Pass Generated' : 'Back'
        }
      />

      {/* ── 2. MAIN SCROLLABLE CONTENT ── */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 max-w-lg mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 1: HOME DASHBOARD
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Net Operating Profit Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#121727] via-[#0E1322] to-[#0A0D18] p-5 rounded-3xl border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
                  Net Operating Profit
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border ${
                    isProfitPositive
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {isProfitPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {isProfitPositive ? 'Surplus' : 'Deficit'}
                </span>
              </div>

              <div className="mt-2">
                <div className="text-3xl font-black tracking-tight text-white">
                  ₹{netProfit.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Collections</span>
                    <span className="text-emerald-400 font-black">₹{totalCollections.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-[1px] h-6 bg-white/10" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Expenses</span>
                    <span className="text-rose-400 font-black">₹{totalExpenseAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Metrics Cards Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div
                onClick={() => navigateTo('members')}
                className="bg-[#101422] hover:bg-[#151A2E] p-3.5 rounded-2xl border border-white/10 text-center cursor-pointer transition-all active:scale-95 shadow-md"
              >
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active</div>
                <div className="text-xl font-black text-white mt-0.5">{members.filter(m => m.status === 'Active').length}</div>
                <span className="text-[9px] text-[#4F7CFF] font-bold block mt-0.5">Members →</span>
              </div>

              <div className="bg-[#101422] p-3.5 rounded-2xl border border-white/10 text-center shadow-md">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Check-ins</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{todayCheckins.length}</div>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Today</span>
              </div>

              <div
                onClick={() => navigateTo('more')}
                className="bg-[#101422] hover:bg-[#151A2E] p-3.5 rounded-2xl border border-white/10 text-center cursor-pointer transition-all active:scale-95 shadow-md"
              >
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Trainers</div>
                <div className="text-xl font-black text-purple-400 mt-0.5">{trainers.length}</div>
                <span className="text-[9px] text-purple-400 font-bold block mt-0.5">Coaches →</span>
              </div>
            </div>

            {/* Quick Actions Title */}
            <div className="pt-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => navigateTo('add-member')}
                  className="bg-gradient-to-br from-[#1A2238] to-[#121727] hover:from-[#202B47] hover:to-[#161D32] active:scale-95 p-4 rounded-2xl border border-[#4F7CFF]/30 text-left transition-all shadow-lg group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#4F7CFF]/20 text-[#4F7CFF] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">+ Add Member</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Enroll new student</div>
                </button>

                <button
                  onClick={() => navigateTo('add-trainer')}
                  className="bg-gradient-to-br from-[#1A2238] to-[#121727] hover:from-[#202B47] hover:to-[#161D32] active:scale-95 p-4 rounded-2xl border border-purple-500/30 text-left transition-all shadow-lg group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">+ Add Trainer</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Register gym coach</div>
                </button>

                <button
                  onClick={() => navigateTo('add-expense')}
                  className="bg-gradient-to-br from-[#1A2238] to-[#121727] hover:from-[#202B47] hover:to-[#161D32] active:scale-95 p-4 rounded-2xl border border-rose-500/30 text-left transition-all shadow-lg group"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">+ Record Expense</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Add operational cost</div>
                </button>

                <button
                  onClick={() => navigateTo('broadcast')}
                  className="bg-gradient-to-br from-[#1A2238] to-[#121727] hover:from-[#202B47] hover:to-[#161D32] active:scale-95 p-4 rounded-2xl border border-emerald-500/30 text-left transition-all shadow-lg group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Send className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">Push Broadcast</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Notify entire gym</div>
                </button>
              </div>
            </div>

            {/* Recent Admissions Feed */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Recent Admissions
                </h3>
                <button
                  onClick={() => navigateTo('members')}
                  className="text-[11px] font-bold text-[#4F7CFF] hover:underline"
                >
                  View All ({members.length})
                </button>
              </div>

              <div className="space-y-2">
                {members.slice(0, 4).map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      setSelectedMember(member);
                      navigateTo('member-profile');
                    }}
                    className="p-3 bg-[#101422] hover:bg-[#151A2E] active:scale-[0.98] rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[#4F7CFF]/40"
                      />
                      <div>
                        <h4 className="text-xs font-black text-white">{member.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{member.membershipNo}</span>
                          <span>•</span>
                          <span className="text-[#4F7CFF] font-semibold">{member.planName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {member.status}
                      </span>
                      <span className="text-[9px] text-slate-400 block mt-1">Exp: {member.endDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 2: MEMBERS MANAGEMENT
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'members' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            
            {/* Search Bar & Add CTA */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, ID or mobile..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#101422] rounded-2xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF] transition-all"
                />
              </div>
              <button
                onClick={() => navigateTo('add-member')}
                className="px-3.5 py-2.5 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 text-white font-black text-xs flex items-center gap-1 shadow-lg shadow-[#4F7CFF]/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Admission</span>
              </button>
            </div>

            {/* Goal Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['all', 'Muscle Building', 'Weight Loss', 'Endurance', 'Flexibility'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGoalFilter(g)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                    goalFilter === g
                      ? 'bg-[#4F7CFF] text-white shadow-md'
                      : 'bg-[#101422] text-slate-400 border border-white/10 hover:text-white'
                  }`}
                >
                  {g === 'all' ? 'All Goals' : g}
                </button>
              ))}
            </div>

            {/* Members List */}
            <div className="space-y-2.5">
              {filteredMembers.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold">No members found</p>
                </div>
              ) : (
                filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMember(m);
                      navigateTo('member-profile');
                    }}
                    className="p-3.5 bg-[#101422] hover:bg-[#151A2E] active:scale-[0.98] rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={m.photoUrl}
                        alt={m.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-[#4F7CFF]/50 shadow-inner"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-white">{m.name}</h4>
                          <span
                            className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border uppercase ${
                              m.status === 'Active'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>{m.membershipNo}</span>
                          <span>•</span>
                          <span className="text-[#4F7CFF] font-semibold">{m.planName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-white">₹{m.paymentStatus === 'Paid' ? '1,500' : '0'}</div>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Exp: {m.endDate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 3: FINANCE & EXPENSES
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'finance' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Financial Overview Card */}
            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Financial Health</span>
                <button
                  onClick={() => navigateTo('add-expense')}
                  className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-[10px] flex items-center gap-1 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Record Expense</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10">
                  <span className="text-[10px] text-slate-400 font-medium block">Total Collections</span>
                  <span className="text-lg font-black text-emerald-400">₹{totalCollections.toLocaleString('en-IN')}</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">{branchTransactions.length} Transactions</span>
                </div>
                <div className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10">
                  <span className="text-[10px] text-slate-400 font-medium block">Total Expenses</span>
                  <span className="text-lg font-black text-rose-400">₹{totalExpenseAmount.toLocaleString('en-IN')}</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">{branchExpenses.length} Records</span>
                </div>
              </div>

              <div className="p-3 bg-[#07090E] rounded-2xl border border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Net Operational Balance</span>
                <span className={`text-base font-black ${isProfitPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{netProfit.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Recent Expenses List */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Expense Records ({branchExpenses.length})
              </h3>

              {branchExpenses.map((exp) => (
                <div key={exp.id} className="p-3.5 bg-[#101422] rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-white">{exp.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 font-medium">{exp.category}</span>
                      <span>•</span>
                      <span>{exp.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-400">-₹{exp.amount.toLocaleString('en-IN')}</span>
                    <span className="text-[9px] text-emerald-400 block font-semibold">{exp.status}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 4: ALERTS & BROADCAST
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'alerts' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Composer Card */}
            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <h3 className="text-xs font-black text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-[#4F7CFF]" />
                <span>Compose Push Notification</span>
              </h3>

              {notifSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{notifSuccess}</span>
                </div>
              )}

              <form onSubmit={handleBroadcast} className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Target Audience
                  </label>
                  <select
                    value={notifTarget}
                    onChange={(e) => setNotifTarget(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                  >
                    <option value="all">All Members & Coaches</option>
                    <option value="active">Active Members Only</option>
                    <option value="expired">Expired Members (Renewal Promo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Special Holiday Hours / New Batch"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Message Body
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Type broadcast message for instant push delivery..."
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingBroadcast}
                  className="w-full py-3 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#4F7CFF]/20"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingBroadcast ? 'Broadcasting Push...' : 'Send Broadcast Push'}</span>
                </button>
              </form>
            </div>

            {/* Notification Log History */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Recent Broadcasts
              </h4>
              {notifications.map((n) => (
                <div key={n.id} className="p-3 bg-[#101422] rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-white">{n.title}</span>
                    <span className="text-[9px] text-slate-400">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">{n.message}</p>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 5: MORE / SETTINGS
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'more' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Branch Facility Picker */}
            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <h3 className="text-xs font-black text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#4F7CFF]" />
                <span>Active Facility Branch</span>
              </h3>

              <div className="space-y-2">
                {branches.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBranchId(b.id as BranchId)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedBranchId === b.id
                        ? 'bg-[#4F7CFF]/15 border-[#4F7CFF] text-white font-bold'
                        : 'bg-[#0B0E17] border-white/10 text-slate-300 hover:bg-[#151A2E]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black">{b.name}</div>
                      <div className="text-[10px] text-slate-400">{b.city} • {b.phone}</div>
                    </div>
                    {selectedBranchId === b.id && <Check className="w-4 h-4 text-[#4F7CFF]" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Gym Trainers Directory */}
            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Certified Coaches ({trainers.length})</span>
                </h3>
                <button
                  onClick={() => navigateTo('add-trainer')}
                  className="text-[10px] font-black text-[#4F7CFF] hover:underline"
                >
                  + Add Coach
                </button>
              </div>

              <div className="space-y-2">
                {trainers.map((tr) => (
                  <div key={tr.id} className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={tr.photoUrl} alt={tr.name} className="w-9 h-9 rounded-xl object-cover border border-purple-500/40" />
                      <div>
                        <div className="text-xs font-black text-white">{tr.name}</div>
                        <div className="text-[10px] text-purple-400 font-semibold">{tr.specialization}</div>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-400">
                      <div>Salary: ₹{tr.baseSalary.toLocaleString('en-IN')}</div>
                      <div className="text-emerald-400 font-semibold">{tr.shift}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security & Sign Out */}
            <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">Smart Gym App OS</span>
                <span className="text-[#4F7CFF] font-mono text-[10px]">v4.5 Android Edition</span>
              </div>

              <button
                onClick={signOutApp}
                className="w-full py-3 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Owner Account</span>
              </button>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 1: ADD MEMBER (NATIVE IN-APP FORM)
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'add-member' && (
          <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <UserPlus className="w-4 h-4 text-[#4F7CFF]" />
              <span>Student Admission & VIP Pass Creation</span>
            </h3>

            <form onSubmit={handleCreateMember} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Sharma"
                  value={memName}
                  onChange={(e) => setMemName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Mobile No *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={memMobile}
                    onChange={(e) => setMemMobile(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={memEmail}
                    onChange={(e) => setMemEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Gender
                  </label>
                  <select
                    value={memGender}
                    onChange={(e) => setMemGender(e.target.value as Gender)}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Primary Goal
                  </label>
                  <select
                    value={memGoal}
                    onChange={(e) => setMemGoal(e.target.value as GoalType)}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                  >
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Endurance">Endurance</option>
                    <option value="Strength">Strength</option>
                    <option value="Flexibility">Flexibility</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Membership Package
                </label>
                <select
                  value={memPlanId}
                  onChange={(e) => setMemPlanId(e.target.value)}
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{(p.totalPrice || p.basePrice || 1500).toLocaleString('en-IN')} ({p.durationDays || 30} Days)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Assign Personal Coach
                </label>
                <select
                  value={memTrainerId}
                  onChange={(e) => setMemTrainerId(e.target.value)}
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                >
                  <option value="">Auto-Assign Primary Master Trainer</option>
                  {trainers.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      Coach {tr.name} ({tr.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingMember}
                  className="w-full py-3 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#4F7CFF]/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingMember ? 'Generating Obsidian Pass...' : 'Create Member & Issue VIP Pass'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 2: MEMBER CREATED SUCCESS
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'member-created-success' && newlyCreatedMember && (
          <div className="space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">Member Admitted Successfully!</h3>
              <p className="text-xs text-slate-400 mt-0.5">Obsidian Gold VIP Access Pass is Active</p>
            </div>

            <div className="w-full max-w-sm mx-auto">
              <PrivilegePassCard member={newlyCreatedMember} />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedMember(newlyCreatedMember);
                  navigateTo('member-profile');
                }}
                className="flex-1 py-3 rounded-2xl bg-[#101422] hover:bg-[#151A2E] border border-white/10 text-white font-bold text-xs"
              >
                View Profile
              </button>
              <button
                onClick={() => navigateTo('members')}
                className="flex-1 py-3 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] text-white font-black text-xs"
              >
                Members Directory
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 3: MEMBER PROFILE (MOBILE-FIRST)
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'member-profile' && selectedMember && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Header Avatar & Info */}
            <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-xl flex items-center gap-3.5">
              <img
                src={selectedMember.photoUrl}
                alt={selectedMember.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#4F7CFF] shadow-lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white">{selectedMember.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                    {selectedMember.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">ID: {selectedMember.membershipNo} • {selectedMember.mobile}</div>
                <div className="text-[10px] text-[#4F7CFF] font-bold mt-0.5">Goal: {selectedMember.goal}</div>
              </div>
            </div>

            {/* Obsidian Gold Card */}
            <div className="w-full max-w-sm mx-auto">
              <PrivilegePassCard member={selectedMember} />
            </div>

            {/* Details & Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 bg-[#101422] rounded-2xl border border-white/10">
                <span className="text-[10px] text-slate-400 font-medium block">Package Plan</span>
                <span className="text-xs font-black text-white block mt-0.5">{selectedMember.planName}</span>
                <span className="text-[9px] text-slate-400 mt-1 block">Valid Until: {selectedMember.endDate}</span>
              </div>

              <div className="p-3.5 bg-[#101422] rounded-2xl border border-white/10">
                <span className="text-[10px] text-slate-400 font-medium block">Payment Status</span>
                <span className="text-xs font-black text-emerald-400 block mt-0.5">₹1,500 Paid (UPI)</span>
                <span className="text-[9px] text-emerald-400 mt-1 block font-semibold">Active Clear</span>
              </div>
            </div>

            {/* Quick Member Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setNotifTitle(`Message for ${selectedMember.name}`);
                  navigateTo('broadcast');
                }}
                className="py-3 rounded-2xl bg-[#101422] hover:bg-[#151A2E] active:scale-95 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4 text-[#4F7CFF]" />
                <span>Notify Member</span>
              </button>

              <button
                onClick={() => alert(`Calling ${selectedMember.mobile}`)}
                className="py-3 rounded-2xl bg-[#101422] hover:bg-[#151A2E] active:scale-95 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Client</span>
              </button>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 4: ADD TRAINER
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'add-trainer' && (
          <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Coach Onboarding Form</span>
            </h3>

            <form onSubmit={handleCreateTrainer} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Coach Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rohit Deshmukh"
                  value={trName}
                  onChange={(e) => setTrName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={trMobile}
                    onChange={(e) => setTrMobile(e.target.value)}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="coach@smartgym.com"
                    value={trEmail}
                    onChange={(e) => setTrEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Specialization
                </label>
                <select
                  value={trSpecialization}
                  onChange={(e) => setTrSpecialization(e.target.value)}
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="Strength & Conditioning">Strength & Conditioning</option>
                  <option value="Weight Loss & HIIT">Weight Loss & HIIT</option>
                  <option value="Bodybuilding & Hypertrophy">Bodybuilding & Hypertrophy</option>
                  <option value="Functional & Rehab">Functional & Rehab</option>
                  <option value="Yoga & Mobility">Yoga & Mobility</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Monthly Base Salary (₹)
                </label>
                <input
                  type="number"
                  value={trSalary}
                  onChange={(e) => setTrSalary(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingTrainer}
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingTrainer ? 'Registering...' : 'Complete Coach Onboarding'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 5: ADD EXPENSE
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'add-expense' && (
          <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <DollarSign className="w-4 h-4 text-rose-400" />
              <span>Record Gym Operational Expense</span>
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Electricity Bill / Machine Lubrication"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Expense Category
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-rose-400"
                >
                  <option value="Electricity">Electricity</option>
                  <option value="Rent">Rent</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Salary">Staff Salary</option>
                  <option value="Supplements">Supplements Stock</option>
                  <option value="Marketing">Marketing & Ads</option>
                  <option value="Software">Software & Cloud</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  required
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingExpense ? 'Saving...' : 'Record & Deduct from Balance'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* ── 3. FIXED BOTTOM MOBILE NAVIGATION ── */}
      <MobileBottomNav
        tabs={bottomNavTabs}
        activeTab={
          ['add-member', 'member-profile', 'member-created-success'].includes(currentScreen) ? 'members' :
          currentScreen === 'add-expense' ? 'finance' :
          currentScreen === 'broadcast' ? 'alerts' :
          currentScreen === 'add-trainer' ? 'more' :
          currentScreen
        }
        onSelectTab={(tabId) => navigateTo(tabId as OwnerScreen)}
        accentColor="#4F7CFF"
      />

    </div>
  );
};
