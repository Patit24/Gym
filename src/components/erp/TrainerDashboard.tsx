import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Member } from '../../types/gym';
import {
  Dumbbell,
  Users,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Award,
  Sparkles,
  Activity,
  Clock,
  AlertTriangle,
  FileText,
  TrendingUp,
  Heart,
  Plus,
  X,
  Scale
} from 'lucide-react';

export const TrainerDashboard: React.FC = () => {
  const {
    employees,
    members,
    workout,
    toggleExerciseCompleted,
    activeMember,
    setActiveMemberId,
    setPerspective,
    progress,
    wellnessCheckins,
    workoutLogs,
    trainerNotes,
    addTrainerNote
  } = useGym();
  
  const [selectedTrainerId, setSelectedTrainerId] = useState('EMP-001');
  const [deepDiveMember, setDeepDiveMember] = useState<Member | null>(null);
  
  // Note Form
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'General' | 'Workout Form' | 'Nutrition' | 'Motivation'>('Workout Form');

  const trainers = employees.filter((e) => e.role === 'Trainer');
  const currentTrainer = trainers.find((t) => t.id === selectedTrainerId) || trainers[0] || {
    id: 'EMP-001',
    name: 'Marcus Vance',
    role: 'Trainer',
    shift: 'Morning',
    baseSalary: 35000,
    ptSessionsCompleted: 42,
    ptCommissionRate: 15
  };

  // Members assigned to this trainer
  const assignedMembers = members.filter((m) => m.assignedTrainerId === currentTrainer.id);

  const handleOpenMemberApp = (memberId: string) => {
    setActiveMemberId(memberId);
    setPerspective('mobile');
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deepDiveMember || !noteContent.trim()) return;

    await addTrainerNote({
      memberId: deepDiveMember.id,
      trainerId: currentTrainer.id,
      trainerName: currentTrainer.name,
      category: noteCategory,
      content: noteContent.trim(),
      date: new Date().toISOString().split('T')[0],
    });

    setNoteContent('');
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
          <p className="text-xs text-gym-subtext">Manage client transformation profiles, adherence, missed visits & coaching notes</p>
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
          <span className="text-[11px] text-[#27D980] font-medium">Active Transformation Rosters</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-gym-border">
          <span className="text-[11px] font-semibold text-gym-subtext uppercase">PT Sessions Completed</span>
          <div className="text-2xl font-black text-[#4F7CFF] mt-1">{currentTrainer.ptSessionsCompleted || 0} Sessions</div>
          <span className="text-[11px] text-gym-subtext">+ {currentTrainer.ptCommissionRate || 10}% Commission</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-gym-border">
          <span className="text-[11px] font-semibold text-gym-subtext uppercase">Transformation Score</span>
          <div className="text-2xl font-black text-[#27D980] mt-1">
            96.4%
          </div>
          <span className="text-[11px] text-gym-subtext">Client Goal Compliance</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-gym-border">
          <span className="text-[11px] font-semibold text-gym-subtext uppercase">Active Client Alert</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {assignedMembers.filter(m => m.status === 'Frozen' || m.status === 'Expired').length} Alert(s)
          </div>
          <span className="text-[11px] text-gym-subtext">Needs Trainer Outreach</span>
        </div>
      </div>

      {/* Main Client Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Assigned Members List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#4F7CFF]" />
              Assigned PT Clients ({assignedMembers.length})
            </span>
          </h3>

          {assignedMembers.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#14171F] border border-gym-border text-center text-slate-400 font-bold space-y-2">
              <Users className="w-8 h-8 text-slate-500 mx-auto" />
              <p>No clients assigned to this trainer yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedMembers.map((mem) => {
                // Calculate member wellness & adherence
                const memLogs = workoutLogs.filter(l => l.memberId === mem.id);
                const memWellness = wellnessCheckins.filter(w => w.memberId === mem.id);
                const latestProgress = progress.filter(p => p.memberId === mem.id).sort((a, b) => b.date.localeCompare(a.date))[0];
                
                // Missed attendance check (if expired or no logs in 7 days)
                const isAtRisk = mem.status === 'Expired' || mem.status === 'Frozen';

                return (
                  <div
                    key={mem.id}
                    className="glass-card rounded-3xl p-5 border border-gym-border hover:border-[#4F7CFF]/40 transition-all space-y-4 shadow-xl"
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
                            {isAtRisk && (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Inactive / Dues
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gym-subtext mt-0.5">{mem.planName} • ID: {mem.membershipNo || mem.id}</p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-300">
                            <span>Weight: <strong className="text-white">{latestProgress?.weightKg || mem.weightKg} kg</strong></span>
                            <span>BMI: <strong className="text-[#27D980]">{mem.bmi}</strong></span>
                            <span>Completed Workouts: <strong className="text-cyan-400">{memLogs.length}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDeepDiveMember(mem)}
                          className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-black text-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>Deep Dive</span>
                        </button>
                        <button
                          onClick={() => handleOpenMemberApp(mem.id)}
                          className="px-3.5 py-2 rounded-xl bg-[#4F7CFF] hover:bg-blue-600 text-white font-extrabold text-xs shadow-md shadow-[#4F7CFF]/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span>Open Mobile App →</span>
                        </button>
                      </div>
                    </div>

                    {/* Member Fast KPI bar */}
                    <div className="grid grid-cols-3 gap-2 bg-[#0B0D12] p-2.5 rounded-2xl border border-gym-border/40 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold block uppercase">Check-in Streak</span>
                        <strong className="text-white font-black">{mem.attendanceStreak || 1} Days Active</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold block uppercase">Wellness Checkins</span>
                        <strong className="text-emerald-400 font-black">{memWellness.length} Logged</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold block uppercase">Chest / Waist</span>
                        <strong className="text-cyan-400 font-black">{latestProgress?.chestCm || mem.chestInches || '—'} / {latestProgress?.waistCm || mem.waistInches || '—'} cm</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PT Session Log & Client Messaging (1 Col) */}
        <div className="space-y-6">
          
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-gym-border">
              <Calendar className="w-4 h-4 text-[#27D980]" />
              Today's Personal Training Roster
            </h3>

            <div className="space-y-3 text-xs">
              {assignedMembers.slice(0, 3).map((mem, idx) => (
                <div key={mem.id} className="p-3 rounded-2xl bg-[#14171F] border border-gym-border flex items-center justify-between">
                  <div>
                    <strong className="text-white">{mem.name}</strong>
                    <p className="text-gym-subtext text-[11px]">{idx === 0 ? '08:30 AM - 09:30 AM (Chest & Core)' : '06:00 PM - 07:00 PM (Strength & Conditioning)'}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    SCHEDULED
                  </span>
                </div>
              ))}
              {assignedMembers.length === 0 && (
                <p className="text-slate-500 text-center py-2">No PT appointments today</p>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-gym-border">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Latest Coaching Notes Recorded
            </h3>

            <div className="space-y-2 text-xs">
              {trainerNotes.slice(0, 3).map((note) => (
                <div key={note.id} className="p-3 rounded-xl bg-[#0B0D12] border border-gym-border/60 space-y-1">
                  <div className="flex justify-between font-bold text-white">
                    <span className="text-purple-300 font-bold">{note.category}</span>
                    <span className="text-[10px] text-gym-subtext">{note.date}</span>
                  </div>
                  <p className="text-gym-subtext text-[11px]">"{note.content}"</p>
                </div>
              ))}
              {trainerNotes.length === 0 && (
                <p className="text-slate-500 text-center py-2">No coaching notes logged yet</p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* CLIENT DEEP-DIVE MODAL */}
      {deepDiveMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#101422] border border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <img src={deepDiveMember.photoUrl} alt={deepDiveMember.name} className="w-12 h-12 rounded-2xl object-cover border border-cyan-400" />
                <div>
                  <h3 className="text-base font-black text-white">{deepDiveMember.name}</h3>
                  <p className="text-xs text-cyan-400 font-bold">{deepDiveMember.goal} • {deepDiveMember.membershipNo}</p>
                </div>
              </div>
              <button onClick={() => setDeepDiveMember(null)} className="p-2 rounded-xl bg-white/10 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10 text-center">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Current Weight</span>
                <div className="text-base font-black text-white mt-0.5">{deepDiveMember.weightKg} kg</div>
              </div>
              <div className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10 text-center">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Target Goal</span>
                <div className="text-base font-black text-[#27D980] mt-0.5">{deepDiveMember.targetWeightKg || deepDiveMember.weightKg} kg</div>
              </div>
              <div className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10 text-center">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Height</span>
                <div className="text-base font-black text-cyan-400 mt-0.5">{deepDiveMember.heightCm} cm</div>
              </div>
              <div className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10 text-center">
                <span className="text-slate-400 text-[10px] uppercase font-bold">BMI Rating</span>
                <div className="text-base font-black text-amber-400 mt-0.5">{deepDiveMember.bmi}</div>
              </div>
            </div>

            {/* Tape Measurements */}
            <div className="p-4 rounded-2xl bg-[#0B0E17] border border-white/10 space-y-2">
              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>Full Body Tape Measurements</span>
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-[#141A29]">
                  <span className="text-[9px] text-slate-400">Chest</span>
                  <div className="font-black text-white">{deepDiveMember.chestInches || '—'} in</div>
                </div>
                <div className="p-2 rounded-xl bg-[#141A29]">
                  <span className="text-[9px] text-slate-400">Waist</span>
                  <div className="font-black text-white">{deepDiveMember.waistInches || '—'} in</div>
                </div>
                <div className="p-2 rounded-xl bg-[#141A29]">
                  <span className="text-[9px] text-slate-400">Hips</span>
                  <div className="font-black text-white">{deepDiveMember.hipsInches || '—'} in</div>
                </div>
                <div className="p-2 rounded-xl bg-[#141A29]">
                  <span className="text-[9px] text-slate-400">Arms</span>
                  <div className="font-black text-white">{deepDiveMember.armsInches || '—'} in</div>
                </div>
                <div className="p-2 rounded-xl bg-[#141A29]">
                  <span className="text-[9px] text-slate-400">Thighs</span>
                  <div className="font-black text-white">{deepDiveMember.thighsInches || '—'} in</div>
                </div>
                <div className="p-2 rounded-xl bg-[#141A29]">
                  <span className="text-[9px] text-slate-400">Calves</span>
                  <div className="font-black text-white">{deepDiveMember.calvesInches || '—'} in</div>
                </div>
              </div>
            </div>

            {/* Direct Member Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  handleOpenMemberApp(deepDiveMember.id);
                  setDeepDiveMember(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4F7CFF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Open Member Mobile View & App</span>
              </button>
            </div>

            {/* Add Trainer Coaching Note */}
            <div className="p-4 rounded-2xl bg-[#0B0E17] border border-white/10 space-y-3">
              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Log Coach Remarks / Technique Instructions</span>
              </h4>

              <form onSubmit={handleAddNote} className="space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as any)}
                    className="bg-[#141A29] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-purple-300 font-bold outline-none"
                  >
                    <option value="Workout Form">Workout Form</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Motivation">Motivation</option>
                    <option value="General">General</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Focus on chest touch at bottom of bench press..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="flex-1 bg-[#141A29] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-all shrink-0 cursor-pointer"
                  >
                    Log Note
                  </button>
                </div>
              </form>

              {/* Note History */}
              <div className="space-y-1.5 pt-2 max-h-36 overflow-y-auto">
                {trainerNotes.filter(n => n.memberId === deepDiveMember.id).map(n => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-[#141A29] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-purple-400 font-black text-[10px] uppercase block">{n.category}</span>
                      <p className="text-slate-200">{n.content}</p>
                    </div>
                    <span className="text-[9px] text-slate-500">{n.date}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

