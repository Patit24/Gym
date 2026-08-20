import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { MealItem, MonthlyDietPlan } from '../../types/gym';
import { Utensils, Droplets, Check, Plus, X, Calendar, Sparkles, User } from 'lucide-react';

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
    : INITIAL_DIET.monthlyPlans;

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

  const isStaffOrAdmin = currentRole === 'Trainer' || currentRole === 'Dietitian' || currentRole === 'Super Admin' || currentRole === 'Owner';

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
      <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="font-bold text-white text-[11px]">Hydration Goal</div>
            <div className="text-cyan-300 text-[10px]">{diet.waterCurrentLiters}L of 4.0L Goal</div>
          </div>
        </div>
        <button
          onClick={() => addWaterIntake(0.25)}
          className="px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-gym-dark font-black text-[10px] flex items-center gap-1 shadow-md"
        >
          <Plus className="w-3 h-3" />
          <span>+250 ml</span>
        </button>
      </div>

      {/* Meals Category Timeline */}
      {currentMonthPlan && (['breakfast', 'lunch', 'snack', 'dinner'] as const).map((cat) => (
        <div key={cat} className="space-y-1.5">
          <h4 className="text-[11px] font-extrabold text-white capitalize border-b border-white/10 pb-0.5">
            {cat}
          </h4>

          {currentMonthPlan.meals[cat].length === 0 ? (
            <div className="text-[10px] text-gym-subtext p-2 italic">No meal items scheduled yet.</div>
          ) : (
            currentMonthPlan.meals[cat].map((meal) => (
              <div
                key={meal.id}
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                  meal.completed ? 'bg-[#0F1420]/60 border-emerald-500/30' : 'bg-[#0F1420] border-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleMealCompleted(selectedMonthNum, cat, meal.id)}
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                      meal.completed ? 'bg-emerald-400 text-gym-dark font-bold' : 'border border-white/20'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <div>
                    <h5 className={`font-extrabold text-[11px] ${meal.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                      {meal.name}
                    </h5>
                    <span className="text-[9px] text-gym-subtext">{meal.portion}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-emerald-400 text-[11px]">{meal.calories} kcal</span>
                  <div className="text-[9px] text-gym-subtext">P: {meal.proteinG}g</div>
                </div>
              </div>
            ))
          )}
        </div>
      ))}

    </div>
  );
};
