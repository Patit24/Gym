import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Member, Role, DailyWorkoutSplit, Exercise, MealItem } from '../../types/gym';
import { QuickDailyPlanner } from './QuickDailyPlanner';
import {
  MASTER_EXERCISES,
  MASTER_FOODS,
  WORKOUT_TEMPLATES,
  DIET_TEMPLATES,
} from '../../data/masterLibrary';
import {
  Dumbbell,
  Utensils,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  Sparkles,
  Search,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  User,
  Activity,
  Layers,
  Zap
} from 'lucide-react';

export const AdvancedPlannerStudio: React.FC = () => {
  const { members, activeMember, setActiveMemberId, employees, currentRole, workout, diet, addWeeklyWorkout, addMonthlyDiet } = useGym();

  const [plannerMode, setPlannerMode] = useState<'quick' | 'advanced'>('quick');
  const [activeStudioTab, setActiveStudioTab] = useState<'workout' | 'diet' | 'library' | 'print'>('workout');

  const [selectedMemberId, setSelectedMemberId] = useState<string>(activeMember?.id || 'MEM-2026-001');
  const [workoutFrequency, setWorkoutFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>('Monthly');
  const [dietFrequency, setDietFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>('Monthly');

  const [expandedWeek, setExpandedWeek] = useState<number>(1);
  const currentMember = members.find((m) => m.id === selectedMemberId) || activeMember;

  const trainers = employees.filter((e) => e.role === 'Trainer');
  const dietitians = employees.filter((e) => e.role === 'Dietitian');

  const [assignedTrainerId, setAssignedTrainerId] = useState<string>(currentMember?.assignedTrainerId || 'EMP-001');
  const [assignedDietitianId, setAssignedDietitianId] = useState<string>(currentMember?.assignedDietitianId || 'EMP-003');

  const canEditWorkout = currentRole === 'Super Admin' || currentRole === 'Owner' || currentRole === 'Branch Manager' || currentRole === 'Trainer';
  const canEditDiet = currentRole === 'Super Admin' || currentRole === 'Owner' || currentRole === 'Branch Manager' || currentRole === 'Dietitian';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Mode Selector Header: Easy 1-Page Flow vs Advanced Enterprise Studio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-[#14171F] border border-gym-border">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#27D980]" />
            Workout & Diet Assignment Center
          </h2>
          <p className="text-xs text-gym-subtext">Choose your preferred creation flow below</p>
        </div>

        {/* Easy Flow vs Enterprise Studio Mode Toggle */}
        <div className="flex items-center gap-2 bg-[#0B0D12] p-1.5 rounded-2xl border border-gym-border">
          <button
            onClick={() => setPlannerMode('quick')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              plannerMode === 'quick'
                ? 'bg-[#27D980] text-gym-dark shadow-lg shadow-[#27D980]/30 font-black'
                : 'text-gym-subtext hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Easy 1-Page Flow (Daily)</span>
          </button>

          <button
            onClick={() => setPlannerMode('advanced')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              plannerMode === 'advanced'
                ? 'bg-[#4F7CFF] text-white shadow-lg shadow-[#4F7CFF]/30 font-extrabold'
                : 'text-gym-subtext hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🏢 Advanced Studio (Weekly/Monthly)</span>
          </button>
        </div>
      </div>

      {/* EASY 1-PAGE FLOW MODE */}
      {plannerMode === 'quick' ? (
        <QuickDailyPlanner />
      ) : (
        /* ADVANCED ENTERPRISE STUDIO MODE */
        <div className="space-y-6 animate-in fade-in">
          
          {/* Member Profile Drawer */}
          <div className="glass-card rounded-[28px] p-6 border border-gym-border/80 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-gym-border/60 pb-4 lg:pb-0 lg:pr-6">
              <img src={currentMember.photoUrl} alt={currentMember.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-[#4F7CFF]" />
              <div>
                <h3 className="text-base font-extrabold text-white">{currentMember.name}</h3>
                <p className="text-xs text-gym-subtext">{currentMember.goal} • ID: {currentMember.id}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                  <span>Weight: <strong>{currentMember.weightKg} kg</strong></span>
                  <span>BMI: <strong className="text-[#27D980]">{currentMember.bmi}</strong></span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-b lg:border-b-0 lg:border-r border-gym-border/60 pb-4 lg:pb-0 lg:pr-6">
              <span className="text-[11px] font-bold text-[#4F7CFF] uppercase">Assign Trainer</span>
              <div className="flex items-center gap-2">
                <select value={assignedTrainerId} onChange={(e) => setAssignedTrainerId(e.target.value)} className="flex-1 bg-[#0B0D12] border border-gym-border rounded-xl px-2.5 py-1.5 text-xs text-white">
                  {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button className="px-3 py-1.5 rounded-xl bg-[#4F7CFF] text-white font-bold text-xs">Assign</button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#27D980] uppercase">Assign Dietitian</span>
              <div className="flex items-center gap-2">
                <select value={assignedDietitianId} onChange={(e) => setAssignedDietitianId(e.target.value)} className="flex-1 bg-[#0B0D12] border border-gym-border rounded-xl px-2.5 py-1.5 text-xs text-white">
                  {dietitians.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button className="px-3 py-1.5 rounded-xl bg-[#27D980] text-gym-dark font-extrabold text-xs">Assign</button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-gym-border pb-3">
            <button onClick={() => setActiveStudioTab('workout')} className={`px-4 py-2 rounded-2xl text-xs font-extrabold ${activeStudioTab === 'workout' ? 'bg-[#4F7CFF] text-white' : 'bg-[#14171F] text-gym-subtext'}`}>
              Training Plans
            </button>
            <button onClick={() => setActiveStudioTab('diet')} className={`px-4 py-2 rounded-2xl text-xs font-extrabold ${activeStudioTab === 'diet' ? 'bg-[#27D980] text-gym-dark' : 'bg-[#14171F] text-gym-subtext'}`}>
              Diet Plans
            </button>
            <button onClick={() => setActiveStudioTab('library')} className={`px-4 py-2 rounded-2xl text-xs font-extrabold ${activeStudioTab === 'library' ? 'bg-purple-600 text-white' : 'bg-[#14171F] text-gym-subtext'}`}>
              Master Libraries
            </button>
            <button onClick={() => setActiveStudioTab('print')} className={`px-4 py-2 rounded-2xl text-xs font-extrabold ${activeStudioTab === 'print' ? 'bg-amber-500 text-gym-dark' : 'bg-[#14171F] text-gym-subtext'}`}>
              Print & Export PDF
            </button>
          </div>

          {/* Workout / Diet Content */}
          {activeStudioTab === 'workout' && (
            <div className="space-y-4">
              {workout.weeklyPlans.map((wPlan) => (
                <div key={wPlan.weekNumber} className="glass-card rounded-[28px] p-6 border border-gym-border space-y-3">
                  <h4 className="text-base font-extrabold text-white">{wPlan.weekTitle}</h4>
                  <div className="space-y-2">
                    {wPlan.splits.map((split) => (
                      <div key={split.day} className="bg-[#0B0D12] p-3 rounded-2xl border border-gym-border/60">
                        <span className="text-xs font-extrabold text-[#27D980] uppercase">{split.day}: {split.title}</span>
                        <div className="mt-2 space-y-1">
                          {split.exercises.map((ex) => (
                            <div key={ex.id} className="p-2 rounded-xl bg-[#14171F] text-xs text-white flex justify-between">
                              <span>{ex.name} ({ex.targetSets}x{ex.targetReps})</span>
                              <strong className="text-[#4F7CFF]">{ex.weightKg} kg</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeStudioTab === 'diet' && (
            <div className="space-y-4">
              {diet.monthlyPlans.map((mPlan) => (
                <div key={mPlan.monthNumber} className="glass-card rounded-[28px] p-6 border border-gym-border space-y-3">
                  <h4 className="text-base font-extrabold text-white">{mPlan.monthTitle}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map((cat) => (
                      <div key={cat} className="bg-[#0B0D12] p-3 rounded-2xl border border-gym-border/60">
                        <span className="text-xs font-extrabold text-[#4F7CFF] capitalize">{cat}</span>
                        <div className="mt-2 space-y-1 text-xs">
                          {mPlan.meals[cat].map((meal) => (
                            <div key={meal.id} className="flex justify-between text-white">
                              <span>{meal.name}</span>
                              <strong className="text-[#27D980]">{meal.calories} kcal</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeStudioTab === 'library' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-[28px] space-y-2 text-xs">
                <h3 className="font-extrabold text-white text-sm">Master Exercise Library ({MASTER_EXERCISES.length})</h3>
                {MASTER_EXERCISES.map((ex) => (
                  <div key={ex.id} className="p-2 bg-[#14171F] rounded-xl flex justify-between">
                    <span>{ex.name} ({ex.bodyPart})</span>
                    <span className="text-emerald-400">{ex.caloriesBurnedPerMin} kcal/min</span>
                  </div>
                ))}
              </div>

              <div className="glass-panel p-6 rounded-[28px] space-y-2 text-xs">
                <h3 className="font-extrabold text-white text-sm">Master Food Database ({MASTER_FOODS.length})</h3>
                {MASTER_FOODS.map((food) => (
                  <div key={food.id} className="p-2 bg-[#14171F] rounded-xl flex justify-between">
                    <span>{food.name} ({food.category})</span>
                    <span className="text-[#27D980]">{food.calories} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStudioTab === 'print' && (
            <div className="glass-panel rounded-[28px] p-6 text-center space-y-3">
              <h3 className="font-extrabold text-white text-base">Print Member Workout & Diet Card</h3>
              <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-[#27D980] text-gym-dark font-extrabold text-xs">
                <Printer className="w-4 h-4 inline mr-1" /> Print Member Card
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
