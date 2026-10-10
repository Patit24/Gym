import { MonthlyDietPlan, WeeklyDietPlan, DailyDietPlan, MealItem } from '../types/gym';

const DAYS_OF_WEEK = [
  { dayNumber: 1, dayName: 'Monday', title: 'High Protein Ignition' },
  { dayNumber: 2, dayName: 'Tuesday', title: 'Lean Fuel & Endurance' },
  { dayNumber: 3, dayName: 'Wednesday', title: 'Mid-Week Muscle Rebuild' },
  { dayNumber: 4, dayName: 'Thursday', title: 'Carb-Controlled Power' },
  { dayNumber: 5, dayName: 'Friday', title: 'Peak Anabolic Nutrition' },
  { dayNumber: 6, dayName: 'Saturday', title: 'Weekend Clean Surplus' },
  { dayNumber: 7, dayName: 'Sunday', title: 'Recovery & Micronutrient Reset' },
];

export const createDefaultDailyMeals = (monthNum: number, weekNum: number, dayNum: number): {
  breakfast: MealItem[];
  lunch: MealItem[];
  snack: MealItem[];
  dinner: MealItem[];
} => {
  const prefix = `m${monthNum}-w${weekNum}-d${dayNum}`;
  
  if (dayNum % 2 === 1) {
    return {
      breakfast: [
        {
          id: `${prefix}-bf-1`,
          name: 'Oatmeal with Whey Protein & Banana',
          portion: '80g Oats + 1 Scoop Whey + 1 Banana',
          calories: 480,
          proteinG: 36,
          carbsG: 20,
          fatG: 10,
          completed: false,
        },
        {
          id: `${prefix}-bf-2`,
          name: 'Boiled Eggs / Egg Whites',
          portion: '3 Whole Eggs + 2 Whites',
          calories: 280,
          proteinG: 24,
          carbsG: 20,
          fatG: 10,
          completed: false,
        },
      ],
      lunch: [
        {
          id: `${prefix}-lu-1`,
          name: 'Grilled Chicken Breast with White Rice',
          portion: '200g Chicken + 200g Steamed Rice',
          calories: 620,
          proteinG: 55,
          carbsG: 30,
          fatG: 12,
          completed: false,
        },
        {
          id: `${prefix}-lu-2`,
          name: 'Steamed Broccoli & Green Salad',
          portion: '150g Fresh Greens + 1 tsp Olive Oil',
          calories: 90,
          proteinG: 4,
          carbsG: 12,
          fatG: 4,
          completed: false,
        },
      ],
      snack: [
        {
          id: `${prefix}-sn-1`,
          name: 'Greek Yogurt with Almonds & Berries',
          portion: '200g Low Fat Greek Yogurt + 15g Almonds',
          calories: 290,
          proteinG: 22,
          carbsG: 18,
          fatG: 8,
          completed: false,
        },
        {
          id: `${prefix}-sn-2`,
          name: 'Protein Shake with Peanut Butter',
          portion: '1 Scoop Whey Isolate + 1 tbsp Peanut Butter',
          calories: 260,
          proteinG: 32,
          carbsG: 8,
          fatG: 9,
          completed: false,
        },
      ],
      dinner: [
        {
          id: `${prefix}-dn-1`,
          name: 'Grilled Salmon Fillet / Low-Fat Paneer',
          portion: '180g Salmon or 200g Low-Fat Paneer',
          calories: 420,
          proteinG: 46,
          carbsG: 12,
          fatG: 18,
          completed: false,
        },
        {
          id: `${prefix}-dn-2`,
          name: 'Quinoa & Sautéed Asparagus',
          portion: '100g Cooked Quinoa + Steamed Asparagus',
          calories: 160,
          proteinG: 8,
          carbsG: 30,
          fatG: 4,
          completed: false,
        },
      ],
    };
  } else {
    return {
      breakfast: [
        {
          id: `${prefix}-bf-1`,
          name: 'Scrambled Eggs with Multigrain Toast',
          portion: '4 Egg Whites + 2 Whole Eggs + 2 Slices Toast',
          calories: 460,
          proteinG: 34,
          carbsG: 28,
          fatG: 12,
          completed: false,
        },
        {
          id: `${prefix}-bf-2`,
          name: 'Chia Seed & Mixed Berry Smoothie',
          portion: '250ml Almond Milk + 1 tbsp Chia + Berries',
          calories: 240,
          proteinG: 18,
          carbsG: 24,
          fatG: 8,
          completed: false,
        },
      ],
      lunch: [
        {
          id: `${prefix}-lu-1`,
          name: 'Lean Beef Steak / Tofu Bowl with Sweet Potato',
          portion: '200g Lean Steak or 250g Tofu + 150g Sweet Potato',
          calories: 640,
          proteinG: 52,
          carbsG: 38,
          fatG: 14,
          completed: false,
        },
        {
          id: `${prefix}-lu-2`,
          name: 'Cucumber Tomato Herb Salad',
          portion: '1 Large Bowl + Lemon Dressing',
          calories: 80,
          proteinG: 3,
          carbsG: 10,
          fatG: 2,
          completed: false,
        },
      ],
      snack: [
        {
          id: `${prefix}-sn-1`,
          name: 'Whey Protein Isolate & Apple',
          portion: '1 Scoop Whey + 1 Medium Apple',
          calories: 250,
          proteinG: 28,
          carbsG: 22,
          fatG: 3,
          completed: false,
        },
        {
          id: `${prefix}-sn-2`,
          name: 'Handful of Mixed Roasted Walnuts',
          portion: '25g Raw Walnuts',
          calories: 180,
          proteinG: 6,
          carbsG: 4,
          fatG: 17,
          completed: false,
        },
      ],
      dinner: [
        {
          id: `${prefix}-dn-1`,
          name: 'Herb Crusted Turkey / Soya Chunk Curry',
          portion: '200g Lean Turkey Breast or 100g Soya Chunks',
          calories: 450,
          proteinG: 48,
          carbsG: 16,
          fatG: 12,
          completed: false,
        },
        {
          id: `${prefix}-dn-2`,
          name: 'Steamed Brown Rice & Zucchini',
          portion: '120g Brown Rice + Grilled Zucchini',
          calories: 180,
          proteinG: 6,
          carbsG: 36,
          fatG: 3,
          completed: false,
        },
      ],
    };
  }
};

export const generateDefaultWeeklyPlans = (monthNum: number): WeeklyDietPlan[] => {
  return [1, 2, 3, 4].map((weekNum) => {
    const days: DailyDietPlan[] = DAYS_OF_WEEK.map((d) => ({
      dayNumber: d.dayNumber,
      dayName: d.dayName,
      dayTitle: `${d.dayName} — ${d.title}`,
      targetCalories: 2600,
      targetProteinG: 189,
      targetCarbsG: 180,
      targetFatG: 84,
      isCompleted: false,
      meals: createDefaultDailyMeals(monthNum, weekNum, d.dayNumber),
    }));

    return {
      weekNumber: weekNum,
      weekTitle: `Week ${weekNum}: Phase ${weekNum} Metabolic Protocol`,
      isCompleted: false,
      days,
    };
  });
};

export const generateDefaultMonthlyPlans = (): MonthlyDietPlan[] => {
  return [
    {
      monthNumber: 1,
      monthTitle: 'Custom Nutrition & Macro Plan',
      targetCalories: 2600,
      targetProteinG: 189,
      targetCarbsG: 180,
      targetFatG: 84,
      waterTargetLiters: 4.5,
      isCompleted: false,
      weeks: generateDefaultWeeklyPlans(1),
      meals: createDefaultDailyMeals(1, 1, 1),
    },
    {
      monthNumber: 2,
      monthTitle: 'Lean Hypertrophy & Fat Shred Plan',
      targetCalories: 2450,
      targetProteinG: 195,
      targetCarbsG: 160,
      targetFatG: 75,
      waterTargetLiters: 4.5,
      isCompleted: false,
      weeks: generateDefaultWeeklyPlans(2),
      meals: createDefaultDailyMeals(2, 1, 1),
    },
    {
      monthNumber: 3,
      monthTitle: 'Competition Definition & Conditioning',
      targetCalories: 2300,
      targetProteinG: 200,
      targetCarbsG: 140,
      targetFatG: 68,
      waterTargetLiters: 5.0,
      isCompleted: false,
      weeks: generateDefaultWeeklyPlans(3),
      meals: createDefaultDailyMeals(3, 1, 1),
    },
  ];
};

/**
 * Ensures any existing monthly plan has fully initialized weeks and 7 days.
 */
export const normalizeMonthlyPlans = (existingPlans?: MonthlyDietPlan[]): MonthlyDietPlan[] => {
  if (!existingPlans || existingPlans.length === 0) {
    return generateDefaultMonthlyPlans();
  }

  return existingPlans.map((mp) => {
    let weeks = mp.weeks;
    if (!weeks || weeks.length === 0) {
      weeks = generateDefaultWeeklyPlans(mp.monthNumber || 1);
    } else {
      // Ensure all 4 weeks exist and each week has 7 days
      weeks = [1, 2, 3, 4].map((wNum) => {
        const existingWeek = weeks?.find((w) => w.weekNumber === wNum);
        if (existingWeek && existingWeek.days && existingWeek.days.length === 7) {
          return existingWeek;
        }

        const days: DailyDietPlan[] = DAYS_OF_WEEK.map((d) => {
          const existingDay = existingWeek?.days?.find((day) => day.dayNumber === d.dayNumber);
          if (existingDay && existingDay.meals) {
            return existingDay;
          }
          return {
            dayNumber: d.dayNumber,
            dayName: d.dayName,
            dayTitle: `${d.dayName} — ${d.title}`,
            targetCalories: mp.targetCalories || 2600,
            targetProteinG: mp.targetProteinG || 189,
            targetCarbsG: mp.targetCarbsG || 180,
            targetFatG: mp.targetFatG || 84,
            isCompleted: false,
            meals: createDefaultDailyMeals(mp.monthNumber || 1, wNum, d.dayNumber),
          };
        });

        const isWeekDone = days.length === 7 && days.every((d) => d.isCompleted);

        return {
          weekNumber: wNum,
          weekTitle: existingWeek?.weekTitle || `Week ${wNum}: Progressive Diet Protocol`,
          isCompleted: isWeekDone,
          days,
        };
      });
    }

    const isMonthDone = weeks.length === 4 && weeks.every((w) => w.isCompleted);

    return {
      ...mp,
      weeks,
      isCompleted: isMonthDone,
    };
  });
};
