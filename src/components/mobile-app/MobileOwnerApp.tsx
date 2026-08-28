import React, { useState, useMemo } from 'react';
import { useGym } from '../../context/GymContext';
import { Member, GoalType, BranchId, AuditLog, Employee } from '../../types/gym';

type Gender = 'Male' | 'Female' | 'Other';
import { MobileAppHeader } from './MobileAppHeader';
import { MobileBottomNav, MobileNavTab } from './MobileBottomNav';
import { PrivilegePassCard } from '../shared/PrivilegePassCard';
import { MobileFinanceScreen } from '../mobile/MobileFinanceScreen';
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
  Activity,
  Dumbbell,
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
  Lock,
  Building2,
  ChevronDown,
  AlertTriangle
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
  | 'trainer-created-success'
  | 'fee-matrix'
  | 'due-members';

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
    renewSubscription,
    addMembershipPlan,
    updateMembershipPlan,
    signOutApp,
    notifications,
    markNotificationRead,
    recordMemberPayment
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
  
  const [isMobileRenewOpen, setIsMobileRenewOpen] = useState(false);
  const [mobileRenewPlanId, setMobileRenewPlanId] = useState('');
  const [mobileRenewPaymentMethod, setMobileRenewPaymentMethod] = useState<'UPI' | 'Cash' | 'Card' | 'Bank Transfer'>('UPI');
  const [isMobileRenewing, setIsMobileRenewing] = useState(false);
  const [mobileRenewSuccessToast, setMobileRenewSuccessToast] = useState<string | null>(null);

  // Fee Matrix State
  const monthlyPlanItem = plans.find(p => p.durationMonths === 1 || p.duration === 'Monthly');
  const quarterlyPlanItem = plans.find(p => p.durationMonths === 3 || p.duration === 'Quarterly');
  const yearlyPlanItem = plans.find(p => p.durationMonths === 12 || p.duration === 'Yearly');

  const [feeReg, setFeeReg] = useState<number>(monthlyPlanItem?.joiningFee || 500);
  const [feeMonthly, setFeeMonthly] = useState<number>(monthlyPlanItem?.basePrice || 1500);
  const [feeQuarterly, setFeeQuarterly] = useState<number>(quarterlyPlanItem?.basePrice || 4000);
  const [feeYearly, setFeeYearly] = useState<number>(yearlyPlanItem?.basePrice || 12000);
  const [isSavingFeeMatrix, setIsSavingFeeMatrix] = useState(false);
  const [feeMatrixToast, setFeeMatrixToast] = useState<string | null>(null);

  const handleSaveMobileFeeMatrix = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFeeMatrix(true);
    try {
      const calcTot = (b: number, j: number, gst: number = 18) => Math.round((b + j) * (1 + gst / 100));

      if (monthlyPlanItem) {
        await updateMembershipPlan(monthlyPlanItem.id, {
          basePrice: feeMonthly,
          joiningFee: feeReg,
          totalPrice: calcTot(feeMonthly, feeReg, monthlyPlanItem.gstPercent || 18)
        });
      } else {
        await addMembershipPlan({
          id: `plan-monthly-${Date.now()}`,
          name: 'Monthly Standard Membership',
          durationMonths: 1,
          duration: 'Monthly',
          basePrice: feeMonthly,
          joiningFee: feeReg,
          gstPercent: 18,
          totalPrice: calcTot(feeMonthly, feeReg, 18),
          description: 'Standard monthly gym pass with full floor access.',
          includedAddons: ['Gym Floor Access', 'Locker Access'],
          includedFeatures: { personalTraining: false, dietPlan: false, locker: true, steam: false },
          isActive: true
        });
      }

      if (quarterlyPlanItem) {
        await updateMembershipPlan(quarterlyPlanItem.id, {
          basePrice: feeQuarterly,
          joiningFee: feeReg,
          totalPrice: calcTot(feeQuarterly, feeReg, quarterlyPlanItem.gstPercent || 18)
        });
      } else {
        await addMembershipPlan({
          id: `plan-quarterly-${Date.now()}`,
          name: 'Quarterly Pro Fitness Pass',
          durationMonths: 3,
          duration: 'Quarterly',
          basePrice: feeQuarterly,
          joiningFee: feeReg,
          gstPercent: 18,
          totalPrice: calcTot(feeQuarterly, feeReg, 18),
          description: '3-month transformation plan with trainer assessments.',
          includedAddons: ['Gym Floor Access', 'Bi-weekly Assessment', 'Locker Room'],
          includedFeatures: { personalTraining: true, dietPlan: true, locker: true, steam: false },
          isActive: true
        });
      }

      if (yearlyPlanItem) {
        await updateMembershipPlan(yearlyPlanItem.id, {
          basePrice: feeYearly,
          joiningFee: feeReg,
          totalPrice: calcTot(feeYearly, feeReg, yearlyPlanItem.gstPercent || 18)
        });
      } else {
        await addMembershipPlan({
          id: `plan-yearly-${Date.now()}`,
          name: 'Annual VIP All-Access Pass',
          durationMonths: 12,
          duration: 'Yearly',
          basePrice: feeYearly,
          joiningFee: feeReg,
          gstPercent: 18,
          totalPrice: calcTot(feeYearly, feeReg, 18),
          description: '12-month unlimited gym floor & sauna pass.',
          includedAddons: ['All Access', 'Unlimited PT', 'Steam & Sauna', 'Diet Plan'],
          includedFeatures: { personalTraining: true, dietPlan: true, locker: true, steam: true },
          isActive: true
        });
      }

      setFeeMatrixToast('Standard fee rates applied successfully!');
      setTimeout(() => setFeeMatrixToast(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save fee structure');
    } finally {
      setIsSavingFeeMatrix(false);
    }
  };

  const [searchMember, setSearchMember] = useState('');
  const [goalFilter, setGoalFilter] = useState<string>('all');

  // Due Members & Outstanding Collections State
  const [searchDueMember, setSearchDueMember] = useState('');
  const [dueCategoryFilter, setDueCategoryFilter] = useState<'all' | 'expired' | 'partial'>('all');
  const [isCollectDueOpen, setIsCollectDueOpen] = useState(false);
  const [collectDueMember, setCollectDueMember] = useState<Member | null>(null);
  const [collectDueAmount, setCollectDueAmount] = useState<number>(1500);
  const [collectDuePaymentMethod, setCollectDuePaymentMethod] = useState<'UPI' | 'Cash' | 'Card' | 'Bank Transfer'>('UPI');
  const [isCollectingDue, setIsCollectingDue] = useState(false);
  const [collectDueToast, setCollectDueToast] = useState<string | null>(null);

  const dueMembers = useMemo(() => {
    return (members || []).filter((m) => {
      if (!m) return false;
      const isExpired = m.status === 'Expired' || m.status === 'Renewal Due' || (m.endDate && new Date(m.endDate) < new Date());
      const hasDues = (m.pendingDues || 0) > 0 || (m.balanceDue || 0) > 0 || m.paymentStatus === 'Pending' || m.paymentStatus === 'Partially Paid' || m.paymentStatus === 'Overdue';
      return isExpired || hasDues;
    });
  }, [members]);

  const totalOutstandingAmount = useMemo(() => {
    return dueMembers.reduce((sum, m) => {
      if ((m.pendingDues || 0) > 0) return sum + m.pendingDues;
      if ((m.balanceDue || 0) > 0) return sum + (m.balanceDue || 0);
      const plan = plans.find(p => p.id === m.planId) || plans[0];
      return sum + (plan?.totalPrice || 1500);
    }, 0);
  }, [dueMembers, plans]);

  const filteredDueMembers = useMemo(() => {
    return dueMembers.filter((m) => {
      const q = (searchDueMember || '').toLowerCase();
      const nameMatch = (m.name || '').toLowerCase().includes(q) || (m.membershipNo || '').toLowerCase().includes(q) || (m.mobile || '').includes(q);
      if (!nameMatch) return false;

      if (dueCategoryFilter === 'expired') {
        return m.status === 'Expired' || m.status === 'Renewal Due' || (m.endDate && new Date(m.endDate) < new Date());
      }
      if (dueCategoryFilter === 'partial') {
        return (m.pendingDues || 0) > 0 || (m.balanceDue || 0) > 0 || m.paymentStatus === 'Partially Paid';
      }
      return true;
    });
  }, [dueMembers, searchDueMember, dueCategoryFilter]);

  const handleSendDueWhatsApp = (m: Member) => {
    const dueAmount = (m.pendingDues || 0) > 0 ? m.pendingDues : (plans.find(p => p.id === m.planId)?.totalPrice || 1500);
    const phoneClean = (m.mobile || '').replace(/\D/g, '');
    const normPhone = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;
    const text = encodeURIComponent(
      `Hi ${m.name},\n\nThis is a friendly reminder from Smart Gym (${currentBranch.name}).\nYour gym membership fee has a pending balance / renewal due of *₹${dueAmount.toLocaleString('en-IN')}*.\n\nPlease clear your dues at the gym counter or via UPI to maintain uninterrupted biometric and mobile workout access.\n\nThank you,\nSmart Gym Management`
    );
    window.open(`https://wa.me/${normPhone}?text=${text}`, '_blank');
  };

  const handleOpenCollectDue = (m: Member) => {
    setCollectDueMember(m);
    const amount = (m.pendingDues || 0) > 0 ? m.pendingDues : (plans.find(p => p.id === m.planId)?.totalPrice || 1500);
    setCollectDueAmount(amount);
    setCollectDuePaymentMethod('UPI');
    setIsCollectDueOpen(true);
  };

  const handleCollectDueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectDueMember) return;
    setIsCollectingDue(true);
    try {
      await recordMemberPayment(
        collectDueMember.id,
        collectDueAmount,
        collectDuePaymentMethod,
        `Due collection cleared by admin via ${collectDuePaymentMethod}`
      );
      
      collectDueMember.pendingDues = Math.max(0, (collectDueMember.pendingDues || 0) - collectDueAmount);
      collectDueMember.paymentStatus = (collectDueMember.pendingDues === 0) ? 'Paid' : 'Partially Paid';
      
      setCollectDueToast(`Payment of ₹${collectDueAmount.toLocaleString('en-IN')} recorded successfully!`);
      setTimeout(() => {
        setCollectDueToast(null);
        setIsCollectDueOpen(false);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setIsCollectingDue(false);
    }
  };

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
  const [memPaymentMethod, setMemPaymentMethod] = useState<'UPI' | 'Cash' | 'Card' | 'Bank Transfer'>('UPI');
  const [includeRegFee, setIncludeRegFee] = useState(true);
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
    if (goalFilter === 'dues') {
      const isExpired = m.status === 'Expired' || m.status === 'Renewal Due' || (m.endDate && new Date(m.endDate) < new Date());
      const hasDues = (m.pendingDues || 0) > 0 || (m.balanceDue || 0) > 0 || m.paymentStatus === 'Pending' || m.paymentStatus === 'Partially Paid' || m.paymentStatus === 'Overdue';
      return matchesSearch && (isExpired || hasDues);
    }
    const matchesGoal = goalFilter === 'all' || m.goal === goalFilter;
    return matchesSearch && matchesGoal;
  });

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName.trim() || !memMobile.trim()) return;
    setIsSubmittingMember(true);

    try {
      const selectedPlan = plans.find((p) => p.id === memPlanId) || plans[0];
      const packagePrice = selectedPlan?.totalPrice || selectedPlan?.basePrice || 1500;
      const regFeeAmount = includeRegFee ? (feeReg || 500) : 0;
      const totalAdmissionAmount = packagePrice + regFeeAmount;

      const today = new Date();
      const expiry = new Date();
      expiry.setDate(today.getDate() + (selectedPlan?.durationDays || (selectedPlan?.durationMonths ? selectedPlan.durationMonths * 30 : 30)));

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
        paymentMethod: memPaymentMethod,
        assignedTrainerId: memTrainerId || (trainers[0]?.id || 'emp-trainer-1'),
        pendingDues: 0,
        paidAmount: totalAdmissionAmount,
        totalPlanAmount: totalAdmissionAmount,
        faceEnrolled: false,
        lockerNumber: `L-${Math.floor(10 + Math.random() * 90)}`,
      }, {
        createLogin: autoCreateLogin,
        sendWhatsApp: autoSendWhatsApp
      });

      // Record transaction in ledger
      try {
        await recordMemberPayment(res.member.id, totalAdmissionAmount, memPaymentMethod);
      } catch (tErr) {
        console.warn('Admission transaction recorded in context:', tErr);
      }

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
    'trainer-created-success',
    'fee-matrix',
    'due-members'
  ].includes(currentScreen);

  const bottomNavTabs: MobileNavTab[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'members', label: 'Members', icon: Users, badge: members.length },
    { id: 'finance', label: 'Finance', icon: CreditCard },
    { id: 'attendance', label: 'Attendance', icon: Calendar, badge: todayCheckins.length > 0 ? todayCheckins.length : undefined },
    { id: 'more', label: 'More', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#0A0D14] bg-ambient-mesh text-slate-100 flex flex-col justify-between selection:bg-[#00D4FF] selection:text-black relative overflow-hidden font-sans">
      
      {/* ── 0. AMBIENT GLOWING BLURRED GRADIENT SPHERES (CYAN, MAGENTA, AMBER) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#00D4FF]/12 blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-[#EC4899]/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-16 left-1/3 w-80 h-80 rounded-full bg-[#F59E0B]/08 blur-[100px] pointer-events-none" />
      </div>

      {/* ── 1. COMPACT NATIVE MOBILE HEADER ── */}
      <MobileAppHeader
        title={isSubPage ? undefined : 'Smart Gym'}
        subtitle={isSubPage ? undefined : `${currentBranch.name} • Master Admin`}
        role="Admin"
        accentColor="#00D4FF"
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
          currentScreen === 'fee-matrix' ? 'Fee Matrix & Rates' :
          currentScreen === 'due-members' ? 'Pending Dues & Defaulters' :
          currentScreen === 'member-created-success' ? 'Member Created' : 'Back'
        }
      />

      {/* ── 2. MAIN SCROLLABLE CONTENT ── */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 max-w-lg mx-auto w-full relative z-10">

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 1: HOME OVERVIEW (EXECUTIVE DASHBOARD)
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            
            {/* Live Branch Selector Pill */}
            <div className="flex items-center justify-between p-3 rounded-[20px] glass-card-premium shadow-xl gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-[#00D4FF]/15 text-[#00D4FF] flex items-center justify-center border border-[#00D4FF]/30 shadow-md shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Active Branch</span>
                  <span className="text-[10px] font-bold text-[#00D4FF] truncate max-w-[80px]">{currentBranch.code}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                <div className="relative flex-1 min-w-0 max-w-[210px]">
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full bg-black/60 text-white text-xs font-bold pl-3 pr-7 py-2 rounded-xl border border-white/12 outline-none cursor-pointer focus:border-[#00D4FF] backdrop-blur-md appearance-none truncate"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} className="bg-[#0A0D14] text-white">
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <button
                  onClick={() => navigateTo('add-branch')}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/12 text-[#00D4FF] flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-sm shrink-0"
                  title="Add New Branch"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Net Operating Profit Hero Container */}
            <div className="glass-card-premium p-5 rounded-[20px] shadow-2xl relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#10B981]/10 blur-[50px] pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Net Operating Profit ({currentBranch.code})
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm ${
                  isProfitPositive
                    ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                    : 'bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30'
                }`}>
                  {isProfitPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{isProfitPositive ? 'Surplus' : 'Deficit'}</span>
                </span>
              </div>

              <div className="mt-2 relative z-10">
                <div className="text-3xl font-black text-white tracking-tight">
                  ₹{Math.abs(netProfit).toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-4 mt-2.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                    <span className="text-slate-400">Collections:</span>
                    <strong className="text-[#10B981] font-black">₹{totalCollections.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F87171] shadow-[0_0_8px_#F87171]" />
                    <span className="text-slate-400">Expenses:</span>
                    <strong className="text-[#F87171] font-black">₹{totalExpenseAmount.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Dues & Defaulters Executive Alert Card */}
            <div
              onClick={() => navigateTo('due-members')}
              className="p-4 bg-gradient-to-r from-amber-950/40 via-[#14121F] to-[#0E101A] rounded-[20px] border border-amber-500/40 hover:border-amber-400/60 shadow-xl cursor-pointer active:scale-[0.99] transition-all relative overflow-hidden group"
            >
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-amber-500/5 blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-white">Pending Dues & Defaulters</h4>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {dueMembers.length} Members
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Total Outstanding: <strong className="text-amber-400 font-extrabold">₹{totalOutstandingAmount.toLocaleString('en-IN')}</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-black group-hover:translate-x-0.5 transition-transform">
                  <span>Manage</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* 3-Column Key Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div
                onClick={() => navigateTo('members')}
                className="glass-card-premium hover:border-[#00D4FF]/40 p-3.5 rounded-[20px] text-center cursor-pointer transition-all active:scale-95 shadow-lg group relative overflow-hidden"
              >
                <div className="w-7 h-7 rounded-xl bg-[#00D4FF]/15 text-[#00D4FF] flex items-center justify-center mx-auto mb-1 border border-[#00D4FF]/25 shadow-sm group-hover:scale-110 transition-transform">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Members</div>
                <div className="text-xl font-black text-white mt-0.5 group-hover:text-[#00D4FF] transition-colors">{members.length}</div>
                <span className="text-[9px] text-[#00D4FF] font-bold block mt-0.5">Directory →</span>
              </div>

              <div
                onClick={() => navigateTo('attendance')}
                className="glass-card-premium hover:border-[#10B981]/40 p-3.5 rounded-[20px] text-center cursor-pointer transition-all active:scale-95 shadow-lg group relative overflow-hidden"
              >
                <div className="w-7 h-7 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mx-auto mb-1 border border-[#10B981]/25 shadow-sm group-hover:scale-110 transition-transform">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Check-ins</div>
                <div className="text-xl font-black text-[#10B981] mt-0.5">{todayCheckins.length}</div>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Live Today</span>
              </div>

              <div
                onClick={() => navigateTo('due-members')}
                className="glass-card-premium hover:border-amber-400/40 p-3.5 rounded-[20px] text-center cursor-pointer transition-all active:scale-95 shadow-lg group relative overflow-hidden"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-1 border border-amber-500/25 shadow-sm group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Due Fees</div>
                <div className="text-xl font-black text-amber-400 mt-0.5">{dueMembers.length}</div>
                <span className="text-[9px] text-amber-300 font-bold block mt-0.5">₹{(totalOutstandingAmount/1000).toFixed(0)}k Dues →</span>
              </div>
            </div>

            {/* 2x2 Grid for Executive Quick Action Tiles */}
            <div className="pt-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1 mb-2">
                Executive Quick Actions
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => navigateTo('add-member')}
                  className="glass-card-premium hover:border-[#00D4FF]/40 active:scale-95 p-4 rounded-[20px] text-left transition-all shadow-xl group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#00D4FF]/15 text-[#00D4FF] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform border border-[#00D4FF]/30 shadow-md">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">+ Add Member</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Auto-provision & WhatsApp</div>
                </button>

                <button
                  onClick={() => navigateTo('due-members')}
                  className="glass-card-premium hover:border-amber-400/50 active:scale-95 p-4 rounded-[20px] text-left transition-all shadow-xl group cursor-pointer border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-red-950/20"
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform border border-amber-500/40 shadow-md">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">Due Members ({dueMembers.length})</div>
                  <div className="text-[10px] text-amber-300 font-medium mt-0.5">₹{totalOutstandingAmount.toLocaleString('en-IN')} pending</div>
                </button>

                <button
                  onClick={() => navigateTo('fee-matrix')}
                  className="glass-card-premium hover:border-cyan-400/50 active:scale-95 p-4 rounded-[20px] text-left transition-all shadow-xl group cursor-pointer border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-blue-950/20"
                >
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform border border-cyan-500/40 shadow-md">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">Fee Rates & Matrix</div>
                  <div className="text-[10px] text-cyan-300 font-medium mt-0.5">Reg, Monthly, Quarterly, Yearly</div>
                </button>

                <button
                  onClick={() => navigateTo('add-expense')}
                  className="glass-card-premium hover:border-[#F87171]/40 active:scale-95 p-4 rounded-[20px] text-left transition-all shadow-xl group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#F87171]/15 text-[#F87171] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform border border-[#F87171]/30 shadow-md">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">+ Record Expense</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Bills, rent & repairs</div>
                </button>
              </div>
            </div>

            {/* Recent Member Admissions Stream */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Recent Members
                </span>
                <button
                  onClick={() => navigateTo('members')}
                  className="text-[10px] font-bold text-[#00D4FF] hover:underline cursor-pointer"
                >
                  View All ({members.length}) →
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
                    className="p-3.5 glass-card-premium hover:border-[#00D4FF]/40 active:scale-[0.98] rounded-[20px] flex items-center justify-between cursor-pointer transition-all shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[#00D4FF]/40 shadow-sm"
                      />
                      <div>
                        <h4 className="text-xs font-black text-white">{member.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{member.username || member.membershipNo}</span>
                          <span>•</span>
                          <span className="text-[#00D4FF] font-semibold">{member.planName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                          {member.status}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-1">Exp: {member.endDate}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMember(member);
                          setMobileRenewPlanId(member.planId || plans[0]?.id || '');
                          setIsMobileRenewOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-[10px] flex items-center gap-1 active:scale-95 cursor-pointer"
                        title="Extend / Renew Plan"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Extend</span>
                      </button>
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
              <button
                onClick={() => setGoalFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                  goalFilter === 'all'
                    ? 'bg-[#4F7CFF] text-white shadow-md'
                    : 'bg-[#101422] text-slate-400 border border-white/10 hover:text-white'
                }`}
              >
                All Members ({members.length})
              </button>

              <button
                onClick={() => setGoalFilter('dues')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-1 ${
                  goalFilter === 'dues'
                    ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Pending Dues ({dueMembers.length})</span>
              </button>

              {['Muscle Building', 'Weight Loss', 'Endurance', 'Flexibility'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGoalFilter(g)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                    goalFilter === g
                      ? 'bg-[#4F7CFF] text-white shadow-md'
                      : 'bg-[#101422] text-slate-400 border border-white/10 hover:text-white'
                  }`}
                >
                  {g}
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

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-200">{member.planName}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Exp: {member.endDate}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMember(member);
                        setMobileRenewPlanId(member.planId || plans[0]?.id || '');
                        setIsMobileRenewOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm"
                      title="Extend / Renew Plan"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Extend</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 3: FINANCE & CASHFLOW
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'finance' && <MobileFinanceScreen />}

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
                onClick={() => navigateTo('due-members')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151A2E] active:bg-[#1B2238] transition-all bg-gradient-to-r from-amber-950/30 to-transparent"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white block">Pending Dues & Defaulters</span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {dueMembers.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-300">₹{totalOutstandingAmount.toLocaleString('en-IN')} outstanding collections</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => navigateTo('fee-matrix')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151A2E] active:bg-[#1B2238] transition-all bg-gradient-to-r from-cyan-950/20 to-transparent"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Membership Fee Matrix & Rates</span>
                    <span className="text-[10px] text-cyan-300">Set Registration, Monthly, Quarterly & Yearly tariffs</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </button>

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

              {/* Fee Breakdown & Payment Method Section */}
              {(() => {
                const selectedAddPlan = plans.find((p) => p.id === memPlanId) || plans[0];
                const packagePrice = selectedAddPlan?.totalPrice || selectedAddPlan?.basePrice || 1500;
                const regFeeAmount = includeRegFee ? (feeReg || 500) : 0;
                const totalAdmissionAmount = packagePrice + regFeeAmount;

                return (
                  <div className="p-4 bg-gradient-to-br from-[#0B1528] via-[#0D1220] to-[#07090E] rounded-3xl border border-cyan-500/30 shadow-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-cyan-400" />
                        <span>Admission Fees & Package Tariff</span>
                      </span>
                      <span className="text-[9px] font-black text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 uppercase">
                        Payment Summary
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Registration fee row */}
                      <div className="flex items-center justify-between p-2.5 bg-[#07090E] rounded-2xl border border-white/5">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold text-xs">
                          <input
                            type="checkbox"
                            checked={includeRegFee}
                            onChange={(e) => setIncludeRegFee(e.target.checked)}
                            className="w-4 h-4 rounded text-cyan-500 bg-[#121727] border-white/20 focus:ring-0"
                          />
                          <span>Registration / Admission Fee</span>
                        </label>
                        <span className="text-white font-extrabold">₹{(feeReg || 500).toLocaleString('en-IN')}</span>
                      </div>

                      {/* Selected Plan row */}
                      <div className="flex items-center justify-between p-2.5 bg-[#07090E] rounded-2xl border border-white/5">
                        <div>
                          <span className="text-white font-bold block">{selectedAddPlan?.name || 'Standard Plan'}</span>
                          <span className="text-[10px] text-slate-400">Duration: {selectedAddPlan?.durationMonths || 1} Month(s)</span>
                        </div>
                        <span className="text-cyan-300 font-black">₹{packagePrice.toLocaleString('en-IN')}</span>
                      </div>

                      {/* Total Due Row */}
                      <div className="flex items-center justify-between p-3 bg-cyan-950/40 rounded-2xl border border-cyan-500/40">
                        <span className="text-xs font-black text-white uppercase">Total Payable Amount</span>
                        <strong className="text-base font-black text-emerald-400">₹{totalAdmissionAmount.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>

                    {/* Payment Method Chips */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                        Select Payment Method *
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['UPI', 'Cash', 'Card', 'Bank Transfer'] as const).map((method) => (
                          <button
                            type="button"
                            key={method}
                            onClick={() => setMemPaymentMethod(method)}
                            className={`py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                              memPaymentMethod === method
                                ? 'bg-cyan-500/25 border-cyan-500 text-cyan-300 shadow-md font-black'
                                : 'bg-[#080C14] border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

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

              {/* Submit Pay & Enroll Button */}
              {(() => {
                const selectedAddPlan = plans.find((p) => p.id === memPlanId) || plans[0];
                const packagePrice = selectedAddPlan?.totalPrice || selectedAddPlan?.basePrice || 1500;
                const regFeeAmount = includeRegFee ? (feeReg || 500) : 0;
                const totalAdmissionAmount = packagePrice + regFeeAmount;

                return (
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingMember}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00D4FF] via-cyan-500 to-emerald-400 hover:opacity-95 active:scale-95 disabled:opacity-50 text-black font-black text-xs flex items-center justify-center gap-2 shadow-2xl shadow-cyan-500/30 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {isSubmittingMember
                          ? 'Processing Admission & Dispatching Credentials...'
                          : `Pay ₹${totalAdmissionAmount.toLocaleString('en-IN')} & Enroll Member`}
                      </span>
                    </button>
                  </div>
                );
              })()}
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
              <h3 className="text-base font-black text-white">Payment Received & Member Enrolled! 🎉</h3>
              <p className="text-xs text-slate-400">Account credentials generated and ready to dispatch</p>
            </div>

            {/* Payment Receipt Summary Card */}
            <div className="p-4 bg-gradient-to-br from-[#0B1528] via-[#0D1220] to-[#07090E] rounded-3xl border border-emerald-500/30 shadow-xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Admission Payment Receipt</span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Paid via {newlyCreatedMember.paymentMethod || 'UPI'} ✓
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-300">Total Amount Paid:</span>
                <strong className="text-base font-black text-emerald-400">
                  ₹{(newlyCreatedMember.paidAmount || 2000).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="p-2.5 bg-[#07090E] rounded-xl border border-white/5 text-[11px] space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Enrolled Package:</span>
                  <span className="text-white font-bold">{newlyCreatedMember.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Membership Validity:</span>
                  <span className="text-cyan-300 font-bold">{newlyCreatedMember.endDate}</span>
                </div>
              </div>
            </div>

            {/* Login Credentials Card */}
            <div className="bg-[#101422] p-4 rounded-3xl border border-cyan-500/30 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">Member Login Credentials</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Active
                </span>
              </div>

              {/* Login Credentials Box */}
              <div className="p-3.5 bg-[#07090E] rounded-2xl border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Username</span>
                    <strong className="text-sm font-mono text-white font-black">{newlyCreatedMember.username || newlyCreatedMember.membershipNo}</strong>
                  </div>
                  <button
                    onClick={() => copyToClipboard(newlyCreatedMember.username || newlyCreatedMember.membershipNo, 'Username')}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                    title="Copy Username"
                  >
                    {copiedField === 'Username' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'Username' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Temporary Password</span>
                    <strong className="text-sm font-mono text-amber-400 font-black">{newlyCreatedTempPassword || newlyCreatedMember.tempPassword || 'Gym@48291'}</strong>
                  </div>
                  <button
                    onClick={() => copyToClipboard(newlyCreatedTempPassword || newlyCreatedMember.tempPassword || 'Gym@48291', 'Password')}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                    title="Copy Password"
                  >
                    {copiedField === 'Password' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'Password' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp Action Button */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">
                    {newlyCreatedWhatsAppStatus === 'SENT' ? 'Credentials Sent via WhatsApp' : 'Dispatch via WhatsApp'}
                  </span>
                </div>
                {newlyCreatedWhatsAppUrl && (
                  <button
                    onClick={() => window.open(newlyCreatedWhatsAppUrl, '_blank')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-[10px] flex items-center gap-1 shadow-md cursor-pointer active:scale-95"
                  >
                    <span>Open Chat</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Copy Full Text */}
              <button
                onClick={() => {
                  const fullText = `Welcome to Smart Gym!\n\nHi ${newlyCreatedMember.name},\nYour member account is created.\nMember ID: ${newlyCreatedMember.membershipNo}\nUsername: ${newlyCreatedMember.username}\nTemporary Password: ${newlyCreatedTempPassword || 'Gym@48291'}\n\nPlease log in at: https://smartgym.app/login`;
                  copyToClipboard(fullText, 'FullCredentials');
                }}
                className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {copiedField === 'FullCredentials' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedField === 'FullCredentials' ? 'Copied Full Credentials Message!' : 'Copy Full Credentials Message'}</span>
              </button>
            </div>

            {/* Membership Pass Card */}
            <div className="w-full max-w-sm mx-auto">
              <PrivilegePassCard member={newlyCreatedMember} />
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setSelectedMember(newlyCreatedMember);
                  navigateTo('member-profile');
                }}
                className="flex-1 py-3 rounded-2xl bg-[#101422] hover:bg-[#151A2E] border border-white/10 text-white font-bold text-xs cursor-pointer active:scale-95"
              >
                View Profile
              </button>
              <button
                onClick={() => navigateTo('members')}
                className="flex-1 py-3 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] text-white font-black text-xs cursor-pointer active:scale-95"
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

            {/* ── SUBSCRIPTION EXTENSION & RENEWAL CARD ── */}
            <div className="p-4 bg-gradient-to-br from-[#0B1528] via-[#0D1220] to-[#07090E] rounded-3xl border border-cyan-500/30 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">Subscription & Renewal</span>
                </div>
                <span className="text-[10px] font-bold text-cyan-300">
                  {new Date(selectedMember.expiryDate || selectedMember.endDate || '') > new Date() ? '⚡ Extends Active Pass' : 'Expired'}
                </span>
              </div>

              {/* 1-Tap Quick Extend Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={async () => {
                    const plan1M = plans.find(p => p.durationMonths === 1) || plans[0];
                    if (plan1M) {
                      await renewSubscription(selectedMember.id, plan1M.id, 'UPI');
                      const updated = members.find((m) => m.id === selectedMember.id);
                      if (updated) setSelectedMember(updated);
                      alert(`Subscription extended by 1 Month (Valid until ${updated?.endDate || updated?.expiryDate})`);
                    }
                  }}
                  className="p-2.5 rounded-2xl bg-[#141E34] hover:bg-[#1A2846] border border-cyan-500/30 text-center active:scale-95 transition-all cursor-pointer"
                >
                  <div className="text-xs font-black text-cyan-300">+1 Month</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Quick Extend</div>
                </button>

                <button
                  onClick={async () => {
                    const plan3M = plans.find(p => p.durationMonths === 3) || plans[1] || plans[0];
                    if (plan3M) {
                      await renewSubscription(selectedMember.id, plan3M.id, 'UPI');
                      const updated = members.find((m) => m.id === selectedMember.id);
                      if (updated) setSelectedMember(updated);
                      alert(`Subscription extended by 3 Months (Valid until ${updated?.endDate || updated?.expiryDate})`);
                    }
                  }}
                  className="p-2.5 rounded-2xl bg-[#1D1634] hover:bg-[#271E46] border border-purple-500/30 text-center active:scale-95 transition-all cursor-pointer"
                >
                  <div className="text-xs font-black text-purple-300">+3 Months</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Quarterly</div>
                </button>

                <button
                  onClick={async () => {
                    const plan12M = plans.find(p => p.durationMonths === 12) || plans[2] || plans[0];
                    if (plan12M) {
                      await renewSubscription(selectedMember.id, plan12M.id, 'UPI');
                      const updated = members.find((m) => m.id === selectedMember.id);
                      if (updated) setSelectedMember(updated);
                      alert(`Subscription extended by 12 Months (Valid until ${updated?.endDate || updated?.expiryDate})`);
                    }
                  }}
                  className="p-2.5 rounded-2xl bg-[#122A22] hover:bg-[#18382E] border border-emerald-500/30 text-center active:scale-95 transition-all cursor-pointer"
                >
                  <div className="text-xs font-black text-emerald-300">+1 Year</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Annual VIP</div>
                </button>
              </div>

              {/* Full Renewal Bottom Sheet Trigger */}
              <button
                onClick={() => {
                  setMobileRenewPlanId(selectedMember.planId || plans[0]?.id || '');
                  setIsMobileRenewOpen(true);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00D4FF] via-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Custom Plan & Payment Mode Renewal</span>
              </button>
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

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE: STANDARD GYM FEE MATRIX & TARIFF RATES
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'fee-matrix' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Header Hero Banner */}
            <div className="p-5 bg-gradient-to-br from-[#0B1528] via-[#0D101C] to-[#07090E] rounded-3xl border border-cyan-500/30 shadow-2xl relative overflow-hidden space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Membership Fee Rates</h3>
                    <p className="text-[10px] text-slate-400">Master Tariff & Admission Structure</p>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Admin Master
                </span>
              </div>
              <p className="text-xs text-slate-300 pt-1">
                Manually configure standard admission fees and recurring subscription tariffs. All changes synchronize across user apps instantly.
              </p>
            </div>

            {feeMatrixToast && (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feeMatrixToast}</span>
              </div>
            )}

            {/* Matrix Form */}
            <form onSubmit={handleSaveMobileFeeMatrix} className="space-y-3">
              
              {/* 1. Registration / Admission Fee */}
              <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Registration / Admission Fee</span>
                  </span>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                    One-Time
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={feeReg}
                    onChange={(e) => setFeeReg(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 bg-[#07090E] rounded-2xl border border-white/10 text-white font-extrabold text-sm focus:border-cyan-400 focus:outline-none"
                    placeholder="500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">One-time joining fee charged at first admission</p>
              </div>

              {/* 2. Monthly Fee */}
              <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Monthly Pass Fee (1 Month)</span>
                  </span>
                  <span className="text-[9px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
                    30 Days
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={feeMonthly}
                    onChange={(e) => setFeeMonthly(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 bg-[#07090E] rounded-2xl border border-white/10 text-white font-extrabold text-sm focus:border-cyan-400 focus:outline-none"
                    placeholder="1500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Recurring 1-month gym floor pass rate</p>
              </div>

              {/* 3. Quarterly Fee */}
              <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>Quarterly Fee (3 Months)</span>
                  </span>
                  <span className="text-[9px] font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md border border-purple-400/20">
                    90 Days
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={feeQuarterly}
                    onChange={(e) => setFeeQuarterly(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 bg-[#07090E] rounded-2xl border border-white/10 text-white font-extrabold text-sm focus:border-cyan-400 focus:outline-none"
                    placeholder="4000"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Quarterly transformation package rate</p>
              </div>

              {/* 4. Yearly Fee */}
              <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Yearly VIP Fee (12 Months)</span>
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                    Annual Pass
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={feeYearly}
                    onChange={(e) => setFeeYearly(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 bg-[#07090E] rounded-2xl border border-white/10 text-white font-extrabold text-sm focus:border-cyan-400 focus:outline-none"
                    placeholder="12000"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Full 12-month unlimited membership rate</p>
              </div>

              {/* Submit Save Button */}
              <button
                type="submit"
                disabled={isSavingFeeMatrix}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00D4FF] via-cyan-500 to-blue-600 text-black font-black text-xs flex items-center justify-center gap-2 shadow-2xl shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                <Check className="w-4 h-4" />
                <span>{isSavingFeeMatrix ? 'Updating Rates...' : 'Save & Apply Standard Fee Rates'}</span>
              </button>
            </form>

            {/* Current Active Packages Summary */}
            <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-xl space-y-2.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Active System Packages ({plans.length})
              </span>
              <div className="space-y-2">
                {plans.map((p) => (
                  <div key={p.id} className="p-3 bg-[#07090E] rounded-2xl border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-white font-black block">{p.name}</strong>
                      <span className="text-[10px] text-cyan-400 font-semibold">{p.durationMonths} Months</span>
                    </div>
                    <div className="text-right">
                      <strong className="text-emerald-400 font-black text-sm">₹{p.totalPrice.toLocaleString('en-IN')}</strong>
                      <span className="text-[9px] text-slate-400 block">incl. {p.gstPercent}% GST</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE: PENDING DUES & DEFAULTERS DIRECTORY
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'due-members' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Header Hero Banner */}
            <div className="p-5 bg-gradient-to-br from-amber-950/60 via-[#12101E] to-[#07090E] rounded-3xl border border-amber-500/40 shadow-2xl relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-inner">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Pending Dues Ledger</h3>
                    <p className="text-[10px] text-amber-300/80">{currentBranch.name} • Defaulters & Renewals</p>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {dueMembers.length} Accounts Due
                </span>
              </div>

              <div className="p-3.5 bg-black/40 rounded-2xl border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Outstanding Amount</span>
                  <div className="text-2xl font-black text-amber-400">
                    ₹{totalOutstandingAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Pending / Expired</span>
                  <span className="text-xs font-black text-white">{dueMembers.length} Members</span>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search due member, mobile, username..."
                value={searchDueMember}
                onChange={(e) => setSearchDueMember(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#101422] rounded-2xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setDueCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                  dueCategoryFilter === 'all'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-[#101422] text-slate-400 border border-white/10 hover:text-white'
                }`}
              >
                All Dues ({dueMembers.length})
              </button>
              <button
                onClick={() => setDueCategoryFilter('expired')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                  dueCategoryFilter === 'expired'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-[#101422] text-slate-400 border border-white/10 hover:text-white'
                }`}
              >
                Expired Pass ({dueMembers.filter(m => m.status === 'Expired' || m.status === 'Renewal Due' || (m.endDate && new Date(m.endDate) < new Date())).length})
              </button>
              <button
                onClick={() => setDueCategoryFilter('partial')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                  dueCategoryFilter === 'partial'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-[#101422] text-slate-400 border border-white/10 hover:text-white'
                }`}
              >
                Partial Balance ({dueMembers.filter(m => (m.pendingDues || 0) > 0 || (m.balanceDue || 0) > 0).length})
              </button>
            </div>

            {/* Due Members List */}
            <div className="space-y-3">
              {filteredDueMembers.map((m) => {
                const memberDueAmount = (m.pendingDues || 0) > 0 ? m.pendingDues : (m.balanceDue || 0) > 0 ? m.balanceDue : (plans.find(p => p.id === m.planId)?.totalPrice || 1500);
                const isPassExpired = m.status === 'Expired' || m.status === 'Renewal Due' || (m.endDate && new Date(m.endDate) < new Date());

                return (
                  <div
                    key={m.id}
                    className="p-4 bg-[#101422] rounded-3xl border border-amber-500/30 hover:border-amber-500/60 shadow-xl space-y-3 transition-all"
                  >
                    {/* Top Row: Photo, Name & Due Badge */}
                    <div className="flex items-center justify-between gap-3">
                      <div 
                        onClick={() => {
                          setSelectedMember(m);
                          navigateTo('member-profile');
                        }}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <img
                          src={m.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop&q=80'}
                          alt={m.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-amber-500/40 shadow-inner shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-white truncate flex items-center gap-1.5">
                            <span>{m.name}</span>
                            <span className="text-[9px] font-mono text-slate-400">({m.membershipNo})</span>
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {m.planName || 'Standard Membership'} • {m.mobile}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs">
                          ₹{(memberDueAmount || 0).toLocaleString('en-IN')} Due
                        </div>
                        <span className="text-[9px] font-bold text-rose-400 block mt-0.5">
                          {isPassExpired ? 'Pass Expired' : 'Balance Overdue'}
                        </span>
                      </div>
                    </div>

                    {/* Expiry Date & Details */}
                    <div className="p-2.5 rounded-xl bg-[#080C14] border border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <div>
                        <span>Validity End: </span>
                        <strong className="text-white">{m.endDate || m.expiryDate || 'N/A'}</strong>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-300 font-semibold">
                          {isPassExpired ? 'Renewal Required' : 'Payment Overdue'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: Collect Due, WhatsApp, Call */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() => handleOpenCollectDue(m)}
                        className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-[11px] flex items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 transition-all"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Collect Due</span>
                      </button>

                      <button
                        onClick={() => handleSendDueWhatsApp(m)}
                        className="py-2.5 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-black text-[11px] flex items-center justify-center gap-1 shadow-sm cursor-pointer active:scale-95 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      <a
                        href={`tel:${m.mobile}`}
                        className="py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                );
              })}

              {filteredDueMembers.length === 0 && (
                <div className="p-8 text-center bg-[#101422] rounded-3xl border border-white/10 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-black text-white">No Outstanding Dues Found! 🎉</h4>
                  <p className="text-xs text-slate-400">All member fee collections are up to date for this branch.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* ── 2.5. RENEW MEMBER SUBSCRIPTION MODAL ── */}
      {isMobileRenewOpen && selectedMember && (
        <div 
          onClick={() => setIsMobileRenewOpen(false)}
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#0E121E] border-t sm:border border-cyan-500/30 rounded-t-[32px] sm:rounded-[32px] p-5 pb-12 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 text-xs"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Renew / Extend Membership</h3>
                  <p className="text-[10px] text-slate-400">{selectedMember.name} • {selectedMember.membershipNo}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileRenewOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold active:scale-90 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {mobileRenewSuccessToast && (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{mobileRenewSuccessToast}</span>
              </div>
            )}

            {/* Current Status Preview */}
            <div className="p-3.5 rounded-2xl bg-[#080C14] border border-white/10 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Current Pass:</span>
                <span className="text-white font-bold">{selectedMember.planName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Current Expiry:</span>
                <span className="text-cyan-300 font-black">{selectedMember.expiryDate || selectedMember.endDate || 'Expired'}</span>
              </div>
              {new Date(selectedMember.expiryDate || selectedMember.endDate || '') > new Date() && (
                <p className="text-[10px] text-emerald-400 font-semibold pt-1 border-t border-white/5">
                  ✓ Active: New duration will be appended to current expiry date.
                </p>
              )}
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!mobileRenewPlanId) return;
                setIsMobileRenewing(true);
                try {
                  await renewSubscription(selectedMember.id, mobileRenewPlanId, mobileRenewPaymentMethod);
                  const updated = members.find((m) => m.id === selectedMember.id);
                  if (updated) setSelectedMember(updated);
                  setMobileRenewSuccessToast('Subscription renewed successfully!');
                  setTimeout(() => {
                    setMobileRenewSuccessToast(null);
                    setIsMobileRenewOpen(false);
                  }, 1200);
                } catch (err: any) {
                  alert(err.message || 'Renewal failed');
                } finally {
                  setIsMobileRenewing(false);
                }
              }}
              className="space-y-3 pt-1"
            >
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Select Renewal Package *
                </label>
                <select
                  value={mobileRenewPlanId}
                  onChange={(e) => setMobileRenewPlanId(e.target.value)}
                  required
                  className="w-full bg-[#080C14] border border-white/10 rounded-2xl px-3.5 py-3 text-xs text-white font-bold outline-none focus:border-cyan-400"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.durationMonths}M) — ₹{p.totalPrice.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Payment Method *
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['UPI', 'Cash', 'Card', 'Bank Transfer'] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setMobileRenewPaymentMethod(m)}
                      className={`py-2.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                        mobileRenewPaymentMethod === m
                          ? 'bg-cyan-500/25 border-cyan-500 text-cyan-300 shadow-md font-black'
                          : 'bg-[#080C14] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isMobileRenewing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00D4FF] via-cyan-500 to-blue-600 text-black font-black text-xs flex items-center justify-center gap-2 shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50 mt-3"
              >
                <Check className="w-4 h-4" />
                <span>{isMobileRenewing ? 'Processing Renewal...' : 'Confirm & Renew Pass'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 2.6. COLLECT DUE PAYMENT MODAL ── */}
      {isCollectDueOpen && collectDueMember && (
        <div 
          onClick={() => setIsCollectDueOpen(false)}
          className="fixed inset-0 z-[85] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#0E121E] border-t sm:border border-amber-500/40 rounded-t-[32px] sm:rounded-[32px] p-5 pb-12 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 text-xs"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Collect Outstanding Fee</h3>
                  <p className="text-[10px] text-slate-400">{collectDueMember.name} • {collectDueMember.membershipNo}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCollectDueOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold active:scale-90 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {collectDueToast && (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{collectDueToast}</span>
              </div>
            )}

            {/* Member Due Summary Preview */}
            <div className="p-3.5 rounded-2xl bg-[#080C14] border border-amber-500/20 space-y-2 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Enrolled Package:</span>
                <strong className="text-white font-bold">{collectDueMember.planName || 'Membership Pass'}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Outstanding Balance:</span>
                <strong className="text-amber-400 font-extrabold text-sm">
                  ₹{((collectDueMember.pendingDues || 0) > 0 ? (collectDueMember.pendingDues || 0) : (collectDueMember.balanceDue || 0) > 0 ? (collectDueMember.balanceDue || 0) : (plans.find(p => p.id === collectDueMember.planId)?.totalPrice || 1500)).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Member Mobile:</span>
                <span className="text-slate-300 font-mono">{collectDueMember.mobile}</span>
              </div>
            </div>

            {/* Payment Collection Form */}
            <form onSubmit={handleCollectDueSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Amount to Collect (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={collectDueAmount}
                    onChange={(e) => setCollectDueAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-3 bg-[#080C14] border border-white/10 rounded-2xl text-xs text-white font-extrabold outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Payment Mode *
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['UPI', 'Cash', 'Card', 'Bank Transfer'] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setCollectDuePaymentMethod(m)}
                      className={`py-2.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                        collectDuePaymentMethod === m
                          ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow-md font-black'
                          : 'bg-[#080C14] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isCollectingDue}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-black text-xs flex items-center justify-center gap-2 shadow-2xl shadow-amber-500/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50 mt-3"
              >
                <Check className="w-4 h-4" />
                <span>{isCollectingDue ? 'Recording Payment...' : `Confirm & Collect ₹${collectDueAmount.toLocaleString('en-IN')}`}</span>
              </button>
            </form>
          </div>
        </div>
      )}

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
        accentColor="#00D4FF"
      />

    </div>
  );
};
