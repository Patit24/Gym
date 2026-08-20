import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Exercise, MealItem } from '../../types/gym';
import { Dumbbell, Utensils, Plus, Trash2, CheckCircle2, User, Sparkles, Send } from 'lucide-react';

export const QuickDailyPlanner: React.FC = () => {
  const { members, activeMember, setActiveMemberId, addWeeklyWorkout, addMonthlyDiet } = useGym();

  const [targetMemberId, setTargetMemberId] = useState<string>(activeMember?.id || 'MEM-2026-001');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  // Quick Exercises State
  const [exercisesList, setExercisesList] = useState<{ name: string; sets: number; reps: number; weightKg: number }[]>([
    { name: 'Barbell Bench Press', sets: 4, reps: 10, weightKg: 75 },
    { name: 'Incline Dumbbell Flyes', sets: 3, reps: 12, weightKg: 20 },
  ]);

  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState(4);
  const [newExReps, setNewExReps] = useState(10);
  const [newExWeight, setNewExWeight] = useState(40);

  // Quick Meals State
  const [mealsList, setMealsList] = useState<{ category: 'breakfast' | 'lunch' | 'snack' | 'dinner'; name: string; portion: string; calories: number; proteinG: number }[]>([
    { category: 'breakfast', name: 'Oatmeal & Whey Protein', portion: '1 Bowl + 1 Scoop', calories: 420, proteinG: 32 },
    { category: 'lunch', name: 'Grilled Chicken & Rice', portion: '200g Chicken + 200g Rice', calories: 650, proteinG: 55 },
  ]);

  const [newMealCategory, setNewMealCategory] = useState<'breakfast' | 'lunch' | 'snack' | 'dinner'>('breakfast');
  const [newMealName, setNewMealName] = useState('');
  const [newMealPortion, setNewMealPortion] = useState('1 Portion');
  const [newMealCals, setNewMealCals] = useState(350);
  const [newMealProtein, setNewMealProtein] = useState(25);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectedMemberObj = members.find((m) => m.id === targetMemberId) || activeMember;

  const handleAddExercise = () => {
    const exerciseToAdd = newExName.trim() ? newExName.trim() : `Exercise #${exercisesList.length + 1}`;
    setExercisesList((prev) => [
      ...prev,
      { name: exerciseToAdd, sets: newExSets || 4, reps: newExReps || 10, weightKg: newExWeight || 40 }
    ]);
    setNewExName('');
  };

  const handleRemoveExercise = (index: number) => {
    setExercisesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMeal = () => {
    const mealToAdd = newMealName.trim() ? newMealName.trim() : `${newMealCategory.toUpperCase()} Meal #${mealsList.length + 1}`;
    setMealsList((prev) => [
      ...prev,
      {
        category: newMealCategory,
        name: mealToAdd,
        portion: newMealPortion || '1 Portion',
        calories: newMealCals || 350,
        proteinG: newMealProtein || 25
      }
    ]);
    setNewMealName('');
  };

  const handleRemoveMeal = (index: number) => {
    setMealsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublishDailyPlan = () => {
    // 1. Publish Workout Split
    const formattedExercises: Exercise[] = exercisesList.map((ex, idx) => ({
      id: `ex-${Date.now()}-${idx}`,
      name: ex.name,
      category: 'Chest',
      targetSets: ex.sets,
      targetReps: ex.reps,
      weightKg: ex.weightKg,
      restSeconds: 60,
      completed: false,
    }));

    addWeeklyWorkout(targetMemberId, 1, `Daily Split (${selectedDay})`, [
      { day: selectedDay as any, title: `${selectedDay} Workout Split`, exercises: formattedExercises }
    ]);

    // 2. Publish Diet Plan
    const bMeals: MealItem[] = mealsList.filter((m) => m.category === 'breakfast').map((m, i) => ({ id: `mb-${i}`, name: m.name, portion: m.portion, calories: m.calories, proteinG: m.proteinG, carbsG: 20, fatG: 10, completed: false }));
    const lMeals: MealItem[] = mealsList.filter((m) => m.category === 'lunch').map((m, i) => ({ id: `ml-${i}`, name: m.name, portion: m.portion, calories: m.calories, proteinG: m.proteinG, carbsG: 30, fatG: 12, completed: false }));
    const sMeals: MealItem[] = mealsList.filter((m) => m.category === 'snack').map((m, i) => ({ id: `ms-${i}`, name: m.name, portion: m.portion, calories: m.calories, proteinG: m.proteinG, carbsG: 15, fatG: 5, completed: false }));
    const dMeals: MealItem[] = mealsList.filter((m) => m.category === 'dinner').map((m, i) => ({ id: `md-${i}`, name: m.name, portion: m.portion, calories: m.calories, proteinG: m.proteinG, carbsG: 25, fatG: 15, completed: false }));

    const totalCals = mealsList.reduce((acc, curr) => acc + curr.calories, 0);

    addMonthlyDiet(targetMemberId, {
      monthNumber: 1,
      monthTitle: `Daily Nutrition Plan (${selectedDay})`,
      targetCalories: totalCals || 2200,
      targetProteinG: 150,
      targetCarbsG: 200,
      targetFatG: 60,
      waterTargetLiters: 4.0,
      meals: { breakfast: bMeals, lunch: lMeals, snack: sMeals, dinner: dMeals }
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#4F7CFF]/20 to-[#27D980]/20 border border-[#27D980]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#27D980] text-gym-dark">
            ⚡ EASY 1-PAGE FLOW
          </span>
          <h2 className="text-xl font-black text-white mt-1">Set Daily Workout & Diet for Member</h2>
          <p className="text-xs text-gym-subtext">Select member, pick day, add exercises & meals, click Save!</p>
        </div>

        {/* Target Member Picker */}
        <div className="flex items-center gap-2 bg-[#0B0D12] p-2 rounded-2xl border border-gym-border">
          <User className="w-4 h-4 text-[#27D980]" />
          <select
            value={targetMemberId}
            onChange={(e) => {
              setTargetMemberId(e.target.value);
              setActiveMemberId(e.target.value);
            }}
            className="bg-transparent text-white font-extrabold text-xs cursor-pointer focus:outline-none"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name} ({m.goal})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Select Day */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              selectedDay === day
                ? 'bg-[#27D980] text-gym-dark shadow-lg shadow-[#27D980]/30'
                : 'bg-[#14171F] text-gym-subtext hover:text-white border border-gym-border'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* 2-Column Grid: Left Workout, Right Diet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: DAILY WORKOUT */}
        <div className="glass-card rounded-[28px] p-5 border border-gym-border space-y-4">
          <div className="flex items-center justify-between border-b border-gym-border pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#4F7CFF]" />
              1. Add Exercises for {selectedDay}
            </h3>
            <span className="text-xs text-[#4F7CFF] font-bold">{exercisesList.length} Exercises</span>
          </div>

          {/* Quick Add Form */}
          <div className="p-3 rounded-2xl bg-[#0B0D12] border border-gym-border space-y-2 text-xs">
            <input
              type="text"
              placeholder="Exercise Name (e.g. Bench Press)"
              value={newExName}
              onChange={(e) => setNewExName(e.target.value)}
              className="w-full bg-[#14171F] border border-gym-border rounded-xl px-3 py-2 text-white placeholder-slate-500"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-gym-subtext">Sets</label>
                <input type="number" value={newExSets} onChange={(e) => setNewExSets(Number(e.target.value))} className="w-full bg-[#14171F] border border-gym-border rounded-lg px-2 py-1 text-white" />
              </div>
              <div>
                <label className="block text-[10px] text-gym-subtext">Reps</label>
                <input type="number" value={newExReps} onChange={(e) => setNewExReps(Number(e.target.value))} className="w-full bg-[#14171F] border border-gym-border rounded-lg px-2 py-1 text-white" />
              </div>
              <div>
                <label className="block text-[10px] text-gym-subtext">Weight (kg)</label>
                <input type="number" value={newExWeight} onChange={(e) => setNewExWeight(Number(e.target.value))} className="w-full bg-[#14171F] border border-gym-border rounded-lg px-2 py-1 text-white" />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddExercise}
              className="w-full py-2.5 rounded-xl bg-[#4F7CFF] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-600 shadow-md cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> + Add Exercise to {selectedDay}
            </button>
          </div>

          {/* Exercises Added List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {exercisesList.length === 0 ? (
              <div className="text-center py-4 text-gym-subtext text-xs italic">No exercises added yet. Click "+ Add Exercise" above!</div>
            ) : (
              exercisesList.map((ex, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#14171F] border border-gym-border flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-extrabold text-white">{ex.name}</h4>
                    <span className="text-[10px] text-gym-subtext">{ex.sets} Sets x {ex.reps} Reps • <strong className="text-[#4F7CFF]">{ex.weightKg} kg</strong></span>
                  </div>
                  <button onClick={() => handleRemoveExercise(idx)} className="p-1.5 text-slate-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DAILY DIET */}
        <div className="glass-card rounded-[28px] p-5 border border-gym-border space-y-4">
          <div className="flex items-center justify-between border-b border-gym-border pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#27D980]" />
              2. Add Meals for {selectedDay}
            </h3>
            <span className="text-xs text-[#27D980] font-bold">{mealsList.length} Meals</span>
          </div>

          {/* Quick Add Meal Form */}
          <div className="p-3 rounded-2xl bg-[#0B0D12] border border-gym-border space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newMealCategory}
                onChange={(e) => setNewMealCategory(e.target.value as any)}
                className="bg-[#14171F] border border-gym-border rounded-xl px-2 py-1.5 text-white"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snack">Snack</option>
                <option value="dinner">Dinner</option>
              </select>
              <input
                type="text"
                placeholder="Portion (e.g. 200g Chicken)"
                value={newMealPortion}
                onChange={(e) => setNewMealPortion(e.target.value)}
                className="bg-[#14171F] border border-gym-border rounded-xl px-3 py-1.5 text-white placeholder-slate-500"
              />
            </div>

            <input
              type="text"
              placeholder="Meal Name (e.g. Oatmeal & Eggs)"
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
              className="w-full bg-[#14171F] border border-gym-border rounded-xl px-3 py-2 text-white placeholder-slate-500"
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gym-subtext">Calories (kcal)</label>
                <input type="number" value={newMealCals} onChange={(e) => setNewMealCals(Number(e.target.value))} className="w-full bg-[#14171F] border border-gym-border rounded-lg px-2 py-1 text-white" />
              </div>
              <div>
                <label className="block text-[10px] text-gym-subtext">Protein (g)</label>
                <input type="number" value={newMealProtein} onChange={(e) => setNewMealProtein(Number(e.target.value))} className="w-full bg-[#14171F] border border-gym-border rounded-lg px-2 py-1 text-white" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddMeal}
              className="w-full py-2.5 rounded-xl bg-[#27D980] text-gym-dark font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> + Add Meal to {selectedDay}
            </button>
          </div>

          {/* Meals Added List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {mealsList.length === 0 ? (
              <div className="text-center py-4 text-gym-subtext text-xs italic">No meals added yet. Click "+ Add Meal" above!</div>
            ) : (
              mealsList.map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#14171F] border border-gym-border flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-extrabold text-white capitalize">{m.category}: {m.name}</h4>
                    <span className="text-[10px] text-gym-subtext">{m.portion} • <strong className="text-[#27D980]">{m.calories} kcal</strong></span>
                  </div>
                  <button onClick={() => handleRemoveMeal(idx)} className="p-1.5 text-slate-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Success Alert */}
      {savedSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold text-center animate-bounce">
          🎉 DAILY PLAN PUBLISHED TO {(selectedMemberObj?.name || 'MEMBER').toUpperCase()}'S MOBILE APP SUCCESSFULLY!
        </div>
      )}

      {/* Large Publish Button */}
      <button
        type="button"
        onClick={handlePublishDailyPlan}
        className="w-full py-4 rounded-3xl bg-gradient-to-r from-[#4F7CFF] via-[#27D980] to-emerald-400 text-gym-dark font-black text-sm shadow-2xl shadow-[#27D980]/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
      >
        <Send className="w-5 h-5 text-gym-dark" />
        <span>SAVE & PUBLISH TODAY'S PLAN TO {(selectedMemberObj?.name || 'MEMBER').toUpperCase()}'S APP 🚀</span>
      </button>

    </div>
  );
};
