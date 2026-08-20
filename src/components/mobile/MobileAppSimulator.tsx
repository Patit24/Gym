import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { DynamicQRCard } from './DynamicQRCard';
import { WorkoutLogger } from './WorkoutLogger';
import { DietTracker } from './DietTracker';
import { ProgressStudio } from './ProgressStudio';
import { AIChatCoach } from './AIChatCoach';
import { TrainerMobileView } from './TrainerMobileView';
import { SubscriptionCard } from './SubscriptionCard';
import { AdminMobileConsole } from './AdminMobileConsole';
import { Role } from '../../types/gym';
import {
  Home,
  Dumbbell,
  QrCode,
  Utensils,
  Activity,
  Bot,
  Wifi,
  Battery,
  Users,
  ChevronRight,
  UserCheck,
  Lock,
  ShoppingBag,
  Calendar,
  AlertCircle,
  Award,
  Sparkles,
  CreditCard,
  ScanLine,
  User,
  Zap,
  ArrowRight,
  LogOut,
  Layers
} from 'lucide-react';

export const MobileAppSimulator: React.FC = () => {
  const { activeMember, setActiveMemberId, workout, diet, currentRole, setCurrentRole, selectedBranchId, branches, setPerspective, signOutApp } = useGym();
  const [activeTab, setActiveTab] = useState<'home' | 'workout' | 'qr' | 'diet' | 'progress' | 'subscription' | 'ai'>('home');
  const [showRoleDrawer, setShowRoleDrawer] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState<string | null>(null);

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const roles: Role[] = [
    'Member',
    'Trainer',
    'Dietitian',
    'Receptionist',
    'Branch Manager',
    'Owner',
    'Super Admin'
  ];

  const isMemberRole = currentRole === 'Member';

  return (
    <div className="flex items-center justify-center min-h-[85vh] py-4 animate-in fade-in duration-300">
      
      {/* iPhone 16 Pro High-Definition Device Frame */}
      <div className="relative w-[410px] h-[820px] bg-[#0A0D14] border-[10px] border-[#1E2330] rounded-[56px] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden ring-2 ring-white/20">
        
        {/* Top Status Bar & Dynamic Island */}
        <div className="relative z-30 pt-3.5 px-7 pb-2.5 flex items-center justify-between text-xs text-white bg-[#0A0D14] border-b border-white/10">
          <span className="font-extrabold text-xs tracking-tight text-white">9:41</span>
          
          {/* Dynamic Island Notch */}
          <div className="w-28 h-6 bg-black rounded-full flex items-center justify-between px-3 text-[10px] text-[#27D980] font-mono border border-white/20 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#27D980] animate-ping" />
            <span className="font-bold tracking-widest text-[#27D980]">SMART GYM</span>
          </div>

          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-white" />
            <Battery className="w-4 h-4 text-[#27D980]" />
          </div>
        </div>

        {/* High Contrast Header Bar */}
        <div className="px-5 py-3.5 bg-[#121622] border-b border-white/15 flex items-center justify-between z-20 shadow-md">
          <div className="flex items-center gap-3">
            {/* Glowing Avatar */}
            <div className="relative group cursor-pointer" onClick={() => (currentRole === 'Super Admin' || currentRole === 'Owner') && setShowRoleDrawer(!showRoleDrawer)}>
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 to-[#27D980] blur-sm opacity-90 group-hover:opacity-100 transition-opacity" />
              <img
                src={activeMember?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={activeMember?.name || 'Member'}
                className="relative w-11 h-11 rounded-full object-cover border-2 border-[#27D980] shadow-md"
              />
            </div>

            <div>
              <h3 className="text-sm font-black text-white tracking-tight leading-none">
                {isMemberRole ? (activeMember?.name || 'Member') : `${currentRole} Workspace`}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                {(currentRole === 'Super Admin' || currentRole === 'Owner') ? (
                  <button
                    onClick={() => setShowRoleDrawer(!showRoleDrawer)}
                    className="text-[11px] text-cyan-300 font-extrabold flex items-center gap-1 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-400/40 hover:bg-cyan-900/80 transition-colors"
                  >
                    <span>Role: <strong>{currentRole}</strong></span>
                    <UserCheck className="w-3 h-3 text-cyan-400" />
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-[#27D980] bg-[#27D980]/15 px-2 py-0.5 rounded-full border border-[#27D980]/30">
                    Active Member
                  </span>
                )}
                <button
                  onClick={() => {
                    signOutApp();
                  }}
                  className="p-1 rounded-md bg-red-950/60 border border-red-500/40 text-red-400 hover:bg-red-900/80 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* High Contrast AI Robot Button */}
          <button
            onClick={() => setActiveTab('ai')}
            className="w-10 h-10 rounded-2xl bg-[#1A2338] border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-lg hover:bg-cyan-500 hover:text-gym-dark transition-all"
            title="Ask AI Coach"
          >
            <Bot className="w-5 h-5" />
          </button>
        </div>

        {/* Role Drawer Dropdown */}
        {showRoleDrawer && (currentRole === 'Super Admin' || currentRole === 'Owner') && (
          <div className="absolute top-20 inset-x-4 z-40 bg-[#121622] border-2 border-cyan-400/60 rounded-3xl p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95">
            <div className="text-xs font-black text-cyan-400 uppercase tracking-wider border-b border-white/10 pb-1.5 flex items-center justify-between">
              <span>Switch App Access Persona</span>
              <span className="text-[10px] text-slate-400 font-normal">Tap role to view</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setCurrentRole(r);
                    setShowRoleDrawer(false);
                  }}
                  className={`p-2.5 rounded-xl text-left font-extrabold text-xs transition-all ${
                    currentRole === r
                      ? 'bg-gradient-to-r from-cyan-400 to-[#27D980] text-gym-dark font-black shadow-lg scale-105'
                      : 'bg-[#1A2030] text-white hover:bg-[#252E44] border border-white/10'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Alert Popup */}
        {showQuickModal && (
          <div className="absolute inset-x-4 top-24 z-50 p-4 rounded-2xl bg-[#161C2E] border-2 border-[#27D980] text-xs text-white shadow-2xl flex items-center justify-between animate-in fade-in zoom-in-95">
            <span className="font-semibold leading-relaxed">{showQuickModal}</span>
            <button onClick={() => setShowQuickModal(null)} className="px-3 py-1 bg-[#27D980] text-gym-dark font-black rounded-xl text-xs ml-2">OK</button>
          </div>
        )}

        {/* Main App Screen Scrollable Container */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20">
          
          {(currentRole === 'Super Admin' || currentRole === 'Owner' || currentRole === 'Branch Manager') ? (
            <AdminMobileConsole />
          ) : currentRole === 'Trainer' ? (
            <TrainerMobileView />
          ) : currentRole === 'Receptionist' ? (
            /* RECEPTIONIST ROLE MOBILE VIEW */
            <div className="space-y-4 animate-in fade-in duration-300 text-xs">
              <div className="p-4 rounded-3xl bg-amber-500/20 border-2 border-amber-400 text-amber-200 space-y-1">
                <h4 className="font-black text-white text-sm">Reception Mobile Desk</h4>
                <p className="text-xs text-amber-100 font-medium">{currentBranch.currentCheckIns} Members Currently Inside</p>
              </div>

              <button
                onClick={() => setPerspective('hardware')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-[#27D980] text-gym-dark font-black text-sm shadow-xl flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                <span>Open Door Scanner Terminal →</span>
              </button>
            </div>
          ) : (
            /* MEMBER USER ROLE VIEW WITH ULTRA HIGH VISIBILITY & CONTRAST */
            activeTab === 'home' ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* 1. Welcome Member Banner Card with High Contrast */}
                <div className="relative overflow-hidden rounded-[30px] p-5 bg-gradient-to-br from-[#162A42] via-[#101F33] to-[#0A1424] border-2 border-cyan-400/50 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5 tracking-wide uppercase">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        Member Portal
                      </span>
                      <h2 className="text-lg font-black mt-1 tracking-tight flex items-center gap-1.5">
                        <span className="animate-text-shimmer">Welcome, {activeMember.name}!</span>
                        <span className="animate-wave text-xl inline-block origin-[70%_70%]">🖐️</span>
                      </h2>
                    </div>

                    {/* Glowing Gold Rewards Balance Pill */}
                    <div className="px-3.5 py-2 rounded-2xl bg-[#26210F] border-2 border-amber-400 text-amber-300 font-black text-xs flex items-center gap-1.5 shadow-lg">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>{activeMember.rewardPoints} PTS</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 font-semibold bg-white/10 p-2 rounded-xl border border-white/10">
                    Plan: <strong className="text-white font-extrabold">{activeMember.planName}</strong>
                  </p>
                </div>

                {/* 2. Section Header with High Contrast Labels */}
                <div className="flex items-center justify-between text-xs px-1">
                  <h3 className="font-black text-white text-sm uppercase tracking-wide">Your Features</h3>
                  <span className="text-xs text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-400/30">Tap card to open</span>
                </div>

                {/* 3. 2-Column Bento Grid with High Visibility Text & Badges */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* CARD 1: Subscription & Expiry Pass (Amber Theme) */}
                  <div
                    onClick={() => setActiveTab('subscription')}
                    className="p-4 rounded-[26px] bg-gradient-to-br from-[#2E2412] via-[#1F180B] to-[#120D05] border-2 border-amber-400/60 hover:border-amber-300 transition-all cursor-pointer shadow-xl space-y-3 group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-[#3D3016] border-2 border-amber-400 text-amber-300 flex items-center justify-center shadow-lg">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:text-amber-300 group-hover:bg-white/20 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-white leading-tight group-hover:text-amber-200 transition-colors">
                        Subscription & Expiry Pass
                      </h4>
                      <span className="inline-block mt-1.5 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-gym-dark">
                        ● Start & End Date
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/15 text-[10px] text-amber-200 font-bold space-y-0.5">
                      <div>Start: <strong className="text-white">{activeMember.startDate || '2026-01-10'}</strong></div>
                      <div>End: <strong className="text-white">{activeMember.endDate || activeMember.expiryDate || '2027-01-09'}</strong></div>
                    </div>
                  </div>

                  {/* CARD 2: Dynamic Gate Pass (Teal Theme) */}
                  <div
                    onClick={() => setActiveTab('qr')}
                    className="p-4 rounded-[26px] bg-gradient-to-br from-[#0F3630] via-[#0A2420] to-[#051412] border-2 border-[#27D980]/60 hover:border-[#27D980] transition-all cursor-pointer shadow-xl space-y-3 group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-[#144A42] border-2 border-[#27D980] text-[#27D980] flex items-center justify-center shadow-lg">
                        <QrCode className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:text-[#27D980] group-hover:bg-white/20 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-white leading-tight group-hover:text-emerald-200 transition-colors">
                        Dynamic Gate Pass
                      </h4>
                      <span className="inline-block mt-1.5 text-[9px] font-black px-2 py-0.5 rounded-full bg-[#27D980] text-gym-dark">
                        30s Refresh
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-200 font-medium leading-tight">
                      30s TOTP QR security code for door access
                    </p>
                  </div>

                  {/* CARD 3: Daily & Weekly Workouts (Royal Blue Theme) */}
                  <div
                    onClick={() => setActiveTab('workout')}
                    className="p-4 rounded-[26px] bg-gradient-to-br from-[#12284D] via-[#0C1A36] to-[#060E21] border-2 border-blue-400/60 hover:border-blue-300 transition-all cursor-pointer shadow-xl space-y-3 group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-[#1A386D] border-2 border-blue-400 text-blue-300 flex items-center justify-center shadow-lg">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:text-blue-300 group-hover:bg-white/20 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-white leading-tight group-hover:text-blue-200 transition-colors">
                        Daily & Weekly Workouts
                      </h4>
                      <span className="inline-block mt-1.5 text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-400 text-gym-dark">
                        Week 1-4
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-200 font-medium leading-tight line-clamp-2">
                      {workout.weeklyPlans[0]?.weekTitle || 'Week 1: Hypertrophy Adaptation & Form • Sets & Rest Timer'}
                    </p>
                  </div>

                  {/* CARD 4: Monthly Nutrition & Diet (Cyan / Teal Theme) */}
                  <div
                    onClick={() => setActiveTab('diet')}
                    className="p-4 rounded-[26px] bg-gradient-to-br from-[#0F383E] via-[#0A262A] to-[#051517] border-2 border-cyan-400/60 hover:border-cyan-300 transition-all cursor-pointer shadow-xl space-y-3 group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-[#164D54] border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-lg">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:text-cyan-300 group-hover:bg-white/20 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-white leading-tight group-hover:text-cyan-200 transition-colors">
                        Monthly Nutrition & Diet
                      </h4>
                      <span className="inline-block mt-1.5 text-[9px] font-black px-2 py-0.5 rounded-full bg-cyan-400 text-gym-dark">
                        Month 1-3
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-200 font-medium leading-tight">
                      {diet.monthlyPlans[0]?.targetCalories || 2850} kcal Goal • {diet.waterCurrentLiters}L Water
                    </p>
                  </div>

                  {/* CARD 5: Body Progress Studio (Purple Theme) */}
                  <div
                    onClick={() => setActiveTab('progress')}
                    className="p-4 rounded-[26px] bg-gradient-to-br from-[#2B184F] via-[#1D1036] to-[#100821] border-2 border-purple-400/60 hover:border-purple-300 transition-all cursor-pointer shadow-xl space-y-3 group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-[#3E2370] border-2 border-purple-400 text-purple-300 flex items-center justify-center shadow-lg">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:text-purple-300 group-hover:bg-white/20 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-white leading-tight group-hover:text-purple-200 transition-colors">
                        Body Progress Studio
                      </h4>
                      <span className="inline-block mt-1.5 text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-400 text-gym-dark">
                        -4.7 kg
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-200 font-medium leading-tight">
                      Start: {activeMember.startWeightKg || 83.2}kg → Current: {activeMember.weightKg}kg (BMI {activeMember.bmi})
                    </p>
                  </div>

                  {/* CARD 6: AI Gym Assistant (Deep Blue Robot Theme) */}
                  <div
                    onClick={() => setActiveTab('ai')}
                    className="p-4 rounded-[26px] bg-gradient-to-br from-[#123152] via-[#0B2038] to-[#061221] border-2 border-cyan-400/60 hover:border-cyan-300 transition-all cursor-pointer shadow-xl space-y-3 group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-[#1B436F] border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-lg">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:text-cyan-300 group-hover:bg-white/20 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-white leading-tight group-hover:text-cyan-200 transition-colors">
                        AI Gym Assistant
                      </h4>
                      <span className="inline-block mt-1.5 text-[9px] font-black px-2 py-0.5 rounded-full bg-cyan-400 text-gym-dark">
                        24/7 AI
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-200 font-medium leading-tight">
                      24/7 AI coach for form tips, meals & fitness Q&A
                    </p>
                  </div>

                </div>

                {/* 4. Full Width Banner: Supplement POS Store (Magenta Theme) */}
                <div
                  onClick={() => setShowQuickModal('Supplement POS Store: Order Gold Standard Whey Isolate, Protein Bars & Pre-workouts at member rates!')}
                  className="p-4 rounded-[26px] bg-gradient-to-r from-[#381440] via-[#240B29] to-[#140517] border-2 border-fuchsia-400/60 hover:border-fuchsia-300 transition-all cursor-pointer shadow-xl flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#521C5C] border-2 border-fuchsia-400 text-fuchsia-300 flex items-center justify-center font-bold shadow-lg">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-white group-hover:text-fuchsia-200 transition-colors">
                          Supplement POS Store
                        </h4>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-fuchsia-400 text-gym-dark">
                          Store
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-200 font-medium">Premium supplements at member prices</p>
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:text-fuchsia-300 group-hover:bg-white/20 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

              </div>
            ) : activeTab === 'workout' ? (
              <WorkoutLogger />
            ) : activeTab === 'qr' ? (
              <DynamicQRCard />
            ) : activeTab === 'diet' ? (
              <DietTracker />
            ) : activeTab === 'progress' ? (
              <ProgressStudio />
            ) : activeTab === 'subscription' ? (
              <SubscriptionCard />
            ) : (
              <AIChatCoach />
            )
          )}

        </div>

        {/* High Definition Floating Dock Navigation Bar */}
        <div className="px-4 py-3 bg-[#121622] border-t border-white/20 flex items-center justify-around z-30 shadow-2xl">
          
          {isMemberRole ? (
            <>
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-cyan-300 scale-105' : 'text-slate-300 hover:text-white'}`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px] font-black">Home</span>
                {activeTab === 'home' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 -mt-0.5" />}
              </button>

              <button
                onClick={() => setActiveTab('workout')}
                className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'workout' ? 'text-cyan-300 scale-105' : 'text-slate-300 hover:text-white'}`}
              >
                <Dumbbell className="w-5 h-5" />
                <span className="text-[10px] font-black">Workouts</span>
                {activeTab === 'workout' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 -mt-0.5" />}
              </button>

              {/* Large Center Scan QR Button with Multi-Glow Ring */}
              <button
                onClick={() => setActiveTab('qr')}
                className="group relative -mt-7"
              >
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-[#27D980] to-fuchsia-500 blur-md opacity-90 group-hover:opacity-100 transition-opacity animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-[#121E30] border-2 border-cyan-400 text-cyan-300 flex flex-col items-center justify-center font-black shadow-2xl">
                  <ScanLine className="w-6 h-6 text-cyan-300" />
                  <span className="text-[9px] font-black text-cyan-200 leading-none mt-0.5">Scan QR</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('diet')}
                className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'diet' ? 'text-cyan-300 scale-105' : 'text-slate-300 hover:text-white'}`}
              >
                <Utensils className="w-5 h-5" />
                <span className="text-[10px] font-black">Nutrition</span>
                {activeTab === 'diet' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 -mt-0.5" />}
              </button>

              <button
                onClick={() => setActiveTab('progress')}
                className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'progress' ? 'text-cyan-300 scale-105' : 'text-slate-300 hover:text-white'}`}
              >
                <User className="w-5 h-5" />
                <span className="text-[10px] font-black">Profile</span>
                {activeTab === 'progress' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 -mt-0.5" />}
              </button>
            </>
          ) : (
            <>
              {/* ADMIN / STAFF MOBILE DOCK */}
              <button
                onClick={() => setCurrentRole('Super Admin')}
                className={`flex flex-col items-center gap-1 transition-all ${currentRole === 'Super Admin' ? 'text-purple-300 scale-105 font-black' : 'text-slate-300 hover:text-white'}`}
              >
                <Lock className="w-5 h-5 text-purple-400" />
                <span className="text-[10px] font-bold">Admin HQ</span>
                {currentRole === 'Super Admin' && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 -mt-0.5" />}
              </button>

              <button
                onClick={() => setCurrentRole('Trainer')}
                className={`flex flex-col items-center gap-1 transition-all ${currentRole === 'Trainer' ? 'text-cyan-300 scale-105 font-black' : 'text-slate-300 hover:text-white'}`}
              >
                <Dumbbell className="w-5 h-5 text-cyan-400" />
                <span className="text-[10px] font-bold">Trainer</span>
                {currentRole === 'Trainer' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 -mt-0.5" />}
              </button>

              {/* Large Center Gate Pass Scanner for Admin */}
              <button
                onClick={() => setPerspective('hardware')}
                className="group relative -mt-7"
                title="Open Smart Door Gate Scanner"
              >
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-purple-500 via-[#4F7CFF] to-[#27D980] blur-md opacity-90 group-hover:opacity-100 transition-opacity animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-[#1A1230] border-2 border-purple-400 text-purple-300 flex flex-col items-center justify-center font-black shadow-2xl">
                  <ScanLine className="w-6 h-6 text-[#27D980]" />
                  <span className="text-[9px] font-black text-slate-100 leading-none mt-0.5">Gate Pass</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentRole('Member')}
                className="flex flex-col items-center gap-1 transition-all text-slate-300 hover:text-[#27D980]"
                title="Preview Member App"
              >
                <Users className="w-5 h-5 text-[#27D980]" />
                <span className="text-[10px] font-bold">Member UI</span>
              </button>

              <button
                onClick={() => setPerspective('erp')}
                className="flex flex-col items-center gap-1 transition-all text-slate-300 hover:text-[#4F7CFF]"
                title="Switch to Web ERP"
              >
                <Layers className="w-5 h-5 text-[#4F7CFF]" />
                <span className="text-[10px] font-bold">Web ERP</span>
              </button>
            </>
          )}

        </div>

      </div>

    </div>
  );
};
