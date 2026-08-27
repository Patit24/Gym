import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { MobileAppHeader } from './MobileAppHeader';
import { MobileBottomNav, MobileNavTab } from './MobileBottomNav';
import { DynamicQRCard } from '../mobile/DynamicQRCard';
import { WorkoutLogger } from '../mobile/WorkoutLogger';
import { DietTracker } from '../mobile/DietTracker';
import { ProgressStudio } from '../mobile/ProgressStudio';
import { AIChatCoach } from '../mobile/AIChatCoach';
import { SubscriptionCard } from '../mobile/SubscriptionCard';
import { MemberProfileEditor } from '../mobile/MemberProfileEditor';
import { PrivilegePassCard } from '../shared/PrivilegePassCard';
import {
  Home,
  Dumbbell,
  Utensils,
  TrendingUp,
  Layers,
  QrCode,
  Sparkles,
  Calendar,
  CreditCard,
  Zap,
  CheckCircle2,
  Brain,
  ShieldCheck,
  ChevronRight,
  Flame,
  Award,
  LogOut,
  Clock,
  User,
  Trophy,
  Share2,
  Gift,
  Copy,
  Check,
  Crown,
  Receipt,
  Bell,
  FileText,
  Target,
  FileCheck,
  Settings,
  HelpCircle,
  Info,
  Building2,
  Droplets,
  Footprints,
  ArrowRight,
  ExternalLink,
  Download,
  AlertTriangle
} from 'lucide-react';

type MemberScreen =
  | 'home'
  | 'workout'
  | 'diet'
  | 'progress'
  | 'more'
  | 'ai'
  | 'qr'
  | 'subscription'
  | 'profile'
  | 'challenges'
  | 'referrals'
  | 'payment'
  | 'notifications';

export const MobileMemberApp: React.FC = () => {
  const {
    activeMember,
    activeMemberId,
    setActiveMemberId,
    workout,
    diet,
    signOutApp,
    notifications,
    attendance,
    gymChallenges,
    joinChallenge,
    referrals,
    transactions,
    selectedBranchId,
    branches,
    setSelectedBranchId
  } = useGym();

  const [currentScreen, setCurrentScreen] = useState<MemberScreen>('home');
  const [copiedCode, setCopiedCode] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'important'>('all');

  useEffect(() => {
    if (activeMember?.id && activeMember.id !== activeMemberId) {
      setActiveMemberId(activeMember.id);
    }
  }, [activeMember?.id, activeMemberId, setActiveMemberId]);

  const unreadNotifs = notifications.filter((n) => !n.read);

  // Dynamic Day & Workout Computation across all assigned weekly plans
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNames[new Date().getDay()];
  const allSplits = workout?.weeklyPlans?.flatMap((w) => w.splits || []) || [];
  const currentSplit = allSplits.find(
    (s) => s.day && s.day.toLowerCase() === currentDayName.toLowerCase()
  ) || allSplits[0] || workout?.weeklyPlans?.[0]?.splits?.[0];
  const hasWorkout = Boolean(currentSplit && currentSplit.exercises && currentSplit.exercises.length > 0);

  // Dynamic Diet & Macros Computation across all assigned monthly plans
  const activeMonthlyDiet = diet?.monthlyPlans?.[0];
  const hasDiet = Boolean(activeMonthlyDiet && activeMonthlyDiet.targetCalories > 0);
  const targetCalories = activeMonthlyDiet?.targetCalories || 2200;
  const targetProtein = activeMonthlyDiet?.targetProteinG || 160;
  const targetCarbs = activeMonthlyDiet?.targetCarbsG || 220;
  const targetFat = activeMonthlyDiet?.targetFatG || 70;
  const todayCalories = hasDiet ? Math.round(targetCalories * 0.85) : 0;
  const todayProtein = hasDiet ? Math.round(targetProtein * 0.82) : 0;
  const todayCarbs = hasDiet ? Math.round(targetCarbs * 0.81) : 0;
  const todayFat = hasDiet ? Math.round(targetFat * 0.77) : 0;
  const proteinPercent = targetProtein > 0 ? Math.min(100, Math.round((todayProtein / targetProtein) * 100)) : 0;

  // Member Referrals
  const myReferrals = referrals.filter((r) => r.referrerMemberId === activeMember?.id);
  const referralCode = `GYM-${activeMember?.membershipNo?.replace(/\D/g, '') || 'VIP2026'}`;

  // Dynamic Attendance / Check-ins
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  const monthlyCheckIns = attendance.filter(
    (a) =>
      (a.memberId === activeMember?.id || (a.memberName && a.memberName.toLowerCase() === activeMember?.name?.toLowerCase())) &&
      a.date.startsWith(currentMonthPrefix)
  ).length;

  const memberWeight = activeMember?.weightKg || 0;
  const startWeight = activeMember?.startWeightKg || activeMember?.weightKg || 0;
  const goalWeight = activeMember?.goalWeightKg || (memberWeight > 0 ? memberWeight - 5 : 68);
  const weightDiff = memberWeight > 0 && startWeight > 0 ? (memberWeight - startWeight).toFixed(1) : '0.0';

  // Member Transactions
  const memberTransactions = transactions.filter((t) => t.memberId === activeMember?.id);

  // Membership Validity Calculations
  const startDateStr = activeMember?.startDate || new Date().toISOString().split('T')[0];
  const endDateStr = activeMember?.endDate || activeMember?.expiryDate || '2027-01-09';
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const today = new Date();
  const totalDurationDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const usagePercent = Math.min(100, Math.round((daysElapsed / totalDurationDays) * 100));

  const navigateTo = (screen: MemberScreen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(`Join Smart Gym with my referral code ${referralCode} and get 1 month free extension!`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const isSubPage = ['ai', 'qr', 'subscription', 'profile', 'challenges', 'referrals', 'payment', 'notifications'].includes(currentScreen);

  const bottomNavTabs: MobileNavTab[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'diet', label: 'Diet', icon: Utensils },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'more', label: 'More', icon: Layers, badge: unreadNotifs.length > 0 ? unreadNotifs.length : undefined },
  ];

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0] || { name: 'Kolkata Downtown Club' };

  return (
    <div className="min-h-screen bg-ambient-mesh text-slate-100 flex flex-col justify-between selection:bg-[#00D4FF] selection:text-black">
      
      {/* ── 1. COMPACT NATIVE MOBILE HEADER ── */}
      <MobileAppHeader
        title={isSubPage ? undefined : 'Smart Gym'}
        subtitle={isSubPage ? undefined : `Good morning, ${activeMember?.name || 'Patit Paban'} 👋`}
        role="Member"
        userName={activeMember?.name || 'Patit Paban'}
        userPhoto={activeMember?.photoUrl}
        accentColor="#00D4FF"
        unreadCount={unreadNotifs.length}
        onOpenNotifications={() => navigateTo('notifications')}
        onSignOut={signOutApp}
        backAction={isSubPage ? () => setCurrentScreen('home') : undefined}
        backTitle={
          currentScreen === 'ai' ? 'AI Coach Studio' :
          currentScreen === 'qr' ? 'Gate QR Pass' :
          currentScreen === 'subscription' ? 'Membership Plan' :
          currentScreen === 'profile' ? 'My Health Profile' :
          currentScreen === 'challenges' ? 'Gym Challenges' :
          currentScreen === 'referrals' ? 'Refer & Earn' :
          currentScreen === 'payment' ? 'Payment History' :
          currentScreen === 'notifications' ? 'Notifications' : 'Back'
        }
      />

      {/* ── 2. MAIN SCROLLABLE CONTENT ── */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 max-w-lg mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 1: MEMBER HOME DASHBOARD
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            
            {/* Holographic / Dark Glass VIP Membership Card */}
            <div className="w-full max-w-sm mx-auto">
              <PrivilegePassCard
                member={activeMember}
                priorityText={activeMember?.planName?.includes('VIP') ? 'PRIORITY' : 'VIP PASS'}
                showFlipButton={true}
              />
            </div>

            {/* Quick Actions Matrix: 5 Colorful Glass Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1">
                Quick Actions
              </span>
              <div className="grid grid-cols-5 gap-2">
                
                {/* 1. QR Access */}
                <button
                  onClick={() => navigateTo('qr')}
                  className="p-3 rounded-2xl glass-card hover:border-[#00D4FF]/40 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-90 group cursor-pointer shadow-lg"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#00D4FF]/15 text-[#00D4FF] flex items-center justify-center border border-[#00D4FF]/30 group-hover:scale-110 transition-transform">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-200 tracking-tight">QR Pass</span>
                </button>

                {/* 2. Workout */}
                <button
                  onClick={() => navigateTo('workout')}
                  className="p-3 rounded-2xl glass-card hover:border-cyan-400/40 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-90 group cursor-pointer shadow-lg"
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-200 tracking-tight">Workout</span>
                </button>

                {/* 3. Diet */}
                <button
                  onClick={() => navigateTo('diet')}
                  className="p-3 rounded-2xl glass-card hover:border-[#00F5A0]/40 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-90 group cursor-pointer shadow-lg"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#00F5A0]/15 text-[#00F5A0] flex items-center justify-center border border-[#00F5A0]/30 group-hover:scale-110 transition-transform">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-200 tracking-tight">Diet</span>
                </button>

                {/* 4. Progress */}
                <button
                  onClick={() => navigateTo('progress')}
                  className="p-3 rounded-2xl glass-card hover:border-[#8B5CF6]/40 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-90 group cursor-pointer shadow-lg"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center border border-[#8B5CF6]/30 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-200 tracking-tight">Progress</span>
                </button>

                {/* 5. Payment */}
                <button
                  onClick={() => navigateTo('payment')}
                  className="p-3 rounded-2xl glass-card hover:border-[#FFC107]/40 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-90 group cursor-pointer shadow-lg"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#FFC107]/15 text-[#FFC107] flex items-center justify-center border border-[#FFC107]/30 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-200 tracking-tight">Payment</span>
                </button>

              </div>
            </div>

            {/* Today's Summary: 4 Modular Metric Cards */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Today's Summary
                </span>
                <button
                  onClick={() => navigateTo('progress')}
                  className="text-[10px] font-bold text-[#00D4FF] hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                
                {/* 1. Workouts */}
                <div className="p-3 rounded-2xl glass-card text-center space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase block truncate">Workouts</span>
                  <div className="w-7 h-7 mx-auto rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Dumbbell className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-black text-white">{hasWorkout ? '1 Split' : '0/1'}</div>
                  <span className="text-[8px] text-slate-400 block truncate">{hasWorkout ? 'Assigned' : 'Rest Day'}</span>
                </div>

                {/* 2. Calories */}
                <div className="p-3 rounded-2xl glass-card text-center space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase block truncate">Calories</span>
                  <div className="w-7 h-7 mx-auto rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center border border-orange-500/30">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-black text-white">{todayCalories}</div>
                  <span className="text-[8px] text-slate-400 block truncate">/{targetCalories} kcal</span>
                </div>

                {/* 3. Water */}
                <div className="p-3 rounded-2xl glass-card text-center space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase block truncate">Water</span>
                  <div className="w-7 h-7 mx-auto rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-black text-white">{(diet?.waterCurrentLiters || 1.8).toFixed(1)}L</div>
                  <span className="text-[8px] text-slate-400 block truncate">/3.0L Target</span>
                </div>

                {/* 4. Monthly Visits / Steps */}
                <div className="p-3 rounded-2xl glass-card text-center space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase block truncate">Attendance</span>
                  <div className="w-7 h-7 mx-auto rounded-lg bg-[#00F5A0]/15 text-[#00F5A0] flex items-center justify-center border border-[#00F5A0]/30">
                    <Footprints className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-black text-white">{monthlyCheckIns} Days</div>
                  <span className="text-[8px] text-slate-400 block truncate">This Month</span>
                </div>

              </div>
            </div>

            {/* Today's Workout Split Widget */}
            <div className="p-4 rounded-3xl glass-card space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Dumbbell className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-black text-white">Today's Workout Split</h3>
                </div>
                <button
                  onClick={() => navigateTo('workout')}
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  View Plan →
                </button>
              </div>

              {hasWorkout ? (
                <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-white text-xs font-black">{currentSplit?.title || 'Active Routine'}</strong>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {currentSplit?.exercises?.length || 0} Exercises scheduled for {currentDayName}
                    </div>
                  </div>
                  <button
                    onClick={() => navigateTo('workout')}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-cyan-500 text-black font-black text-[10px] shadow-md active:scale-95 cursor-pointer"
                  >
                    Start
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-black/30 border border-white/5 text-center text-slate-400 text-xs py-4">
                  No workout assigned for today. Tap below to log custom exercises or review past history.
                </div>
              )}
            </div>

            {/* Today's Diet & Macros Widget */}
            <div className="p-4 rounded-3xl glass-card space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#00F5A0]/20 text-[#00F5A0] flex items-center justify-center border border-[#00F5A0]/30">
                    <Utensils className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-black text-white">Nutrition & Daily Macros</span>
                </div>
                <span className="text-[10px] font-black text-[#00F5A0]">
                  {hasDiet ? `${todayCalories} / ${targetCalories} kcal` : 'Custom Plan'}
                </span>
              </div>

              {/* Macro Bars */}
              {hasDiet ? (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400">Daily Protein Target</span>
                    <span className="text-white">{targetProtein}g ({proteinPercent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-[1px]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${proteinPercent}%`,
                        background: 'linear-gradient(90deg, #00D4FF, #00F5A0)'
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Custom nutrition goals active. Tap below to track your water and daily meals.
                </p>
              )}

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400 font-medium text-[11px]">
                  {hasDiet && activeMonthlyDiet ? (activeMonthlyDiet.monthTitle || 'Personal Nutrition Plan') : 'Daily Diet Plan'}
                </span>
                <button
                  onClick={() => navigateTo('diet')}
                  className="text-[11px] font-bold text-[#00F5A0] hover:underline cursor-pointer"
                >
                  View Diet Plan →
                </button>
              </div>
            </div>

            {/* Quick Shortcuts: Challenges & Referrals */}
            <div className="grid grid-cols-2 gap-2.5">
              <div
                onClick={() => navigateTo('challenges')}
                className="p-3.5 rounded-3xl glass-card hover:border-amber-500/40 cursor-pointer active:scale-95 transition-all space-y-1 shadow-xl"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Trophy className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white mt-1">Gym Challenges</h4>
                <p className="text-[10px] text-amber-300 font-bold">{gymChallenges.length} Active Contests</p>
              </div>

              <div
                onClick={() => navigateTo('referrals')}
                className="p-3.5 rounded-3xl glass-card hover:border-purple-500/40 cursor-pointer active:scale-95 transition-all space-y-1 shadow-xl"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <Gift className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white mt-1">Refer & Earn</h4>
                <p className="text-[10px] text-purple-300 font-bold">Earn Free Extensions</p>
              </div>
            </div>

            {/* AI Coach Studio Banner */}
            <div
              onClick={() => navigateTo('ai')}
              className="p-4 rounded-3xl glass-card hover:border-purple-500/40 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40 shadow-md">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">AI Coach Studio</h4>
                  <p className="text-[10px] text-slate-400">Ask form tips, diet advice & workout tweaks</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-400" />
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 2: WORKOUT LOGGER
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'workout' && (
          <div className="animate-in fade-in duration-300">
            <WorkoutLogger />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 3: DIET TRACKER
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'diet' && (
          <div className="animate-in fade-in duration-300">
            <DietTracker />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 4: PROGRESS STUDIO
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'progress' && (
          <div className="animate-in fade-in duration-300">
            <ProgressStudio />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 5: MORE SCREEN (12-GRID MENU & PROFILE)
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'more' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            
            {/* Member Profile Hero Header */}
            <div className="p-4 rounded-3xl glass-card flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={activeMember?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop&q=80'}
                    alt={activeMember?.name || 'Member'}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-[#00D4FF] shadow-lg"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#00F5A0] border-2 border-[#070A12]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{activeMember?.name || 'Patit Paban'}</h3>
                  <p className="text-[10px] font-mono text-cyan-400 font-bold">{activeMember?.membershipNo || 'SG-19877'}</p>
                </div>
              </div>

              <button
                onClick={() => navigateTo('profile')}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-cyan-300 border border-white/10 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <span>View Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 12-Icon Glass Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* 1. Membership */}
              <button
                onClick={() => navigateTo('subscription')}
                className="p-3.5 rounded-2xl glass-card hover:border-[#00D4FF]/40 flex flex-col items-center text-center gap-2 transition-all active:scale-95 cursor-pointer group shadow-lg"
              >
                <div className="w-9 h-9 rounded-xl bg-[#00D4FF]/15 text-[#00D4FF] flex items-center justify-center border border-[#00D4FF]/30 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-200">Membership</span>
              </button>

              {/* 2. Payment History */}
              <button
                onClick={() => navigateTo('payment')}
                className="p-3.5 rounded-2xl glass-card hover:border-[#00F5A0]/40 flex flex-col items-center text-center gap-2 transition-all active:scale-95 cursor-pointer group shadow-lg"
              >
                <div className="w-9 h-9 rounded-xl bg-[#00F5A0]/15 text-[#00F5A0] flex items-center justify-center border border-[#00F5A0]/30 group-hover:scale-110 transition-transform">
                  <Receipt className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-200">Payment History</span>
              </button>

              {/* 3. Notifications */}
              <button
                onClick={() => navigateTo('notifications')}
                className="p-3.5 rounded-2xl glass-card hover:border-[#FF5C5C]/40 flex flex-col items-center text-center gap-2 transition-all active:scale-95 cursor-pointer group shadow-lg relative"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FF5C5C]/15 text-[#FF5C5C] flex items-center justify-center border border-[#FF5C5C]/30 group-hover:scale-110 transition-transform">
                  <Bell className="w-4 h-4" />
                </div>
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#FF5C5C] text-white text-[8px] font-black flex items-center justify-center shadow-[0_0_8px_#FF5C5C]">
                    {unreadNotifs.length}
                  </span>
                )}
                <span className="text-[10px] font-black text-slate-200">Notifications</span>
              </button>

              {/* 4. Gym Challenges */}
              <button
                onClick={() => navigateTo('challenges')}
                className="p-3.5 rounded-2xl glass-card hover:border-amber-500/40 flex flex-col items-center text-center gap-2 transition-all active:scale-95 cursor-pointer group shadow-lg"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-200">Gym Challenges</span>
              </button>

              {/* 5. Refer & Earn */}
              <button
                onClick={() => navigateTo('referrals')}
                className="p-3.5 rounded-2xl glass-card hover:border-purple-500/40 flex flex-col items-center text-center gap-2 transition-all active:scale-95 cursor-pointer group shadow-lg"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform">
                  <Gift className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-200">Refer & Earn</span>
              </button>

              {/* 6. Gate QR Pass */}
              <button
                onClick={() => navigateTo('qr')}
                className="p-3.5 rounded-2xl glass-card hover:border-cyan-400/40 flex flex-col items-center text-center gap-2 transition-all active:scale-95 cursor-pointer group shadow-lg"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-200">QR Gate Pass</span>
              </button>

              {/* 7. Attendance Log */}
              <button
                onClick={() => navigateTo('progress')}
                className="p-3.5 rounded-2xl glass-card hover:border-emerald-400/40 flex flex-col items-center text-center gap-2 transition-all active:scale-95 cursor-pointer group shadow-lg"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-200">Attendance</span>
              </button>

              {/* 8. My Goals */}
              <button
                onClick={() => navigateTo('profile')}
                className="p-3.5 rounded-2xl glass-card hover:border-rose-400/40 flex flex-col items-center text-center gap-2 transition-all active:scale-95 cursor-pointer group shadow-lg"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30 group-hover:scale-110 transition-transform">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-200">My Goals</span>
              </button>

              {/* 9. AI Coach Assistant */}
              <button
                onClick={() => navigateTo('ai')}
                className="p-3.5 rounded-2xl glass-card hover:border-purple-400/40 flex flex-col items-center text-center gap-2 transition-all active:scale-95 cursor-pointer group shadow-lg"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform">
                  <Brain className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-200">AI Coach</span>
              </button>

              {/* 10. Settings */}
              <button
                onClick={() => navigateTo('profile')}
                className="p-3.5 rounded-2xl glass-card hover:border-slate-400/40 flex flex-col items-center text-center gap-2 transition-all active:scale-95 cursor-pointer group shadow-lg"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-500/15 text-slate-400 flex items-center justify-center border border-slate-500/30 group-hover:scale-110 transition-transform">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-200">Settings</span>
              </button>

              {/* 11. Support */}
              <button
                onClick={() => window.open('https://wa.me/919876543210?text=Hello%20Smart%20Gym%20Support', '_blank')}
                className="p-3.5 rounded-2xl glass-card hover:border-emerald-500/40 flex flex-col items-center text-center gap-2 transition-all active:scale-95 cursor-pointer group shadow-lg"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-200">Support</span>
              </button>

              {/* 12. About Us */}
              <div className="p-3.5 rounded-2xl glass-card flex flex-col items-center text-center gap-2 opacity-80 shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Info className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-200">v2.0 2026</span>
              </div>

            </div>

            {/* Switch Branch Footer Card */}
            <div className="p-4 rounded-3xl glass-card flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Gym Branch</span>
                  <strong className="text-xs font-black text-white">{currentBranch.name}</strong>
                </div>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20">
                Active
              </span>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={signOutApp}
              className="w-full py-3 rounded-2xl bg-[#FF5C5C]/15 hover:bg-[#FF5C5C]/25 border border-[#FF5C5C]/30 text-[#FF5C5C] font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Member Account</span>
            </button>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 1: GATE QR ACCESS PASS
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'qr' && (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <DynamicQRCard />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 2: AI COACH STUDIO
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'ai' && (
          <div className="animate-in fade-in duration-200">
            <AIChatCoach />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 3: SUBSCRIPTION CARD & PLAN DETAILS
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'subscription' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <SubscriptionCard />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 4: MEMBER PROFILE & BODY STATS EDITOR
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'profile' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <MemberProfileEditor />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 5: GYM COMMUNITY CHALLENGES
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'challenges' && (
          <div className="space-y-4 animate-in fade-in duration-200 text-xs">
            <div className="p-4 rounded-3xl glass-card border border-amber-500/30 flex items-center justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">COMMUNITY ARENA</span>
                <h3 className="text-sm font-black text-white mt-0.5">Gym Transformation Challenges</h3>
              </div>
              <Trophy className="w-7 h-7 text-amber-400" />
            </div>

            {gymChallenges.length === 0 ? (
              <div className="p-8 rounded-3xl glass-card text-center text-slate-400 space-y-2">
                <Trophy className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="font-bold">No active challenges right now.</p>
                <p className="text-[10px] text-slate-500">Check back soon for monthly gym member competitions!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {gymChallenges.map((ch) => {
                  const isJoined = ch.participants?.includes(activeMember?.id || '');

                  return (
                    <div key={ch.id} className="p-4 rounded-3xl glass-card border border-amber-500/30 space-y-3 shadow-xl">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                          {ch.category}
                        </span>
                        <span className="text-[10px] text-slate-400">Ends: {ch.endDate}</span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-white">{ch.title}</h4>
                        <p className="text-xs text-slate-300 mt-1">{ch.description}</p>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">Grand Prize:</span>
                        <strong className="text-amber-400 font-black">{ch.prize}</strong>
                      </div>

                      {ch.leaderboard && ch.leaderboard.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            Top Leaderboard
                          </span>
                          {ch.leaderboard.slice(0, 3).map((lb) => (
                            <div key={lb.rank} className="p-2 rounded-xl bg-black/40 flex items-center justify-between text-xs">
                              <span className="text-white font-bold">#{lb.rank} {lb.memberName}</span>
                              <span className="text-[#00F5A0] font-black">{lb.score} pts</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {!isJoined ? (
                        <button
                          onClick={() => activeMember && joinChallenge(ch.id, activeMember.id, activeMember.name)}
                          className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                        >
                          Join Challenge ({ch.participants?.length || 0} Members)
                        </button>
                      ) : (
                        <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black text-center text-xs">
                          ✓ You are participating in this challenge!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 6: REFERRAL & REWARDS PROGRAM
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'referrals' && (
          <div className="space-y-4 animate-in fade-in duration-200 text-xs">
            <div className="p-4 rounded-3xl glass-card border border-purple-500/30 flex items-center justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">EXCLUSIVE PERK</span>
                <h3 className="text-sm font-black text-white mt-0.5">Member Referral Program</h3>
              </div>
              <Gift className="w-7 h-7 text-purple-400" />
            </div>

            {/* Invite Code Box */}
            <div className="p-5 rounded-3xl glass-card border border-purple-500/30 space-y-3 text-center shadow-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Your Unique Invite Code</span>
              <div className="text-2xl font-black text-purple-300 font-mono tracking-widest bg-black/40 py-3 rounded-2xl border border-purple-500/20">
                {referralCode}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyReferralLink}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-[#00F5A0]" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied Invite!' : 'Copy Invite Link'}</span>
                </button>
              </div>
            </div>

            {/* How It Works */}
            <div className="p-4 rounded-3xl glass-card space-y-2.5 shadow-xl">
              <h4 className="text-xs font-black text-white">How Referral Rewards Work</h4>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <span>Share your code with friends or workout buddies.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <span>When they join a membership, they get an exclusive discount.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <span>You receive <strong>1 Month Free Extension</strong> added to your Privilege Pass!</span>
                </div>
              </div>
            </div>

            {/* Referrals History */}
            <div className="p-4 rounded-3xl glass-card space-y-2 shadow-xl">
              <h4 className="text-xs font-black text-white">Your Successful Referrals ({myReferrals.length})</h4>
              {myReferrals.length === 0 ? (
                <p className="text-slate-500 text-center py-3 text-[11px]">No friends referred yet. Share your code above!</p>
              ) : (
                <div className="space-y-2">
                  {myReferrals.map((r) => (
                    <div key={r.id} className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                      <div>
                        <strong className="text-white">{r.referredFriendName}</strong>
                        <div className="text-[10px] text-slate-400">{r.date}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        {r.rewardClaimed ? 'Reward Claimed' : 'Pending Verification'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 7: PAYMENT HISTORY LEDGER
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'payment' && (
          <div className="space-y-4 animate-in fade-in duration-200 text-xs">
            <div className="p-4 rounded-3xl glass-card border border-[#00F5A0]/30 flex items-center justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-black text-[#00F5A0] uppercase tracking-wider">FINANCIAL LEDGER</span>
                <h3 className="text-sm font-black text-white mt-0.5">Payment & Invoice History</h3>
              </div>
              <Receipt className="w-7 h-7 text-[#00F5A0]" />
            </div>

            {memberTransactions.length === 0 ? (
              <div className="p-8 rounded-3xl glass-card text-center text-slate-400 space-y-2 shadow-xl">
                <Receipt className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="font-bold text-white">No Payment History Yet</p>
                <p className="text-[10px] text-slate-500">Your membership and PT payments will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {memberTransactions.map((tx) => (
                  <div key={tx.id} className="p-3.5 rounded-2xl glass-card flex items-center justify-between shadow-lg">
                    <div className="space-y-0.5">
                      <strong className="text-white text-xs font-black">{tx.planName || tx.category || 'Membership Fee'}</strong>
                      <div className="text-[10px] text-slate-400">{tx.date} • Paid via {tx.paymentMethod || 'UPI'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#00F5A0] font-black text-xs">₹{tx.amount?.toLocaleString('en-IN')}</div>
                      <span className="text-[9px] font-bold text-emerald-400">SUCCESS</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 8: NOTIFICATIONS HUB
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'notifications' && (
          <div className="space-y-4 animate-in fade-in duration-200 text-xs">
            <div className="p-4 rounded-3xl glass-card border border-cyan-500/30 flex items-center justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">NOTIFICATION CENTER</span>
                <h3 className="text-sm font-black text-white mt-0.5">Club Alerts & Updates</h3>
              </div>
              <Bell className="w-7 h-7 text-cyan-400" />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 rounded-2xl bg-black/40 border border-white/5">
              <button
                onClick={() => setNotifFilter('all')}
                className={`flex-1 py-1.5 rounded-xl font-black text-[10px] transition-all ${
                  notifFilter === 'all' ? 'bg-[#00D4FF] text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setNotifFilter('unread')}
                className={`flex-1 py-1.5 rounded-xl font-black text-[10px] transition-all ${
                  notifFilter === 'unread' ? 'bg-[#00D4FF] text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Unread ({unreadNotifs.length})
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 rounded-3xl glass-card text-center text-slate-400 space-y-2 shadow-xl">
                <Bell className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="font-bold text-white">You're All Caught Up!</p>
                <p className="text-[10px] text-slate-500">No new notifications right now.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {notifications
                  .filter((n) => (notifFilter === 'unread' ? !n.read : true))
                  .map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 rounded-2xl glass-card space-y-1.5 shadow-lg ${
                        !n.read ? 'border-cyan-500/40 bg-cyan-500/[0.04]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-black text-cyan-400 uppercase tracking-wider">{n.type || 'Alert'}</span>
                        <span className="text-[9px] text-slate-400">{n.timestamp ? n.timestamp.split('T')[0] : 'Today'}</span>
                      </div>
                      <h4 className="text-xs font-black text-white">{n.title}</h4>
                      <p className="text-[11px] text-slate-300">{n.message}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ── 3. FIXED FLOATING BOTTOM MOBILE NAVIGATION ── */}
      <MobileBottomNav
        tabs={bottomNavTabs}
        activeTab={
          ['qr', 'subscription'].includes(currentScreen) ? 'home' :
          currentScreen === 'ai' || currentScreen === 'payment' || currentScreen === 'notifications' || currentScreen === 'challenges' || currentScreen === 'referrals' || currentScreen === 'profile' ? 'more' :
          currentScreen
        }
        onSelectTab={(tabId) => navigateTo(tabId as MemberScreen)}
        accentColor="#00D4FF"
      />

    </div>
  );
};
