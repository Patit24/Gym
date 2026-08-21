import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Member } from '../../types/gym';
import { QuickDailyPlanner } from '../planner/QuickDailyPlanner';
import { AdvancedPlannerStudio } from '../planner/AdvancedPlannerStudio';
import { TrainerAddMemberModal } from './TrainerAddMemberModal';
import { PrivilegePassCard } from '../shared/PrivilegePassCard';
import { 
  Dumbbell, 
  Users, 
  Utensils, 
  Calendar, 
  Search, 
  Filter, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Zap, 
  ChevronRight, 
  X, 
  Send, 
  Sparkles,
  ShieldCheck,
  Smartphone,
  Phone,
  Mail,
  Flame,
  Activity,
  Layers,
  Award
} from 'lucide-react';

import { TrainerMobileAppSimulator } from '../mobile/TrainerMobileAppSimulator';

export const TrainerAppDashboard: React.FC = () => {
  const { 
    members, 
    employees, 
    appUserAccount, 
    attendance, 
    workout, 
    diet, 
    sendBulkNotification,
    setActiveMemberId,
    activeMember
  } = useGym();

  const currentTrainer = employees.find(e => e.id === appUserAccount?.linkedId || e.role === 'Trainer') || employees[0];
  
  // Strict Trainer filter: Only show members assigned to this trainer
  const myAssignedMembers = members.filter(m => m.assignedTrainerId === currentTrainer?.id || m.branchId === currentTrainer?.branchId);

  const [viewMode, setViewMode] = useState<'mobile' | 'web'>('mobile');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'workout' | 'diet' | 'attendance' | 'notifications' | 'profile'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showQuickPlannerModal, setShowQuickPlannerModal] = useState(false);

  // Notification sender state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSuccess, setNotifSuccess] = useState('');
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  // Filtered members
  const filteredMembers = myAssignedMembers.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.membershipNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.mobile.includes(searchQuery);
    const matchesGoal = goalFilter === 'all' || m.goal === goalFilter;
    return matchesSearch && matchesGoal;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayStr);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    setIsSendingNotif(true);
    try {
      await sendBulkNotification('all', `[Trainer ${currentTrainer.name}]: ${notifTitle}`, notifMessage);
      setNotifSuccess('Message sent to all assigned clients successfully!');
      setNotifTitle('');
      setNotifMessage('');
      setTimeout(() => setNotifSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingNotif(false);
    }
  };

  return (
    <div className="space-y-0 md:space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner: Trainer Welcome & Mode Switcher (Desktop Only) */}
      <div className="hidden md:flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#101524] p-5 rounded-3xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-3.5">
          <img
            src={currentTrainer?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentTrainer?.name || 'Trainer')}`}
            alt={currentTrainer?.name}
            className="w-12 h-12 rounded-2xl object-cover border border-[#4F7CFF]/50"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">Coach {currentTrainer?.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30 text-[10px] font-black uppercase">
                {currentTrainer?.specialization || 'Master Trainer'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              <strong className="text-white">{myAssignedMembers.length}</strong> Assigned PT Clients • <strong className="text-emerald-400">{todayAttendance.length}</strong> Checked In Today
            </p>
          </div>
        </div>

        {/* Mode Selector Toggle: Mobile Phone Frame vs Responsive Widescreen */}
        <div className="flex items-center bg-[#07090E] p-1 rounded-2xl border border-white/10 text-xs font-bold self-end sm:self-auto">
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'mobile'
                ? 'bg-[#4F7CFF] text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App UI</span>
          </button>
          <button
            onClick={() => setViewMode('web')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'web'
                ? 'bg-[#27D980] text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Widescreen Studio</span>
          </button>
        </div>
      </div>

      {/* ── 1. MOBILE PHONE APP SIMULATOR (DEFAULT) ── */}
      {viewMode === 'mobile' && (
        <div className="w-full flex justify-center p-0 md:py-2">
          <TrainerMobileAppSimulator />
        </div>
      )}

      {/* ── 2. WIDESCREEN STUDIO VIEW ── */}
      {viewMode === 'web' && (
        <div className="space-y-6">
          {/* Navigation Tabs for Trainer App */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none">
            {[
              { id: 'dashboard', label: 'Trainer Dashboard', icon: Layers },
              { id: 'members', label: `My Members (${myAssignedMembers.length})`, icon: Users },
              { id: 'workout', label: 'Workout Studio', icon: Dumbbell },
              { id: 'diet', label: 'Diet Studio', icon: Utensils },
              { id: 'attendance', label: 'Client Attendance', icon: Calendar },
              { id: 'notifications', label: 'Client Messages', icon: Send },
              { id: 'profile', label: 'Trainer Profile', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#4F7CFF] text-white shadow-lg shadow-[#4F7CFF]/20'
                      : 'bg-[#101524] text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

      {/* ── 1. TRAINER DASHBOARD OVERVIEW ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-3xl bg-[#101524] border border-white/10 space-y-1">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Total Assigned</div>
              <div className="text-2xl font-black text-white">{myAssignedMembers.length}</div>
              <div className="text-[10px] text-[#4F7CFF] font-semibold">Active PT Roster</div>
            </div>

            <div className="p-4 rounded-3xl bg-[#101524] border border-white/10 space-y-1">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Today's In-Gym</div>
              <div className="text-2xl font-black text-emerald-400">{todayAttendance.length}</div>
              <div className="text-[10px] text-emerald-300 font-semibold">Checked-in Members</div>
            </div>

            <div className="p-4 rounded-3xl bg-[#101524] border border-white/10 space-y-1">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Sessions Done</div>
              <div className="text-2xl font-black text-[#27D980]">{currentTrainer?.ptSessionsCompleted || 148}</div>
              <div className="text-[10px] text-slate-400 font-semibold">Logged PT Workouts</div>
            </div>

            <div className="p-4 rounded-3xl bg-[#101524] border border-white/10 space-y-1">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Pending Plans</div>
              <div className="text-2xl font-black text-amber-400">2</div>
              <div className="text-[10px] text-amber-300 font-semibold">Review Diet / Split</div>
            </div>
          </div>

          {/* Quick Roster List */}
          <div className="bg-[#101524] border border-white/10 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4F7CFF]" />
                <span>My Client Roster</span>
              </h3>
              <button
                onClick={() => setActiveTab('members')}
                className="text-xs text-[#4F7CFF] font-black hover:underline flex items-center gap-1"
              >
                <span>View Full List</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myAssignedMembers.slice(0, 6).map((mem) => (
                <div
                  key={mem.id}
                  onClick={() => { setSelectedMember(mem); setActiveMemberId(mem.id); }}
                  className="p-3.5 rounded-2xl bg-[#090C13] border border-white/10 hover:border-[#4F7CFF]/50 transition-all cursor-pointer space-y-2.5 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={mem.photoUrl}
                        alt={mem.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[#4F7CFF]/40"
                      />
                      <div>
                        <h4 className="font-bold text-white text-xs group-hover:text-[#4F7CFF] transition-colors">{mem.name}</h4>
                        <span className="text-[10px] text-emerald-400 font-semibold">{mem.goal}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg">
                      {mem.weightKg} kg
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/5">
                    <span>Plan: <strong className="text-slate-200">{mem.planName}</strong></span>
                    <span className="text-[#4F7CFF] font-bold">Open Profile →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── 2. MY MEMBERS SECTION ── */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          
          {/* Search & Goal Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#101524] p-4 rounded-3xl border border-white/10">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search member by name, ID or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#090C13] border border-white/10 focus:border-[#4F7CFF] rounded-2xl pl-10 pr-4 py-2 text-xs text-white outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={goalFilter}
                onChange={(e) => setGoalFilter(e.target.value)}
                className="bg-[#090C13] border border-white/10 rounded-2xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="all">All Fitness Goals</option>
                <option value="Muscle Building">Muscle Building</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Endurance">Endurance</option>
                <option value="General Fitness">General Fitness</option>
              </select>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-[#4F7CFF] text-white text-xs font-bold"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Client</span>
              </button>
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredMembers.map((mem) => (
              <div
                key={mem.id}
                onClick={() => { setSelectedMember(mem); setActiveMemberId(mem.id); }}
                className="p-4 rounded-3xl bg-[#101524] border border-white/10 hover:border-[#4F7CFF]/50 transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={mem.photoUrl}
                      alt={mem.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#4F7CFF]/50"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-[#4F7CFF] transition-colors">{mem.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{mem.membershipNo}</span>
                      <div className="text-[10px] text-emerald-400 font-bold mt-0.5">{mem.goal}</div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    mem.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}>
                    {mem.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 bg-[#090C13] p-2 rounded-2xl text-center text-[10px] border border-white/5">
                  <div>
                    <span className="text-slate-400 block">Weight</span>
                    <strong className="text-white">{mem.weightKg} kg</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Height</span>
                    <strong className="text-white">{mem.heightCm} cm</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">BMI</span>
                    <strong className="text-[#27D980]">{mem.bmi}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Medical: <strong className="text-slate-200">{mem.medicalHistory || 'None'}</strong></span>
                  <span className="text-[#4F7CFF] font-bold group-hover:underline">Open Profile →</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ── 3. WORKOUT STUDIO ── */}
      {activeTab === 'workout' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-[#101524] border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#4F7CFF]" />
                <span>Trainer Workout Studio</span>
              </h3>
              <p className="text-xs text-slate-400">
                Design custom daily/weekly exercise splits, sets, repetitions, weights, and rest timings.
              </p>
            </div>
            <button
              onClick={() => setShowQuickPlannerModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-[#27D980] text-black text-xs font-black shadow-md flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>1-Click Assign</span>
            </button>
          </div>

          <AdvancedPlannerStudio />
        </div>
      )}

      {/* ── 4. DIET STUDIO ── */}
      {activeTab === 'diet' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-[#101524] border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-400" />
                <span>Trainer Diet & Macro Studio</span>
              </h3>
              <p className="text-xs text-slate-400">
                Configure personalized calories, proteins, carbohydrates, fats, and meal schedule for clients.
              </p>
            </div>
            <button
              onClick={() => setShowQuickPlannerModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-emerald-400 text-black text-xs font-black shadow-md flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>1-Click Assign</span>
            </button>
          </div>

          <QuickDailyPlanner />
        </div>
      )}

      {/* ── 5. CLIENT ATTENDANCE ── */}
      {activeTab === 'attendance' && (
        <div className="bg-[#101524] border border-white/10 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#4F7CFF]" />
              <span>Assigned Clients Check-In History</span>
            </h3>
            <span className="text-xs text-emerald-400 font-bold">{todayAttendance.length} Checked-in Today</span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {attendance.slice(0, 15).map((att) => (
              <div
                key={att.id}
                className="p-3 rounded-2xl bg-[#090C13] border border-white/10 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <img src={att.memberPhoto} alt={att.memberName} className="w-8 h-8 rounded-xl object-cover border border-[#4F7CFF]/40" />
                  <div>
                    <div className="font-bold text-white">{att.memberName}</div>
                    <div className="text-[10px] text-slate-400">{att.date} at {att.entryTime}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold bg-[#27D980]/15 text-[#27D980] px-2 py-0.5 rounded-full border border-[#27D980]/30">
                    {att.verificationMethod}
                  </span>
                  <span className="block text-[9px] text-slate-500 mt-0.5">{att.deviceInfo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. NOTIFICATIONS & CLIENT MESSAGING ── */}
      {activeTab === 'notifications' && (
        <div className="max-w-2xl mx-auto bg-[#101524] border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-[#4F7CFF]" />
            <span>Broadcast Message to Assigned Clients</span>
          </h3>
          <p className="text-xs text-slate-400">
            Send motivation, diet reminders, workout routine updates, or schedule changes directly to your clients.
          </p>

          {notifSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notifSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSendNotification} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase">Message Title</label>
              <input
                type="text"
                placeholder="e.g. Leg Day Today + Hydration Reminder!"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="w-full bg-[#090C13] border border-white/10 focus:border-[#4F7CFF] rounded-2xl px-3.5 py-2.5 text-white outline-none font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase">Message Content</label>
              <textarea
                rows={4}
                placeholder="Write your workout tips, hydration reminder, or meal guidance..."
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                className="w-full bg-[#090C13] border border-white/10 focus:border-[#4F7CFF] rounded-2xl px-3.5 py-2.5 text-white outline-none font-medium resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSendingNotif}
              className="w-full py-3 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] text-white font-black text-xs shadow-lg shadow-[#4F7CFF]/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSendingNotif ? 'Sending Broadcast...' : 'Send to All My PT Clients'}</span>
            </button>
          </form>
        </div>
      )}

      {/* ── 7. TRAINER PROFILE ── */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto bg-[#101524] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={currentTrainer?.photoUrl}
              alt={currentTrainer?.name}
              className="w-16 h-16 rounded-3xl object-cover border-2 border-[#4F7CFF]"
            />
            <div>
              <h3 className="text-base font-black text-white">{currentTrainer?.name}</h3>
              <div className="text-xs text-[#4F7CFF] font-bold">{currentTrainer?.specialization}</div>
              <div className="text-[11px] text-slate-400">Employee ID: {currentTrainer?.id}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
            <div className="p-3 rounded-2xl bg-[#090C13] border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-400 block">Phone</span>
              <strong className="text-white">{currentTrainer?.phone}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-[#090C13] border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-400 block">Email</span>
              <strong className="text-white">{currentTrainer?.email}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Trainer Add Member */}
      {isAddModalOpen && (
        <TrainerAddMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Modal: Quick 1-Page Daily Plan Creator */}
      {showQuickPlannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#14171F] border border-white/10 rounded-3xl max-w-lg w-full p-4 shadow-2xl space-y-3 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 sticky top-0 bg-[#14171F] z-10">
              <h4 className="font-extrabold text-white text-xs flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#27D980]" />
                Easy Daily Plan Assign
              </h4>
              <button onClick={() => setShowQuickPlannerModal(false)} className="text-slate-400"><X className="w-4 h-4" /></button>
            </div>

            <QuickDailyPlanner />
          </div>
        </div>
      )}

      {/* Modal / Sheet: Selected Member Detail View */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#121724] border border-white/10 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3 sticky top-0 bg-[#121724] z-10">
              <div className="flex items-center gap-3">
                <img src={selectedMember.photoUrl} alt={selectedMember.name} className="w-10 h-10 rounded-2xl object-cover border border-[#4F7CFF]" />
                <div>
                  <h3 className="text-sm font-black text-white">{selectedMember.name}</h3>
                  <p className="text-[10px] text-slate-400">{selectedMember.membershipNo} • {selectedMember.goal}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Obsidian Gold Luxury Pass Preview */}
            <div className="flex justify-center">
              <PrivilegePassCard member={selectedMember} priorityText="PT CLIENT" showFlipButton={false} />
            </div>

            {/* Client Bio & Tape Measurements */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-[#090C13] border border-white/5">
                <span className="text-[10px] text-slate-400 block">Weight / Height</span>
                <strong className="text-white">{selectedMember.weightKg} kg / {selectedMember.heightCm} cm</strong>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#090C13] border border-white/5">
                <span className="text-[10px] text-slate-400 block">BMI</span>
                <strong className="text-[#27D980]">{selectedMember.bmi}</strong>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#090C13] border border-white/5">
                <span className="text-[10px] text-slate-400 block">Chest / Waist</span>
                <strong className="text-white">{selectedMember.chestCm || 95}cm / {selectedMember.waistCm || 82}cm</strong>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#090C13] border border-white/5">
                <span className="text-[10px] text-slate-400 block">Arms / Thighs</span>
                <strong className="text-white">{selectedMember.armsCm || 36}cm / {selectedMember.thighsCm || 54}cm</strong>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-black text-slate-400 uppercase">Medical History / Notes</span>
              <div className="p-3 rounded-2xl bg-[#090C13] border border-white/5 text-slate-200">
                {selectedMember.medicalHistory || 'No active medical restrictions recorded.'}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setSelectedMember(null);
                  setActiveTab('workout');
                }}
                className="px-4 py-2 rounded-xl bg-[#4F7CFF] text-white text-xs font-bold"
              >
                Open Workout Studio →
              </button>
            </div>

          </div>
        </div>
      )}

        </div>
      )}

    </div>
  );
};
