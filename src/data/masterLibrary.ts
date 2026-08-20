export interface MasterExercise {
  id: string;
  name: string;
  bodyPart: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';
  equipment: 'Barbell' | 'Dumbbell' | 'Cable' | 'Machine' | 'Bodyweight';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  caloriesBurnedPerMin: number;
  targetMuscle: string;
  videoUrl: string;
  defaultSets: number;
  defaultReps: number;
  defaultWeightKg: number;
  defaultRestSec: number;
  instructions: string;
}

export interface MasterFood {
  id: string;
  name: string;
  servingSize: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Supplement';
  image: string;
}

export interface PredefinedWorkoutTemplate {
  id: string;
  name: string;
  category: 'Muscle Gain' | 'Weight Loss' | 'Powerlifting' | 'CrossFit' | 'Rehab';
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  description: string;
  splits: {
    weekNumber?: number;
    dayName: string;
    dayTitle: string;
    exercises: Omit<MasterExercise, 'id'>[];
  }[];
}

export interface PredefinedDietTemplate {
  id: string;
  name: string;
  category: 'High Protein' | 'Weight Loss Veg' | 'Keto' | 'PCOS' | 'Competition Prep';
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  description: string;
  meals: {
    monthNumber?: number;
    weekNumber?: number;
    dayName?: string;
    breakfast: Omit<MasterFood, 'id'>[];
    lunch: Omit<MasterFood, 'id'>[];
    snack: Omit<MasterFood, 'id'>[];
    dinner: Omit<MasterFood, 'id'>[];
  }[];
}

export const MASTER_EXERCISES: MasterExercise[] = [
  {
    id: 'ex-barbell-bench',
    name: 'Barbell Flat Bench Press',
    bodyPart: 'Chest',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    caloriesBurnedPerMin: 9.5,
    targetMuscle: 'Pectoralis Major, Anterior Deltoids',
    videoUrl: 'https://youtube.com/watch?v=rT7DgCr-3pg',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeightKg: 80,
    defaultRestSec: 90,
    instructions: 'Maintain 3 points of contact on bench. Retract scapula and drive with legs.',
  },
  {
    id: 'ex-incline-db',
    name: 'Incline Dumbbell Press',
    bodyPart: 'Chest',
    equipment: 'Dumbbell',
    difficulty: 'Intermediate',
    caloriesBurnedPerMin: 8.5,
    targetMuscle: 'Clavicular Head Pectoralis (Upper Chest)',
    videoUrl: 'https://youtube.com/watch?v=0G2_XV7slIg',
    defaultSets: 4,
    defaultReps: 12,
    defaultWeightKg: 34,
    defaultRestSec: 75,
    instructions: 'Set bench to 30-45 degree incline. Squeeze upper chest at peak contraction.',
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Lat Pulldown Wide Grip',
    bodyPart: 'Back',
    equipment: 'Cable',
    difficulty: 'Beginner',
    caloriesBurnedPerMin: 7.0,
    targetMuscle: 'Latissimus Dorsi, Teres Major',
    videoUrl: 'https://youtube.com/watch?v=CAwf7n6Luuc',
    defaultSets: 4,
    defaultReps: 12,
    defaultWeightKg: 65,
    defaultRestSec: 60,
    instructions: 'Pull bar down to upper sternum. Avoid excessive backward lean.',
  },
  {
    id: 'ex-barbell-squat',
    name: 'Barbell High Bar Squat',
    bodyPart: 'Legs',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    caloriesBurnedPerMin: 12.0,
    targetMuscle: 'Quadriceps, Gluteus Maximus',
    videoUrl: 'https://youtube.com/watch?v=ultWZbUMPL8',
    defaultSets: 5,
    defaultReps: 8,
    defaultWeightKg: 110,
    defaultRestSec: 120,
    instructions: 'Break at hips and knees simultaneously. Depth below parallel.',
  },
  {
    id: 'ex-db-bicep-curl',
    name: 'Standing Dumbbell Alternating Curl',
    bodyPart: 'Arms',
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    caloriesBurnedPerMin: 5.5,
    targetMuscle: 'Biceps Brachii',
    videoUrl: 'https://youtube.com/watch?v=ykJmrZ5v0Oo',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 16,
    defaultRestSec: 45,
    instructions: 'Keep elbows fixed at sides. Supinate wrist as dumbbell ascends.',
  },
  {
    id: 'ex-cable-pushdown',
    name: 'Tricep Rope Pushdown',
    bodyPart: 'Arms',
    equipment: 'Cable',
    difficulty: 'Beginner',
    caloriesBurnedPerMin: 5.0,
    targetMuscle: 'Triceps Lateral & Medial Head',
    videoUrl: 'https://youtube.com/watch?v=vB5OHsJ3EME',
    defaultSets: 4,
    defaultReps: 15,
    defaultWeightKg: 25,
    defaultRestSec: 45,
    instructions: 'Flare rope apart at bottom contraction for max tricep engagement.',
  }
];

export const MASTER_FOODS: MasterFood[] = [
  {
    id: 'food-oats',
    name: 'Rolled Whole Oats',
    servingSize: '100g Dry',
    calories: 389,
    proteinG: 13,
    carbsG: 66,
    fatG: 6.9,
    fiberG: 10.6,
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'food-whey',
    name: 'Gold Standard Isolate Whey Protein',
    servingSize: '1 Scoop (30g)',
    calories: 120,
    proteinG: 24,
    carbsG: 2,
    fatG: 1.0,
    fiberG: 0,
    category: 'Supplement',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'food-chicken',
    name: 'Boneless Grilled Chicken Breast',
    servingSize: '200g Cooked',
    calories: 330,
    proteinG: 62,
    carbsG: 0,
    fatG: 7.2,
    fiberG: 0,
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'food-rice',
    name: 'Brown Jasmine Steamed Rice',
    servingSize: '200g Cooked',
    calories: 250,
    proteinG: 5.5,
    carbsG: 53,
    fatG: 1.8,
    fiberG: 3.5,
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'food-egg',
    name: 'Whole Boiled Organic Eggs',
    servingSize: '3 Whole Eggs',
    calories: 215,
    proteinG: 18,
    carbsG: 1.2,
    fatG: 15,
    fiberG: 0,
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'food-paneer',
    name: 'Fresh Low Fat Cottage Cheese (Paneer)',
    servingSize: '150g Raw',
    calories: 290,
    proteinG: 27,
    carbsG: 4.5,
    fatG: 18,
    fiberG: 0,
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop&q=80',
  }
];

export const WORKOUT_TEMPLATES: PredefinedWorkoutTemplate[] = [
  {
    id: 'tmpl-w1',
    name: 'Muscle Gain 4-Week Overload (Hypertrophy)',
    category: 'Muscle Gain',
    frequency: 'Monthly',
    description: '4-Week progressive overload protocol increasing volume and intensity each week.',
    splits: [
      {
        weekNumber: 1,
        dayName: 'Monday',
        dayTitle: 'Week 1: Chest & Triceps Adaptation',
        exercises: [MASTER_EXERCISES[0], MASTER_EXERCISES[1], MASTER_EXERCISES[5]],
      },
      {
        weekNumber: 2,
        dayName: 'Monday',
        dayTitle: 'Week 2: Heavy Load Chest Press',
        exercises: [MASTER_EXERCISES[0], MASTER_EXERCISES[3]],
      }
    ]
  },
  {
    id: 'tmpl-w2',
    name: 'Fat Loss & HIIT Circuit',
    category: 'Weight Loss',
    frequency: 'Weekly',
    description: 'High calorie burn weekly circuit targeting fat loss and metabolic conditioning.',
    splits: [
      {
        dayName: 'Monday',
        dayTitle: 'Legs & Cardio Burn',
        exercises: [MASTER_EXERCISES[3], MASTER_EXERCISES[2]],
      }
    ]
  }
];

export const DIET_TEMPLATES: PredefinedDietTemplate[] = [
  {
    id: 'tmpl-d1',
    name: 'High Protein Lean Muscle Gain (2850 kcal)',
    category: 'High Protein',
    frequency: 'Monthly',
    targetCalories: 2850,
    targetProteinG: 185,
    targetCarbsG: 310,
    targetFatG: 75,
    description: 'Clean bulking diet with 2.3g/kg protein target for optimal protein synthesis.',
    meals: [
      {
        monthNumber: 1,
        dayName: 'Monday',
        breakfast: [MASTER_FOODS[0], MASTER_FOODS[1], MASTER_FOODS[4]],
        lunch: [MASTER_FOODS[2], MASTER_FOODS[3]],
        snack: [MASTER_FOODS[1]],
        dinner: [MASTER_FOODS[5]],
      }
    ]
  },
  {
    id: 'tmpl-d2',
    name: 'Keto Fat Burn Shred (1900 kcal)',
    category: 'Keto',
    frequency: 'Weekly',
    targetCalories: 1900,
    targetProteinG: 160,
    targetCarbsG: 25,
    targetFatG: 120,
    description: 'Ketogenic low carb protocol designed for deep fat burning and stable energy.',
    meals: [
      {
        dayName: 'Monday',
        breakfast: [MASTER_FOODS[4]],
        lunch: [MASTER_FOODS[2]],
        snack: [],
        dinner: [MASTER_FOODS[5]],
      }
    ]
  }
];
