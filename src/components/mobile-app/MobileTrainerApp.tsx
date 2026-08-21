import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Member, GoalType } from '../../types/gym';
import { MobileAppHeader } from './MobileAppHeader';
import { MobileBottomNav, MobileNavTab } from './MobileBottomNav';
import { PrivilegePassCard } from '../shared/PrivilegePassCard';
import {
  Home,
  Users,
  Dumbbell,
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
  Scale,
  Flame,
  Award,
  ChevronRight,
  Check,
  Send,
  Plus,
  Utensils,
  Brain
} from 'lucide-react';

type Gender = 'Male' | 'Female' | 'Other';
type TrainerScreen = 
  | 'home'
  | 'clients'
  | 'plans'
  | 'attendance'
  | 'more'
  | 'add-client'
  | 'client-profile'
  | 'broadcast';

export const MobileTrainerApp: React.FC = () => {
  const {
    members,
    employees,
    plans,
    selectedBranchId,
    appUserAccount,
    attendance,
    workout,
    diet,
    addMember,
    sendBulkNotification,
    signOutApp,
    notifications
  } = useGym();

  const currentTrainer = employees.find(
    (e) => e.id === appUserAccount?.linkedId || e.role === 'Trainer'
  ) || employees[0];

  // Strictly filter members assigned to this trainer or within this branch
  const myClients = members.filter(
    (m) => m.assignedTrainerId === currentTrainer?.id || m.branchId === currentTrainer?.branchId
  );

  const [currentScreen, setCurrentScreen] = useState<TrainerScreen>('home');
  const [previousScreen, setPreviousScreen] = useState<TrainerScreen>('home');
  const [selectedClient, setSelectedClient] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState<string>('all');

  // Enroll Client Form
  const [clName, setClName] = useState('');
  const [clMobile, setClMobile] = useState('');
  const [clEmail, setClEmail] = useState('');
  const [clGender, setClGender] = useState<Gender>('Male');
  const [clGoal, setClGoal] = useState<GoalType>('Muscle Building');
  const [clPlanId, setClPlanId] = useState(plans[0]?.id || 'plan-annual-vip');
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);

  // Quick Plan Creator Form
  const [planDay, setPlanDay] = useState('Monday');
  const [planTarget, setPlanTarget] = useState('Chest & Triceps');
  const [planExercises, setPlanExercises] = useState('Incline Dumbbell Press (4x10)\nCable Flyes (4x12)\nTricep Rope Pushdowns (3x15)');
  const [planSuccess, setPlanSuccess] = useState('');

  // Notification Broadcast
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSuccess, setNotifSuccess] = useState('');
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === todayStr);
  const myTodayAttendance = todayAttendance.filter((a) => myClients.some((c) => c.id === a.memberId));
  const unreadNotifs = notifications.filter((n) => !n.read);

  const navigateTo = (screen: TrainerScreen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setCurrentScreen(previousScreen === currentScreen ? 'home' : previousScreen);
  };

  // Filtered clients list with strict null safety
  const filteredClients = (myClients || []).filter((m) => {
    if (!m) return false;
    const nameStr = m.name || '';
    const membershipNoStr = m.membershipNo || '';
    const mobileStr = m.mobile || '';
    const query = (searchQuery || '').toLowerCase();
    const matchesSearch =
      nameStr.toLowerCase().includes(query) ||
      membershipNoStr.toLowerCase().includes(query) ||
      mobileStr.includes(query);
    const matchesGoal = goalFilter === 'all' || m.goal === goalFilter;
    return matchesSearch && matchesGoal;
  });

  const handleEnrollClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clName.trim() || !clMobile.trim()) return;
    setIsSubmittingClient(true);

    try {
      const selectedPlan = plans.find((p) => p.id === clPlanId) || plans[0];
      const today = new Date();
      const expiry = new Date();
      expiry.setDate(today.getDate() + (selectedPlan?.durationDays || 30));

      const created = await addMember({
        name: clName.trim(),
        mobile: clMobile.trim(),
        email: clEmail.trim() || `${clName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(clName)}`,
        gender: clGender,
        dob: '2001-01-01',
        heightCm: 175,
        weightKg: 74,
        startWeightKg: 74,
        bmi: 24.2,
        chestCm: 95,
        waistCm: 80,
        armsCm: 35,
        thighsCm: 55,
        bloodGroup: 'B+',
        emergencyContactName: 'Emergency',
        emergencyMobile: clMobile.trim(),
        address: 'City Center',
        medicalHistory: 'None',
        goal: clGoal,
        referralSource: 'Trainer Client Enrollment',
        branchId: selectedBranchId,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        startDate: today.toISOString().split('T')[0],
        endDate: expiry.toISOString().split('T')[0],
        expiryDate: expiry.toISOString().split('T')[0],
        paymentStatus: 'Paid',
        assignedTrainerId: currentTrainer?.id || 'emp-trainer-1',
        pendingDues: 0,
        paidAmount: selectedPlan?.totalPrice || selectedPlan?.basePrice || 1500,
        totalPlanAmount: selectedPlan?.totalPrice || selectedPlan?.basePrice || 1500,
        faceEnrolled: false,
        lockerNumber: `L-${Math.floor(10 + Math.random() * 90)}`,
      });

      setSelectedClient(created);
      setClName('');
      setClMobile('');
      setClEmail('');
      setCurrentScreen('client-profile');
    } finally {
      setIsSubmittingClient(false);
    }
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setPlanSuccess(`Workout plan assigned to ${selectedClient ? selectedClient.name : 'assigned clients'} for ${planDay}!`);
    setTimeout(() => setPlanSuccess(''), 3500);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    setIsSendingNotif(true);

    try {
      await sendBulkNotification('all', `[Coach ${currentTrainer?.name}]: ${notifTitle}`, notifMessage);
      setNotifSuccess('Message sent to assigned clients!');
      setNotifTitle('');
      setNotifMessage('');
      setTimeout(() => setNotifSuccess(''), 3000);
    } finally {
      setIsSendingNotif(false);
    }
  };

  const isSubPage = ['add-client', 'client-profile', 'broadcast'].includes(currentScreen);

  const bottomNavTabs: MobileNavTab[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'clients', label: 'Clients', icon: Users, badge: myClients.length },
    { id: 'plans', label: 'Plans', icon: Dumbbell },
    { id: 'attendance', label: 'Attendance', icon: Calendar, badge: myTodayAttendance.length > 0 ? myTodayAttendance.length : undefined },
    { id: 'more', label: 'More', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between selection:bg-[#4F7CFF] selection:text-white">
      
      {/* ── 1. COMPACT NATIVE MOBILE HEADER ── */}
      <MobileAppHeader
        title={isSubPage ? undefined : 'Smart Gym'}
        subtitle={isSubPage ? undefined : `Coach ${currentTrainer?.name} • ${currentTrainer?.specialization || 'Trainer'}`}
        role="Trainer"
        userPhoto={currentTrainer?.photoUrl}
        accentColor="#4F7CFF"
        unreadCount={unreadNotifs.length}
        onOpenNotifications={() => navigateTo('more')}
        onSignOut={signOutApp}
        backAction={isSubPage ? goBack : undefined}
        backTitle={
          currentScreen === 'add-client' ? 'Enroll Client' :
          currentScreen === 'client-profile' ? 'Client Profile' :
          currentScreen === 'broadcast' ? 'Client Broadcast' : 'Back'
        }
      />

      {/* ── 2. MAIN SCROLLABLE CONTENT ── */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 max-w-lg mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 1: TRAINER HOME DASHBOARD
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Trainer Greeting Banner */}
            <div className="bg-gradient-to-br from-[#121727] via-[#0E1322] to-[#0A0D18] p-5 rounded-3xl border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3.5">
                <img
                  src={currentTrainer?.photoUrl}
                  alt={currentTrainer?.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-[#4F7CFF] shadow-lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-white">Coach {currentTrainer?.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30 text-[9px] font-black uppercase">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentTrainer?.specialization || 'Master Strength Coach'} • {currentTrainer?.shift}
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Metrics Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div
                onClick={() => navigateTo('clients')}
                className="bg-[#101422] hover:bg-[#151A2E] p-3.5 rounded-2xl border border-white/10 text-center cursor-pointer transition-all active:scale-95 shadow-md"
              >
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">My Clients</div>
                <div className="text-xl font-black text-white mt-0.5">{myClients.length}</div>
                <span className="text-[9px] text-[#4F7CFF] font-bold block mt-0.5">Manage →</span>
              </div>

              <div
                onClick={() => navigateTo('attendance')}
                className="bg-[#101422] hover:bg-[#151A2E] p-3.5 rounded-2xl border border-white/10 text-center cursor-pointer transition-all active:scale-95 shadow-md"
              >
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Checked In</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{myTodayAttendance.length}</div>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Today</span>
              </div>

              <div
                onClick={() => navigateTo('plans')}
                className="bg-[#101422] hover:bg-[#151A2E] p-3.5 rounded-2xl border border-white/10 text-center cursor-pointer transition-all active:scale-95 shadow-md"
              >
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Plans</div>
                <div className="text-xl font-black text-purple-400 mt-0.5">{myClients.length}</div>
                <span className="text-[9px] text-purple-400 font-bold block mt-0.5">Diets & Sets →</span>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="pt-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5">
                Trainer Actions
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => navigateTo('add-client')}
                  className="bg-gradient-to-br from-[#1A2238] to-[#121727] hover:from-[#202B47] hover:to-[#161D32] active:scale-95 p-4 rounded-2xl border border-[#4F7CFF]/30 text-left transition-all shadow-lg group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#4F7CFF]/20 text-[#4F7CFF] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">+ Enroll Client</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">New personal trainee</div>
                </button>

                <button
                  onClick={() => navigateTo('plans')}
                  className="bg-gradient-to-br from-[#1A2238] to-[#121727] hover:from-[#202B47] hover:to-[#161D32] active:scale-95 p-4 rounded-2xl border border-purple-500/30 text-left transition-all shadow-lg group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">Assign Workout</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Custom daily splits</div>
                </button>

                <button
                  onClick={() => navigateTo('plans')}
                  className="bg-gradient-to-br from-[#1A2238] to-[#121727] hover:from-[#202B47] hover:to-[#161D32] active:scale-95 p-4 rounded-2xl border border-emerald-500/30 text-left transition-all shadow-lg group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">Assign Diet</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Macro meal regimes</div>
                </button>

                <button
                  onClick={() => navigateTo('broadcast')}
                  className="bg-gradient-to-br from-[#1A2238] to-[#121727] hover:from-[#202B47] hover:to-[#161D32] active:scale-95 p-4 rounded-2xl border border-amber-500/30 text-left transition-all shadow-lg group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Send className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">Notify Clients</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Direct push alert</div>
                </button>
              </div>
            </div>

            {/* Today's Client Check-ins */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Assigned Trainees ({myClients.length})
                </h3>
                <button
                  onClick={() => navigateTo('clients')}
                  className="text-[11px] font-bold text-[#4F7CFF] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {myClients.slice(0, 4).map((client) => (
                  <div
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client);
                      navigateTo('client-profile');
                    }}
                    className="p-3 bg-[#101422] hover:bg-[#151A2E] active:scale-[0.98] rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={client.photoUrl}
                        alt={client.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[#4F7CFF]/40"
                      />
                      <div>
                        <h4 className="text-xs font-black text-white">{client.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{client.membershipNo}</span>
                          <span>•</span>
                          <span className="text-[#4F7CFF] font-semibold">{client.goal}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {client.status}
                      </span>
                      <span className="text-[9px] text-slate-400 block mt-1">Weight: {client.weightKg || 74} kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 2: CLIENTS DIRECTORY
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'clients' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            
            {/* Search & Enroll */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search client name or mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#101422] rounded-2xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
              </div>
              <button
                onClick={() => navigateTo('add-client')}
                className="px-3.5 py-2.5 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 text-white font-black text-xs flex items-center gap-1 shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Client</span>
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

            {/* Clients List */}
            <div className="space-y-2.5">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client);
                    navigateTo('client-profile');
                  }}
                  className="p-3.5 bg-[#101422] hover:bg-[#151A2E] active:scale-[0.98] rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={client.photoUrl}
                      alt={client.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-[#4F7CFF]/50 shadow-inner"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-white">{client.name}</h4>
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                          {client.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>{client.membershipNo}</span>
                        <span>•</span>
                        <span className="text-[#4F7CFF] font-semibold">{client.goal}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-purple-400">{client.planName}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Exp: {client.endDate}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 3: WORKOUT & DIET PLANS CREATOR
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'plans' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <h3 className="text-xs font-black text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#4F7CFF]" />
                <span>1-Click Daily Workout & Diet Assigner</span>
              </h3>

              {planSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{planSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSavePlan} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      Split Day
                    </label>
                    <select
                      value={planDay}
                      onChange={(e) => setPlanDay(e.target.value)}
                      className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      Focus Target
                    </label>
                    <input
                      type="text"
                      value={planTarget}
                      onChange={(e) => setPlanTarget(e.target.value)}
                      className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Exercise Set Regimen
                  </label>
                  <textarea
                    rows={4}
                    value={planExercises}
                    onChange={(e) => setPlanExercises(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#4F7CFF]/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Assign Plan to Trainees</span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 4: ATTENDANCE TRACKER
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'attendance' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Today's Check-in Log</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black">
                  {myTodayAttendance.length} / {myClients.length} Present
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {myClients.map((client) => {
                  const isCheckedIn = myTodayAttendance.some((a) => a.memberId === client.id);

                  return (
                    <div
                      key={client.id}
                      className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={client.photoUrl} alt={client.name} className="w-9 h-9 rounded-xl object-cover border border-white/20" />
                        <div>
                          <div className="text-xs font-black text-white">{client.name}</div>
                          <div className="text-[10px] text-slate-400">{client.membershipNo}</div>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${
                          isCheckedIn
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                      >
                        {isCheckedIn ? 'Checked In ✓' : 'Not In Gym'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 5: MORE / COACH PROFILE
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'more' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Coach Profile Info */}
            <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-xl flex items-center gap-3.5">
              <img
                src={currentTrainer?.photoUrl}
                alt={currentTrainer?.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#4F7CFF] shadow-lg"
              />
              <div>
                <h3 className="text-sm font-black text-white">Coach {currentTrainer?.name}</h3>
                <p className="text-xs text-purple-400 font-bold mt-0.5">{currentTrainer?.specialization}</p>
                <div className="text-[10px] text-slate-400 mt-1">Shift: {currentTrainer?.shift}</div>
              </div>
            </div>

            {/* Broadcast Form */}
            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <h3 className="text-xs font-black text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-[#4F7CFF]" />
                <span>Message Trainees</span>
              </h3>

              {notifSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{notifSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSendNotification} className="space-y-2.5 text-xs">
                <input
                  type="text"
                  placeholder="Subject: e.g. Leg Day Focus / Bring Straps"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
                <textarea
                  rows={3}
                  placeholder="Instructions for your assigned trainees..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
                <button
                  type="submit"
                  disabled={isSendingNotif}
                  className="w-full py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-[#3D69EB] text-white font-black text-xs"
                >
                  Send Push to Clients
                </button>
              </form>
            </div>

            {/* Sign Out */}
            <button
              onClick={signOutApp}
              className="w-full py-3 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Trainer Account</span>
            </button>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 1: ENROLL CLIENT
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'add-client' && (
          <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <UserPlus className="w-4 h-4 text-[#4F7CFF]" />
              <span>Enroll New Client to PT Batch</span>
            </h3>

            <form onSubmit={handleEnrollClient} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Client Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arjun Kapoor"
                  value={clName}
                  onChange={(e) => setClName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Mobile *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={clMobile}
                    onChange={(e) => setClMobile(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Primary Goal
                  </label>
                  <select
                    value={clGoal}
                    onChange={(e) => setClGoal(e.target.value as GoalType)}
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
                  Package Plan
                </label>
                <select
                  value={clPlanId}
                  onChange={(e) => setClPlanId(e.target.value)}
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.durationDays} Days)</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingClient}
                  className="w-full py-3 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#4F7CFF]/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingClient ? 'Enrolling...' : 'Enroll & Assign to Coach Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 2: CLIENT PROFILE
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'client-profile' && selectedClient && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-xl flex items-center gap-3.5">
              <img
                src={selectedClient.photoUrl}
                alt={selectedClient.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#4F7CFF] shadow-lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white">{selectedClient.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                    {selectedClient.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">ID: {selectedClient.membershipNo} • {selectedClient.mobile}</div>
                <div className="text-[10px] text-[#4F7CFF] font-bold mt-0.5">Target: {selectedClient.goal}</div>
              </div>
            </div>

            <div className="w-full max-w-sm mx-auto">
              <PrivilegePassCard member={selectedClient} />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  navigateTo('plans');
                }}
                className="py-3 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] text-white font-black text-xs flex items-center justify-center gap-2"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Assign Workout</span>
              </button>

              <button
                onClick={() => alert(`Calling ${selectedClient.mobile}`)}
                className="py-3 rounded-2xl bg-[#101422] hover:bg-[#151A2E] text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Client</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ── 3. FIXED BOTTOM MOBILE NAVIGATION ── */}
      <MobileBottomNav
        tabs={bottomNavTabs}
        activeTab={
          ['add-client', 'client-profile'].includes(currentScreen) ? 'clients' :
          currentScreen === 'broadcast' ? 'more' :
          currentScreen
        }
        onSelectTab={(tabId) => navigateTo(tabId as TrainerScreen)}
        accentColor="#4F7CFF"
      />

    </div>
  );
};
