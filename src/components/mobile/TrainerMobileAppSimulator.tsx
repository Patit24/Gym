import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Member, GoalType, Employee } from '../../types/gym';

type Gender = 'Male' | 'Female' | 'Other';
import { PrivilegePassCard } from '../shared/PrivilegePassCard';
import { QuickDailyPlanner } from '../planner/QuickDailyPlanner';
import {
  Home,
  Users,
  Dumbbell,
  Utensils,
  Calendar,
  Zap,
  Plus,
  UserPlus,
  Wifi,
  Battery,
  ChevronRight,
  ArrowLeft,
  Search,
  CheckCircle2,
  Phone,
  Mail,
  Scale,
  Award,
  Send,
  Sparkles,
  Flame,
  Check
} from 'lucide-react';

type TrainerScreen = 'home' | 'members' | 'quick-plan' | 'attendance' | 'notifications' | 'add-client' | 'client-profile';

export const TrainerMobileAppSimulator: React.FC = () => {
  const {
    members,
    employees,
    plans,
    selectedBranchId,
    appUserAccount,
    attendance,
    addMember,
    sendBulkNotification,
    setActiveMemberId
  } = useGym();

  const currentTrainer: Employee = employees.find(
    (e) =>
      e.id === appUserAccount?.id ||
      e.id === appUserAccount?.linkedId ||
      (e.email && e.email.toLowerCase() === (appUserAccount?.email || '').toLowerCase()) ||
      ((e as any).username && (e as any).username.toLowerCase() === (appUserAccount?.username || '').toLowerCase())
  ) || (appUserAccount?.role === 'Trainer' || appUserAccount?.role === 'Dietitian' ? {
    id: appUserAccount.linkedId || appUserAccount.id,
    name: appUserAccount.linkedName || appUserAccount.username,
    role: appUserAccount.role,
    email: appUserAccount.email || `${appUserAccount.username.toLowerCase()}@smartgym.com`,
    phone: '+91 98765 00000',
    branchId: appUserAccount.branchId || 'branch-1',
  } as Employee : employees.find(e => e.role === 'Trainer') || employees[0]);

  const assignedMembers = members.filter(m => m.assignedTrainerId === currentTrainer?.id || m.branchId === currentTrainer?.branchId);

  // Screen navigation state (ALL IN-APP, ZERO POPUPS)
  const [currentScreen, setCurrentScreen] = useState<TrainerScreen>('home');
  const [previousScreen, setPreviousScreen] = useState<TrainerScreen>('home');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchMember, setSearchMember] = useState('');

  // Add Client form state
  const [clientName, setClientName] = useState('');
  const [clientMobile, setClientMobile] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientGender, setClientGender] = useState<Gender>('Male');
  const [clientGoal, setClientGoal] = useState<GoalType>('Muscle Building');
  const [clientPlanId, setClientPlanId] = useState(plans[0]?.id || 'plan-annual-vip');
  const [clientWeight, setClientWeight] = useState(75);
  const [clientHeight, setClientHeight] = useState(175);
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);

  // Broadcast state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSuccess, setNotifSuccess] = useState('');
  const [isSending, setIsSending] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayStr);

  const filteredMembers = assignedMembers.filter(m =>
    m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.membershipNo.toLowerCase().includes(searchMember.toLowerCase())
  );

  const navigateTo = (screen: TrainerScreen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (['add-client', 'client-profile'].includes(currentScreen)) {
      setCurrentScreen('members');
    } else {
      setCurrentScreen(previousScreen || 'home');
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientMobile.trim()) return;
    setIsSubmittingClient(true);

    const plan = plans.find(p => p.id === clientPlanId) || plans[0];
    const startDate = new Date().toISOString().split('T')[0];
    const endDateObj = new Date();
    endDateObj.setMonth(endDateObj.getMonth() + (plan?.durationMonths || 12));
    const endDate = endDateObj.toISOString().split('T')[0];
    const bmi = parseFloat((clientWeight / ((clientHeight / 100) ** 2)).toFixed(1));

    try {
      const created = await addMember({
        name: clientName.trim(),
        mobile: clientMobile.trim(),
        email: clientEmail.trim() || `${clientName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        dob: '1998-05-15',
        gender: clientGender,
        heightCm: clientHeight,
        weightKg: clientWeight,
        startWeightKg: clientWeight,
        bmi,
        chestCm: 100,
        waistCm: 84,
        armsCm: 37,
        thighsCm: 56,
        bloodGroup: 'O+',
        emergencyContactName: 'Family',
        emergencyMobile: clientMobile,
        address: 'City Center',
        medicalHistory: 'None',
        goal: clientGoal,
        referralSource: `Trainer ${currentTrainer.name}`,
        branchId: selectedBranchId,
        planId: plan.id,
        planName: plan.name,
        startDate,
        endDate,
        expiryDate: endDate,
        faceEnrolled: false,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(clientName)}`,
        pendingDues: 0,
        assignedTrainerId: currentTrainer.id,
      });

      setSelectedMember(created);
      setClientName('');
      setClientMobile('');
      setClientEmail('');
      setCurrentScreen('client-profile');
    } finally {
      setIsSubmittingClient(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    setIsSending(true);
    try {
      await sendBulkNotification('all', `[Coach ${currentTrainer.name}]: ${notifTitle}`, notifMessage);
      setNotifSuccess('Message sent to all your clients!');
      setNotifTitle('');
      setNotifMessage('');
      setTimeout(() => {
        setNotifSuccess('');
        setCurrentScreen('home');
      }, 2000);
    } finally {
      setIsSending(false);
    }
  };

  const isSubPage = ['add-client', 'client-profile'].includes(currentScreen);

  return (
    <div className="w-full flex items-center justify-center p-0 md:py-2 animate-in fade-in duration-300">
      
      {/* ── TRAINER MOBILE APP FRAME (Full Screen on Mobile / App, Phone Bezel on Desktop) ── */}
      <div className="relative w-full min-h-screen md:min-h-0 md:w-[410px] md:h-[840px] bg-[#0A0D14] md:border-[10px] md:border-[#1E2330] md:rounded-[56px] md:shadow-[0_0_60px_rgba(0,0,0,0.85)] md:ring-2 md:ring-white/20 flex flex-col justify-between overflow-hidden">
        
        {/* 1. Status Bar & Dynamic Island (Desktop Simulator Only) */}
        <div className="hidden md:flex relative z-30 pt-3 px-7 pb-2 items-center justify-between text-xs text-white bg-[#0A0D14] border-b border-white/10 shrink-0">
          <span className="font-extrabold text-xs tracking-tight text-white">9:41</span>
          
          <div className="w-32 h-6 bg-black rounded-full flex items-center justify-between px-3 text-[10px] text-[#4F7CFF] font-mono border border-white/20 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#4F7CFF] animate-ping" />
            <span className="font-black tracking-wider text-white">TRAINER OS</span>
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
                {currentScreen === 'add-client' && 'Enroll Client'}
                {currentScreen === 'client-profile' && 'Client Details'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <img
                src={currentTrainer?.photoUrl}
                alt={currentTrainer?.name}
                className="w-8 h-8 rounded-xl object-cover border border-[#4F7CFF]"
              />
              <div>
                <h3 className="text-xs font-black text-white leading-none">Coach {currentTrainer?.name}</h3>
                <span className="text-[9px] font-bold text-[#4F7CFF] block mt-0.5">
                  {currentTrainer?.specialization || 'Master Strength Coach'}
                </span>
              </div>
            </div>
          )}

          {!isSubPage && (
            <button
              onClick={() => navigateTo('add-client')}
              className="p-1.5 rounded-xl bg-[#4F7CFF] hover:bg-[#3D69EB] text-white text-xs font-bold flex items-center gap-1 shadow-md"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="text-[10px]">+ Client</span>
            </button>
          )}
        </div>

        {/* 3. Main Screen Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 scrollbar-none text-xs">
          
          {/* ════════ PAGE 1: HOME OVERVIEW ════════ */}
          {currentScreen === 'home' && (
            <div className="space-y-3.5 animate-in fade-in">
              
              {/* Quick 1-Click Planner Button */}
              <button
                onClick={() => navigateTo('quick-plan')}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#4F7CFF] via-[#27D980] to-emerald-400 text-black font-black text-xs shadow-lg shadow-[#27D980]/20 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
              >
                <Zap className="w-4 h-4 text-black" />
                <span>⚡ 1-Click Assign Workout & Diet Plan</span>
              </button>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div 
                  onClick={() => navigateTo('members')}
                  className="p-3 rounded-2xl bg-[#121622] border border-white/10 text-center space-y-0.5 cursor-pointer hover:border-[#4F7CFF]/50 transition-all"
                >
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">My Clients</span>
                  <span className="text-base font-black text-white">{assignedMembers.length}</span>
                  <span className="text-[8px] text-[#4F7CFF] block">Enrolled →</span>
                </div>
                <div 
                  onClick={() => navigateTo('attendance')}
                  className="p-3 rounded-2xl bg-[#121622] border border-white/10 text-center space-y-0.5 cursor-pointer hover:border-emerald-500/50 transition-all"
                >
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Today In Gym</span>
                  <span className="text-base font-black text-emerald-400">{todayAttendance.length}</span>
                  <span className="text-[8px] text-slate-500 block">Check-ins →</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 text-center space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Sessions</span>
                  <span className="text-base font-black text-purple-400">{currentTrainer?.ptSessionsCompleted || 148}</span>
                  <span className="text-[8px] text-slate-500 block">Completed</span>
                </div>
              </div>

              {/* Client Roster Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Assigned Clients</span>
                  <button onClick={() => navigateTo('members')} className="text-[10px] text-[#4F7CFF] font-bold">
                    View All ({assignedMembers.length}) →
                  </button>
                </div>

                <div className="space-y-1.5">
                  {assignedMembers.slice(0, 4).map((mem) => (
                    <div
                      key={mem.id}
                      onClick={() => {
                        setSelectedMember(mem);
                        setActiveMemberId(mem.id);
                        navigateTo('client-profile');
                      }}
                      className="p-2.5 rounded-2xl bg-[#121622] border border-white/10 hover:border-[#4F7CFF]/50 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={mem.photoUrl} alt={mem.name} className="w-8 h-8 rounded-xl object-cover border border-[#4F7CFF]" />
                        <div>
                          <div className="font-bold text-white text-xs leading-tight">{mem.name}</div>
                          <div className="text-[9px] text-[#27D980] font-semibold">{mem.goal} • {mem.weightKg}kg</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ════════ PAGE 2: CLIENTS DIRECTORY ════════ */}
          {currentScreen === 'members' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-white text-sm">Client Directory ({assignedMembers.length})</h4>
                <button
                  onClick={() => navigateTo('add-client')}
                  className="px-2.5 py-1 rounded-xl bg-[#4F7CFF] text-white text-[10px] font-black flex items-center gap-1 shadow-md"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Client</span>
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search client by name..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full bg-[#121622] border border-white/10 rounded-2xl pl-8 pr-3 py-1.5 text-white text-xs outline-none focus:border-[#4F7CFF]"
                />
              </div>

              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {filteredMembers.map((mem) => (
                  <div
                    key={mem.id}
                    onClick={() => {
                      setSelectedMember(mem);
                      setActiveMemberId(mem.id);
                      navigateTo('client-profile');
                    }}
                    className="p-3 rounded-2xl bg-[#121622] border border-white/10 hover:border-[#4F7CFF]/50 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={mem.photoUrl} alt={mem.name} className="w-9 h-9 rounded-xl object-cover border border-[#4F7CFF]" />
                        <div>
                          <h5 className="font-black text-white text-xs">{mem.name}</h5>
                          <span className="text-[10px] text-emerald-400 font-semibold">{mem.goal}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-[#4F7CFF] bg-[#4F7CFF]/15 px-2 py-0.5 rounded-full">
                        {mem.weightKg} kg
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-white/5">
                      <span>Plan: <strong className="text-slate-200">{mem.planName}</strong></span>
                      <span className="text-[#4F7CFF] font-bold">Open Profile →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ PAGE 3: ADD PT CLIENT (IN-APP NATIVE PAGE) ════════ */}
          {currentScreen === 'add-client' && (
            <form onSubmit={handleCreateClient} className="space-y-3 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
                <div className="text-[10px] font-black text-[#4F7CFF] uppercase tracking-wide flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Client Onboarding</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-300">Client Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Patel"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#4F7CFF]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-300">Mobile Number *</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 00000"
                      value={clientMobile}
                      onChange={(e) => setClientMobile(e.target.value)}
                      className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-300">Gender</label>
                    <select
                      value={clientGender}
                      onChange={(e) => setClientGender(e.target.value as Gender)}
                      className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-2 py-2 text-white text-xs outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-300">Weight (kg)</label>
                    <input
                      type="number"
                      value={clientWeight}
                      onChange={(e) => setClientWeight(parseFloat(e.target.value) || 70)}
                      className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-300">Height (cm)</label>
                    <input
                      type="number"
                      value={clientHeight}
                      onChange={(e) => setClientHeight(parseInt(e.target.value) || 170)}
                      className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-300">Goal</label>
                  <select
                    value={clientGoal}
                    onChange={(e) => setClientGoal(e.target.value as GoalType)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-2 py-2 text-white text-xs outline-none"
                  >
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Body Recomposition">Body Recomposition</option>
                    <option value="Endurance & Cardio">Endurance & Cardio</option>
                    <option value="Rehab & Mobility">Rehab & Mobility</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingClient}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-[#27D980] text-black font-black text-xs shadow-lg transition-all"
                >
                  {isSubmittingClient ? 'Enrolling...' : 'Enroll Client & Bind to Coach 🚀'}
                </button>
              </div>
            </form>
          )}

          {/* ════════ PAGE 4: CLIENT PROFILE (IN-APP NATIVE PAGE) ════════ */}
          {currentScreen === 'client-profile' && selectedMember && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-center scale-95 -my-2">
                <PrivilegePassCard member={selectedMember} priorityText="PT CLIENT" showFlipButton={false} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Goal & Weight</span>
                  <strong className="text-white text-xs">{selectedMember.goal} ({selectedMember.weightKg} kg)</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">BMI & Height</span>
                  <strong className="text-[#27D980] text-xs">{selectedMember.bmi} BMI ({selectedMember.heightCm} cm)</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Plan</span>
                  <strong className="text-cyan-400 text-xs">{selectedMember.planName}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-[#121622] border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">Expiry</span>
                  <strong className="text-purple-400 text-xs">{selectedMember.expiryDate || selectedMember.endDate}</strong>
                </div>
              </div>

              <button
                onClick={() => navigateTo('quick-plan')}
                className="w-full py-2.5 rounded-xl bg-[#4F7CFF] text-white font-bold text-xs shadow-md"
              >
                Assign Workout & Diet Plan →
              </button>
            </div>
          )}

          {/* ════════ PAGE 5: QUICK PLANNER (IN-APP NATIVE PAGE) ════════ */}
          {currentScreen === 'quick-plan' && (
            <div className="space-y-3 animate-in fade-in">
              <h4 className="font-black text-white text-sm">Quick Workout & Diet Studio</h4>
              <QuickDailyPlanner />
            </div>
          )}

          {/* ════════ PAGE 6: CLIENT ATTENDANCE ════════ */}
          {currentScreen === 'attendance' && (
            <div className="space-y-3 animate-in fade-in">
              <h4 className="font-black text-white text-sm">Client Check-Ins ({todayAttendance.length} Today)</h4>
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {attendance.slice(0, 10).map((att) => (
                  <div
                    key={att.id}
                    className="p-2.5 rounded-2xl bg-[#121622] border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={att.memberPhoto} alt={att.memberName} className="w-8 h-8 rounded-xl object-cover border border-[#4F7CFF]" />
                      <div>
                        <div className="font-bold text-white text-xs">{att.memberName}</div>
                        <div className="text-[9px] text-slate-400">{att.date} at {att.entryTime}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                      {att.verificationMethod}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ PAGE 7: CLIENT BROADCAST ════════ */}
          {currentScreen === 'notifications' && (
            <form onSubmit={handleSendBroadcast} className="space-y-3 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
                <div className="text-[10px] font-black text-[#4F7CFF] uppercase tracking-wide flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Message All Assigned Clients</span>
                </div>
                
                {notifSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                    {notifSuccess}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-300">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Leg Day + Hydration Reminder!"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#4F7CFF]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-300">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Write coaching workout tip or macro target..."
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none resize-none focus:border-[#4F7CFF]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3 rounded-xl bg-[#4F7CFF] hover:bg-[#3D69EB] text-white font-black text-xs shadow-lg transition-all"
                >
                  {isSending ? 'Broadcasting...' : 'Send Message to All Clients 🚀'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* 4. Bottom Navigation Bar */}
        <div className="px-3 py-2 bg-[#101422] border-t border-white/10 flex items-center justify-around z-20 shrink-0">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'members', label: 'Clients', icon: Users },
            { id: 'quick-plan', label: 'Planner', icon: Zap },
            { id: 'attendance', label: 'Check-ins', icon: Calendar },
            { id: 'notifications', label: 'Alerts', icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentScreen === tab.id || (
              ['add-client', 'client-profile'].includes(currentScreen) && tab.id === 'members'
            );

            return (
              <button
                key={tab.id}
                onClick={() => setCurrentScreen(tab.id as TrainerScreen)}
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
