import React, { useState, useEffect, useMemo } from 'react';
import { useGym } from '../../context/GymContext';
import { Exercise, DailyWorkoutSplit, WorkoutSetLog, ExerciseExecution } from '../../types/gym';
import { WearableHeartRateSyncModal } from './WearableHeartRateSyncModal';
import {
  Dumbbell,
  Check,
  Play,
  Clock,
  Sparkles,
  Plus,
  X,
  User,
  Flame,
  Trophy,
  History,
  CheckCircle2,
  Zap,
  TrendingUp,
  Award,
  Heart,
  Watch,
  Radio,
  Activity
} from 'lucide-react';

export const WorkoutLogger: React.FC = () => {
  const {
    workout,
    toggleExerciseCompleted,
    addWeeklyWorkout,
    currentRole,
    members,
    activeMember,
    setActiveMemberId,
    workoutLogs,
    logWorkoutSession,
    personalRecords
  } = useGym();
  
  const [activeTab, setActiveTab] = useState<'plan' | 'live' | 'history' | 'prs'>('plan');
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [activeRestTimer, setActiveRestTimer] = useState<number | null>(null);

  // Live Workout Session State
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isWearableSyncOpen, setIsWearableSyncOpen] = useState<boolean>(false);
  const [liveWatchBpm, setLiveWatchBpm] = useState<number>(138);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionExercises, setSessionExercises] = useState<{
    exerciseId: string;
    exerciseName: string;
    category?: string;
    targetSets: number;
    targetReps: number;
    targetWeight: number;
    sets: { setNumber: number; reps: number; weightKg: number; rpe: number; completed: boolean }[];
    notes: string;
  }[]>([]);
  const [newPrDetected, setNewPrDetected] = useState<string | null>(null);

  // Trainer/Admin Add Weekly Workout Modal State
  const [showAddWeekModal, setShowAddWeekModal] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState<string>(activeMember?.id || 'MEM-2026-001');
  const [newWeekNum, setNewWeekNum] = useState<number>(2);
  const [newWeekTitle, setNewWeekTitle] = useState('Week 2: Progressive Load & Overload');
  const [newExName, setNewExName] = useState('Incline Dumbbell Press');
  const [newExCategory, setNewExCategory] = useState<Exercise['category']>('Chest');
  const [newExSets, setNewExSets] = useState(4);
  const [newExReps, setNewExReps] = useState(10);
  const [newExWeight, setNewExWeight] = useState(40);

  const weeklyPlans = (workout?.weeklyPlans && workout.weeklyPlans.length > 0) 
    ? workout.weeklyPlans 
    : [];

  const currentWeekPlan = weeklyPlans.find((w) => w.weekNumber === selectedWeekNum) || weeklyPlans[0];
  const currentSplit = currentWeekPlan?.splits?.[selectedDayIdx] || currentWeekPlan?.splits?.[0];

  // Member's Workout Logs & PRs
  const memberLogs = useMemo(() => {
    return workoutLogs
      .filter((l) => l.memberId === activeMember?.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [workoutLogs, activeMember?.id]);

  const memberPRs = useMemo(() => {
    return personalRecords.filter((pr) => pr.memberId === activeMember?.id);
  }, [personalRecords, activeMember?.id]);

  // Workout Adherence
  const totalAssignedSplits = currentWeekPlan?.splits?.length || 5;
  const completedThisWeek = memberLogs.filter((l) => {
    const logDate = new Date(l.date);
    const now = new Date();
    const diffDays = Math.round((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;
  const adherencePct = Math.min(100, Math.round((completedThisWeek / totalAssignedSplits) * 100));

  useEffect(() => {
    let interval: any = null;
    if (activeRestTimer !== null && activeRestTimer > 0) {
      interval = setInterval(() => {
        setActiveRestTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeRestTimer]);

  const startRestTimer = (seconds: number) => {
    setActiveRestTimer(seconds);
  };

  const initiateWorkoutWithWearableSync = () => {
    setIsWearableSyncOpen(true);
  };

  const handleWearableSyncComplete = () => {
    setIsWearableSyncOpen(false);
    handleStartWorkout();
  };

  const handleStartWorkout = () => {
    if (!currentSplit || !currentSplit.exercises.length) return;
    
    const initialEx = currentSplit.exercises.map((ex) => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      category: ex.category,
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      targetWeight: ex.weightKg,
      sets: Array.from({ length: ex.targetSets || 3 }, (_, idx) => ({
        setNumber: idx + 1,
        reps: ex.targetReps || 10,
        weightKg: ex.weightKg || 30,
        rpe: 8,
        completed: false,
      })),
      notes: ex.notes || '',
    }));

    setSessionExercises(initialEx);
    setIsSessionActive(true);
    setSessionStartTime(Date.now());
    setActiveTab('live');
  };

  const toggleLiveSet = (exIdx: number, setIdx: number) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exIdx] };
      const sets = [...ex.sets];
      const targetSet = { ...sets[setIdx], completed: !sets[setIdx].completed };
      sets[setIdx] = targetSet;
      ex.sets = sets;
      updated[exIdx] = ex;

      // PR Check
      if (targetSet.completed && targetSet.weightKg > 0) {
        const existingPR = memberPRs.find((pr) => pr.exerciseName.toLowerCase() === ex.exerciseName.toLowerCase());
        if (!existingPR || targetSet.weightKg > existingPR.maxWeightKg) {
          setNewPrDetected(`🔥 New PR Milestone: ${ex.exerciseName} @ ${targetSet.weightKg} kg!`);
          setTimeout(() => setNewPrDetected(null), 5000);
        }
      }

      return updated;
    });
  };

  const updateSetWeight = (exIdx: number, setIdx: number, weightKg: number) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], weightKg };
      updated[exIdx] = { ...updated[exIdx], sets };
      return updated;
    });
  };

  const updateSetReps = (exIdx: number, setIdx: number, reps: number) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], reps };
      updated[exIdx] = { ...updated[exIdx], sets };
      return updated;
    });
  };

  const handleFinishWorkout = async () => {
    if (!activeMember?.id || !sessionExercises.length) return;

    const durationMinutes = sessionStartTime ? Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000)) : 45;
    
    // Calculate volume
    let totalVol = 0;
    sessionExercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed) {
          totalVol += (s.weightKg * s.reps);
        }
      });
    });

    const executionLog: ExerciseExecution[] = sessionExercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      category: ex.category,
      sets: ex.sets.map((s) => ({
        setNumber: s.setNumber,
        reps: s.reps,
        weightKg: s.weightKg,
        rpe: s.rpe,
        completed: s.completed,
      })),
      notes: ex.notes,
    }));

    await logWorkoutSession({
      memberId: activeMember.id,
      date: new Date().toISOString().split('T')[0],
      day: currentSplit?.day || 'Today',
      splitTitle: currentSplit?.title || 'Workout Session',
      exercises: executionLog,
      durationMinutes,
      totalVolumeKg: totalVol,
      completedAt: new Date().toISOString(),
    });

    setIsSessionActive(false);
    setActiveTab('history');
  };

  const handleSaveWeeklyWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const newExercise: Exercise = {
      id: `ex-${Date.now()}`,
      name: newExName,
      category: newExCategory,
      targetSets: newExSets,
      targetReps: newExReps,
      weightKg: newExWeight,
      restSeconds: 60,
      completed: false,
    };

    const newSplits: DailyWorkoutSplit[] = [
      {
        day: 'Monday',
        title: `${newExCategory} & Target Split`,
        exercises: [newExercise]
      }
    ];

    addWeeklyWorkout(targetMemberId, newWeekNum, newWeekTitle, newSplits);
    setShowAddWeekModal(false);
  };

  const completedCount = currentSplit ? currentSplit.exercises.filter((e) => e.completed).length : 0;
  const progressPercent = currentSplit ? Math.round((completedCount / currentSplit.exercises.length) * 100) || 0 : 0;

  const isTrainerOrAdmin = currentRole === 'Trainer' || currentRole === 'Super Admin' || currentRole === 'Owner';

  if (!currentWeekPlan || !currentSplit) {
    return (
      <div className="space-y-4 text-xs animate-in fade-in">
        {isTrainerOrAdmin && (
          <div className="bg-[#0F1420] p-2.5 rounded-2xl border border-white/10 flex items-center justify-between">
            <span className="text-gym-subtext font-extrabold flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              Target Member:
            </span>
            <select
              value={activeMember?.id || ''}
              onChange={(e) => setActiveMemberId(e.target.value)}
              className="bg-[#070A10] text-cyan-400 font-extrabold px-2.5 py-1 rounded-xl border border-cyan-500/30 focus:outline-none cursor-pointer text-xs"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.membershipNo})</option>
              ))}
            </select>
          </div>
        )}

        <div className="p-8 rounded-3xl bg-[#0F1420] border border-white/10 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30 flex items-center justify-center">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-white">No Workout Routine Assigned Yet</h3>
          <p className="text-xs text-gym-subtext max-w-xs">
            Your assigned gym trainer will customize your training split, sets, reps, and exercises.
          </p>
          {isTrainerOrAdmin && (
            <button
              onClick={() => setShowAddWeekModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#3D68E6] text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#4F7CFF]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Workout Routine</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300 text-xs">
      
      {/* Target Member Selector for Trainer / Staff */}
      {isTrainerOrAdmin && (
        <div className="bg-[#0F1420] p-2.5 rounded-2xl border border-white/10 flex items-center justify-between">
          <span className="text-gym-subtext font-extrabold flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            Target Member:
          </span>
          <select
            value={activeMember.id}
            onChange={(e) => setActiveMemberId(e.target.value)}
            className="bg-[#070A10] text-cyan-400 font-extrabold px-2.5 py-1 rounded-xl border border-cyan-500/30 focus:outline-none cursor-pointer text-xs"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name} ({m.goal})</option>
            ))}
          </select>
        </div>
      )}

      {/* New PR Banner Alert */}
      {newPrDetected && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-400/50 text-amber-300 font-black text-xs flex items-center gap-2 animate-bounce shadow-xl">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{newPrDetected}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-gym-border/40 pb-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'plan', label: 'Workout Plan', icon: Dumbbell },
          { id: 'live', label: isSessionActive ? '⚡ Active Session' : 'Start Workout', icon: Play },
          { id: 'history', label: `History (${memberLogs.length})`, icon: History },
          { id: 'prs', label: `Personal Records (${memberPRs.length})`, icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#4F7CFF] text-white shadow-md shadow-[#4F7CFF]/20 font-black'
                  : 'bg-[#101422] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: WORKOUT PLAN */}
      {activeTab === 'plan' && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          
          {/* Adherence & Weekly Bases Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[1, 2, 3, 4].map((wk) => (
                <button
                  key={wk}
                  onClick={() => {
                    setSelectedWeekNum(wk);
                    setSelectedDayIdx(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all ${
                    selectedWeekNum === wk
                      ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-gym-dark shadow-lg shadow-cyan-500/20 font-black'
                      : 'bg-[#0F1420] text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  Week {wk}
                </button>
              ))}
            </div>

            {isTrainerOrAdmin && (
              <button
                onClick={() => setShowAddWeekModal(true)}
                className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md text-xs font-bold flex items-center gap-1 shrink-0"
                title="Set Weekly Workout for Member"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[10px]">Set Routine</span>
              </button>
            )}
          </div>

          {/* Adherence Rate Banner */}
          <div className="p-3 bg-[#101422] rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#27D980]" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Weekly Adherence Rate</span>
                <span className="text-xs font-black text-white">{completedThisWeek} / {totalAssignedSplits} Splits Completed</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30 font-black text-[11px]">
              {adherencePct}% Compliance
            </span>
          </div>

          {/* Day Selector (Monday - Sunday) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {currentWeekPlan.splits.map((split, idx) => (
              <button
                key={split.day}
                onClick={() => setSelectedDayIdx(idx)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                  selectedDayIdx === idx
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'bg-[#0F1420] text-slate-400 border border-white/10'
                }`}
              >
                {split.day}
              </button>
            ))}
          </div>

          {/* Daily Focus Card */}
          {currentSplit && (
            <div className="glass-card rounded-[24px] p-4 border border-cyan-500/30 bg-gradient-to-br from-[#0E1A33] via-[#0A1121] to-[#050912] flex items-center justify-between">
              <div>
                <span className="text-[9px] font-extrabold text-blue-400 uppercase tracking-wider">DAILY FOCUS</span>
                <h3 className="text-xs font-black text-white mt-0.5">{currentSplit.title}</h3>
                <span className="text-[10px] text-gym-subtext">{completedCount} of {currentSplit.exercises.length} Exercises Completed</span>
              </div>
              <button
                onClick={initiateWorkoutWithWearableSync}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#27D980] to-emerald-500 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Start Workout</span>
              </button>
            </div>
          )}

          {/* Exercise Cards List */}
          <div className="space-y-2.5">
            {currentSplit && currentSplit.exercises.map((ex) => (
              <div
                key={ex.id}
                className={`p-3.5 rounded-[20px] border transition-all ${
                  ex.completed
                    ? 'bg-[#0F1420]/60 border-emerald-500/40'
                    : 'bg-[#0F1420] border-white/10 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExerciseCompleted(selectedWeekNum, currentSplit.day, ex.id)}
                      className={`w-6 h-6 rounded-xl flex items-center justify-center transition-all ${
                        ex.completed
                          ? 'bg-emerald-400 text-gym-dark font-extrabold shadow-md'
                          : 'border border-white/20 text-transparent hover:border-cyan-400'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <h4 className={`text-xs font-black ${ex.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {ex.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-gym-subtext mt-0.5">
                        <span><strong>{ex.targetSets}</strong> Sets</span>
                        <span>• <strong>{ex.targetReps}</strong> Reps</span>
                        <span>• <strong className="text-cyan-400">{ex.weightKg} kg</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => startRestTimer(ex.restSeconds)}
                    className="px-2.5 py-1 rounded-xl bg-[#161E30] hover:bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center gap-1 border border-white/10"
                  >
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Rest {ex.restSeconds}s</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE WORKOUT SESSION LOGGER */}
      {activeTab === 'live' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {!isSessionActive ? (
            <div className="p-8 rounded-3xl bg-[#101422] border border-white/10 text-center space-y-3">
              <Dumbbell className="w-10 h-10 text-cyan-400 mx-auto" />
              <h3 className="text-sm font-black text-white">Ready for Today's Training?</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Track every set weight, reps, and check-offs live to automatically record personal records.
              </p>
              <button
                onClick={initiateWorkoutWithWearableSync}
                className="px-5 py-2.5 rounded-2xl bg-[#27D980] hover:bg-[#20BE6F] text-black font-black text-xs shadow-xl active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Launch Live Session</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Companion Watch Live Biometric Sync Ribbon */}
              <div className="p-3.5 rounded-2xl glass-card-premium border border-[#00D4FF]/30 bg-gradient-to-r from-[#0E1726] via-[#090D17] to-[#0E1726] shadow-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-[#EC4899]/15 text-[#EC4899] flex items-center justify-center border border-[#EC4899]/30">
                      <Heart className="w-5 h-5 fill-[#EC4899] animate-pulse" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#0A0D14] animate-ping" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-black text-white font-mono">{liveWatchBpm}</span>
                      <span className="text-[10px] text-slate-400 font-bold">BPM</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-[#10B981]/15 text-[#10B981] text-[8px] font-black border border-[#10B981]/30 uppercase ml-1">
                        Zone 3 Cardio
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[9.5px] text-slate-400 mt-0.5">
                      <span>🔥 9.4 kcal/min</span>
                      <span>•</span>
                      <span>⚡ HRV 64ms</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-[9px] font-black text-[#00D4FF]">
                    <Watch className="w-3 h-3" />
                    <span> Ultra Sync</span>
                  </div>
                  <span className="text-[8px] font-mono text-emerald-400 font-bold block mt-0.5">
                    🔒 0.2ms Locked
                  </span>
                </div>
              </div>

              {/* Active Session Header */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-[#141F36] to-[#0D1524] border border-cyan-500/40 flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-[9px] font-black text-cyan-400 uppercase tracking-wider">LIVE WORKOUT EXECUTION</span>
                  <h3 className="text-xs font-black text-white mt-0.5">{currentSplit?.title}</h3>
                </div>
                <button
                  onClick={handleFinishWorkout}
                  className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finish Workout</span>
                </button>
              </div>

              {/* Exercises with Interactive Sets */}
              <div className="space-y-3">
                {sessionExercises.map((ex, exIdx) => (
                  <div key={ex.exerciseId} className="p-4 rounded-3xl bg-[#101422] border border-white/10 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div>
                        <h4 className="text-xs font-black text-white">{ex.exerciseName}</h4>
                        <span className="text-[9px] text-slate-400">{ex.category} • Target: {ex.targetSets} Sets × {ex.targetReps} Reps</span>
                      </div>
                      <span className="text-[10px] font-bold text-cyan-400">
                        {ex.sets.filter((s) => s.completed).length}/{ex.sets.length} Done
                      </span>
                    </div>

                    <div className="space-y-2">
                      {ex.sets.map((set, setIdx) => (
                        <div
                          key={set.setNumber}
                          className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 text-xs transition-all ${
                            set.completed
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : 'bg-[#0B0E17] border-white/5'
                          }`}
                        >
                          <span className="font-bold text-slate-400 text-[11px] w-12">Set {set.setNumber}</span>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={set.weightKg}
                                onChange={(e) => updateSetWeight(exIdx, setIdx, Number(e.target.value))}
                                className="w-14 bg-[#101422] border border-white/10 rounded-lg px-2 py-1 text-center font-black text-white text-xs outline-none"
                              />
                              <span className="text-[10px] text-slate-400">kg</span>
                            </div>

                            <span className="text-slate-500">×</span>

                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={set.reps}
                                onChange={(e) => updateSetReps(exIdx, setIdx, Number(e.target.value))}
                                className="w-12 bg-[#101422] border border-white/10 rounded-lg px-2 py-1 text-center font-black text-white text-xs outline-none"
                              />
                              <span className="text-[10px] text-slate-400">reps</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleLiveSet(exIdx, setIdx)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black transition-all cursor-pointer ${
                              set.completed
                                ? 'bg-emerald-400 text-black shadow-md shadow-emerald-500/20'
                                : 'bg-white/10 text-slate-400 hover:bg-white/20'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WORKOUT EXECUTION HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Historical Workout Sessions</span>
            </h4>
          </div>

          {memberLogs.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#101422] border border-white/10 text-center text-slate-400 font-bold space-y-2">
              <Dumbbell className="w-8 h-8 text-slate-500 mx-auto" />
              <p>No workout history yet.</p>
              <p className="text-[10px] text-slate-500">Launch a session above to record your completed sets!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {memberLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-3xl bg-[#101422] border border-white/10 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white">{log.splitTitle}</h4>
                      <span className="text-[10px] text-slate-400">{log.date} • {log.day}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-black text-[10px] border border-cyan-500/30">
                      {log.durationMinutes || 45} mins
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-white/5">
                    {log.exercises?.map((ex, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>{ex.exerciseName}</span>
                        <span className="font-mono text-slate-400 text-[10px]">
                          {ex.sets?.filter(s => s.completed).map(s => `${s.weightKg}kg×${s.reps}`).join(', ') || 'Completed'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {log.totalVolumeKg && log.totalVolumeKg > 0 ? (
                    <div className="text-[10px] text-emerald-400 font-black pt-1">
                      Total Volume Lifted: {log.totalVolumeKg.toLocaleString()} kg
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PERSONAL RECORDS */}
      {activeTab === 'prs' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Verified Personal Records (PRs)</span>
            </h4>
          </div>

          {memberPRs.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#101422] border border-white/10 text-center text-slate-400 font-bold space-y-2">
              <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
              <p>No personal records recorded yet.</p>
              <p className="text-[10px] text-slate-500">Log heavy sets in live workouts to automatically unlock PR badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {memberPRs.map((pr) => (
                <div key={pr.id} className="p-4 rounded-3xl bg-[#101422] border border-amber-500/30 space-y-1.5 shadow-lg shadow-amber-500/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      Personal Best
                    </span>
                    <span className="text-[9px] text-slate-400">{pr.achievedDate}</span>
                  </div>
                  <h4 className="text-xs font-black text-white">{pr.exerciseName}</h4>
                  <div className="text-lg font-black text-emerald-400">
                    {pr.maxWeightKg} kg <span className="text-xs text-slate-400">({pr.reps} reps)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Weekly Workout Modal */}
      {showAddWeekModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0F1420] border border-cyan-500/40 rounded-3xl max-w-xs w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="font-extrabold text-white text-xs">Set Weekly Workout</h4>
              <button onClick={() => setShowAddWeekModal(false)} className="text-gym-subtext"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSaveWeeklyWorkout} className="space-y-2">
              <div>
                <label className="block text-[10px] text-gym-subtext mb-0.5">Select Gym Member</label>
                <select
                  value={targetMemberId}
                  onChange={(e) => setTargetMemberId(e.target.value)}
                  className="w-full bg-[#070A10] border border-white/10 rounded-xl px-2.5 py-1.5 text-white"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.membershipNo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gym-subtext mb-0.5">Select Week Number</label>
                <select
                  value={newWeekNum}
                  onChange={(e) => setNewWeekNum(Number(e.target.value))}
                  className="w-full bg-[#070A10] border border-white/10 rounded-xl px-2.5 py-1.5 text-white"
                >
                  <option value={1}>Week 1</option>
                  <option value={2}>Week 2</option>
                  <option value={3}>Week 3</option>
                  <option value={4}>Week 4</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gym-subtext mb-0.5">Week Title</label>
                <input
                  type="text"
                  required
                  value={newWeekTitle}
                  onChange={(e) => setNewWeekTitle(e.target.value)}
                  className="w-full bg-[#070A10] border border-white/10 rounded-xl px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gym-subtext mb-0.5">Exercise Name</label>
                <input
                  type="text"
                  required
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full bg-[#070A10] border border-white/10 rounded-xl px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] text-gym-subtext">Sets</label>
                  <input type="number" value={newExSets} onChange={(e) => setNewExSets(Number(e.target.value))} className="w-full bg-[#070A10] border border-white/10 rounded-lg px-2 py-1 text-white" />
                </div>
                <div>
                  <label className="block text-[9px] text-gym-subtext">Reps</label>
                  <input type="number" value={newExReps} onChange={(e) => setNewExReps(Number(e.target.value))} className="w-full bg-[#070A10] border border-white/10 rounded-lg px-2 py-1 text-white" />
                </div>
                <div>
                  <label className="block text-[9px] text-gym-subtext">Weight (kg)</label>
                  <input type="number" value={newExWeight} onChange={(e) => setNewExWeight(Number(e.target.value))} className="w-full bg-[#070A10] border border-white/10 rounded-lg px-2 py-1 text-white" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-gym-dark font-black text-xs shadow-md mt-1"
              >
                Assign Week {newWeekNum} Workout
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Wearable Heart Rate Sync Preload Modal */}
      <WearableHeartRateSyncModal
        isOpen={isWearableSyncOpen}
        workoutTitle={currentSplit?.title || 'Daily Training'}
        onSyncComplete={handleWearableSyncComplete}
        onCancel={() => setIsWearableSyncOpen(false)}
      />

    </div>
  );
};

