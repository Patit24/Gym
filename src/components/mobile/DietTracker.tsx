import React, { useState, useMemo } from 'react';
import { useGym } from '../../context/GymContext';
import { MealItem, MonthlyDietPlan } from '../../types/gym';
import { Utensils, Droplets, Check, Plus, X, Calendar, Sparkles, User, Lock } from 'lucide-react';
import { SubscriptionExpiredLockCard } from './SubscriptionExpiredLockCard';

import { INITIAL_DIET } from '../../data/initialData';

export const DietTracker: React.FC = () => {
  const { diet, toggleMealCompleted, addWaterIntake, addMonthlyDiet, currentRole, members, activeMember, setActiveMemberId } = useGym();
  
  const [selectedMonthNum, setSelectedMonthNum] = useState<number>(1);
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

  const monthlyPlans = (diet?.monthlyPlans && diet.monthlyPlans.length > 0)
    ? diet.monthlyPlans
    : [];

  const currentMonthPlan = monthlyPlans.find((m) => m.monthNumber === selectedMonthNum) || monthlyPlans[0];

  const allMeals = currentMonthPlan ? [
    ...currentMonthPlan.meals.breakfast,
    ...currentMonthPlan.meals.lunch,
    ...currentMonthPlan.meals.snack,
    ...currentMonthPlan.meals.dinner,
  ] : [];

  const currentCalories = allMeals.filter((m) => m.completed).reduce((a, b) => a + b.calories, 0);
  const currentProtein = allMeals.filter((m) => m.completed).reduce((a, b) => a + b.proteinG, 0);
  const currentCarbs = allMeals.filter((m) => m.completed).reduce((a, b) => a + b.carbsG, 0);
  const currentFat = allMeals.filter((m) => m.completed).reduce((a, b) => a + b.fatG, 0);

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
      }
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

  const isStaffOrAdmin = currentRole === 'Trainer' || currentRole === 'Dietitian' || currentRole === 'Super Admin' || currentRole === 'Owner';

  if (!currentMonthPlan) {
    return (
      <div className="space-y-4 text-xs animate-in fade-in">
        {isStaffOrAdmin && (
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
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-[#27D980] border border-emerald-500/30 flex items-center justify-center">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-white">No Nutrition Plan Assigned Yet</h3>
          <p className="text-xs text-gym-subtext max-w-xs">
            Your gym nutritionist or trainer will formulate your daily calorie goals, macro targets, and meal plans.
          </p>
          {isStaffOrAdmin && (
            <button
              onClick={() => setShowAddMonthModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-[#27D980] hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#27D980]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Nutrition Plan</span>
            </button>
          )}
        </div>

        {/* Add Monthly Diet Modal */}
        {showAddMonthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
            <div className="bg-[#0F1420] border border-emerald-500/40 rounded-3xl max-w-xs w-full p-4 shadow-2xl space-y-3 text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="font-extrabold text-white text-xs">Set Monthly Nutrition Plan</h4>
                <button onClick={() => setShowAddMonthModal(false)} className="text-gym-subtext"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSaveMonthlyDiet} className="space-y-2">
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
                  <label className="block text-[10px] text-gym-subtext mb-0.5">Select Month Number</label>
                  <select
                    value={newMonthNum}
                    onChange={(e) => setNewMonthNum(Number(e.target.value))}
                    className="w-full bg-[#070A10] border border-white/10 rounded-xl px-2.5 py-1.5 text-white"
                  >
                    <option value={1}>Month 1</option>
                    <option value={2}>Month 2</option>
                    <option value={3}>Month 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-0.5">Month Title / Goal</label>
                  <input
                    type="text"
                    required
                    value={newMonthTitle}
                    onChange={(e) => setNewMonthTitle(e.target.value)}
                    className="w-full bg-[#070A10] border border-white/10 rounded-xl px-2.5 py-1.5 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-gym-subtext">Calories (kcal)</label>
                    <input type="number" value={newTargetCals} onChange={(e) => setNewTargetCals(Number(e.target.value))} className="w-full bg-[#070A10] border border-white/10 rounded-lg px-2 py-1 text-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gym-subtext">Protein (g)</label>
                    <input type="number" value={newTargetProtein} onChange={(e) => setNewTargetProtein(Number(e.target.value))} className="w-full bg-[#070A10] border border-white/10 rounded-lg px-2 py-1 text-white" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-gym-dark font-black text-xs shadow-md mt-1"
                >
                  Assign Month {newMonthNum} Nutrition
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300 text-xs">
      
      {/* Target Member Selector for Dietitian / Staff */}
      {isStaffOrAdmin && (
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

      {/* Monthly Bases Selector (Month 1, Month 2, Month 3) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[1, 2, 3].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonthNum(m)}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all ${
                selectedMonthNum === m
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-gym-dark shadow-lg shadow-cyan-500/20 font-black'
                  : 'bg-[#0F1420] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              Month {m}
            </button>
          ))}
        </div>

        {/* Add Monthly Diet Button for Dietitians/Trainers */}
        {isStaffOrAdmin && (
          <button
            onClick={() => setShowAddMonthModal(true)}
            className="p-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md text-xs font-bold flex items-center gap-1 shrink-0"
            title="Set Monthly Diet for Member"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[10px]">Set Diet</span>
          </button>
        )}
      </div>

      {/* Add / Assign Monthly Diet Modal */}
      {showAddMonthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0F1420] border border-cyan-500/40 rounded-3xl max-w-xs w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="font-extrabold text-white text-xs">Set Monthly Diet via App</h4>
              <button onClick={() => setShowAddMonthModal(false)} className="text-gym-subtext"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSaveMonthlyDiet} className="space-y-2">
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
                <label className="block text-[10px] text-gym-subtext mb-0.5">Select Month Number</label>
                <select
                  value={newMonthNum}
                  onChange={(e) => setNewMonthNum(Number(e.target.value))}
                  className="w-full bg-[#070A10] border border-white/10 rounded-xl px-2.5 py-1.5 text-white"
                >
                  <option value={1}>Month 1</option>
                  <option value={2}>Month 2</option>
                  <option value={3}>Month 3</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gym-subtext mb-0.5">Month Plan Title</label>
                <input
                  type="text"
                  required
                  value={newMonthTitle}
                  onChange={(e) => setNewMonthTitle(e.target.value)}
                  className="w-full bg-[#070A10] border border-white/10 rounded-xl px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-gym-subtext">Calories Goal</label>
                  <input type="number" value={newTargetCals} onChange={(e) => setNewTargetCals(Number(e.target.value))} className="w-full bg-[#070A10] border border-white/10 rounded-lg px-2 py-1 text-white" />
                </div>
                <div>
                  <label className="block text-[9px] text-gym-subtext">Protein Goal (g)</label>
                  <input type="number" value={newTargetProtein} onChange={(e) => setNewTargetProtein(Number(e.target.value))} className="w-full bg-[#070A10] border border-white/10 rounded-lg px-2 py-1 text-white" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gym-subtext mb-0.5">Breakfast Meal Item</label>
                <input
                  type="text"
                  required
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  className="w-full bg-[#070A10] border border-white/10 rounded-xl px-2.5 py-1.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-gym-dark font-black text-xs shadow-md mt-1"
              >
                Assign Month {newMonthNum} Diet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Month Title Banner */}
      {currentMonthPlan && (
        <div className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20 flex items-center justify-between">
          <span>{currentMonthPlan.monthTitle}</span>
          <span className="text-[10px] text-gym-subtext">Month {selectedMonthNum} of 3</span>
        </div>
      )}

      {/* Macro Ring Card matching Reference Image */}
      {currentMonthPlan && (
        <div className="glass-card rounded-[24px] p-4 border border-cyan-500/30 bg-gradient-to-br from-[#0B2529] via-[#07191C] to-[#040F11] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-white flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-cyan-400" />
              Nutrition Breakdown
            </span>
            <span className="font-black text-emerald-400">{currentCalories} / {currentMonthPlan.targetCalories} kcal</span>
          </div>

          <div className="w-full bg-[#070A10] h-2 rounded-full overflow-hidden p-[1px]">
            <div
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (currentCalories / currentMonthPlan.targetCalories) * 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="p-2 rounded-2xl bg-[#070A10] border border-white/10">
              <div className="text-gym-subtext">Protein</div>
              <strong className="text-white text-xs">{currentProtein}g</strong> / {currentMonthPlan.targetProteinG}g
            </div>
            <div className="p-2 rounded-2xl bg-[#070A10] border border-white/10">
              <div className="text-gym-subtext">Carbs</div>
              <strong className="text-white text-xs">{currentCarbs}g</strong> / {currentMonthPlan.targetCarbsG}g
            </div>
            <div className="p-2 rounded-2xl bg-[#070A10] border border-white/10">
              <div className="text-gym-subtext">Fats</div>
              <strong className="text-white text-xs">{currentFat}g</strong> / {currentMonthPlan.targetFatG}g
            </div>
          </div>
        </div>
      )}

      {/* Hydration Tracker */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#0E1A33] to-[#0A1224] border border-cyan-500/30 space-y-3 text-xs shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-white text-xs">Daily Hydration</div>
              <div className="text-cyan-300 font-bold text-[10px]">
                {diet.waterCurrentLiters.toFixed(2)}L of {currentMonthPlan?.waterTargetLiters || 4.0}L Target
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono font-black text-cyan-400 text-xs">
              {Math.min(100, Math.round((diet.waterCurrentLiters / (currentMonthPlan?.waterTargetLiters || 4.0)) * 100))}%
            </span>
          </div>
        </div>

        {/* Hydration Progress Bar */}
        <div className="w-full bg-[#070A10] h-2 rounded-full overflow-hidden p-[1px]">
          <div
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (diet.waterCurrentLiters / (currentMonthPlan?.waterTargetLiters || 4.0)) * 100)}%` }}
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
              className="flex-1 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-95 text-cyan-300 hover:text-white border border-cyan-500/20 font-black text-[10px] transition-all cursor-pointer"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meals Category Timeline */}
      {currentMonthPlan && (['breakfast', 'lunch', 'snack', 'dinner'] as const).map((cat) => (
        <div key={cat} className="space-y-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-1">
            <h4 className="text-[11px] font-black text-white capitalize flex items-center gap-1.5">
              <span>{cat}</span>
              <span className="text-[9px] text-slate-400 font-normal">
                ({currentMonthPlan.meals[cat].filter(m => m.completed).length}/{currentMonthPlan.meals[cat].length} logged)
              </span>
            </h4>
            <span className="text-[9px] text-gym-subtext font-bold uppercase">
              {currentMonthPlan.meals[cat].reduce((sum, m) => sum + m.calories, 0)} kcal
            </span>
          </div>

          {currentMonthPlan.meals[cat].length === 0 ? (
            <div className="text-[10px] text-gym-subtext p-3 bg-[#0F1420]/40 rounded-2xl border border-white/5 italic text-center">
              No meal items scheduled yet.
            </div>
          ) : (
            currentMonthPlan.meals[cat].map((meal) => (
              <div
                key={meal.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                  meal.completed ? 'bg-[#0F1420]/60 border-emerald-500/30 shadow-md shadow-emerald-500/5' : 'bg-[#0F1420] border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleMealCompleted(selectedMonthNum, cat, meal.id)}
                    className={`w-6 h-6 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      meal.completed ? 'bg-emerald-400 text-gym-dark font-extrabold shadow-md' : 'border border-white/20 hover:border-cyan-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <h5 className={`font-black text-xs ${meal.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                      {meal.name}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-gym-subtext mt-0.5">
                      <span>{meal.portion}</span>
                      <span>• <strong className="text-cyan-400">P: {meal.proteinG}g</strong></span>
                      {meal.carbsG ? <span>• C: {meal.carbsG}g</span> : null}
                      {meal.fatG ? <span>• F: {meal.fatG}g</span> : null}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-emerald-400 text-xs">{meal.calories} kcal</span>
                  <div className="text-[9px] font-bold text-slate-400">{meal.completed ? 'Eaten' : 'Pending'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      ))}

    </div>
  );
};
