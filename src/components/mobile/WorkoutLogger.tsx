import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { Exercise, DailyWorkoutSplit } from '../../types/gym';
import { Dumbbell, Check, Play, Clock, Sparkles, Plus, X, User } from 'lucide-react';

import { INITIAL_WORKOUT } from '../../data/initialData';

export const WorkoutLogger: React.FC = () => {
  const { workout, toggleExerciseCompleted, addWeeklyWorkout, currentRole, members, activeMember, setActiveMemberId } = useGym();
  
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [activeRestTimer, setActiveRestTimer] = useState<number | null>(null);

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
    : INITIAL_WORKOUT.weeklyPlans;

  const currentWeekPlan = weeklyPlans.find((w) => w.weekNumber === selectedWeekNum) || weeklyPlans[0];
  const currentSplit = currentWeekPlan?.splits?.[selectedDayIdx] || currentWeekPlan?.splits?.[0] || INITIAL_WORKOUT.weeklyPlans[0].splits[0];

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

      {/* Weekly Bases Selector (Week 1, Week 2, Week 3, Week 4) */}
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

        {/* Add Weekly Workout Button for Trainer/Admin */}
        {isTrainerOrAdmin && (
          <button
            onClick={() => setShowAddWeekModal(true)}
            className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md text-xs font-bold flex items-center gap-1 shrink-0"
            title="Set Weekly Workout for Member"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[10px]">Set Workout</span>
          </button>
        )}
      </div>

      {/* Add / Assign Weekly Workout Modal */}
      {showAddWeekModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0F1420] border border-cyan-500/40 rounded-3xl max-w-xs w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="font-extrabold text-white text-xs">Set Weekly Workout via App</h4>
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

      {/* Week Title Banner */}
      <div className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20 flex items-center justify-between">
        <span>{currentWeekPlan.weekTitle}</span>
        <span className="text-[10px] text-gym-subtext">Week {selectedWeekNum} of 4</span>
      </div>

      {/* Day Selector (Monday - Sunday) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {currentWeekPlan.splits.map((split, idx) => (
          <button
            key={split.day}
            onClick={() => setSelectedDayIdx(idx)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
              selectedDayIdx === idx
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#0F1420] text-slate-400 border border-white/10'
            }`}
          >
            {split.day}
          </button>
        ))}
      </div>

      {/* Daily Focus Card with Progress Ring matching Reference Image */}
      {currentSplit && (
        <div className="glass-card rounded-[24px] p-4 border border-cyan-500/30 bg-gradient-to-br from-[#0E1A33] via-[#0A1121] to-[#050912] flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold text-blue-400 uppercase tracking-wider">DAILY FOCUS</span>
            <h3 className="text-xs font-black text-white mt-0.5">{currentSplit.title}</h3>
            <span className="text-[10px] text-gym-subtext">{completedCount} of {currentSplit.exercises.length} Exercises Completed</span>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#070A10] border-2 border-emerald-400 flex items-center justify-center font-black text-xs text-emerald-400 shadow-md">
            {progressPercent}%
          </div>
        </div>
      )}

      {/* Active Rest Timer Banner */}
      {activeRestTimer !== null && (
        <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-between animate-pulse">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Rest Timer Running:
          </span>
          <span className="text-sm font-black text-white">{activeRestTimer}s</span>
        </div>
      )}

      {/* Exercise Cards List matching Reference Image */}
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
  );
};
