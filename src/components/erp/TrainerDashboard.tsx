import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Dumbbell, Users, CheckCircle2, Calendar, MessageSquare, Award, Sparkles, Activity, Clock } from 'lucide-react';

export const TrainerDashboard: React.FC = () => {
  const { employees, members, workout, toggleExerciseCompleted, activeMember, setActiveMemberId, setPerspective } = useGym();
  const [selectedTrainerId, setSelectedTrainerId] = useState('EMP-001');

  const trainers = employees.filter((e) => e.role === 'Trainer');
  const currentTrainer = trainers.find((t) => t.id === selectedTrainerId) || trainers[0];

  // Members assigned to this trainer
  const assignedMembers = members.filter((m) => m.assignedTrainerId === currentTrainer.id) || [members[0]];

  const handleOpenMemberApp = (memberId: string) => {
    setActiveMemberId(memberId);
    setPerspective('mobile');
  };

  const currentWeeklySplits = workout.weeklyPlans[0]?.splits || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Trainer Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30">
              Trainer Operating Workspace
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2 mt-1">
            <Dumbbell className="w-6 h-6 text-[#4F7CFF]" />
            Trainer Dashboard: {currentTrainer.name}
          </h2>
          <p className="text-xs text-gym-subtext">Manage client weekly workout splits, monthly diet plans, and PT sessions</p>
        </div>

        {/* Switch Between Multiple Trainers */}
        <div className="flex items-center gap-2 bg-[#14171F] p-2 rounded-2xl border border-gym-border text-xs">
          <span className="text-gym-subtext font-medium">Switch Trainer:</span>
          <select
            value={selectedTrainerId}
            onChange={(e) => setSelectedTrainerId(e.target.value)}
            className="bg-[#0B0D12] text-white font-bold px-3 py-1.5 rounded-xl border border-gym-border focus:outline-none cursor-pointer"
          >
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.shift.split(' ')[0]})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Trainer Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-gym-border">
          <span className="text-[11px] font-semibold text-gym-subtext uppercase">Assigned Clients</span>
          <div className="text-2xl font-black text-white mt-1">{assignedMembers.length} Members</div>
          <span className="text-[11px] text-[#27D980] font-medium">100% Active Plans</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-gym-border">
          <span className="text-[11px] font-semibold text-gym-subtext uppercase">PT Sessions Completed</span>
          <div className="text-2xl font-black text-[#4F7CFF] mt-1">{currentTrainer.ptSessionsCompleted} Sessions</div>
          <span className="text-[11px] text-gym-subtext">+ {currentTrainer.ptCommissionRate}% Commission Bonus</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-gym-border">
          <span className="text-[11px] font-semibold text-gym-subtext uppercase">Monthly PT Earnings</span>
          <div className="text-2xl font-black text-[#27D980] mt-1">
            ₹{(currentTrainer.baseSalary + (currentTrainer.baseSalary * currentTrainer.ptCommissionRate) / 100).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-gym-subtext">Base: ₹{currentTrainer.baseSalary.toLocaleString('en-IN')}</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-gym-border">
          <span className="text-[11px] font-semibold text-gym-subtext uppercase">Client Compliance Score</span>
          <div className="text-2xl font-black text-amber-400 mt-1">94%</div>
          <span className="text-[11px] text-gym-subtext">Workout & Diet Check-ins</span>
        </div>
      </div>

      {/* Main Client Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Assigned Members List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#4F7CFF]" />
            Active PT Clients & Workout Plans
          </h3>

          <div className="space-y-4">
            {assignedMembers.map((mem) => (
              <div
                key={mem.id}
                className="glass-card rounded-3xl p-5 border border-gym-border hover:border-[#4F7CFF]/40 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={mem.photoUrl} alt={mem.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-[#4F7CFF]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-white">{mem.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30">
                          {mem.goal}
                        </span>
                      </div>
                      <p className="text-xs text-gym-subtext mt-0.5">{mem.planName} • ID: {mem.id}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-300">
                        <span>Weight: <strong className="text-white">{mem.weightKg} kg</strong></span>
                        <span>BMI: <strong className="text-[#27D980]">{mem.bmi}</strong></span>
                        <span>Locker: <strong className="text-amber-400">{mem.lockerNumber || 'None'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenMemberApp(mem.id)}
                    className="px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-blue-600 text-white font-extrabold text-xs shadow-md shadow-[#4F7CFF]/20 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>View Client App</span>
                  </button>
                </div>

                {/* Today's Workout Split Assigned to Client */}
                <div className="bg-[#0B0D12] p-4 rounded-2xl border border-gym-border/60 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-gym-border/40 pb-2">
                    <span className="font-bold text-white">Week 1: Monday Chest & Triceps Split</span>
                    <span className="text-[#27D980] font-semibold">Active Weekly Plan</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {currentWeeklySplits[0]?.exercises.map((ex) => (
                      <div key={ex.id} className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${ex.completed ? 'bg-[#27D980]' : 'bg-slate-600'}`} />
                          {ex.name}
                        </span>
                        <span className="font-mono text-gym-subtext">{ex.targetSets} sets x {ex.targetReps} reps @ {ex.weightKg}kg</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* PT Session Log & Client Messaging (1 Col) */}
        <div className="space-y-6">
          
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-gym-border">
              <Calendar className="w-4 h-4 text-[#27D980]" />
              Today's PT Schedule
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#14171F] border border-gym-border flex items-center justify-between">
                <div>
                  <strong className="text-white">Rahul Sharma</strong>
                  <p className="text-gym-subtext text-[11px]">08:30 AM - 09:30 AM (Chest & Tri)</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  COMPLETED
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#14171F] border border-gym-border flex items-center justify-between">
                <div>
                  <strong className="text-white">Priya Malhotra</strong>
                  <p className="text-gym-subtext text-[11px]">06:00 PM - 07:00 PM (Core & Rehab)</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  UPCOMING
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-gym-border">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Recent Member Messages
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#0B0D12] border border-gym-border/60 space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>Rahul Sharma</span>
                  <span className="text-[10px] text-gym-subtext">10 mins ago</span>
                </div>
                <p className="text-gym-subtext text-[11px]">"Hey Marcus! Should I add 2.5kg to incline press next week?"</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
