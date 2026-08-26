import React, { useState, useMemo } from 'react';
import { useGym } from '../../context/GymContext';
import { Member, GoalType, BranchId, AuditLog, Employee } from '../../types/gym';

type Gender = 'Male' | 'Female' | 'Other';
import { MobileAppHeader } from './MobileAppHeader';
import { MobileBottomNav, MobileNavTab } from './MobileBottomNav';
import { PrivilegePassCard } from '../shared/PrivilegePassCard';
import {
  Home,
  Users,
  CreditCard,
  Calendar,
  Layers,
  UserPlus,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  LogOut,
  Clock,
  Phone,
  Mail,
  DollarSign,
  Briefcase,
  Award,
  ChevronRight,
  Check,
  Send,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Building,
  Bell,
  Copy,
  ExternalLink,
  MessageSquare,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
  Building2
} from 'lucide-react';

type OwnerScreen =
  | 'home'
  | 'members'
  | 'finance'
  | 'attendance'
  | 'more'
  | 'trainers'
  | 'trainer-profile'
  | 'add-member'
  | 'member-profile'
  | 'add-trainer'
  | 'add-expense'
  | 'broadcast'
  | 'audit-logs'
  | 'member-created-success'
  | 'add-branch'
  | 'trainer-created-success';

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
    auditLogs,
    appUsers,
    addExpense,
    provisionMemberWithAccount,
    provisionTrainerWithAccount,
    resetMemberPassword,
    updateAccountStatus,
    resendMemberCredentials,
    addBranch,
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
  const [newlyCreatedTempPassword, setNewlyCreatedTempPassword] = useState<string>('');
  const [newlyCreatedWhatsAppUrl, setNewlyCreatedWhatsAppUrl] = useState<string>('');
  const [newlyCreatedWhatsAppStatus, setNewlyCreatedWhatsAppStatus] = useState<'SENT' | 'FAILED' | 'NOT_SENT'>('NOT_SENT');
  
  // Trainer Created State
  const [newlyCreatedTrainer, setNewlyCreatedTrainer] = useState<any>(null);
  const [newlyCreatedTrainerUser, setNewlyCreatedTrainerUser] = useState<any>(null);
  const [newlyCreatedTrainerTempPassword, setNewlyCreatedTrainerTempPassword] = useState<string>('');
  const [newlyCreatedTrainerWhatsAppUrl, setNewlyCreatedTrainerWhatsAppUrl] = useState<string>('');
  const [newlyCreatedTrainerWhatsAppStatus, setNewlyCreatedTrainerWhatsAppStatus] = useState<'SENT' | 'FAILED' | 'NOT_SENT'>('NOT_SENT');

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
  const [autoCreateLogin, setAutoCreateLogin] = useState(true);
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  // Add Trainer Form
  const [trName, setTrName] = useState('');
  const [trMobile, setTrMobile] = useState('');
  const [trEmail, setTrEmail] = useState('');
  const [trSpecialization, setTrSpecialization] = useState('Strength & Conditioning');
  const [trSalary, setTrSalary] = useState(35000);
  const [isSubmittingTrainer, setIsSubmittingTrainer] = useState(false);

  // Add Branch Form
  const [brName, setBrName] = useState('');
  const [brCode, setBrCode] = useState('');
  const [brCity, setBrCity] = useState('');
  const [brAddress, setBrAddress] = useState('');
  const [brPhone, setBrPhone] = useState('+91 98765 00000');
  const [brCapacity, setBrCapacity] = useState(150);
  const [brManager, setBrManager] = useState('');
  const [isSubmittingBranch, setIsSubmittingBranch] = useState(false);

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

  // Member Profile Credential States
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string>('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isResendingWhatsApp, setIsResendingWhatsApp] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetResult, setResetResult] = useState<{ password: string; whatsappUrl?: string } | null>(null);

  const currentBranch = (branches || []).find((b) => b?.id === selectedBranchId) || branches?.[0] || {
    id: selectedBranchId || 'branch-1',
    name: 'Main Flagship',
    code: 'HQ',
    city: 'Downtown',
    address: 'Fitness Blvd',
    phone: '+91 98765 00000',
    activeMembers: 0,
    currentCheckIns: 0,
    monthlyRevenue: 0,
    capacity: 100,
    manager: 'Admin'
  };

  // Trainer Roster & Profile States
  const [selectedTrainer, setSelectedTrainer] = useState<Employee | null>(null);
  const [searchTrainer, setSearchTrainer] = useState('');
  const [trainerRoleFilter, setTrainerRoleFilter] = useState<'all' | 'Trainer' | 'Dietitian'>('all');
  const [showTrainerPasswordMap, setShowTrainerPasswordMap] = useState<Record<string, boolean>>({});

  // Comprehensive Trainers & Coaches list
  const trainers = useMemo(() => {
    const fromEmp = (employees || []).filter((e) => e && (e.role === 'Trainer' || e.role === 'Dietitian'));
    const trainerUserLinkedIds = new Set(fromEmp.map(e => e.id));
    
    // Also include any appUsers with Trainer or Dietitian role who might not be in employees collection
    const fromUsers: Employee[] = (appUsers || [])
      .filter(u => (u.role === 'Trainer' || u.role === 'Dietitian') && !trainerUserLinkedIds.has(u.linkedId || u.id))
      .map(u => ({
        id: u.linkedId || u.id,
        name: u.linkedName || u.username,
        role: u.role as 'Trainer' | 'Dietitian',
        email: u.email || `${u.username.toLowerCase()}@smartgym.com`,
        phone: '+91 98765 00000',
        mobile: '+91 98765 00000',
        branchId: (u.branchId as BranchId) || 'branch-1',
        specialization: u.role === 'Dietitian' ? 'Sports Nutrition & Diets' : 'Personal Training & Strength',
        baseSalary: 35000,
        ptCommissionRate: 20,
        ptSessionsCompleted: 0,
        attendanceDays: 26,
        joiningDate: u.createdAt ? u.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        shift: 'Morning (06:00 - 14:00)',
        photoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&fit=crop&q=80',
        username: u.username,
        tempPassword: u.tempPassword
      }));

    return [...fromEmp, ...fromUsers];
  }, [employees, appUsers, members]);

  const unreadNotifs = (notifications || []).filter((n) => n && !n.read);

  // Financial Calculations
  const branchTransactions = (transactions || []).filter((t) => t && t.branchId === selectedBranchId);
  const branchExpenses = (expenses || []).filter((e) => e && e.branchId === selectedBranchId);
  const totalCollections = branchTransactions.reduce((acc, t) => acc + (t?.amount || 0), 0);
  const totalExpenseAmount = branchExpenses.reduce((acc, e) => acc + (e?.amount || 0), 0);
  const netProfit = totalCollections - totalExpenseAmount;
  const isProfitPositive = netProfit >= 0;

  // Attendance
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckins = (attendance || []).filter((a) => a && a.date === todayStr);

  const navigateTo = (screen: OwnerScreen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setCurrentScreen(previousScreen === currentScreen ? 'home' : previousScreen);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(''), 2500);
    }
  };

  // Filtered members list with strict null safety
  const filteredMembers = (members || []).filter((m) => {
    if (!m) return false;
    const nameStr = m.name || '';
    const membershipNoStr = m.membershipNo || '';
    const mobileStr = m.mobile || '';
    const query = (searchMember || '').toLowerCase();
    const matchesSearch =
      nameStr.toLowerCase().includes(query) ||
      membershipNoStr.toLowerCase().includes(query) ||
      mobileStr.includes(query);
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

      const res = await provisionMemberWithAccount({
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
      }, {
        createLogin: autoCreateLogin,
        sendWhatsApp: autoSendWhatsApp
      });

      setNewlyCreatedMember(res.member);
      setNewlyCreatedTempPassword(res.tempPassword || '');
      setNewlyCreatedWhatsAppUrl(res.whatsappDirectUrl || '');
      setNewlyCreatedWhatsAppStatus(res.whatsappStatus);

      setMemName('');
      setMemMobile('');
      setMemEmail('');
      setCurrentScreen('member-created-success');
    } finally {
      setIsSubmittingMember(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedMember) return;
    setIsResettingPassword(true);
    try {
      const res = await resetMemberPassword(selectedMember.id);
      setResetResult({
        password: res.newTempPassword,
        whatsappUrl: res.whatsappDirectUrl,
      });
      // Refresh local selected member state
      setSelectedMember(prev => prev ? {
        ...prev,
        tempPassword: res.newTempPassword,
        mustChangePassword: true,
        whatsappStatus: 'SENT'
      } : null);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleResendCredentials = async () => {
    if (!selectedMember) return;
    setIsResendingWhatsApp(true);
    try {
      const res = await resendMemberCredentials(selectedMember.id);
      if (res.whatsappDirectUrl) {
        window.open(res.whatsappDirectUrl, '_blank');
      }
      setSelectedMember(prev => prev ? { ...prev, whatsappStatus: 'SENT' } : null);
      setCopiedField('WhatsApp Resent!');
      setTimeout(() => setCopiedField(''), 2500);
    } finally {
      setIsResendingWhatsApp(false);
    }
  };

  const handleToggleAccountStatus = async (targetMember: Member) => {
    const isCurrentlyActive = targetMember.status === 'Active';
    const nextStatus = !isCurrentlyActive;
    await updateAccountStatus(targetMember.id, nextStatus);
    setSelectedMember(prev => prev ? { ...prev, status: nextStatus ? 'Active' : 'Suspended' } : null);
  };

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trName.trim()) return;
    setIsSubmittingTrainer(true);

    try {
      const res = await provisionTrainerWithAccount({
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
      }, {
        sendWhatsApp: true,
      });

      setNewlyCreatedTrainer(res.employee);
      setNewlyCreatedTrainerUser(res.appUser);
      setNewlyCreatedTrainerTempPassword(res.tempPassword);
      setNewlyCreatedTrainerWhatsAppUrl(res.whatsappDirectUrl || '');
      setNewlyCreatedTrainerWhatsAppStatus(res.whatsappStatus);

      setTrName('');
      setTrMobile('');
      setTrEmail('');
      setCurrentScreen('trainer-created-success');
    } finally {
      setIsSubmittingTrainer(false);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brName.trim() || !brCode.trim()) return;
    setIsSubmittingBranch(true);

    try {
      const newBranch = await addBranch({
        name: brName.trim(),
        code: brCode.trim().toUpperCase(),
        city: brCity.trim() || 'Smart City',
        address: brAddress.trim() || 'Fitness Boulevard',
        phone: brPhone.trim() || '+91 98765 00000',
        capacity: brCapacity || 150,
        manager: brManager.trim() || 'Branch General Manager',
      });

      setSelectedBranchId(newBranch.id);
      setBrName('');
      setBrCode('');
      setBrCity('');
      setBrAddress('');
      setBrManager('');
      setCurrentScreen('home');
    } finally {
      setIsSubmittingBranch(false);
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
    'trainers',
    'trainer-profile',
    'add-expense',
    'broadcast',
    'audit-logs',
    'member-created-success',
    'add-branch',
    'trainer-created-success'
  ].includes(currentScreen);

  const bottomNavTabs: MobileNavTab[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'members', label: 'Members', icon: Users, badge: members.length },
    { id: 'finance', label: 'Finance', icon: CreditCard },
    { id: 'attendance', label: 'Attendance', icon: Calendar, badge: todayCheckins.length > 0 ? todayCheckins.length : undefined },
    { id: 'more', label: 'More', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between selection:bg-[#4F7CFF] selection:text-white">
      
      {/* ── 1. COMPACT NATIVE MOBILE HEADER ── */}
      <MobileAppHeader
        title={isSubPage ? undefined : 'Smart Gym'}
        subtitle={isSubPage ? undefined : `${currentBranch.name} • ${currentBranch.code}`}
        role="Admin"
        accentColor="#4F7CFF"
        unreadCount={unreadNotifs.length}
        onOpenNotifications={() => navigateTo('broadcast')}
        onSignOut={signOutApp}
        backAction={isSubPage ? goBack : undefined}
        backTitle={
          currentScreen === 'trainers' ? 'Coaches Roster' :
          currentScreen === 'trainer-profile' ? 'Coach Profile' :
          currentScreen === 'add-member' ? 'Add Member' :
          currentScreen === 'member-profile' ? 'Member Profile' :
          currentScreen === 'add-trainer' ? 'Add Coach' :
          currentScreen === 'add-expense' ? 'Add Expense' :
          currentScreen === 'broadcast' ? 'Broadcast Alerts' :
          currentScreen === 'audit-logs' ? 'Audit Logs' :
          currentScreen === 'add-branch' ? 'New Branch' :
          currentScreen === 'trainer-created-success' ? 'Coach Created' :
          currentScreen === 'member-created-success' ? 'Member Created' : 'Back'
        }
      />

      {/* ── 2. MAIN SCROLLABLE CONTENT ── */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 max-w-lg mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 1: HOME OVERVIEW (EXECUTIVE DASHBOARD)
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Live Branch Selector Pill */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#101422] border border-white/10 shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#4F7CFF]/15 text-[#4F7CFF] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Active Branch</div>
                  <div className="text-xs font-black text-white">{currentBranch.name} ({currentBranch.code})</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="bg-[#07090E] text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/10 outline-none cursor-pointer focus:border-[#4F7CFF]"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => navigateTo('add-branch')}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#4F7CFF]"
                  title="Add New Branch"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Net Operating Profit Card */}
            <div className="bg-gradient-to-br from-[#121727] via-[#0E1322] to-[#0A0D18] p-5 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Net Operating Profit ({currentBranch.code})
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                  isProfitPositive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}>
                  {isProfitPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{isProfitPositive ? 'Surplus' : 'Deficit'}</span>
                </span>
              </div>

              <div className="mt-2">
                <div className="text-3xl font-black text-white tracking-tight">
                  ₹{Math.abs(netProfit).toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-slate-400">Collections:</span>
                    <strong className="text-emerald-400">₹{totalCollections.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="text-slate-400">Expenses:</span>
                    <strong className="text-rose-400">₹{totalExpenseAmount.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div
                onClick={() => navigateTo('members')}
                className="bg-[#101422] hover:bg-[#151A2E] p-3.5 rounded-2xl border border-white/10 text-center cursor-pointer transition-all active:scale-95 shadow-md"
              >
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Members</div>
                <div className="text-xl font-black text-white mt-0.5">{members.length}</div>
                <span className="text-[9px] text-[#4F7CFF] font-bold block mt-0.5">Directory →</span>
              </div>

              <div
                onClick={() => navigateTo('attendance')}
                className="bg-[#101422] hover:bg-[#151A2E] p-3.5 rounded-2xl border border-white/10 text-center cursor-pointer transition-all active:scale-95 shadow-md"
              >
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Check-ins</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{todayCheckins.length}</div>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Today</span>
              </div>

              <div
                onClick={() => navigateTo('trainers')}
                className="bg-[#101422] hover:bg-[#151A2E] p-3.5 rounded-2xl border border-white/10 text-center cursor-pointer transition-all active:scale-95 shadow-md"
              >
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Trainers</div>
                <div className="text-xl font-black text-purple-400 mt-0.5">{trainers.length}</div>
                <span className="text-[9px] text-purple-400 font-bold block mt-0.5">Coaches →</span>
              </div>
            </div>

            {/* Touch-Friendly 2x2 Quick Action Grid */}
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
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Auto-provision & WhatsApp</div>
                </button>

                <button
                  onClick={() => navigateTo('add-trainer')}
                  className="bg-gradient-to-br from-[#1A2238] to-[#121727] hover:from-[#202B47] hover:to-[#161D32] active:scale-95 p-4 rounded-2xl border border-purple-500/30 text-left transition-all shadow-lg group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">+ Add Coach</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">PT & trainer roster</div>
                </button>

                <button
                  onClick={() => navigateTo('add-expense')}
                  className="bg-gradient-to-br from-[#1A2238] to-[#121727] hover:from-[#202B47] hover:to-[#161D32] active:scale-95 p-4 rounded-2xl border border-rose-500/30 text-left transition-all shadow-lg group"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">+ Record Expense</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Bills, rent & repairs</div>
                </button>

                <button
                  onClick={() => navigateTo('broadcast')}
                  className="bg-gradient-to-br from-[#1A2238] to-[#121727] hover:from-[#202B47] hover:to-[#161D32] active:scale-95 p-4 rounded-2xl border border-amber-500/30 text-left transition-all shadow-lg group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Send className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">Push Broadcast</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Alert all members</div>
                </button>
              </div>
            </div>

            {/* Recent Member Admissions Stream */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Recent Members
                </h3>
                <button
                  onClick={() => navigateTo('members')}
                  className="text-[11px] font-bold text-[#4F7CFF] hover:underline"
                >
                  View All ({members.length})
                </button>
              </div>

              <div className="space-y-2">
                {filteredMembers.slice(0, 4).map((member) => (
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
                          <span>{member.username || member.membershipNo}</span>
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
            SCREEN 2: MEMBERS DIRECTORY
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'members' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            
            {/* Search & Add Member */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search member, username, mobile..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#101422] rounded-2xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
              </div>
              <button
                onClick={() => navigateTo('add-member')}
                className="px-3.5 py-2.5 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 text-white font-black text-xs flex items-center gap-1 shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Member</span>
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
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => {
                    setSelectedMember(member);
                    navigateTo('member-profile');
                  }}
                  className="p-3.5 bg-[#101422] hover:bg-[#151A2E] active:scale-[0.98] rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-[#4F7CFF]/50 shadow-inner"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-white">{member.name}</h4>
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                          {member.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>{member.username || member.membershipNo}</span>
                        <span>•</span>
                        <span className="text-[#4F7CFF] font-semibold">{member.goal}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-200">{member.planName}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Exp: {member.endDate}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 3: FINANCE & CASHFLOW
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'finance' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Live Branch Selector Pill */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#101422] border border-white/10 shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Branch Accounting</div>
                  <div className="text-xs font-black text-white">{currentBranch.name} ({currentBranch.code})</div>
                </div>
              </div>

              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-[#07090E] text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/10 outline-none cursor-pointer focus:border-[#4F7CFF]"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Branch Cashflow ({currentBranch.code})</span>
                <button
                  onClick={() => navigateTo('add-expense')}
                  className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] flex items-center gap-1 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Expense</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10">
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Collections</div>
                  <div className="text-lg font-black text-emerald-400 mt-0.5">₹{totalCollections.toLocaleString('en-IN')}</div>
                </div>
                <div className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10">
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Expenses</div>
                  <div className="text-lg font-black text-rose-400 mt-0.5">₹{totalExpenseAmount.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

            {/* Recent Expenses List */}
            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Recent Expenses Log</span>
              <div className="space-y-2">
                {branchExpenses.map((exp) => (
                  <div key={exp.id} className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-white">{exp.name}</div>
                      <div className="text-[10px] text-slate-400">{exp.category} • {exp.date}</div>
                    </div>
                    <span className="text-xs font-black text-rose-400">-₹{exp.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 4: ATTENDANCE
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'attendance' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Today's Check-in Log</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black">
                  {todayCheckins.length} Active In Gym
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {todayCheckins.map((rec) => (
                  <div key={rec.id} className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={rec.memberPhoto} alt={rec.memberName} className="w-8 h-8 rounded-xl object-cover border border-white/20" />
                      <div>
                        <div className="text-xs font-black text-white">{rec.memberName}</div>
                        <div className="text-[10px] text-slate-400">{rec.verificationMethod} • {rec.entryTime}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400">Verified ✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 5: MORE / SETTINGS / AUDIT LOGS
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'more' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Branch Selector */}
            <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  Active Gym Branch
                </span>
                <button
                  onClick={() => navigateTo('add-branch')}
                  className="px-2.5 py-1 rounded-xl bg-[#4F7CFF]/20 hover:bg-[#4F7CFF]/30 text-[#4F7CFF] border border-[#4F7CFF]/30 text-[10px] font-black flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Branch</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBranchId(b.id)}
                    className={`p-2.5 rounded-2xl text-left border transition-all ${
                      selectedBranchId === b.id
                        ? 'bg-[#4F7CFF]/20 border-[#4F7CFF] text-white shadow-md'
                        : 'bg-[#0B0E17] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-black truncate">{b.name}</div>
                    <div className="text-[9px] mt-0.5">{b.code} • {b.city}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Management Links */}
            <div className="bg-[#101422] rounded-3xl border border-white/10 overflow-hidden shadow-xl divide-y divide-white/5">
              <button
                onClick={() => navigateTo('add-branch')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151A2E] active:bg-[#1B2238] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-[#4F7CFF]" />
                  <div>
                    <span className="text-xs font-bold text-white block">+ Add New Gym Branch</span>
                    <span className="text-[10px] text-slate-400">Expand franchise network & multi-branch P&L</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => navigateTo('trainers')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151A2E] active:bg-[#1B2238] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Coaches & Trainers Roster ({trainers.length})</span>
                    <span className="text-[10px] text-slate-400">View roster, credentials, assigned clients & passwords</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => navigateTo('add-trainer')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151A2E] active:bg-[#1B2238] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">+ Add Trainer / Coach</span>
                    <span className="text-[10px] text-slate-400">Auto-generate login, temp password & WhatsApp</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => navigateTo('broadcast')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151A2E] active:bg-[#1B2238] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-white">Push Broadcast Notification</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => navigateTo('audit-logs')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151A2E] active:bg-[#1B2238] transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Security & Audit Logs</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Sign Out */}
            <button
              onClick={signOutApp}
              className="w-full py-3 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Owner Account</span>
            </button>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 1: ADD MEMBER (+ AUTO PROVISION & WHATSAPP)
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'add-member' && (
          <div className="bg-[#101422] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <UserPlus className="w-4 h-4 text-[#4F7CFF]" />
              <span>New Member Admission & Account Setup</span>
            </h3>

            <form onSubmit={handleCreateMember} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Roy"
                  value={memName}
                  onChange={(e) => setMemName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    WhatsApp Phone *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={memMobile}
                    onChange={(e) => setMemMobile(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@email.com"
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
                    Fitness Target
                  </label>
                  <select
                    value={memGoal}
                    onChange={(e) => setMemGoal(e.target.value as GoalType)}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                  >
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Body Recomposition">Body Recomposition</option>
                    <option value="Endurance & Cardio">Endurance & Cardio</option>
                    <option value="Rehab & Mobility">Rehab & Mobility</option>
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
                  <option value="">Auto Assign Default Coach</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialization})
                    </option>
                  ))}
                </select>
              </div>

              {/* Automatic Provisioning & WhatsApp Options */}
              <div className="p-3.5 bg-[#07090E] rounded-2xl border border-white/10 space-y-2.5">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Automatic Account & WhatsApp Setup
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-200">
                  <input
                    type="checkbox"
                    checked={autoCreateLogin}
                    onChange={(e) => setAutoCreateLogin(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4F7CFF] bg-[#121727] border-white/20 focus:ring-0"
                  />
                  <span>Create Member Login Account Automatically</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-200">
                  <input
                    type="checkbox"
                    checked={autoSendWhatsApp}
                    onChange={(e) => setAutoSendWhatsApp(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-[#121727] border-white/20 focus:ring-0"
                  />
                  <span>Send Login Credentials via WhatsApp</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingMember}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-[#27D980] hover:opacity-95 active:scale-95 disabled:opacity-50 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#4F7CFF]/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingMember ? 'Creating Account & Dispatching WhatsApp...' : 'Create Member & Dispatch Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 2: MEMBER CREATED SUCCESS & CREDENTIALS
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'member-created-success' && newlyCreatedMember && (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white">Member Admitted & Account Created!</h3>
              <p className="text-xs text-slate-400">Credentials generated and linked successfully</p>
            </div>

            {/* Credentials Card */}
            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div>
                  <div className="text-sm font-black text-white">{newlyCreatedMember.name}</div>
                  <div className="text-[10px] text-slate-400">ID: {newlyCreatedMember.membershipNo}</div>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30">
                  {newlyCreatedMember.planName}
                </span>
              </div>

              {/* Login Credentials Box */}
              <div className="p-3 bg-[#07090E] rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Username</span>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-mono text-white font-black">{newlyCreatedMember.username || newlyCreatedMember.membershipNo}</strong>
                    <button
                      onClick={() => copyToClipboard(newlyCreatedMember.username || newlyCreatedMember.membershipNo, 'Username')}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                      title="Copy Username"
                    >
                      {copiedField === 'Username' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Temporary Password</span>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-mono text-amber-400 font-black">{newlyCreatedTempPassword || newlyCreatedMember.tempPassword || 'Gym@48291'}</strong>
                    <button
                      onClick={() => copyToClipboard(newlyCreatedTempPassword || newlyCreatedMember.tempPassword || 'Gym@48291', 'Password')}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                      title="Copy Password"
                    >
                      {copiedField === 'Password' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* WhatsApp Status */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">
                    {newlyCreatedWhatsAppStatus === 'SENT' ? 'Credentials Sent via WhatsApp' : 'WhatsApp Ready'}
                  </span>
                </div>
                {newlyCreatedWhatsAppUrl && (
                  <button
                    onClick={() => window.open(newlyCreatedWhatsAppUrl, '_blank')}
                    className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-[10px] flex items-center gap-1 shadow-sm"
                  >
                    <span>Open Chat</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Copy Full Text */}
              <button
                onClick={() => {
                  const fullText = `Welcome to Smart Gym!\n\nHi ${newlyCreatedMember.name},\nYour member account is created.\nMember ID: ${newlyCreatedMember.membershipNo}\nUsername: ${newlyCreatedMember.username}\nTemporary Password: ${newlyCreatedTempPassword}\n\nPlease log in and set your new password.`;
                  copyToClipboard(fullText, 'FullCredentials');
                }}
                className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                {copiedField === 'FullCredentials' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedField === 'FullCredentials' ? 'Copied Full Credentials Message!' : 'Copy Full Credentials Message'}</span>
              </button>
            </div>

            {/* Membership Pass Card */}
            <div className="w-full max-w-sm mx-auto">
              <PrivilegePassCard member={newlyCreatedMember} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
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
                Done
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 3: MEMBER PROFILE & LOGIN ACCOUNT MANAGEMENT
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
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    selectedMember.status === 'Active'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}>
                    {selectedMember.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  ID: {selectedMember.membershipNo} • {selectedMember.mobile}
                </div>
                <div className="text-[10px] text-[#4F7CFF] font-bold mt-0.5">Goal: {selectedMember.goal}</div>
              </div>
            </div>

            {/* Obsidian Gold Card */}
            <div className="w-full max-w-sm mx-auto">
              <PrivilegePassCard member={selectedMember} />
            </div>

            {/* ── DEDICATED LOGIN ACCOUNT & CREDENTIALS SECTION ── */}
            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#4F7CFF]" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">Login Account</span>
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                  selectedMember.status === 'Active'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/15 text-red-400 border border-red-500/30'
                }`}>
                  {selectedMember.status === 'Active' ? 'Account Active' : 'Account Disabled'}
                </span>
              </div>

              {/* Username row */}
              <div className="p-3 bg-[#07090E] rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Username</span>
                  <strong className="text-xs font-mono text-white font-black">{selectedMember.username || selectedMember.membershipNo}</strong>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedMember.username || selectedMember.membershipNo, 'ProfileUsername')}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-1.5"
                >
                  {copiedField === 'ProfileUsername' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'ProfileUsername' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Password row */}
              <div className="p-3 bg-[#07090E] rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Password</span>
                  <strong className="text-xs font-mono text-amber-400 font-black">
                    {showPasswordMap[selectedMember.id]
                      ? (selectedMember.tempPassword || 'Gym@48291')
                      : '••••••••••••'}
                  </strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setShowPasswordMap((prev) => ({
                        ...prev,
                        [selectedMember.id]: !prev[selectedMember.id],
                      }))
                    }
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
                    title={showPasswordMap[selectedMember.id] ? 'Hide Password' : 'Show Password'}
                  >
                    {showPasswordMap[selectedMember.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(selectedMember.tempPassword || 'Gym@48291', 'ProfilePassword')}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-1"
                  >
                    {copiedField === 'ProfilePassword' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Account Status Flags & WhatsApp Status */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2.5 bg-[#07090E] rounded-xl border border-white/10">
                  <span className="text-slate-400 block font-medium">First Login Status:</span>
                  <strong className={selectedMember.mustChangePassword ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {selectedMember.mustChangePassword ? 'Pending Setup' : 'Completed ✓'}
                  </strong>
                </div>
                <div className="p-2.5 bg-[#07090E] rounded-xl border border-white/10">
                  <span className="text-slate-400 block font-medium">WhatsApp Delivery:</span>
                  <strong className="text-emerald-400 font-bold">
                    {selectedMember.whatsappStatus === 'SENT' ? 'Delivered ✓' : (selectedMember.whatsappStatus || 'Ready')}
                  </strong>
                </div>
              </div>

              {/* Action Buttons for Login Account */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setResetModalOpen(true)}
                  className="py-2.5 rounded-xl bg-[#1A2238] hover:bg-[#202B47] border border-[#4F7CFF]/30 text-[#4F7CFF] font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Reset Password</span>
                </button>

                <button
                  onClick={handleResendCredentials}
                  disabled={isResendingWhatsApp}
                  className="py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isResendingWhatsApp ? 'Sending...' : 'Resend WhatsApp'}</span>
                </button>
              </div>

              {/* Enable / Disable Account Toggle */}
              <button
                onClick={() => handleToggleAccountStatus(selectedMember)}
                className={`w-full py-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedMember.status === 'Active'
                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {selectedMember.status === 'Active' ? 'Disable / Suspend Account Access' : 'Enable Account Access'}
              </button>
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
                <span className="text-xs font-black text-emerald-400 block mt-0.5">
                  ₹{(selectedMember.paidAmount || 1500).toLocaleString('en-IN')} Paid (UPI)
                </span>
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
            SUBPAGE 4: SECURITY & AUDIT LOGS
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'audit-logs' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-xl space-y-2">
              <h3 className="text-xs font-black text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Security Audit Log (Account Events)</span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Tamper-evident record of account creations, password resets, and WhatsApp dispatches.
              </p>
            </div>

            <div className="space-y-2">
              {(auditLogs || []).map((log) => (
                <div key={log.id} className="p-3 bg-[#101422] rounded-2xl border border-white/10 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-[11px]">{log.eventType.replace(/_/g, ' ')}</span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300">{log.details}</div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    Member: {log.memberName} • Actor: {log.actorRole}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 5: ADD TRAINER
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
            SUBPAGE 6: ADD EXPENSE
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

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 7: BROADCAST NOTIFICATIONS
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'broadcast' && (
          <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <Send className="w-4 h-4 text-amber-400" />
              <span>Broadcast Push Alert to Members</span>
            </h3>

            {notifSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{notifSuccess}</span>
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Recipient Audience
                </label>
                <select
                  value={notifTarget}
                  onChange={(e) => setNotifTarget(e.target.value as any)}
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Gym Members ({members.length})</option>
                  <option value="active">Active Plan Holders</option>
                  <option value="expired">Expired Members (Renewal Alert)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Alert Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Weekend Boot Camp / Holiday Hours"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Message Content *
                </label>
                <textarea
                  rows={4}
                  placeholder="Write clear notification message..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSendingBroadcast}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-50 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingBroadcast ? 'Broadcasting...' : 'Broadcast Instant Alert'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 8: ADD GYM BRANCH FORM
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'add-branch' && (
          <div className="bg-[#101422] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <Building2 className="w-4 h-4 text-[#4F7CFF]" />
              <span>Add New Gym Branch to Network</span>
            </h3>

            <form onSubmit={handleCreateBranch} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Branch Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kolkata South Flagship"
                  value={brName}
                  onChange={(e) => setBrName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Branch Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KS or DWTN"
                    value={brCode}
                    onChange={(e) => setBrCode(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kolkata"
                    value={brCity}
                    onChange={(e) => setBrCity(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Full Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14 Park Street, Tech Hub"
                  value={brAddress}
                  onChange={(e) => setBrAddress(e.target.value)}
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Helpdesk Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={brPhone}
                    onChange={(e) => setBrPhone(e.target.value)}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Max Capacity (Members)
                  </label>
                  <input
                    type="number"
                    value={brCapacity}
                    onChange={(e) => setBrCapacity(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Branch General Manager
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rohit Deshmukh"
                  value={brManager}
                  onChange={(e) => setBrManager(e.target.value)}
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingBranch}
                  className="w-full py-3.5 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#4F7CFF]/20"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{isSubmittingBranch ? 'Provisioning Branch Network...' : 'Create & Switch to New Branch'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 9: TRAINER CREATED SUCCESS & CREDENTIALS
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'trainer-created-success' && newlyCreatedTrainer && (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto border border-purple-500/40 shadow-lg">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white">Coach Onboarded & Account Created!</h3>
              <p className="text-xs text-slate-400">Trainer portal account linked with restricted financial view</p>
            </div>

            {/* Credentials Card */}
            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div>
                  <div className="text-sm font-black text-white">{newlyCreatedTrainer.name}</div>
                  <div className="text-[10px] text-slate-400">ID: {newlyCreatedTrainer.id} • {newlyCreatedTrainer.specialization}</div>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Trainer / Coach
                </span>
              </div>

              {/* Login Credentials Box */}
              <div className="p-3 bg-[#07090E] rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Username</span>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-mono text-white font-black">{newlyCreatedTrainerUser?.username || newlyCreatedTrainer.email}</strong>
                    <button
                      onClick={() => copyToClipboard(newlyCreatedTrainerUser?.username || newlyCreatedTrainer.email, 'TrUsername')}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                      title="Copy Username"
                    >
                      {copiedField === 'TrUsername' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Temporary Password</span>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-mono text-amber-400 font-black">{newlyCreatedTrainerTempPassword || 'Fit#73192'}</strong>
                    <button
                      onClick={() => copyToClipboard(newlyCreatedTrainerTempPassword || 'Fit#73192', 'TrPassword')}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                      title="Copy Password"
                    >
                      {copiedField === 'TrPassword' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* WhatsApp Status */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">
                    {newlyCreatedTrainerWhatsAppStatus === 'SENT' ? 'Credentials Sent via WhatsApp' : 'WhatsApp Ready'}
                  </span>
                </div>
                {newlyCreatedTrainerWhatsAppUrl && (
                  <button
                    onClick={() => window.open(newlyCreatedTrainerWhatsAppUrl, '_blank')}
                    className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-[10px] flex items-center gap-1 shadow-sm"
                  >
                    <span>Open Chat</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Copy Full Text */}
              <button
                onClick={() => {
                  const fullText = `Welcome to Smart Gym!\n\nHi ${newlyCreatedTrainer.name},\nYour Trainer portal account is created.\nRole: Trainer\nID: ${newlyCreatedTrainer.id}\nUsername: ${newlyCreatedTrainerUser?.username || newlyCreatedTrainer.email}\nTemporary Password: ${newlyCreatedTrainerTempPassword}\n\nPlease log in and set your new personal password.`;
                  copyToClipboard(fullText, 'FullTrCredentials');
                }}
                className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                {copiedField === 'FullTrCredentials' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedField === 'FullTrCredentials' ? 'Copied Coach Credentials!' : 'Copy Full Credentials Message'}</span>
              </button>

              <button
                onClick={() => navigateTo('more')}
                className="w-full py-2.5 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] text-white text-xs font-black"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 10: TRAINERS & COACHES ROSTER
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'trainers' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header & Quick Action */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <span>Coaches & Trainers Roster</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {trainers.length} Active PT coaches & nutritionists
                </p>
              </div>

              <button
                onClick={() => navigateTo('add-trainer')}
                className="px-3.5 py-2 rounded-2xl bg-purple-500 hover:bg-purple-600 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Coach</span>
              </button>
            </div>

            {/* Search and Role Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search coach by name, ID, phone..."
                  value={searchTrainer}
                  onChange={(e) => setSearchTrainer(e.target.value)}
                  className="w-full bg-[#101422] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: `All Coaches (${trainers.length})` },
                  { id: 'Trainer', label: `Trainers (${trainers.filter(t => t.role === 'Trainer').length})` },
                  { id: 'Dietitian', label: `Dietitians (${trainers.filter(t => t.role === 'Dietitian').length})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setTrainerRoleFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                      trainerRoleFilter === tab.id
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'bg-[#101422] text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trainers List */}
            <div className="space-y-2.5">
              {trainers
                .filter((t) => {
                  if (trainerRoleFilter !== 'all' && t.role !== trainerRoleFilter) return false;
                  if (!searchTrainer) return true;
                  const q = searchTrainer.toLowerCase();
                  return (
                    (t.name && t.name.toLowerCase().includes(q)) ||
                    (t.id && t.id.toLowerCase().includes(q)) ||
                    (t.specialization && t.specialization.toLowerCase().includes(q)) ||
                    (t.phone && t.phone.toLowerCase().includes(q)) ||
                    ((t as any).username && (t as any).username.toLowerCase().includes(q))
                  );
                })
                .map((trainer) => {
                  const assignedCount = members.filter(m => m.assignedTrainerId === trainer.id || m.assignedDietitianId === trainer.id).length;
                  const trainerUser = (appUsers || []).find(u => u.linkedId === trainer.id || u.id === trainer.id);
                  const displayUsername = (trainer as any).username || trainerUser?.username || trainer.email?.split('@')[0] || trainer.id;

                  return (
                    <div
                      key={trainer.id}
                      onClick={() => {
                        setSelectedTrainer(trainer);
                        navigateTo('trainer-profile');
                      }}
                      className="p-3.5 bg-[#101422] hover:bg-[#151A2E] active:scale-[0.99] rounded-2xl border border-white/10 flex items-center justify-between gap-3 cursor-pointer transition-all shadow-sm group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={trainer.photoUrl || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&fit=crop&q=80'}
                          alt={trainer.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-500/40 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-white truncate">{trainer.name}</h4>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                              {trainer.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {trainer.specialization || 'Strength & Conditioning'} • ID: {trainer.id}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[9px] font-mono text-purple-300">
                            <span>User: {displayUsername}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">{trainer.shift || 'Morning'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30 block">
                          {assignedCount} Trainees
                        </span>
                        <span className="text-[9px] text-slate-400 block font-semibold">
                          {(trainer as any).status || 'Active'}
                        </span>
                      </div>
                    </div>
                  );
                })}

              {trainers.length === 0 && (
                <div className="p-8 rounded-3xl bg-[#101422] border border-white/10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-white">No Coaches Found</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Add certified personal trainers and dietitians to manage workout splits and diet plans.
                  </p>
                  <button
                    onClick={() => navigateTo('add-trainer')}
                    className="px-4 py-2 rounded-xl bg-purple-500 text-white font-black text-xs inline-flex items-center gap-1.5 shadow-lg shadow-purple-500/25"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Onboard First Coach</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 11: TRAINER PROFILE & CREDENTIAL MANAGEMENT
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'trainer-profile' && selectedTrainer && (() => {
          const trainerUser = (appUsers || []).find(u => u.linkedId === selectedTrainer.id || u.id === selectedTrainer.id);
          const trainerUsername = (selectedTrainer as any).username || trainerUser?.username || selectedTrainer.email?.split('@')[0] || selectedTrainer.id;
          const trainerTempPassword = (selectedTrainer as any).tempPassword || trainerUser?.tempPassword || trainerUser?.password || 'Fit#73192';
          const assignedMembers = members.filter(m => m.assignedTrainerId === selectedTrainer.id || m.assignedDietitianId === selectedTrainer.id);
          const isPassVisible = showTrainerPasswordMap[selectedTrainer.id];
          const trainerPhone = selectedTrainer.phone || selectedTrainer.mobile || '+91 98765 00000';
          const trainerSalary = selectedTrainer.baseSalary || (selectedTrainer as any).salary || 35000;

          return (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Profile Card */}
              <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedTrainer.photoUrl || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&fit=crop&q=80'}
                    alt={selectedTrainer.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500 shadow-md shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white truncate">{selectedTrainer.name}</h3>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                        {selectedTrainer.role}
                      </span>
                    </div>
                    <p className="text-xs text-purple-300 font-semibold truncate mt-0.5">
                      {selectedTrainer.specialization || 'Strength & Conditioning'}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                      <span>ID: {selectedTrainer.id}</span>
                      <span>•</span>
                      <span>Shift: {selectedTrainer.shift || 'Morning'}</span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
                  <div className="p-2.5 bg-[#07090E] rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-medium">Mobile Phone:</span>
                    <strong className="text-white font-bold">{trainerPhone}</strong>
                  </div>
                  <div className="p-2.5 bg-[#07090E] rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-medium">Monthly Salary:</span>
                    <strong className="text-emerald-400 font-bold">₹{trainerSalary.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Login Credentials Box */}
              <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-purple-400" />
                    <span>Coach Portal Login Credentials</span>
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Active Login
                  </span>
                </div>

                {/* Username Row */}
                <div className="p-3 bg-[#07090E] rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Username</span>
                    <strong className="text-xs font-mono text-white font-black">{trainerUsername}</strong>
                  </div>
                  <button
                    onClick={() => copyToClipboard(trainerUsername, 'CoachUsername')}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-1.5"
                  >
                    {copiedField === 'CoachUsername' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'CoachUsername' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Password Row */}
                <div className="p-3 bg-[#07090E] rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Password</span>
                    <strong className="text-xs font-mono text-amber-400 font-black">
                      {isPassVisible ? trainerTempPassword : '••••••••••••'}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowTrainerPasswordMap(prev => ({ ...prev, [selectedTrainer.id]: !prev[selectedTrainer.id] }))}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
                      title={isPassVisible ? 'Hide Password' : 'Show Password'}
                    >
                      {isPassVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(trainerTempPassword, 'CoachPassword')}
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-1"
                    >
                      {copiedField === 'CoachPassword' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                {/* WhatsApp Action */}
                <button
                  onClick={() => {
                    const phoneClean = trainerPhone.replace(/\D/g, '');
                    const normPhone = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;
                    const text = encodeURIComponent(
                      `Welcome to Smart Gym, Coach ${selectedTrainer.name}!\n\nYour Trainer Portal Login:\nUsername: ${trainerUsername}\nTemporary Password: ${trainerTempPassword}\n\nLog in at: https://smartgym.app/login`
                    );
                    window.open(`https://wa.me/${normPhone}?text=${text}`, '_blank');
                  }}
                  className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-black font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Credentials via WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 1:1 Identity & Auth Diagnostic Card */}
              <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-black text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Account Identity & Role Diagnostics</span>
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Synced 1:1 ✓
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 bg-[#07090E] rounded-xl border border-white/5 font-mono">
                    <span className="text-slate-400 block uppercase font-bold">Profile ID</span>
                    <strong className="text-slate-200 truncate block">{selectedTrainer.id}</strong>
                  </div>
                  <div className="p-2 bg-[#07090E] rounded-xl border border-white/5 font-mono">
                    <span className="text-slate-400 block uppercase font-bold">Role Sync</span>
                    <strong className="text-purple-300 truncate block">{selectedTrainer.role} (Coach)</strong>
                  </div>
                  <div className="p-2 bg-[#07090E] rounded-xl border border-white/5 font-mono">
                    <span className="text-slate-400 block uppercase font-bold">Auth User ID</span>
                    <strong className="text-slate-200 truncate block">{trainerUser?.id || selectedTrainer.id}</strong>
                  </div>
                  <div className="p-2 bg-[#07090E] rounded-xl border border-white/5 font-mono">
                    <span className="text-slate-400 block uppercase font-bold">Email Binding</span>
                    <strong className="text-slate-200 truncate block">{selectedTrainer.email || `${trainerUsername}@smartgym.com`}</strong>
                  </div>
                </div>
              </div>

              {/* Assigned Trainees */}
              <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Assigned Trainees ({assignedMembers.length})
                  </h4>
                  <span className="text-[10px] text-purple-400 font-bold">Active Roster</span>
                </div>

                <div className="space-y-2">
                  {assignedMembers.map(m => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMember(m);
                        navigateTo('member-profile');
                      }}
                      className="p-2.5 bg-[#07090E] hover:bg-white/5 rounded-xl border border-white/5 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={m.photoUrl} alt={m.name} className="w-8 h-8 rounded-xl object-cover border border-[#4F7CFF]/40" />
                        <div>
                          <div className="text-xs font-black text-white">{m.name}</div>
                          <div className="text-[9px] text-slate-400">{m.membershipNo} • {m.goal}</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {m.status}
                      </span>
                    </div>
                  ))}

                  {assignedMembers.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-2">
                      No members assigned to this coach yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      </main>

      {/* ── 3. PASSWORD RESET CONFIRMATION MODAL ── */}
      {resetModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101422] border border-white/15 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-sm font-black text-white">Reset Member Login Password?</h3>
              <p className="text-xs text-slate-400 mt-1">
                This will invalidate {selectedMember.name}'s previous credentials, generate a new temporary password, and prepare a WhatsApp message.
              </p>
            </div>

            {resetResult ? (
              <div className="p-3.5 bg-[#07090E] rounded-2xl border border-white/10 space-y-2 text-xs">
                <div className="text-[10px] text-slate-400 uppercase font-black">New Temporary Password</div>
                <div className="text-base font-mono text-amber-400 font-black">{resetResult.password}</div>
                {resetResult.whatsappUrl && (
                  <button
                    onClick={() => window.open(resetResult.whatsappUrl, '_blank')}
                    className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md mt-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send New Password via WhatsApp</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setResetModalOpen(false);
                    setResetResult(null);
                  }}
                  className="w-full py-2 rounded-xl bg-white/10 text-white font-bold text-xs mt-1"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setResetModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={isResettingPassword}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs flex items-center justify-center gap-1"
                >
                  <span>{isResettingPassword ? 'Generating...' : 'Confirm Reset'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 4. FIXED BOTTOM MOBILE NAVIGATION ── */}
      <MobileBottomNav
        tabs={bottomNavTabs}
        activeTab={
          ['add-member', 'member-profile', 'member-created-success'].includes(currentScreen) ? 'members' :
          currentScreen === 'add-expense' ? 'finance' :
          ['broadcast', 'audit-logs', 'add-trainer', 'trainers', 'trainer-profile'].includes(currentScreen) ? 'more' :
          currentScreen
        }
        onSelectTab={(tabId) => navigateTo(tabId as OwnerScreen)}
        accentColor="#4F7CFF"
      />

    </div>
  );
};
