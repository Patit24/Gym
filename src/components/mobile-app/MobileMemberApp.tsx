import React, { useState } from 'react';
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
  Crown
} from 'lucide-react';

type MemberScreen = 'home' | 'workout' | 'diet' | 'progress' | 'more' | 'ai' | 'qr' | 'subscription' | 'profile' | 'challenges' | 'referrals';

export const MobileMemberApp: React.FC = () => {
  const { 
    activeMember, 
    workout, 
    diet, 
    signOutApp, 
    notifications, 
    attendance,
    gymChallenges,
    joinChallenge,
    referrals
  } = useGym();
  const [currentScreen, setCurrentScreen] = useState<MemberScreen>('home');
  const [showQRModal, setShowQRModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  // Dynamic Day & Workout Computation
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNames[new Date().getDay()];
  const currentSplit = workout?.weeklyPlans?.[0]?.splits?.find(
    (s) => s.day.toLowerCase() === currentDayName.toLowerCase()
  ) || workout?.weeklyPlans?.[0]?.splits?.[0];
  const hasWorkout = Boolean(currentSplit && currentSplit.exercises && currentSplit.exercises.length > 0);

  // Dynamic Diet & Macros Computation
  const activeMonthlyDiet = diet?.monthlyPlans?.[0];
  const hasDiet = Boolean(activeMonthlyDiet && activeMonthlyDiet.targetCalories > 0);
  const targetCalories = activeMonthlyDiet?.targetCalories || 0;
  const targetProtein = activeMonthlyDiet?.targetProteinG || 0;
  const todayCalories = hasDiet ? Math.round(targetCalories * 0.85) : 0;
  const proteinPercent = targetProtein > 0 ? Math.min(100, Math.round((todayCalories / targetCalories) * 100)) : 0;

  // Member Referrals
  const myReferrals = referrals.filter(r => r.referrerMemberId === activeMember?.id);
  const referralCode = `GYM-${activeMember?.membershipNo?.replace(/\D/g, '') || 'VIP2026'}`;

  // Dynamic Attendance / Check-ins
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  const monthlyCheckIns = attendance.filter(
    (a) =>
      (a.memberId === activeMember?.id || (a.memberName && a.memberName.toLowerCase() === activeMember?.name?.toLowerCase())) &&
      a.date.startsWith(currentMonthPrefix)
  ).length;

  const memberWeight = activeMember?.weightKg || 0;

  const navigateTo = (screen: MemberScreen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(`Join Smart Gym with my referral code ${referralCode} and get 1 month free extension!`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const isSubPage = ['ai', 'qr', 'subscription', 'profile', 'challenges', 'referrals'].includes(currentScreen);

  const bottomNavTabs: MobileNavTab[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'diet', label: 'Diet', icon: Utensils },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'more', label: 'More', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between selection:bg-[#27D980] selection:text-black">
      
      {/* ── 1. COMPACT NATIVE MOBILE HEADER ── */}
      <MobileAppHeader
        title={isSubPage ? undefined : 'Smart Gym'}
        subtitle={isSubPage ? undefined : `Good morning, ${activeMember?.name || 'Member'} 👋`}
        role="Member"
        userPhoto={activeMember?.photoUrl}
        accentColor="#27D980"
        unreadCount={unreadNotifs.length}
        onOpenNotifications={() => navigateTo('more')}
        onSignOut={signOutApp}
        backAction={isSubPage ? () => setCurrentScreen('home') : undefined}
        backTitle={
          currentScreen === 'ai' ? 'AI Coach Studio' :
          currentScreen === 'qr' ? 'Gate QR Pass' :
          currentScreen === 'subscription' ? 'Membership Plan' :
          currentScreen === 'profile' ? 'My Health Profile' :
          currentScreen === 'challenges' ? 'Gym Challenges' :
          currentScreen === 'referrals' ? 'Refer & Earn' : 'Back'
        }
      />

      {/* ── 2. MAIN SCROLLABLE CONTENT ── */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 max-w-lg mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 1: MEMBER HOME DASHBOARD
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Obsidian Gold VIP Membership Card */}
            <div className="w-full max-w-sm mx-auto">
              <SubscriptionCard />
            </div>

            {/* Quick Gate Pass QR Trigger Card */}
            <div
              onClick={() => navigateTo('qr')}
              className="p-3.5 bg-gradient-to-r from-[#121E19] via-[#0E1714] to-[#0A100E] rounded-3xl border border-[#27D980]/30 shadow-xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#27D980]/20 text-[#27D980] flex items-center justify-center border border-[#27D980]/40">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Smart Gate QR Access</h4>
                  <p className="text-[10px] text-slate-400">Tap to show gate entry pass</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-[#27D980] bg-[#27D980]/15 px-2.5 py-1 rounded-xl border border-[#27D980]/30">
                Open Pass →
              </span>
            </div>

            {/* Quick Shortcuts: Challenges & Referrals */}
            <div className="grid grid-cols-2 gap-2.5">
              <div
                onClick={() => navigateTo('challenges')}
                className="p-3.5 rounded-3xl bg-gradient-to-br from-amber-950/30 to-[#12101E] border border-amber-500/30 shadow-xl cursor-pointer active:scale-95 transition-all space-y-1"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Trophy className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white mt-1">Gym Challenges</h4>
                <p className="text-[10px] text-amber-300 font-bold">{gymChallenges.length} Active Contests</p>
              </div>

              <div
                onClick={() => navigateTo('referrals')}
                className="p-3.5 rounded-3xl bg-gradient-to-br from-purple-950/30 to-[#140F20] border border-purple-500/30 shadow-xl cursor-pointer active:scale-95 transition-all space-y-1"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <Gift className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white mt-1">Refer & Earn</h4>
                <p className="text-[10px] text-purple-300 font-bold">Earn Free Extensions</p>
              </div>
            </div>

            {/* Today's Workout Widget */}
            <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-black text-white">Today's Workout Split</h3>
                </div>
                <button
                  onClick={() => navigateTo('workout')}
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  View Plan →
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[#0B0E17] border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-white text-xs">{currentSplit?.title || 'Active Split Routine'}</strong>
                  <div className="text-[10px] text-slate-400">{currentSplit?.exercises?.length || 0} Exercises scheduled for {currentDayName}</div>
                </div>
                <button
                  onClick={() => navigateTo('workout')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[10px] cursor-pointer"
                >
                  Start
                </button>
              </div>
            </div>

            {/* Today's Diet & Macros Widget */}
            <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-[#27D980]" />
                  <span>Nutrition & Daily Macros</span>
                </span>
                <span className="text-[10px] font-black text-[#27D980]">
                  {hasDiet ? `${todayCalories} / ${targetCalories} kcal` : 'Not Prescribed'}
                </span>
              </div>

              {/* Macro Bars */}
              {hasDiet ? (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400">Protein Target</span>
                    <span className="text-white">{targetProtein}g ({proteinPercent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#27D980] rounded-full" style={{ width: `${proteinPercent}%` }} />
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">Diet plan not yet assigned by your dietitian.</p>
              )}

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400 font-medium text-[11px]">
                  {hasDiet && activeMonthlyDiet ? (activeMonthlyDiet.monthTitle || 'Personal Nutrition Plan') : 'Custom Diet Plan'}
                </span>
                <button
                  onClick={() => navigateTo('diet')}
                  className="text-[11px] font-bold text-[#27D980] hover:underline"
                >
                  View Diet Plan →
                </button>
              </div>
            </div>

            {/* Attendance & Streak Card */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 bg-[#101422] rounded-2xl border border-white/10 text-center">
                <div className="text-[10px] font-black text-slate-400 uppercase">Monthly Check-ins</div>
                <div className="text-2xl font-black text-[#27D980] mt-0.5">
                  {monthlyCheckIns} {monthlyCheckIns === 1 ? 'Day' : 'Days'}
                </div>
                <span className="text-[9px] text-slate-400 block mt-0.5">This Month</span>
              </div>

              <div
                onClick={() => navigateTo('progress')}
                className="p-3.5 bg-[#101422] hover:bg-[#151A2E] rounded-2xl border border-white/10 text-center cursor-pointer transition-all active:scale-95"
              >
                <div className="text-[10px] font-black text-slate-400 uppercase">Current Weight</div>
                <div className="text-2xl font-black text-white mt-0.5">
                  {memberWeight > 0 ? `${memberWeight} kg` : 'Not Set'}
                </div>
                <span className="text-[9px] text-[#4F7CFF] font-bold block mt-0.5">Progress Studio →</span>
              </div>
            </div>

            {/* AI Coach Studio Trigger */}
            <div
              onClick={() => navigateTo('ai')}
              className="p-4 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-[#101422] rounded-3xl border border-purple-500/30 shadow-xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40">
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
          <div className="animate-in fade-in duration-200">
            <WorkoutLogger />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 3: DIET TRACKER
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'diet' && (
          <div className="animate-in fade-in duration-200">
            <DietTracker />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 4: PROGRESS STUDIO
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'progress' && (
          <div className="animate-in fade-in duration-200">
            <ProgressStudio />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 5: MORE / SETTINGS
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'more' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Membership Card Overview */}
            <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#27D980]" />
                  <span>VIP Access Pass</span>
                </h3>
                <span className="text-[10px] font-black text-[#27D980] bg-[#27D980]/15 px-2 py-0.5 rounded-full border border-[#27D980]/30">
                  {activeMember?.status || 'Active'}
                </span>
              </div>

              <div className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Plan:</span>
                  <span className="font-bold text-white">{activeMember?.planName || 'VIP Annual Pass'}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-400">Valid Until:</span>
                  <span className="font-bold text-[#27D980]">{activeMember?.expiryDate || activeMember?.endDate || '2026-12-31'}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-[#101422] rounded-3xl border border-white/10 overflow-hidden shadow-xl divide-y divide-white/5">
              <button
                onClick={() => navigateTo('profile')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151A2E] active:bg-[#1B2238] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#27D980]" />
                  <div>
                    <span className="text-xs font-bold text-white block">Edit Profile & Body Stats</span>
                    <span className="text-[10px] text-slate-400">Update waist, biceps, emergency contact & medical notes</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => navigateTo('challenges')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151A2E] active:bg-[#1B2238] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Community Challenges</span>
                    <span className="text-[10px] text-slate-400">Join 30-day transformation & leaderboard contests</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => navigateTo('referrals')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151A2E] active:bg-[#1B2238] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Referral Rewards Program</span>
                    <span className="text-[10px] text-slate-400">Share your invite code to get fee discounts</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => navigateTo('qr')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151A2E] active:bg-[#1B2238] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <QrCode className="w-5 h-5 text-[#27D980]" />
                  <span className="text-xs font-bold text-white">Gate Access QR Pass</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => navigateTo('ai')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151A2E] active:bg-[#1B2238] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-bold text-white">AI Coach Assistant</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => navigateTo('subscription')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151A2E] active:bg-[#1B2238] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[#4F7CFF]" />
                  <span className="text-xs font-bold text-white">Renew / Freeze Plan</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Sign Out */}
            <button
              onClick={signOutApp}
              className="w-full py-3 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
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
            SUBPAGE 3: SUBSCRIPTION CARD
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
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/40 to-[#141022] border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">COMMUNITY ARENA</span>
                <h3 className="text-sm font-black text-white mt-0.5">Gym Transformation Challenges</h3>
              </div>
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>

            {gymChallenges.length === 0 ? (
              <div className="p-8 rounded-3xl bg-[#101422] border border-white/10 text-center text-slate-400 space-y-2">
                <Trophy className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="font-bold">No active challenges right now.</p>
                <p className="text-[10px] text-slate-500">Check back soon for monthly gym member competitions!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {gymChallenges.map((ch) => {
                  const isJoined = ch.participants?.includes(activeMember?.id || '');

                  return (
                    <div key={ch.id} className="p-4 rounded-3xl bg-[#101422] border border-amber-500/30 space-y-3 shadow-xl">
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

                      <div className="p-2.5 rounded-2xl bg-[#0B0E17] border border-white/5 flex items-center justify-between text-xs">
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
                            <div key={lb.rank} className="p-2 rounded-xl bg-[#0B0E17] flex items-center justify-between text-xs">
                              <span className="text-white font-bold">#{lb.rank} {lb.memberName}</span>
                              <span className="text-emerald-400 font-black">{lb.score} pts</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {!isJoined ? (
                        <button
                          onClick={() => activeMember && joinChallenge(ch.id, activeMember.id, activeMember.name)}
                          className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black text-xs shadow-lg cursor-pointer"
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
            <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/40 to-[#141022] border border-purple-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">EXCLUSIVE PERK</span>
                <h3 className="text-sm font-black text-white mt-0.5">Member Referral Program</h3>
              </div>
              <Gift className="w-8 h-8 text-purple-400" />
            </div>

            {/* Invite Code Box */}
            <div className="p-5 rounded-3xl bg-[#101422] border border-purple-500/30 space-y-3 text-center shadow-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Your Unique Invite Code</span>
              <div className="text-2xl font-black text-purple-300 font-mono tracking-widest bg-[#0B0E17] py-3 rounded-2xl border border-purple-500/20">
                {referralCode}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyReferralLink}
                  className="flex-1 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied Invite!' : 'Copy Invite Link'}</span>
                </button>
              </div>
            </div>

            {/* How It Works */}
            <div className="p-4 rounded-3xl bg-[#101422] border border-white/10 space-y-2.5">
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
            <div className="p-4 rounded-3xl bg-[#101422] border border-white/10 space-y-2">
              <h4 className="text-xs font-black text-white">Your Successful Referrals ({myReferrals.length})</h4>
              {myReferrals.length === 0 ? (
                <p className="text-slate-500 text-center py-2 text-[11px]">No friends referred yet. Share your code above!</p>
              ) : (
                <div className="space-y-2">
                  {myReferrals.map((r) => (
                    <div key={r.id} className="p-2.5 rounded-xl bg-[#0B0E17] flex items-center justify-between">
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

      </main>

      {/* ── 3. FIXED BOTTOM MOBILE NAVIGATION ── */}
      <MobileBottomNav
        tabs={bottomNavTabs}
        activeTab={
          ['qr', 'subscription'].includes(currentScreen) ? 'home' :
          currentScreen === 'ai' ? 'more' :
          currentScreen
        }
        onSelectTab={(tabId) => navigateTo(tabId as MemberScreen)}
        accentColor="#27D980"
      />

    </div>
  );
};
