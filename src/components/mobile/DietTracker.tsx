import React, { useState, useMemo } from 'react';
import { useGym } from '../../context/GymContext';
import { MealItem, MonthlyDietPlan, WeeklyDietPlan, DailyDietPlan } from '../../types/gym';
import {
  Utensils,
  Droplets,
  Check,
  Plus,
  X,
  Calendar,
  Sparkles,
  User,
  Lock,
  Flame,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SubscriptionExpiredLockCard } from './SubscriptionExpiredLockCard';
import { normalizeMonthlyPlans } from '../../data/defaultDietPlans';

export const DietTracker: React.FC = () => {
  const {
    diet,
    toggleMealCompleted,
    toggleDayCompleted,
    addWaterIntake,
    addMonthlyDiet,
    currentRole,
    members,
    activeMember,
    setActiveMemberId,
  } = useGym();

  const [selectedMonthNum, setSelectedMonthNum] = useState<number>(1);
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [showAddMonthModal, setShowAddMonthModal] = useState(false);

  // Dietitian/Admin Add Monthly Diet State
  const [targetMemberId, setTargetMemberId] = useState<string>(activeMember?.id || 'MEM-2026-001');
  const [newMonthNum, setNewMonthNum] = useState<number>(2);
  const [newMonthTitle, setNewMonthTitle] = useState('Month 2: Lean Cut & Fat Shred');
  const [newTargetCals, setNewTargetCals] = useState(2450);
  const [newTargetProtein, setNewTargetProtein] = useState(195);
  const [newTargetCarbs, setNewTargetCarbs] = useState(220);
  const [newTargetFat, setNewTargetFat] = useState(65);

  const [newMealName, setNewMealName] = useState('Egg White Omelet & Avocado');
  const [newMealPortion, setNewMealPortion] = useState('5 Whites + 1/2 Avocado');
  const [newMealCals, setNewMealCals] = useState(380);
  const [newMealProtein, setNewMealProtein] = useState(35);

  // Normalize monthly plans to guarantee 3 months, 4 weeks, and 7 days
  const monthlyPlans: MonthlyDietPlan[] = useMemo(() => {
    return normalizeMonthlyPlans(diet?.monthlyPlans);
  }, [diet?.monthlyPlans]);

  const currentMonthPlan = monthlyPlans.find((m) => m.monthNumber === selectedMonthNum) || monthlyPlans[0];
  const currentWeekPlan = currentMonthPlan?.weeks?.find((w) => w.weekNumber === selectedWeekNum) || currentMonthPlan?.weeks?.[0];
  const currentDayPlan = currentWeekPlan?.days?.find((d) => d.dayNumber === selectedDayNum) || currentWeekPlan?.days?.[0];

  // Meals for the selected day
  const dayMeals = currentDayPlan?.meals || currentMonthPlan?.meals || {
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: [],
  };

  const allMealsInCurrentDay = [
    ...(dayMeals.breakfast || []),
    ...(dayMeals.lunch || []),
    ...(dayMeals.snack || []),
    ...(dayMeals.dinner || []),
  ];

  const currentCalories = allMealsInCurrentDay.filter((m) => m.completed).reduce((a, b) => a + b.calories, 0);
  const currentProtein = allMealsInCurrentDay.filter((m) => m.completed).reduce((a, b) => a + b.proteinG, 0);
  const currentCarbs = allMealsInCurrentDay.filter((m) => m.completed).reduce((a, b) => a + b.carbsG, 0);
  const currentFat = allMealsInCurrentDay.filter((m) => m.completed).reduce((a, b) => a + b.fatG, 0);

  const targetDayCalories = currentDayPlan?.targetCalories || currentMonthPlan?.targetCalories || 2600;
  const targetDayProtein = currentDayPlan?.targetProteinG || currentMonthPlan?.targetProteinG || 189;
  const targetDayCarbs = currentDayPlan?.targetCarbsG || currentMonthPlan?.targetCarbsG || 180;
  const targetDayFat = currentDayPlan?.targetFatG || currentMonthPlan?.targetFatG || 84;

  // Weekly Completion Calculations
  const completedDaysInWeek = currentWeekPlan?.days?.filter((d) => d.isCompleted).length || 0;
  const isWeekComplete = completedDaysInWeek === 7;
  const daysRemainingInWeek = 7 - completedDaysInWeek;

  // Monthly Completion Calculations
  const completedWeeksInMonth = currentMonthPlan?.weeks?.filter((w) => w.isCompleted).length || 0;
  const totalCompletedDaysInMonth = currentMonthPlan?.weeks?.flatMap((w) => w.days).filter((d) => d.isCompleted).length || 0;

  const handleSaveMonthlyDiet = (e: React.FormEvent) => {
    e.preventDefault();
    const newMeal: MealItem = {
      id: `m-${Date.now()}`,
      name: newMealName,
      portion: newMealPortion,
      calories: newMealCals,
      proteinG: newMealProtein,
      carbsG: 10,
      fatG: 15,
      completed: false,
    };

    const newMonthPlan: MonthlyDietPlan = {
      monthNumber: newMonthNum,
      monthTitle: newMonthTitle,
      targetCalories: newTargetCals,
      targetProteinG: newTargetProtein,
      targetCarbsG: newTargetCarbs,
      targetFatG: newTargetFat,
      waterTargetLiters: 4.5,
      meals: {
        breakfast: [newMeal],
        lunch: [],
        snack: [],
        dinner: [],
      },
    };

    addMonthlyDiet(targetMemberId, newMonthPlan);
    setShowAddMonthModal(false);
  };

  const isSubscriptionExpired = useMemo(() => {
    if (currentRole !== 'Member') return false;
    if (!activeMember) return false;
    if (activeMember.status === 'Expired' || activeMember.status === 'Cancelled' || activeMember.status === 'Suspended') return true;
    if (activeMember.expiryDate || activeMember.endDate) {
      const expDate = new Date(activeMember.expiryDate || activeMember.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return expDate < today;
    }
    return false;
  }, [activeMember, currentRole]);

  if (isSubscriptionExpired) {
    return <SubscriptionExpiredLockCard featureName="Diet & Nutrition Chart" />;
  }

  const isStaffOrAdmin =
    currentRole === 'Trainer' ||
    currentRole === 'Dietitian' ||
    currentRole === 'Super Admin' ||
    currentRole === 'Owner' ||
    currentRole === 'Branch Manager';

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300 text-xs">
      {/* Target Member Selector for Dietitian / Staff */}
      {isStaffOrAdmin && activeMember && (
        <div className="bg-[#0F1420] p-2.5 rounded-2xl border border-white/10 flex items-center justify-between shadow-md">
          <span className="text-slate-400 font-extrabold flex items-center gap-1.5 text-xs">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            Target Member:
          </span>
          <select
            value={activeMember.id}
            onChange={(e) => setActiveMemberId(e.target.value)}
            className="bg-[#070A10] text-cyan-400 font-extrabold px-2.5 py-1 rounded-xl border border-cyan-500/30 focus:outline-none cursor-pointer text-xs"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.goal})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── 1. MONTHLY TABS (Month 1, Month 2, Month 3) ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[1, 2, 3].map((m) => {
            const mPlan = monthlyPlans.find((p) => p.monthNumber === m);
            const mWeeksDone = mPlan?.weeks?.filter((w) => w.isCompleted).length || 0;

            return (
              <button
                key={m}
                onClick={() => setSelectedMonthNum(m)}
                className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedMonthNum === m
                    ? 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-black shadow-lg shadow-cyan-500/25 font-black scale-100'
                    : 'bg-[#0E1322] text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <span>Month {m}</span>
                {mWeeksDone > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${selectedMonthNum === m ? 'bg-black/20 text-black font-extrabold' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                    {mWeeksDone}/4 W
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Add Monthly Diet Button for Dietitians/Trainers */}
        {isStaffOrAdmin && (
          <button
            onClick={() => setShowAddMonthModal(true)}
            className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-all active:scale-95"
            title="Set Custom Monthly Diet"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[10px]">Set Diet</span>
          </button>
        )}
      </div>

      {/* Month Title Banner */}
      <div className="text-xs font-bold text-cyan-400 bg-gradient-to-r from-cyan-950/40 via-[#0B1528] to-[#07090E] px-3.5 py-2 rounded-2xl border border-cyan-500/20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-extrabold text-white text-xs">{currentMonthPlan?.monthTitle || 'Custom Nutrition & Macro Plan'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-mono font-bold">Month {selectedMonthNum} of 3</span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            {totalCompletedDaysInMonth}/28 Days
          </span>
        </div>
      </div>

      {/* ── 2. WEEKLY TABS (Week 1, Week 2, Week 3, Week 4) ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-cyan-400" />
            Select Week (4-Week Cycle)
          </span>
          <span className="text-[9px] font-bold text-slate-400">
            {completedWeeksInMonth}/4 Weeks Completed
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((wNum) => {
            const wPlan = currentMonthPlan?.weeks?.find((w) => w.weekNumber === wNum);
            const wDaysDone = wPlan?.days?.filter((d) => d.isCompleted).length || 0;
            const isWkDone = wDaysDone === 7;
            const isSelected = selectedWeekNum === wNum;

            return (
              <button
                key={wNum}
                onClick={() => setSelectedWeekNum(wNum)}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#101C33] border-cyan-400 shadow-md shadow-cyan-500/15'
                    : isWkDone
                    ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-400/50'
                    : 'bg-[#0E1322] border-white/10 hover:border-white/20'
                }`}
              >
                <span className={`text-[11px] font-black ${isSelected ? 'text-cyan-300' : isWkDone ? 'text-emerald-400' : 'text-slate-200'}`}>
                  Week {wNum}
                </span>
                <span className={`text-[9px] font-bold mt-0.5 flex items-center gap-0.5 ${isWkDone ? 'text-emerald-400' : isSelected ? 'text-cyan-400' : 'text-slate-400'}`}>
                  {isWkDone ? (
                    <>
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>7/7 Done</span>
                    </>
                  ) : (
                    <span>{wDaysDone}/7 Days</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. DAILY 7-DAY SELECTOR STRIP (Day 1..7 / Mon..Sun) ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            7-Day Daily Diet Schedule
          </span>
          <span className="text-[9px] font-bold text-cyan-300">
            Week {selectedWeekNum} • {completedDaysInWeek}/7 Days Ticked
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {(currentWeekPlan?.days || []).map((day) => {
            const isDaySelected = selectedDayNum === day.dayNumber;
            const isDayDone = day.isCompleted;

            return (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDayNum(day.dayNumber)}
                className={`py-2 px-1 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                  isDaySelected
                    ? 'bg-gradient-to-b from-cyan-500/25 to-[#0B1528] border-cyan-400 shadow-md shadow-cyan-500/20'
                    : isDayDone
                    ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#0E1322] border-white/10 hover:border-white/20 text-slate-300'
                }`}
              >
                <span className={`text-[9px] font-black uppercase ${isDaySelected ? 'text-cyan-300' : isDayDone ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {day.dayName.slice(0, 3)}
                </span>
                <span className={`text-xs font-black mt-0.5 ${isDaySelected ? 'text-white' : isDayDone ? 'text-emerald-300' : 'text-slate-200'}`}>
                  D{day.dayNumber}
                </span>

                {/* Status Dot / Check */}
                <div className="mt-1">
                  {isDayDone ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. WEEK & DAY COMPLETION STATUS BANNER ── */}
      {isWeekComplete ? (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#0B251F] to-[#0E1322] border border-emerald-500/50 shadow-lg shadow-emerald-500/10 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                <span>Week {selectedWeekNum} Diet 100% Completed!</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full uppercase font-extrabold">
                  Auto Completed
                </span>
              </h4>
              <p className="text-[10px] text-slate-300 mt-0.5">All 7 days of daily nutrition logged with perfect adherence.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-[#0E1424] border border-white/10 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${currentDayPlan?.isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
              {currentDayPlan?.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>{currentDayPlan?.dayName} (Day {selectedDayNum})</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${currentDayPlan?.isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}`}>
                  {currentDayPlan?.isCompleted ? 'Day Complete' : 'Not Completed'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {currentDayPlan?.isCompleted
                  ? 'All meals ticked for this day. Complete remaining days to auto-complete week!'
                  : `${daysRemainingInWeek} days remaining in Week ${selectedWeekNum} to auto-complete week diet.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleDayCompleted(selectedMonthNum, selectedWeekNum, selectedDayNum)}
            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0 ${
              currentDayPlan?.isCompleted
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                : 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-black shadow-md'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{currentDayPlan?.isCompleted ? 'Untick Day' : 'Complete Day'}</span>
          </button>
        </div>
      )}

      {/* ── 5. NUTRITION BREAKDOWN CARD (Matching Uploaded Screenshot) ── */}
      <div className="glass-card rounded-[24px] p-4 border border-cyan-500/30 bg-gradient-to-br from-[#0B2529] via-[#07191C] to-[#040F11] space-y-3 shadow-xl">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-white flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-cyan-400" />
            <span>Nutrition Breakdown</span>
          </span>
          <span className="font-black text-emerald-400 text-xs">
            {currentCalories} / {targetDayCalories} kcal
          </span>
        </div>

        {/* Dynamic Macro Progress Bar */}
        <div className="w-full bg-[#070A10] h-2 rounded-full overflow-hidden p-[1px]">
          <div
            className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (currentCalories / (targetDayCalories || 2600)) * 100)}%` }}
          />
        </div>

        {/* 3 Bento Macro Cards */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="p-2.5 rounded-2xl bg-[#070A10] border border-white/10">
            <div className="text-slate-400 font-bold">Protein</div>
            <div className="mt-0.5">
              <strong className="text-white text-xs font-black">{currentProtein}g</strong>
              <span className="text-slate-400 text-[10px]"> / {targetDayProtein}g</span>
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#070A10] border border-white/10">
            <div className="text-slate-400 font-bold">Carbs</div>
            <div className="mt-0.5">
              <strong className="text-white text-xs font-black">{currentCarbs}g</strong>
              <span className="text-slate-400 text-[10px]"> / {targetDayCarbs}g</span>
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#070A10] border border-white/10">
            <div className="text-slate-400 font-bold">Fats</div>
            <div className="mt-0.5">
              <strong className="text-white text-xs font-black">{currentFat}g</strong>
              <span className="text-slate-400 text-[10px]"> / {targetDayFat}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. DAILY HYDRATION CARD (Matching Uploaded Screenshot) ── */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#0E1A33] to-[#0A1224] border border-cyan-500/30 space-y-3 text-xs shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-white text-xs">Daily Hydration</div>
              <div className="text-cyan-300 font-bold text-[10px]">
                {diet.waterCurrentLiters.toFixed(2)}L of {currentMonthPlan?.waterTargetLiters || 4.5}L Target
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono font-black text-cyan-400 text-xs">
              {Math.min(100, Math.round((diet.waterCurrentLiters / (currentMonthPlan?.waterTargetLiters || 4.5)) * 100))}%
            </span>
          </div>
        </div>

        {/* Hydration Progress Bar */}
        <div className="w-full bg-[#070A10] h-2 rounded-full overflow-hidden p-[1px]">
          <div
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (diet.waterCurrentLiters / (currentMonthPlan?.waterTargetLiters || 4.5)) * 100)}%` }}
          />
        </div>

        {/* Quick Log Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {[
            { label: '+250ml', val: 0.25 },
            { label: '+500ml', val: 0.5 },
            { label: '+750ml', val: 0.75 },
            { label: '+1.0L', val: 1.0 },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => addWaterIntake(btn.val)}
              className="flex-1 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-95 text-cyan-300 hover:text-white border border-cyan-500/20 font-black text-[10px] transition-all cursor-pointer"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 7. MEALS CATEGORY TIMELINE (Breakfast, Lunch, Snack, Dinner) ── */}
      {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map((cat) => {
        const catMeals = dayMeals[cat] || [];
        const completedCatCount = catMeals.filter((m) => m.completed).length;
        const catTotalCals = catMeals.reduce((sum, m) => sum + m.calories, 0);

        return (
          <div key={cat} className="space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-1 px-1">
              <h4 className="text-xs font-black text-white capitalize flex items-center gap-1.5">
                <span>{cat}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({completedCatCount}/{catMeals.length} Logged)
                </span>
              </h4>
              <span className="text-[10px] text-slate-400 font-black uppercase">
                {catTotalCals} KCAL
              </span>
            </div>

            {catMeals.length === 0 ? (
              <div className="text-[10px] text-slate-400 p-3 bg-[#0F1420]/40 rounded-2xl border border-white/5 italic text-center">
                No {cat} meals scheduled for {currentDayPlan?.dayName}.
              </div>
            ) : (
              catMeals.map((meal) => (
                <div
                  key={meal.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    meal.completed
                      ? 'bg-[#0E1B1B]/80 border-emerald-500/30 shadow-md shadow-emerald-500/5'
                      : 'bg-[#0E1322] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <button
                      onClick={() =>
                        toggleMealCompleted(
                          selectedMonthNum,
                          selectedWeekNum,
                          selectedDayNum,
                          cat,
                          meal.id
                        )
                      }
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        meal.completed
                          ? 'bg-emerald-400 text-black font-black shadow-md'
                          : 'border-2 border-slate-600 hover:border-cyan-400 bg-[#070A10]'
                      }`}
                      title={meal.completed ? 'Mark as Not Eaten' : 'Mark as Eaten'}
                    >
                      {meal.completed && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                    <div className="min-w-0">
                      <h5 className={`font-black text-xs truncate ${meal.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {meal.name}
                      </h5>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <span className="truncate">{meal.portion}</span>
                        <span>•</span>
                        <span><strong className="text-cyan-400">P: {meal.proteinG}g</strong></span>
                        {meal.carbsG !== undefined && <span>• C: {meal.carbsG}g</span>}
                        {meal.fatG !== undefined && <span>• F: {meal.fatG}g</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-emerald-400 text-xs">{meal.calories} kcal</span>
                    <div className={`text-[9.5px] font-bold ${meal.completed ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {meal.completed ? 'Eaten' : 'Pending'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      })}

      {/* ── 8. ADD / ASSIGN MONTHLY DIET MODAL (STAFF / DIETITIAN) ── */}
      {showAddMonthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0F1420] border border-cyan-500/40 rounded-3xl max-w-xs w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="font-extrabold text-white text-xs">Set Monthly Diet Plan</h4>
              <button onClick={() => setShowAddMonthModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMonthlyDiet} className="space-y-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Select Gym Member</label>
                <select
                  value={targetMemberId}
                  onChange={(e) => setTargetMemberId(e.target.value)}
                  className="w-full bg-[#070A10] border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.membershipNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Select Month Number</label>
                <select
                  value={newMonthNum}
                  onChange={(e) => setNewMonthNum(Number(e.target.value))}
                  className="w-full bg-[#070A10] border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs"
                >
                  <option value={1}>Month 1</option>
                  <option value={2}>Month 2</option>
                  <option value={3}>Month 3</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Month Plan Title</label>
                <input
                  type="text"
                  required
                  value={newMonthTitle}
                  onChange={(e) => setNewMonthTitle(e.target.value)}
                  className="w-full bg-[#070A10] border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-slate-400">Calories Goal</label>
                  <input
                    type="number"
                    value={newTargetCals}
                    onChange={(e) => setNewTargetCals(Number(e.target.value))}
                    className="w-full bg-[#070A10] border border-white/10 rounded-lg px-2 py-1 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400">Protein Goal (g)</label>
                  <input
                    type="number"
                    value={newTargetProtein}
                    onChange={(e) => setNewTargetProtein(Number(e.target.value))}
                    className="w-full bg-[#070A10] border border-white/10 rounded-lg px-2 py-1 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Breakfast Meal Item</label>
                <input
                  type="text"
                  required
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  className="w-full bg-[#070A10] border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-black text-xs shadow-md mt-1 cursor-pointer active:scale-98"
              >
                Assign Month {newMonthNum} Diet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
