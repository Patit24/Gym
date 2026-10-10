import React, { useState, useMemo, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { Member, GoalType, Exercise, DailyWorkoutSplit, MealItem, MonthlyDietPlan, Employee, BranchId } from '../../types/gym';
import { MobileAppHeader } from './MobileAppHeader';
import { MobileBottomNav, MobileNavTab } from './MobileBottomNav';
import { PrivilegePassCard } from '../shared/PrivilegePassCard';
import { TrainerCollectPaymentModal } from '../trainer/TrainerCollectPaymentModal';
import { TrainerAddExpenseModal } from '../trainer/TrainerAddExpenseModal';
import {
  Home,
  Users,
  Dumbbell,
  Calendar,
  Layers,
  UserPlus,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  LogOut,
  Clock,
  Phone,
  Mail,
  Scale,
  Flame,
  Award,
  ChevronRight,
  Check,
  Send,
  Plus,
  Trash2,
  Utensils,
  Brain,
  Coffee,
  Sun,
  Moon,
  Cookie,
  CreditCard,
  Receipt,
  DollarSign,
  CalendarRange,
  Hash
} from 'lucide-react';

type Gender = 'Male' | 'Female' | 'Other';
type TrainerScreen = 
  | 'home'
  | 'clients'
  | 'plans'
  | 'attendance'
  | 'more'
  | 'add-client'
  | 'client-profile'
  | 'broadcast'
  | 'set-workout'
  | 'set-diet';

export const MobileTrainerApp: React.FC = () => {
  const {
    members,
    employees,
    plans,
    selectedBranchId,
    appUserAccount,
    attendance,
    addWeeklyWorkout,
    addMonthlyDiet,
    addMember,
    sendBulkNotification,
    signOutApp,
    notifications,
    setActiveMemberId
  } = useGym();

  const currentTrainer: Employee = useMemo(() => {
    if (appUserAccount) {
      const match = employees.find(
        (e) =>
          e.id === appUserAccount.id ||
          e.id === appUserAccount.linkedId ||
          (e.email && e.email.toLowerCase() === (appUserAccount.email || '').toLowerCase()) ||
          ((e as any).username && (e as any).username.toLowerCase() === appUserAccount.username.toLowerCase())
      );
      if (match) return match;

      return {
        id: appUserAccount.linkedId || appUserAccount.id,
        name: appUserAccount.linkedName || appUserAccount.username,
        photoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&fit=crop&q=80',
        role: (appUserAccount.role as any) || 'Trainer',
        email: appUserAccount.email || `${appUserAccount.username.toLowerCase()}@smartgym.com`,
        phone: '+91 98765 00000',
        mobile: '+91 98765 00000',
        specialization: appUserAccount.role === 'Dietitian' ? 'Sports Nutrition & Diets' : 'Personal Training & Strength',
        branchId: (appUserAccount.branchId as BranchId) || 'branch-1',
        baseSalary: 35000,
        ptCommissionRate: 20,
        ptSessionsCompleted: 0,
        joiningDate: appUserAccount.createdAt ? appUserAccount.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        shift: 'Morning (06:00 - 14:00)',
        attendanceDays: 26,
      } as Employee;
    }

    return employees.find(e => e.role === 'Trainer') || employees[0];
  }, [employees, appUserAccount]);

  // Strictly filter members assigned to this trainer or within this branch, with full gym fallback
  const assignedClients = members.filter(
    (m) => m.assignedTrainerId === currentTrainer?.id || (m.branchId && m.branchId === currentTrainer?.branchId)
  );
  const myClients = assignedClients.length > 0 ? assignedClients : members;

  const [currentScreen, setCurrentScreen] = useState<TrainerScreen>('home');
  const [previousScreen, setPreviousScreen] = useState<TrainerScreen>('home');
  const [selectedClient, setSelectedClient] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState<string>('all');

  // Active Plan Tab in Screen 3
  const [planSubTab, setPlanSubTab] = useState<'workout' | 'diet'>('workout');

  // Shared Target Member for Workout/Diet assignment
  const [targetMemberId, setTargetMemberId] = useState<string>(myClients[0]?.id || members[0]?.id || '');

  React.useEffect(() => {
    if (!targetMemberId && (myClients[0]?.id || members[0]?.id)) {
      setTargetMemberId(myClients[0]?.id || members[0]?.id || '');
    }
  }, [myClients, members, targetMemberId]);

  // ════════════════════════════════════════════════════════════════
  // WORKOUT BUILDER STATE
  // ════════════════════════════════════════════════════════════════
  const [workoutDay, setWorkoutDay] = useState<string>('Monday');
  const [workoutSplitTitle, setWorkoutSplitTitle] = useState<string>('Monday: Chest & Triceps Hypertrophy');
  const [workoutWeekNum, setWorkoutWeekNum] = useState<number>(1);
  const [exercisesList, setExercisesList] = useState<{
    id: string;
    name: string;
    category: Exercise['category'];
    targetSets: number;
    targetReps: number;
    weightKg: number;
    restSeconds: number;
  }[]>([
    { id: 'ex-1', name: 'Barbell Flat Bench Press', category: 'Chest', targetSets: 4, targetReps: 10, weightKg: 65, restSeconds: 90 },
    { id: 'ex-2', name: 'Incline Dumbbell Press', category: 'Chest', targetSets: 3, targetReps: 12, weightKg: 24, restSeconds: 60 },
    { id: 'ex-3', name: 'Cable Chest Flyes', category: 'Chest', targetSets: 3, targetReps: 15, weightKg: 15, restSeconds: 45 },
    { id: 'ex-4', name: 'Tricep Rope Pushdowns', category: 'Arms', targetSets: 4, targetReps: 12, weightKg: 20, restSeconds: 45 },
  ]);
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState<Exercise['category']>('Chest');
  const [newExSets, setNewExSets] = useState(4);
  const [newExReps, setNewExReps] = useState(10);
  const [newExWeight, setNewExWeight] = useState(30);
  const [workoutSuccessMsg, setWorkoutSuccessMsg] = useState('');
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);

  // ════════════════════════════════════════════════════════════════
  // DIET BUILDER STATE
  // ════════════════════════════════════════════════════════════════
  const [dietTitle, setDietTitle] = useState<string>('Custom Nutrition & Macro Plan');
  const [targetCalories, setTargetCalories] = useState<number>(2400);
  const [targetProtein, setTargetProtein] = useState<number>(160);
  const [targetCarbs, setTargetCarbs] = useState<number>(250);
  const [targetFats, setTargetFats] = useState<number>(65);
  const [waterTarget, setWaterTarget] = useState<number>(4.0);

  const [breakfastMeals, setBreakfastMeals] = useState<{ id: string; name: string; portion: string; calories: number; proteinG: number }[]>([
    { id: 'bf-1', name: 'Oatmeal with Whey Protein & Banana', portion: '80g Oats + 1 Scoop Whey + 1 Banana', calories: 480, proteinG: 36 },
    { id: 'bf-2', name: 'Boiled Eggs / Egg Whites', portion: '3 Whole Eggs + 2 Whites', calories: 280, proteinG: 24 }
  ]);
  const [lunchMeals, setLunchMeals] = useState<{ id: string; name: string; portion: string; calories: number; proteinG: number }[]>([
    { id: 'lu-1', name: 'Grilled Chicken Breast with White Rice', portion: '200g Chicken + 200g Steamed Rice', calories: 620, proteinG: 55 },
    { id: 'lu-2', name: 'Steamed Broccoli & Mixed Veggies', portion: '1 Bowl (150g)', calories: 90, proteinG: 4 }
  ]);
  const [snackMeals, setSnackMeals] = useState<{ id: string; name: string; portion: string; calories: number; proteinG: number }[]>([
    { id: 'sn-1', name: 'Greek Yogurt with Almonds', portion: '200g Greek Yogurt + 15 Almonds', calories: 280, proteinG: 22 },
    { id: 'sn-2', name: 'Apple with Peanut Butter', portion: '1 Apple + 1 tbsp Peanut Butter', calories: 190, proteinG: 4 }
  ]);
  const [dinnerMeals, setDinnerMeals] = useState<{ id: string; name: string; portion: string; calories: number; proteinG: number }[]>([
    { id: 'dn-1', name: 'Baked Salmon / Paneer Tikka with Sweet Potato', portion: '180g Salmon/Paneer + 150g Sweet Potato', calories: 540, proteinG: 42 },
    { id: 'dn-2', name: 'Fresh Green Salad with Olive Oil', portion: '1 Bowl with 1 tsp Olive Oil', calories: 120, proteinG: 2 }
  ]);

  const [newMealName, setNewMealName] = useState('');
  const [newMealPortion, setNewMealPortion] = useState('1 Serving (150g)');
  const [newMealCals, setNewMealCals] = useState(300);
  const [newMealProtein, setNewMealProtein] = useState(25);
  const [newMealCategory, setNewMealCategory] = useState<'breakfast' | 'lunch' | 'snack' | 'dinner'>('breakfast');
  const [dietSuccessMsg, setDietSuccessMsg] = useState('');
  const [isSavingDiet, setIsSavingDiet] = useState(false);

  // Enroll Client Form
  const [clName, setClName] = useState('');
  const [clMobile, setClMobile] = useState('');
  const [clEmail, setClEmail] = useState('');
  const [clGender, setClGender] = useState<Gender>('Male');
  const [clGoal, setClGoal] = useState<GoalType>('Muscle Building');
  const [clPlanId, setClPlanId] = useState(plans[0]?.id || 'plan-annual-vip');
  const [isClCustomDuration, setIsClCustomDuration] = useState(false);
  const [clCustomMonths, setClCustomMonths] = useState(5);
  const [clCustomStartDate, setClCustomStartDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [includeAdmissionFee, setIncludeAdmissionFee] = useState(true);
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);

  // Sync selected plan with available plans (filter out 6-month preset)
  useEffect(() => {
    const validPlans = plans.filter(p => p.durationMonths !== 6 && p.duration !== 'Half-Yearly');
    if (validPlans.length > 0 && (!clPlanId || !validPlans.some(p => p.id === clPlanId))) {
      setClPlanId(validPlans[0].id);
    }
  }, [plans, clPlanId]);

  // Notification Broadcast
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSuccess, setNotifSuccess] = useState('');
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  // Collect Payment Modal State
  const [isCollectPaymentOpen, setIsCollectPaymentOpen] = useState(false);
  const [paymentTargetMember, setPaymentTargetMember] = useState<Member | null>(null);

  // Add Expense Voucher Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === todayStr);
  const myTodayAttendance = todayAttendance.filter((a) => myClients.some((c) => c.id === a.memberId));
  const unreadNotifs = notifications.filter((n) => !n.read);

  const navigateTo = (screen: TrainerScreen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setCurrentScreen(previousScreen === currentScreen ? 'home' : previousScreen);
  };

  // Filtered clients list
  const filteredClients = (myClients || []).filter((m) => {
    if (!m) return false;
    const nameStr = m.name || '';
    const membershipNoStr = m.membershipNo || '';
    const mobileStr = m.mobile || '';
    const query = (searchQuery || '').toLowerCase();
    const matchesSearch =
      nameStr.toLowerCase().includes(query) ||
      membershipNoStr.toLowerCase().includes(query) ||
      mobileStr.includes(query);
    const matchesGoal = goalFilter === 'all' || m.goal === goalFilter;
    return matchesSearch && matchesGoal;
  });

  const selectedMemberObj = members.find((m) => m.id === targetMemberId) || selectedClient || myClients[0] || members[0];

  // ════════════════════════════════════════════════════════════════
  // WORKOUT TEMPLATE PRESETS
  // ════════════════════════════════════════════════════════════════
  const loadWorkoutTemplate = (templateType: 'chest' | 'back' | 'legs' | 'shoulders' | 'fullbody') => {
    if (templateType === 'chest') {
      setWorkoutSplitTitle(`${workoutDay}: Chest & Triceps Hypertrophy`);
      setExercisesList([
        { id: `ex-${Date.now()}-1`, name: 'Barbell Flat Bench Press', category: 'Chest', targetSets: 4, targetReps: 10, weightKg: 65, restSeconds: 90 },
        { id: `ex-${Date.now()}-2`, name: 'Incline Dumbbell Press', category: 'Chest', targetSets: 3, targetReps: 12, weightKg: 24, restSeconds: 60 },
        { id: `ex-${Date.now()}-3`, name: 'Cable Chest Flyes', category: 'Chest', targetSets: 3, targetReps: 15, weightKg: 15, restSeconds: 45 },
        { id: `ex-${Date.now()}-4`, name: 'Tricep Rope Pushdowns', category: 'Arms', targetSets: 4, targetReps: 12, weightKg: 20, restSeconds: 45 },
        { id: `ex-${Date.now()}-5`, name: 'Overhead Dumbbell Extension', category: 'Arms', targetSets: 3, targetReps: 12, weightKg: 16, restSeconds: 60 }
      ]);
    } else if (templateType === 'back') {
      setWorkoutSplitTitle(`${workoutDay}: Back & Biceps Power`);
      setExercisesList([
        { id: `ex-${Date.now()}-1`, name: 'Lat Pulldowns (Wide Grip)', category: 'Back', targetSets: 4, targetReps: 10, weightKg: 55, restSeconds: 60 },
        { id: `ex-${Date.now()}-2`, name: 'Barbell Bent-Over Rows', category: 'Back', targetSets: 4, targetReps: 8, weightKg: 60, restSeconds: 90 },
        { id: `ex-${Date.now()}-3`, name: 'Seated Cable Row', category: 'Back', targetSets: 3, targetReps: 12, weightKg: 45, restSeconds: 60 },
        { id: `ex-${Date.now()}-4`, name: 'EZ-Bar Bicep Curls', category: 'Arms', targetSets: 4, targetReps: 10, weightKg: 25, restSeconds: 45 },
        { id: `ex-${Date.now()}-5`, name: 'Hammer Curls', category: 'Arms', targetSets: 3, targetReps: 12, weightKg: 14, restSeconds: 45 }
      ]);
    } else if (templateType === 'legs') {
      setWorkoutSplitTitle(`${workoutDay}: Leg Day & Core`);
      setExercisesList([
        { id: `ex-${Date.now()}-1`, name: 'Barbell Back Squats', category: 'Legs', targetSets: 4, targetReps: 8, weightKg: 80, restSeconds: 120 },
        { id: `ex-${Date.now()}-2`, name: 'Leg Press Machine', category: 'Legs', targetSets: 4, targetReps: 12, weightKg: 140, restSeconds: 90 },
        { id: `ex-${Date.now()}-3`, name: 'Hamstring Leg Curls', category: 'Legs', targetSets: 3, targetReps: 12, weightKg: 40, restSeconds: 60 },
        { id: `ex-${Date.now()}-4`, name: 'Standing Calf Raises', category: 'Legs', targetSets: 4, targetReps: 15, weightKg: 50, restSeconds: 45 },
        { id: `ex-${Date.now()}-5`, name: 'Hanging Leg Raises', category: 'Core', targetSets: 3, targetReps: 15, weightKg: 0, restSeconds: 45 }
      ]);
    } else if (templateType === 'shoulders') {
      setWorkoutSplitTitle(`${workoutDay}: Shoulders & Abs`);
      setExercisesList([
        { id: `ex-${Date.now()}-1`, name: 'Dumbbell Overhead Shoulder Press', category: 'Shoulders', targetSets: 4, targetReps: 10, weightKg: 20, restSeconds: 75 },
        { id: `ex-${Date.now()}-2`, name: 'Dumbbell Lateral Raises', category: 'Shoulders', targetSets: 4, targetReps: 15, weightKg: 10, restSeconds: 45 },
        { id: `ex-${Date.now()}-3`, name: 'Face Pulls (Rear Delts)', category: 'Shoulders', targetSets: 3, targetReps: 15, weightKg: 25, restSeconds: 45 },
        { id: `ex-${Date.now()}-4`, name: 'Plank Holds', category: 'Core', targetSets: 3, targetReps: 60, weightKg: 0, restSeconds: 45 }
      ]);
    } else if (templateType === 'fullbody') {
      setWorkoutSplitTitle(`${workoutDay}: Full Body Conditioning`);
      setExercisesList([
        { id: `ex-${Date.now()}-1`, name: 'Barbell Deadlifts', category: 'Back', targetSets: 3, targetReps: 6, weightKg: 90, restSeconds: 120 },
        { id: `ex-${Date.now()}-2`, name: 'Dumbbell Goblet Squats', category: 'Legs', targetSets: 3, targetReps: 12, weightKg: 26, restSeconds: 60 },
        { id: `ex-${Date.now()}-3`, name: 'Push-Ups (Chest & Triceps)', category: 'Chest', targetSets: 3, targetReps: 15, weightKg: 0, restSeconds: 45 },
        { id: `ex-${Date.now()}-4`, name: 'Dumbbell Arnold Press', category: 'Shoulders', targetSets: 3, targetReps: 10, weightKg: 16, restSeconds: 60 }
      ]);
    }
  };

  const handleAddExerciseToSplit = () => {
    const name = newExName.trim() || `Exercise #${exercisesList.length + 1}`;
    setExercisesList((prev) => [
      ...prev,
      {
        id: `ex-${Date.now()}`,
        name,
        category: newExCategory,
        targetSets: newExSets || 4,
        targetReps: newExReps || 10,
        weightKg: newExWeight || 20,
        restSeconds: 60
      }
    ]);
    setNewExName('');
  };

  const handleRemoveExerciseFromSplit = (index: number) => {
    setExercisesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveWorkoutPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMemberId) {
      alert('Please select a member to assign this workout to.');
      return;
    }
    if (exercisesList.length === 0) {
      alert('Please add at least one exercise to the workout.');
      return;
    }

    setIsSavingWorkout(true);
    try {
      const formattedExercises: Exercise[] = exercisesList.map((ex, i) => ({
        id: ex.id || `ex-${Date.now()}-${i}`,
        name: ex.name,
        category: ex.category,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        weightKg: ex.weightKg,
        restSeconds: ex.restSeconds,
        completed: false
      }));

      const newSplit: DailyWorkoutSplit = {
        day: workoutDay as any,
        title: workoutSplitTitle || `${workoutDay} Workout Split`,
        exercises: formattedExercises
      };

      await addWeeklyWorkout(targetMemberId, workoutWeekNum, `Week ${workoutWeekNum}: Custom Program`, [newSplit]);

      // Notify member directly
      const clientName = selectedMemberObj?.name || 'Client';
      await sendBulkNotification(
        'single',
        '🏋️ New Workout Assigned!',
        `Coach ${currentTrainer?.name} assigned a new workout plan: ${workoutSplitTitle} (${exercisesList.length} exercises)`,
        targetMemberId
      );

      setWorkoutSuccessMsg(`✓ Workout successfully assigned to ${clientName} for ${workoutDay}!`);
      setTimeout(() => setWorkoutSuccessMsg(''), 4500);
    } catch (err: any) {
      alert('Failed to save workout: ' + (err?.message || 'Database error'));
    } finally {
      setIsSavingWorkout(false);
    }
  };

  // ════════════════════════════════════════════════════════════════
  // DIET TEMPLATE PRESETS
  // ════════════════════════════════════════════════════════════════
  const loadDietTemplate = (templateType: 'bulk' | 'cut' | 'recomp' | 'veg') => {
    if (templateType === 'bulk') {
      setDietTitle('High-Protein Lean Muscle Bulk (2,600 kcal)');
      setTargetCalories(2600);
      setTargetProtein(180);
      setTargetCarbs(280);
      setTargetFats(70);
      setWaterTarget(4.5);
      setBreakfastMeals([
        { id: `bf-1`, name: 'Oatmeal with Whey & Peanut Butter', portion: '100g Oats + 1 Scoop Whey + 2 tbsp PB', calories: 550, proteinG: 40 },
        { id: `bf-2`, name: 'Whole Eggs & Toast', portion: '3 Whole Eggs + 2 Brown Bread', calories: 350, proteinG: 22 }
      ]);
      setLunchMeals([
        { id: `lu-1`, name: 'Grilled Chicken & White Rice', portion: '220g Chicken Breast + 250g Rice', calories: 700, proteinG: 60 },
        { id: `lu-2`, name: 'Curd & Cucumber Salad', portion: '150g Greek Curd + 1 Cucumber', calories: 110, proteinG: 6 }
      ]);
      setSnackMeals([
        { id: `sn-1`, name: 'Protein Shake & Banana', portion: '1 Scoop Whey + 1 Large Banana', calories: 250, proteinG: 26 },
        { id: `sn-2`, name: 'Mixed Roasted Nuts', portion: '30g Walnuts & Almonds', calories: 190, proteinG: 6 }
      ]);
      setDinnerMeals([
        { id: `dn-1`, name: 'Fish Fillet / Paneer with Sweet Potato', portion: '200g Fish/Paneer + 150g Sweet Potato', calories: 580, proteinG: 45 }
      ]);
    } else if (templateType === 'cut') {
      setDietTitle('Fat Loss & Muscle Preservation (1,850 kcal)');
      setTargetCalories(1850);
      setTargetProtein(160);
      setTargetCarbs(150);
      setTargetFats(45);
      setWaterTarget(4.0);
      setBreakfastMeals([
        { id: `bf-1`, name: 'Egg White Omelet with Spinach', portion: '5 Egg Whites + 1 Whole Egg + Veggies', calories: 240, proteinG: 30 },
        { id: `bf-2`, name: 'Black Coffee & Apple', portion: '1 Cup + 1 Medium Apple', calories: 85, proteinG: 1 }
      ]);
      setLunchMeals([
        { id: `lu-1`, name: 'Grilled Chicken Salad with Olive Oil', portion: '200g Chicken + Large Mixed Greens', calories: 480, proteinG: 50 },
        { id: `lu-2`, name: 'Brown Rice', portion: '100g Cooked Brown Rice', calories: 120, proteinG: 3 }
      ]);
      setSnackMeals([
        { id: `sn-1`, name: 'Whey Protein in Water', portion: '1 Scoop (30g)', calories: 120, proteinG: 25 },
        { id: `sn-2`, name: 'Almonds', portion: '12 Almonds', calories: 85, proteinG: 3 }
      ]);
      setDinnerMeals([
        { id: `dn-1`, name: 'Grilled Tofu / White Fish with Steamed Broccoli', portion: '200g Fish/Tofu + 150g Broccoli', calories: 380, proteinG: 40 }
      ]);
    } else if (templateType === 'recomp') {
      setDietTitle('Body Recomposition & Strength (2,200 kcal)');
      setTargetCalories(2200);
      setTargetProtein(165);
      setTargetCarbs(220);
      setTargetFats(60);
      setWaterTarget(4.0);
      setBreakfastMeals([
        { id: `bf-1`, name: 'Oatmeal with Blueberries & Whey', portion: '70g Oats + 1 Scoop Whey', calories: 420, proteinG: 34 }
      ]);
      setLunchMeals([
        { id: `lu-1`, name: 'Chicken / Paneer Breast with Quinoa', portion: '180g Chicken/Paneer + 150g Quinoa', calories: 600, proteinG: 52 }
      ]);
      setSnackMeals([
        { id: `sn-1`, name: 'Greek Yogurt with Honey', portion: '150g Yogurt + 1 tsp Honey', calories: 210, proteinG: 18 }
      ]);
      setDinnerMeals([
        { id: `dn-1`, name: 'Baked Salmon with Roasted Vegetables', portion: '160g Salmon + Asparagus & Bell Peppers', calories: 520, proteinG: 40 }
      ]);
    } else if (templateType === 'veg') {
      setDietTitle('High-Protein Pure Vegetarian Diet (2,300 kcal)');
      setTargetCalories(2300);
      setTargetProtein(145);
      setTargetCarbs(260);
      setTargetFats(65);
      setWaterTarget(4.0);
      setBreakfastMeals([
        { id: `bf-1`, name: 'Soya Chunk Upma / Oats with Plant Protein', portion: '50g Soya Chunks + 60g Oats', calories: 450, proteinG: 38 }
      ]);
      setLunchMeals([
        { id: `lu-1`, name: 'Paneer Bhurji with 2 Rotis & Dal', portion: '150g Paneer + 1 Cup Dal + 2 Multigrain Roti', calories: 680, proteinG: 42 }
      ]);
      setSnackMeals([
        { id: `sn-1`, name: 'Roasted Chana & Whey Isolate', portion: '40g Chana + 1 Scoop Whey', calories: 280, proteinG: 30 }
      ]);
      setDinnerMeals([
        { id: `dn-1`, name: 'Tofu Stir-fry with Brown Rice', portion: '180g Tofu + 150g Brown Rice', calories: 520, proteinG: 35 }
      ]);
    }
  };

  const handleAddMealItem = () => {
    const name = newMealName.trim() || `Food Item`;
    const newItem = {
      id: `meal-${Date.now()}`,
      name,
      portion: newMealPortion || '1 Serving',
      calories: newMealCals || 250,
      proteinG: newMealProtein || 20
    };

    if (newMealCategory === 'breakfast') setBreakfastMeals(prev => [...prev, newItem]);
    else if (newMealCategory === 'lunch') setLunchMeals(prev => [...prev, newItem]);
    else if (newMealCategory === 'snack') setSnackMeals(prev => [...prev, newItem]);
    else if (newMealCategory === 'dinner') setDinnerMeals(prev => [...prev, newItem]);

    setNewMealName('');
  };

  const handleRemoveMealItem = (category: 'breakfast' | 'lunch' | 'snack' | 'dinner', id: string) => {
    if (category === 'breakfast') setBreakfastMeals(prev => prev.filter(m => m.id !== id));
    else if (category === 'lunch') setLunchMeals(prev => prev.filter(m => m.id !== id));
    else if (category === 'snack') setSnackMeals(prev => prev.filter(m => m.id !== id));
    else if (category === 'dinner') setDinnerMeals(prev => prev.filter(m => m.id !== id));
  };

  const handleSaveDietPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMemberId) {
      alert('Please select a member to assign this diet plan to.');
      return;
    }

    setIsSavingDiet(true);
    try {
      const bMeals: MealItem[] = breakfastMeals.map(m => ({ id: m.id, name: m.name, portion: m.portion, calories: m.calories, proteinG: m.proteinG, carbsG: 20, fatG: 10, completed: false }));
      const lMeals: MealItem[] = lunchMeals.map(m => ({ id: m.id, name: m.name, portion: m.portion, calories: m.calories, proteinG: m.proteinG, carbsG: 30, fatG: 12, completed: false }));
      const sMeals: MealItem[] = snackMeals.map(m => ({ id: m.id, name: m.name, portion: m.portion, calories: m.calories, proteinG: m.proteinG, carbsG: 15, fatG: 5, completed: false }));
      const dMeals: MealItem[] = dinnerMeals.map(m => ({ id: m.id, name: m.name, portion: m.portion, calories: m.calories, proteinG: m.proteinG, carbsG: 25, fatG: 15, completed: false }));

      const newMonthPlan: MonthlyDietPlan = {
        monthNumber: 1,
        monthTitle: dietTitle || 'Custom Nutrition Plan',
        targetCalories,
        targetProteinG: targetProtein,
        targetCarbsG: targetCarbs,
        targetFatG: targetFats,
        waterTargetLiters: waterTarget,
        meals: {
          breakfast: bMeals,
          lunch: lMeals,
          snack: sMeals,
          dinner: dMeals
        }
      };

      await addMonthlyDiet(targetMemberId, newMonthPlan);

      const clientName = selectedMemberObj?.name || 'Client';
      await sendBulkNotification(
        'single',
        '🥗 New Nutrition Plan Assigned!',
        `Coach ${currentTrainer?.name} assigned a customized diet plan (${targetCalories} kcal / ${targetProtein}g protein)`,
        targetMemberId
      );

      setDietSuccessMsg(`✓ Nutrition plan successfully assigned to ${clientName}!`);
      setTimeout(() => setDietSuccessMsg(''), 4500);
    } catch (err: any) {
      alert('Failed to save diet plan: ' + (err?.message || 'Database error'));
    } finally {
      setIsSavingDiet(false);
    }
  };

  const handleEnrollClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clName.trim() || !clMobile.trim()) return;
    setIsSubmittingClient(true);

    try {
      const selectedPlan = plans.find((p) => p.id === clPlanId) || plans[0];
      const planMonths = selectedPlan?.durationMonths || 1;
      const effectiveMonths = isClCustomDuration ? clCustomMonths : planMonths;

      const basePerMonth = (selectedPlan?.basePrice || selectedPlan?.totalPrice || 500) / planMonths;
      const packagePrice = isClCustomDuration
        ? Math.round(basePerMonth * clCustomMonths)
        : (selectedPlan?.basePrice || selectedPlan?.totalPrice || 500);
      const regFeeAmount = includeAdmissionFee ? 500 : 0;
      const totalAdmissionAmount = packagePrice + regFeeAmount;

      const startDateStr = isClCustomDuration ? clCustomStartDate : new Date().toISOString().split('T')[0];
      const startObj = new Date(startDateStr);
      const expiry = new Date(startObj);
      expiry.setMonth(expiry.getMonth() + effectiveMonths);
      const endDateStr = expiry.toISOString().split('T')[0];

      const customPlanName = isClCustomDuration
        ? `${selectedPlan?.name || 'Custom'} (${effectiveMonths} Months)`
        : selectedPlan.name;

      const created = await addMember({
        name: clName.trim(),
        mobile: clMobile.trim(),
        email: clEmail.trim() || `${clName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(clName)}`,
        gender: clGender,
        dob: '2001-01-01',
        heightCm: 175,
        weightKg: 74,
        startWeightKg: 74,
        bmi: 24.2,
        chestCm: 95,
        waistCm: 80,
        armsCm: 35,
        thighsCm: 55,
        bloodGroup: 'B+',
        emergencyContactName: 'Emergency',
        emergencyMobile: clMobile.trim(),
        address: 'City Center',
        medicalHistory: 'None',
        goal: clGoal,
        referralSource: 'Trainer Client Enrollment',
        branchId: selectedBranchId,
        planId: isClCustomDuration ? `${selectedPlan.id}-custom-${effectiveMonths}m` : selectedPlan.id,
        planName: customPlanName,
        startDate: startDateStr,
        endDate: endDateStr,
        expiryDate: endDateStr,
        paymentStatus: 'Paid',
        assignedTrainerId: currentTrainer?.id || 'emp-trainer-1',
        pendingDues: 0,
        paidAmount: totalAdmissionAmount,
        totalPlanAmount: totalAdmissionAmount,
        faceEnrolled: false,
        lockerNumber: `L-${Math.floor(10 + Math.random() * 90)}`,
      });

      setSelectedClient(created);
      setTargetMemberId(created.id);
      setClName('');
      setClMobile('');
      setClEmail('');
      setCurrentScreen('client-profile');
    } finally {
      setIsSubmittingClient(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    setIsSendingNotif(true);

    try {
      await sendBulkNotification('all', `[Coach ${currentTrainer?.name}]: ${notifTitle}`, notifMessage);
      setNotifSuccess('Message sent to assigned clients!');
      setNotifTitle('');
      setNotifMessage('');
      setTimeout(() => setNotifSuccess(''), 3000);
    } finally {
      setIsSendingNotif(false);
    }
  };

  const isSubPage = ['add-client', 'client-profile', 'broadcast', 'set-workout', 'set-diet'].includes(currentScreen);

  const bottomNavTabs: MobileNavTab[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'clients', label: 'Clients', icon: Users, badge: myClients.length },
    { id: 'plans', label: 'Plans', icon: Dumbbell },
    { id: 'attendance', label: 'Attendance', icon: Calendar, badge: myTodayAttendance.length > 0 ? myTodayAttendance.length : undefined },
    { id: 'more', label: 'More', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-ambient-mesh text-slate-100 flex flex-col justify-between selection:bg-[#00D4FF] selection:text-black">
      
      {/* ── 1. COMPACT NATIVE MOBILE HEADER ── */}
      <MobileAppHeader
        title={isSubPage ? undefined : 'Smart Gym'}
        subtitle={isSubPage ? undefined : `Coach ${currentTrainer?.name} • ${currentTrainer?.specialization || 'Trainer'}`}
        role="Trainer"
        userPhoto={currentTrainer?.photoUrl}
        accentColor="#00D4FF"
        unreadCount={unreadNotifs.length}
        onOpenNotifications={() => navigateTo('more')}
        onSignOut={signOutApp}
        backAction={isSubPage ? goBack : undefined}
        backTitle={
          currentScreen === 'add-client' ? 'Enroll Client' :
          currentScreen === 'client-profile' ? 'Client Profile' :
          currentScreen === 'set-workout' ? 'Set Workout' :
          currentScreen === 'set-diet' ? 'Set Diet' :
          currentScreen === 'broadcast' ? 'Client Broadcast' : 'Back'
        }
      />

      {/* ── 2. MAIN SCROLLABLE CONTENT ── */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 max-w-lg mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 1: TRAINER HOME DASHBOARD
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            
            {/* Trainer Profile Glass Banner */}
            <div className="glass-card p-5 rounded-3xl shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={currentTrainer?.photoUrl}
                    alt={currentTrainer?.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.25)]"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#00F5A0] border-2 border-[#070A12]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-white">Coach {currentTrainer?.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30 text-[9px] font-black uppercase">
                      Trainer
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentTrainer?.specialization || 'Master Strength Coach'} • {currentTrainer?.shift}
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div
                onClick={() => navigateTo('clients')}
                className="glass-card hover:border-[#00D4FF]/40 p-3.5 rounded-2xl text-center cursor-pointer transition-all active:scale-95 shadow-lg group"
              >
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">My Clients</div>
                <div className="text-xl font-black text-white mt-0.5 group-hover:text-[#00D4FF] transition-colors">{myClients.length}</div>
                <span className="text-[9px] text-[#00D4FF] font-bold block mt-0.5">Manage →</span>
              </div>

              <div
                onClick={() => navigateTo('attendance')}
                className="glass-card hover:border-[#00F5A0]/40 p-3.5 rounded-2xl text-center cursor-pointer transition-all active:scale-95 shadow-lg group"
              >
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Checked In</div>
                <div className="text-xl font-black text-[#00F5A0] mt-0.5">{myTodayAttendance.length}</div>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Today</span>
              </div>

              <div
                onClick={() => navigateTo('plans')}
                className="glass-card hover:border-[#8B5CF6]/40 p-3.5 rounded-2xl text-center cursor-pointer transition-all active:scale-95 shadow-lg group"
              >
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Plans</div>
                <div className="text-xl font-black text-[#8B5CF6] mt-0.5">{myClients.length}</div>
                <span className="text-[9px] text-[#8B5CF6] font-bold block mt-0.5">Diets & Sets →</span>
              </div>
            </div>

            {/* Featured: Collect Subscription Fee & Record Gym Expense */}
            <div className="pt-1 space-y-2">
              <button
                onClick={() => {
                  setPaymentTargetMember(myClients[0] || members[0] || null);
                  setIsCollectPaymentOpen(true);
                }}
                className="w-full p-3.5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-[#101422] to-teal-500/15 border border-emerald-500/30 hover:border-emerald-500/60 active:scale-95 text-left transition-all shadow-xl group cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-white">💳 Collect Subscription Fee</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase">
                        1-12M
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Manual payment entry • Extend 1, 2, or custom pass
                    </div>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </button>

              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="w-full p-3.5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#101422] to-orange-500/15 border border-amber-500/30 hover:border-amber-500/60 active:scale-95 text-left transition-all shadow-xl group cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-amber-500/40 shadow-lg shadow-amber-500/20">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-white">🧾 Record Gym Expense</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase">
                        Voucher
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Equipment repair, cleaning, chalk, first aid, water refills
                    </div>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs group-hover:translate-x-1 transition-transform">
                  +
                </div>
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="pt-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1 mb-2">
                Trainer Quick Actions
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => navigateTo('add-client')}
                  className="glass-card hover:border-[#00D4FF]/40 active:scale-95 p-4 rounded-3xl text-left transition-all shadow-xl group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#00D4FF]/15 text-[#00D4FF] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform border border-[#00D4FF]/30 shadow-md">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">+ Enroll Client</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">New personal trainee</div>
                </button>

                <button
                  onClick={() => {
                    if (myClients.length > 0) setTargetMemberId(myClients[0].id);
                    navigateTo('set-workout');
                  }}
                  className="glass-card hover:border-[#8B5CF6]/40 active:scale-95 p-4 rounded-3xl text-left transition-all shadow-xl group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform border border-[#8B5CF6]/30 shadow-md">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">Assign Workout</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Custom daily splits</div>
                </button>

                <button
                  onClick={() => {
                    if (myClients.length > 0) setTargetMemberId(myClients[0].id);
                    navigateTo('set-diet');
                  }}
                  className="glass-card hover:border-[#00F5A0]/40 active:scale-95 p-4 rounded-3xl text-left transition-all shadow-xl group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#00F5A0]/15 text-[#00F5A0] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform border border-[#00F5A0]/30 shadow-md">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">Assign Diet</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Macro meal regimes</div>
                </button>

                <button
                  onClick={() => navigateTo('broadcast')}
                  className="glass-card hover:border-[#FFC107]/40 active:scale-95 p-4 rounded-3xl text-left transition-all shadow-xl group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FFC107]/15 text-[#FFC107] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform border border-[#FFC107]/30 shadow-md">
                    <Send className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs text-white">Notify Clients</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Direct push alert</div>
                </button>
              </div>
            </div>

            {/* Today's Client Check-ins */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Assigned Trainees ({myClients.length})
                </h3>
                <button
                  onClick={() => navigateTo('clients')}
                  className="text-[11px] font-bold text-[#4F7CFF] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {myClients.slice(0, 4).map((client) => (
                  <div
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client);
                      setTargetMemberId(client.id);
                      navigateTo('client-profile');
                    }}
                    className="p-3 bg-[#101422] hover:bg-[#151A2E] active:scale-[0.98] rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={client.photoUrl}
                        alt={client.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[#4F7CFF]/40"
                      />
                      <div>
                        <h4 className="text-xs font-black text-white">{client.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{client.membershipNo}</span>
                          <span>•</span>
                          <span className="text-[#4F7CFF] font-semibold">{client.goal}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {client.status}
                      </span>
                      <span className="text-[9px] text-slate-400 block mt-1">Weight: {client.weightKg || 74} kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 2: CLIENTS DIRECTORY
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'clients' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            
            {/* Search & Enroll */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search client name or mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#101422] rounded-2xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
              </div>
              <button
                onClick={() => navigateTo('add-client')}
                className="px-3.5 py-2.5 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 text-white font-black text-xs flex items-center gap-1 shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Client</span>
              </button>
            </div>

            {/* Goal Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['all', 'Muscle Building', 'Weight Loss', 'Body Recomposition', 'Endurance & Cardio', 'Rehab & Mobility'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGoalFilter(g)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                    goalFilter === g
                      ? 'bg-[#4F7CFF] text-white shadow-md'
                      : 'bg-[#101422] text-slate-400 border border-white/10 hover:text-white'
                  }`}
                >
                  {g === 'all' ? 'All Goals' : g}
                </button>
              ))}
            </div>

            {/* Clients List */}
            <div className="space-y-2.5">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="p-3.5 bg-[#101422] hover:bg-[#151A2E] rounded-2xl border border-white/10 flex items-center justify-between transition-all shadow-sm gap-2"
                >
                  <div
                    onClick={() => {
                      setSelectedClient(client);
                      setTargetMemberId(client.id);
                      navigateTo('client-profile');
                    }}
                    className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                  >
                    <img
                      src={client.photoUrl}
                      alt={client.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-[#4F7CFF]/50 shadow-inner shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-white truncate">{client.name}</h4>
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase shrink-0">
                          {client.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 truncate">
                        <span>{client.membershipNo}</span>
                        <span>•</span>
                        <span className="text-[#4F7CFF] font-semibold">{client.goal}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentTargetMember(client);
                        setIsCollectPaymentOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>💳 Fee</span>
                    </button>

                    <div
                      onClick={() => {
                        setSelectedClient(client);
                        setTargetMemberId(client.id);
                        navigateTo('client-profile');
                      }}
                      className="text-right cursor-pointer"
                    >
                      <span className="text-[10px] font-black text-purple-400 block truncate max-w-[80px]">{client.planName}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Exp: {client.endDate || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 3: WORKOUT & DIET PLANS CREATION HUB
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'plans' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Top Switcher: Workout vs Diet */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#101422] border border-white/10">
              <button
                onClick={() => setPlanSubTab('workout')}
                className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                  planSubTab === 'workout'
                    ? 'bg-[#4F7CFF] text-white shadow-lg shadow-[#4F7CFF]/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                <span>🏋️ Assign Workout</span>
              </button>

              <button
                onClick={() => setPlanSubTab('diet')}
                className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                  planSubTab === 'diet'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>🥗 Assign Diet</span>
              </button>
            </div>

            {/* Target Member Picker Banner */}
            <div className="p-3.5 bg-[#101422] rounded-2xl border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={selectedMemberObj?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                  alt={selectedMemberObj?.name || 'Client'}
                  className="w-10 h-10 rounded-xl object-cover border border-[#4F7CFF]/40 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Target Trainee</span>
                  <select
                    value={targetMemberId}
                    onChange={(e) => {
                      setTargetMemberId(e.target.value);
                      const m = members.find(item => item.id === e.target.value);
                      if (m) setSelectedClient(m);
                    }}
                    className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer truncate max-w-[190px]"
                  >
                    {myClients.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#0B0E17] text-white">
                        {m.name} ({m.membershipNo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] text-[#4F7CFF] font-bold block">{selectedMemberObj?.goal}</span>
                <span className="text-[9px] text-slate-400">{selectedMemberObj?.weightKg || 70} kg</span>
              </div>
            </div>

            {/* SUBTAB 1: WORKOUT ASSIGNMENT */}
            {planSubTab === 'workout' && (
              <div className="space-y-4">
                {workoutSuccessMsg && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{workoutSuccessMsg}</span>
                  </div>
                )}

                {/* Quick 1-Click Templates */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    ⚡ 1-Click Workout Templates
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => loadWorkoutTemplate('chest')}
                      className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                    >
                      Chest & Triceps
                    </button>
                    <button
                      type="button"
                      onClick={() => loadWorkoutTemplate('back')}
                      className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                    >
                      Back & Biceps
                    </button>
                    <button
                      type="button"
                      onClick={() => loadWorkoutTemplate('legs')}
                      className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                    >
                      Leg Day & Core
                    </button>
                    <button
                      type="button"
                      onClick={() => loadWorkoutTemplate('shoulders')}
                      className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                    >
                      Shoulders & Abs
                    </button>
                    <button
                      type="button"
                      onClick={() => loadWorkoutTemplate('fullbody')}
                      className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                    >
                      Full Body
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveWorkoutPlan} className="space-y-3.5">
                  <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 space-y-3 shadow-xl">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                          Split Day
                        </label>
                        <select
                          value={workoutDay}
                          onChange={(e) => {
                            setWorkoutDay(e.target.value);
                            setWorkoutSplitTitle(`${e.target.value}: ${workoutSplitTitle.split(': ')[1] || 'Daily Split'}`);
                          }}
                          className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                        >
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                          Program Week #
                        </label>
                        <select
                          value={workoutWeekNum}
                          onChange={(e) => setWorkoutWeekNum(Number(e.target.value))}
                          className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                        >
                          {[1, 2, 3, 4].map((w) => (
                            <option key={w} value={w}>Week {w}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        Split Focus Title
                      </label>
                      <input
                        type="text"
                        value={workoutSplitTitle}
                        onChange={(e) => setWorkoutSplitTitle(e.target.value)}
                        placeholder="e.g. Monday: Chest & Triceps Hypertrophy"
                        required
                        className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                      />
                    </div>
                  </div>

                  {/* Exercise Items List */}
                  <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <Dumbbell className="w-4 h-4 text-[#4F7CFF]" />
                        <span>Exercises ({exercisesList.length})</span>
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold">Sets & Target Load</span>
                    </div>

                    <div className="space-y-2">
                      {exercisesList.map((ex, idx) => (
                        <div
                          key={ex.id || idx}
                          className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10 flex items-center justify-between gap-2"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-[#4F7CFF]/20 text-[#4F7CFF] text-[10px] font-black flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-black text-white truncate">{ex.name}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">
                                {ex.category}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 pl-7 flex items-center gap-2">
                              <span className="text-emerald-400 font-bold">{ex.targetSets} Sets × {ex.targetReps} Reps</span>
                              <span>•</span>
                              <span>Target: <strong>{ex.weightKg} kg</strong></span>
                              <span>•</span>
                              <span>Rest: {ex.restSeconds}s</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveExerciseFromSplit(idx)}
                            className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-all shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Single Exercise */}
                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <span className="text-[10px] font-black text-[#4F7CFF] uppercase tracking-wider block">
                        + Add Custom Exercise
                      </span>
                      <div className="grid grid-cols-12 gap-2">
                        <input
                          type="text"
                          placeholder="Exercise Name (e.g. Incline DB Fly)"
                          value={newExName}
                          onChange={(e) => setNewExName(e.target.value)}
                          className="col-span-6 p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none"
                        />
                        <select
                          value={newExCategory}
                          onChange={(e) => setNewExCategory(e.target.value as any)}
                          className="col-span-6 p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none"
                        >
                          {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'].map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">Sets</label>
                          <input
                            type="number"
                            value={newExSets}
                            onChange={(e) => setNewExSets(Number(e.target.value))}
                            className="w-full p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">Reps</label>
                          <input
                            type="number"
                            value={newExReps}
                            onChange={(e) => setNewExReps(Number(e.target.value))}
                            className="w-full p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">Weight (kg)</label>
                          <input
                            type="number"
                            value={newExWeight}
                            onChange={(e) => setNewExWeight(Number(e.target.value))}
                            className="w-full p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddExerciseToSplit}
                        className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Insert Exercise into List</span>
                      </button>
                    </div>
                  </div>

                  {/* Save Workout Button */}
                  <button
                    type="submit"
                    disabled={isSavingWorkout}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-[#3D69EB] hover:from-[#3D69EB] hover:to-[#2B54D4] active:scale-95 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#4F7CFF]/25 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isSavingWorkout ? 'Publishing to Database...' : `Save & Publish Workout to ${selectedMemberObj?.name || 'Member'}`}</span>
                  </button>
                </form>
              </div>
            )}

            {/* SUBTAB 2: DIET & NUTRITION ASSIGNMENT */}
            {planSubTab === 'diet' && (
              <div className="space-y-4">
                {dietSuccessMsg && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{dietSuccessMsg}</span>
                  </div>
                )}

                {/* Quick 1-Click Templates */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    ⚡ 1-Click Nutrition Templates
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => loadDietTemplate('bulk')}
                      className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                    >
                      Lean Bulk (2,600 kcal)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadDietTemplate('cut')}
                      className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                    >
                      Fat Loss (1,850 kcal)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadDietTemplate('recomp')}
                      className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                    >
                      Recomp (2,200 kcal)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadDietTemplate('veg')}
                      className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                    >
                      Vegetarian (2,300 kcal)
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveDietPlan} className="space-y-3.5">
                  {/* Macro Targets Card */}
                  <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 space-y-3 shadow-xl">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        Diet Plan Title
                      </label>
                      <input
                        type="text"
                        value={dietTitle}
                        onChange={(e) => setDietTitle(e.target.value)}
                        placeholder="e.g. Muscle Recomposition & Shred"
                        required
                        className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 bg-[#0B0E17] rounded-2xl border border-white/10">
                        <span className="text-[9px] font-black text-amber-400 uppercase block">Calories</span>
                        <input
                          type="number"
                          value={targetCalories}
                          onChange={(e) => setTargetCalories(Number(e.target.value))}
                          className="w-full text-center bg-transparent font-black text-xs text-white focus:outline-none mt-0.5"
                        />
                        <span className="text-[8px] text-slate-500 block">kcal</span>
                      </div>

                      <div className="p-2.5 bg-[#0B0E17] rounded-2xl border border-white/10">
                        <span className="text-[9px] font-black text-red-400 uppercase block">Protein</span>
                        <input
                          type="number"
                          value={targetProtein}
                          onChange={(e) => setTargetProtein(Number(e.target.value))}
                          className="w-full text-center bg-transparent font-black text-xs text-white focus:outline-none mt-0.5"
                        />
                        <span className="text-[8px] text-slate-500 block">grams</span>
                      </div>

                      <div className="p-2.5 bg-[#0B0E17] rounded-2xl border border-white/10">
                        <span className="text-[9px] font-black text-[#4F7CFF] uppercase block">Carbs</span>
                        <input
                          type="number"
                          value={targetCarbs}
                          onChange={(e) => setTargetCarbs(Number(e.target.value))}
                          className="w-full text-center bg-transparent font-black text-xs text-white focus:outline-none mt-0.5"
                        />
                        <span className="text-[8px] text-slate-500 block">grams</span>
                      </div>

                      <div className="p-2.5 bg-[#0B0E17] rounded-2xl border border-white/10">
                        <span className="text-[9px] font-black text-emerald-400 uppercase block">Water</span>
                        <input
                          type="number"
                          step="0.5"
                          value={waterTarget}
                          onChange={(e) => setWaterTarget(Number(e.target.value))}
                          className="w-full text-center bg-transparent font-black text-xs text-white focus:outline-none mt-0.5"
                        />
                        <span className="text-[8px] text-slate-500 block">liters</span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Meal Category Breakdown */}
                  <div className="space-y-3">
                    {/* Breakfast */}
                    <div className="bg-[#101422] p-3.5 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                          <Sun className="w-4 h-4" />
                          <span>Breakfast ({breakfastMeals.length} items)</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {breakfastMeals.reduce((acc, m) => acc + m.calories, 0)} kcal • {breakfastMeals.reduce((acc, m) => acc + m.proteinG, 0)}g P
                        </span>
                      </div>
                      {breakfastMeals.map(m => (
                        <div key={m.id} className="p-2.5 bg-[#0B0E17] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-white">{m.name}</div>
                            <div className="text-[10px] text-slate-400">{m.portion} • <strong className="text-amber-400">{m.calories} kcal</strong> ({m.proteinG}g P)</div>
                          </div>
                          <button type="button" onClick={() => handleRemoveMealItem('breakfast', m.id)} className="text-red-400 p-1 hover:bg-red-500/10 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Lunch */}
                    <div className="bg-[#101422] p-3.5 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                          <Utensils className="w-4 h-4" />
                          <span>Lunch ({lunchMeals.length} items)</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {lunchMeals.reduce((acc, m) => acc + m.calories, 0)} kcal • {lunchMeals.reduce((acc, m) => acc + m.proteinG, 0)}g P
                        </span>
                      </div>
                      {lunchMeals.map(m => (
                        <div key={m.id} className="p-2.5 bg-[#0B0E17] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-white">{m.name}</div>
                            <div className="text-[10px] text-slate-400">{m.portion} • <strong className="text-emerald-400">{m.calories} kcal</strong> ({m.proteinG}g P)</div>
                          </div>
                          <button type="button" onClick={() => handleRemoveMealItem('lunch', m.id)} className="text-red-400 p-1 hover:bg-red-500/10 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Snacks */}
                    <div className="bg-[#101422] p-3.5 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-400 flex items-center gap-1.5">
                          <Cookie className="w-4 h-4" />
                          <span>Snacks ({snackMeals.length} items)</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {snackMeals.reduce((acc, m) => acc + m.calories, 0)} kcal • {snackMeals.reduce((acc, m) => acc + m.proteinG, 0)}g P
                        </span>
                      </div>
                      {snackMeals.map(m => (
                        <div key={m.id} className="p-2.5 bg-[#0B0E17] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-white">{m.name}</div>
                            <div className="text-[10px] text-slate-400">{m.portion} • <strong className="text-purple-400">{m.calories} kcal</strong> ({m.proteinG}g P)</div>
                          </div>
                          <button type="button" onClick={() => handleRemoveMealItem('snack', m.id)} className="text-red-400 p-1 hover:bg-red-500/10 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Dinner */}
                    <div className="bg-[#101422] p-3.5 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#4F7CFF] flex items-center gap-1.5">
                          <Moon className="w-4 h-4" />
                          <span>Dinner ({dinnerMeals.length} items)</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {dinnerMeals.reduce((acc, m) => acc + m.calories, 0)} kcal • {dinnerMeals.reduce((acc, m) => acc + m.proteinG, 0)}g P
                        </span>
                      </div>
                      {dinnerMeals.map(m => (
                        <div key={m.id} className="p-2.5 bg-[#0B0E17] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-white">{m.name}</div>
                            <div className="text-[10px] text-slate-400">{m.portion} • <strong className="text-[#4F7CFF]">{m.calories} kcal</strong> ({m.proteinG}g P)</div>
                          </div>
                          <button type="button" onClick={() => handleRemoveMealItem('dinner', m.id)} className="text-red-400 p-1 hover:bg-red-500/10 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Insert Meal Form */}
                    <div className="bg-[#101422] p-3.5 rounded-2xl border border-white/10 space-y-2">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                        + Add Custom Food Item
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={newMealCategory}
                          onChange={(e) => setNewMealCategory(e.target.value as any)}
                          className="p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none"
                        >
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="snack">Snack</option>
                          <option value="dinner">Dinner</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Food Name (e.g. Scrambled Eggs)"
                          value={newMealName}
                          onChange={(e) => setNewMealName(e.target.value)}
                          className="p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Portion (1 Bowl / 200g)"
                          value={newMealPortion}
                          onChange={(e) => setNewMealPortion(e.target.value)}
                          className="p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Calories (kcal)"
                          value={newMealCals}
                          onChange={(e) => setNewMealCals(Number(e.target.value))}
                          className="p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Protein (g)"
                          value={newMealProtein}
                          onChange={(e) => setNewMealProtein(Number(e.target.value))}
                          className="p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddMealItem}
                        className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to {newMealCategory.toUpperCase()}</span>
                      </button>
                    </div>
                  </div>

                  {/* Save Diet Button */}
                  <button
                    type="submit"
                    disabled={isSavingDiet}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isSavingDiet ? 'Publishing to Database...' : `Save & Publish Diet to ${selectedMemberObj?.name || 'Member'}`}</span>
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 4: ATTENDANCE TRACKER
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'attendance' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Today's Check-in Log</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black">
                  {myTodayAttendance.length} / {myClients.length} Present
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {myClients.map((client) => {
                  const isCheckedIn = myTodayAttendance.some((a) => a.memberId === client.id);

                  return (
                    <div
                      key={client.id}
                      className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={client.photoUrl} alt={client.name} className="w-9 h-9 rounded-xl object-cover border border-white/20" />
                        <div>
                          <div className="text-xs font-black text-white">{client.name}</div>
                          <div className="text-[10px] text-slate-400">{client.membershipNo}</div>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${
                          isCheckedIn
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                      >
                        {isCheckedIn ? 'Checked In ✓' : 'Not In Gym'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCREEN 5: MORE / COACH PROFILE
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'more' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Coach Profile Info */}
            <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-xl flex items-center gap-3.5">
              <img
                src={currentTrainer?.photoUrl}
                alt={currentTrainer?.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#4F7CFF] shadow-lg"
              />
              <div>
                <h3 className="text-sm font-black text-white">Coach {currentTrainer?.name}</h3>
                <p className="text-xs text-purple-400 font-bold mt-0.5">{currentTrainer?.specialization}</p>
                <div className="text-[10px] text-slate-400 mt-1">Shift: {currentTrainer?.shift}</div>
              </div>
            </div>

            {/* Coach Operations Actions */}
            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-2.5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                Coach Operations
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentTargetMember(myClients[0] || members[0] || null);
                    setIsCollectPaymentOpen(true);
                  }}
                  className="p-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-black text-xs flex flex-col items-center text-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Collect Fee</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(true)}
                  className="p-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-black text-xs flex flex-col items-center text-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <Receipt className="w-5 h-5" />
                  <span>Add Expense</span>
                </button>
              </div>
            </div>

            {/* Broadcast Form */}
            <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <h3 className="text-xs font-black text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-[#4F7CFF]" />
                <span>Message Trainees</span>
              </h3>

              {notifSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{notifSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSendNotification} className="space-y-2.5 text-xs">
                <input
                  type="text"
                  placeholder="Subject: e.g. Leg Day Focus / Bring Straps"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
                <textarea
                  rows={3}
                  placeholder="Instructions for your assigned trainees..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
                <button
                  type="submit"
                  disabled={isSendingNotif}
                  className="w-full py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-[#3D69EB] text-white font-black text-xs"
                >
                  Send Push to Clients
                </button>
              </form>
            </div>

            {/* Sign Out */}
            <button
              onClick={signOutApp}
              className="w-full py-3 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Trainer Account</span>
            </button>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 1: ENROLL CLIENT
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'add-client' && (
          <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <UserPlus className="w-4 h-4 text-[#4F7CFF]" />
              <span>Enroll New Client to PT Batch</span>
            </h3>

            <form onSubmit={handleEnrollClient} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Client Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arjun Kapoor"
                  value={clName}
                  onChange={(e) => setClName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Mobile *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={clMobile}
                    onChange={(e) => setClMobile(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Primary Goal
                  </label>
                  <select
                    value={clGoal}
                    onChange={(e) => setClGoal(e.target.value as GoalType)}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                  >
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Body Recomposition">Body Recomposition</option>
                    <option value="Endurance & Cardio">Endurance & Cardio</option>
                    <option value="Rehab & Mobility">Rehab & Mobility</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Package Plan
                </label>
                <select
                  value={clPlanId}
                  onChange={(e) => setClPlanId(e.target.value)}
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                >
                  {plans.filter(p => p.durationMonths !== 6 && p.duration !== 'Half-Yearly').map((p) => {
                    const price = p.basePrice || p.totalPrice || 1500;
                    const durationStr = p.durationMonths 
                      ? `${p.durationMonths} ${p.durationMonths === 1 ? 'Month' : 'Months'}`
                      : `${p.durationDays || 30} Days`;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{price.toLocaleString('en-IN')} ({durationStr})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Custom Duration Toggle & Period Settings */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsClCustomDuration(!isClCustomDuration)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                      isClCustomDuration
                        ? 'bg-orange-500/20 border-orange-500/60 text-orange-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CalendarRange className="w-3.5 h-3.5" />
                    <span>{isClCustomDuration ? 'Custom Duration: ON' : 'Set Custom Months / Duration'}</span>
                  </button>
                  {isClCustomDuration && (
                    <span className="text-[10px] text-orange-300">
                      Prorated monthly rate
                    </span>
                  )}
                </div>

                {isClCustomDuration && (
                  <div className="p-3 bg-orange-500/10 border border-orange-500/25 rounded-2xl space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-300 uppercase tracking-wider">
                      <Hash className="w-3.5 h-3.5" />
                      <span>Custom PT Client Window</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                          Months Count *
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={36}
                          value={clCustomMonths}
                          onChange={(e) => setClCustomMonths(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full p-2 bg-[#07090E] rounded-xl border border-orange-500/40 text-xs text-orange-300 font-bold outline-none focus:border-orange-400"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                          Subscription Start *
                        </label>
                        <input
                          type="date"
                          value={clCustomStartDate}
                          onChange={(e) => setClCustomStartDate(e.target.value)}
                          className="w-full p-2 bg-[#07090E] rounded-xl border border-orange-500/40 text-xs text-white outline-none focus:border-orange-400"
                        />
                      </div>
                    </div>

                    {(() => {
                      const startObj = new Date(clCustomStartDate || new Date());
                      const endObj = new Date(startObj);
                      endObj.setMonth(endObj.getMonth() + clCustomMonths);
                      return (
                        <div className="text-[10px] text-slate-300 flex items-center justify-between px-1">
                          <span>Period: <strong className="text-orange-300">{clCustomStartDate}</strong> → <strong className="text-orange-300">{endObj.toISOString().split('T')[0]}</strong></span>
                          <span className="text-slate-400 font-semibold">({clCustomMonths} month{clCustomMonths !== 1 ? 's' : ''})</span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Admission / Registration Fee Option */}
              <div className="flex items-center justify-between p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={includeAdmissionFee}
                    onChange={(e) => setIncludeAdmissionFee(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4F7CFF] bg-[#101422] border-white/20 focus:ring-0"
                  />
                  <span>Registration / Admission Fee</span>
                </label>
                <span className="text-white font-extrabold">₹500</span>
              </div>

              {/* Tariff Breakdown Summary */}
              {(() => {
                const selectedPlan = plans.find((p) => p.id === clPlanId) || plans[0];
                const planMonths = selectedPlan?.durationMonths || 1;
                const effectiveMonths = isClCustomDuration ? clCustomMonths : planMonths;
                const basePerMonth = (selectedPlan?.basePrice || selectedPlan?.totalPrice || 500) / planMonths;
                const packagePrice = isClCustomDuration
                  ? Math.round(basePerMonth * clCustomMonths)
                  : (selectedPlan?.basePrice || selectedPlan?.totalPrice || 500);
                const regFeeAmount = includeAdmissionFee ? 500 : 0;
                const totalAdmissionAmount = packagePrice + regFeeAmount;

                return (
                  <div className="p-3.5 bg-gradient-to-br from-[#0B1528] via-[#0D1220] to-[#07090E] rounded-2xl border border-cyan-500/30 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Admission & Package Summary</span>
                      </span>
                      <span className="text-[9px] font-black text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 uppercase">
                        Payment Summary
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold block">
                          {selectedPlan?.name || 'Standard Package'}
                          {isClCustomDuration && ` — ${effectiveMonths} Months (Custom)`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isClCustomDuration 
                            ? `₹${Math.round(basePerMonth).toLocaleString('en-IN')}/mo × ${effectiveMonths} mo`
                            : `Duration: ${selectedPlan?.durationMonths || 1} Month(s)`}
                        </span>
                      </div>
                      <span className={`font-black ${isClCustomDuration ? 'text-orange-400' : 'text-cyan-300'}`}>
                        ₹{packagePrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {includeAdmissionFee && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Admission Fee</span>
                        <span className="font-bold text-white">₹500</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-500/30">
                      <span className="text-xs font-black text-white uppercase">Total Payable Amount</span>
                      <strong className={`text-sm font-black ${isClCustomDuration ? 'text-orange-400' : 'text-emerald-400'}`}>
                        ₹{totalAdmissionAmount.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingClient}
                  className="w-full py-3 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#4F7CFF]/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingClient ? 'Enrolling...' : 'Enroll & Assign to Coach Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 2: CLIENT PROFILE
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'client-profile' && selectedClient && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-xl flex items-center gap-3.5">
              <img
                src={selectedClient.photoUrl}
                alt={selectedClient.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#4F7CFF] shadow-lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white">{selectedClient.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                    {selectedClient.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">ID: {selectedClient.membershipNo} • {selectedClient.mobile}</div>
                <div className="text-[10px] text-[#4F7CFF] font-bold mt-0.5">Target: {selectedClient.goal}</div>
              </div>
            </div>

            <div className="w-full max-w-sm mx-auto">
              <PrivilegePassCard member={selectedClient} />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {/* Collect Subscription Payment Button */}
              <button
                type="button"
                onClick={() => {
                  setPaymentTargetMember(selectedClient);
                  setIsCollectPaymentOpen(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>💳 Collect Fee / Extend Pass (1-12 Months)</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setTargetMemberId(selectedClient.id);
                    setPlanSubTab('workout');
                    navigateTo('set-workout');
                  }}
                  className="py-3.5 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#4F7CFF]/20 cursor-pointer"
                >
                  <Dumbbell className="w-4 h-4" />
                  <span>🏋️ Set Workout Split</span>
                </button>

                <button
                  onClick={() => {
                    setTargetMemberId(selectedClient.id);
                    setPlanSubTab('diet');
                    navigateTo('set-diet');
                  }}
                  className="py-3.5 rounded-2xl bg-[#101422] hover:bg-[#151A2E] border border-white/10 active:scale-95 text-emerald-400 font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Utensils className="w-4 h-4" />
                  <span>🥗 Set Nutrition Diet</span>
                </button>
              </div>

              <button
                onClick={() => alert(`Calling ${selectedClient.mobile}`)}
                className="w-full py-3 rounded-2xl bg-[#101422] hover:bg-[#151A2E] text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Client ({selectedClient.mobile})</span>
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 3: DEDICATED SET WORKOUT SCREEN
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'set-workout' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Target Member Banner */}
            <div className="p-3.5 bg-[#101422] rounded-2xl border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={selectedMemberObj?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                  alt={selectedMemberObj?.name || 'Client'}
                  className="w-10 h-10 rounded-xl object-cover border border-[#4F7CFF]/40 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Assigning Workout To</span>
                  <select
                    value={targetMemberId}
                    onChange={(e) => {
                      setTargetMemberId(e.target.value);
                      const m = members.find(item => item.id === e.target.value);
                      if (m) setSelectedClient(m);
                    }}
                    className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer truncate max-w-[190px]"
                  >
                    {myClients.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#0B0E17] text-white">
                        {m.name} ({m.membershipNo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] text-[#4F7CFF] font-bold block">{selectedMemberObj?.goal}</span>
                <span className="text-[9px] text-slate-400">{selectedMemberObj?.weightKg || 70} kg</span>
              </div>
            </div>

            {workoutSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{workoutSuccessMsg}</span>
              </div>
            )}

            {/* Quick 1-Click Templates */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                ⚡ 1-Click Workout Presets
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => loadWorkoutTemplate('chest')}
                  className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                >
                  Chest & Triceps
                </button>
                <button
                  type="button"
                  onClick={() => loadWorkoutTemplate('back')}
                  className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                >
                  Back & Biceps
                </button>
                <button
                  type="button"
                  onClick={() => loadWorkoutTemplate('legs')}
                  className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                >
                  Leg Day & Core
                </button>
                <button
                  type="button"
                  onClick={() => loadWorkoutTemplate('shoulders')}
                  className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                >
                  Shoulders & Abs
                </button>
                <button
                  type="button"
                  onClick={() => loadWorkoutTemplate('fullbody')}
                  className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                >
                  Full Body
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveWorkoutPlan} className="space-y-3.5">
              <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 space-y-3 shadow-xl">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      Split Day
                    </label>
                    <select
                      value={workoutDay}
                      onChange={(e) => {
                        setWorkoutDay(e.target.value);
                        setWorkoutSplitTitle(`${e.target.value}: ${workoutSplitTitle.split(': ')[1] || 'Daily Split'}`);
                      }}
                      className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                      Program Week #
                    </label>
                    <select
                      value={workoutWeekNum}
                      onChange={(e) => setWorkoutWeekNum(Number(e.target.value))}
                      className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                    >
                      {[1, 2, 3, 4].map((w) => (
                        <option key={w} value={w}>Week {w}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Split Focus Title
                  </label>
                  <input
                    type="text"
                    value={workoutSplitTitle}
                    onChange={(e) => setWorkoutSplitTitle(e.target.value)}
                    placeholder="e.g. Monday: Chest & Triceps Hypertrophy"
                    required
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
              </div>

              {/* Exercise Items List */}
              <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4 text-[#4F7CFF]" />
                    <span>Exercises ({exercisesList.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold">Sets & Target Load</span>
                </div>

                <div className="space-y-2">
                  {exercisesList.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#4F7CFF]/20 text-[#4F7CFF] text-[10px] font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-black text-white truncate">{ex.name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">
                            {ex.category}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 pl-7 flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">{ex.targetSets} Sets × {ex.targetReps} Reps</span>
                          <span>•</span>
                          <span>Target: <strong>{ex.weightKg} kg</strong></span>
                          <span>•</span>
                          <span>Rest: {ex.restSeconds}s</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveExerciseFromSplit(idx)}
                        className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Quick Add Single Exercise */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <span className="text-[10px] font-black text-[#4F7CFF] uppercase tracking-wider block">
                    + Add Custom Exercise
                  </span>
                  <div className="grid grid-cols-12 gap-2">
                    <input
                      type="text"
                      placeholder="Exercise Name (e.g. Incline DB Fly)"
                      value={newExName}
                      onChange={(e) => setNewExName(e.target.value)}
                      className="col-span-6 p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <select
                      value={newExCategory}
                      onChange={(e) => setNewExCategory(e.target.value as any)}
                      className="col-span-6 p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none"
                    >
                      {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-0.5">Sets</label>
                      <input
                        type="number"
                        value={newExSets}
                        onChange={(e) => setNewExSets(Number(e.target.value))}
                        className="w-full p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-0.5">Reps</label>
                      <input
                        type="number"
                        value={newExReps}
                        onChange={(e) => setNewExReps(Number(e.target.value))}
                        className="w-full p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-0.5">Weight (kg)</label>
                      <input
                        type="number"
                        value={newExWeight}
                        onChange={(e) => setNewExWeight(Number(e.target.value))}
                        className="w-full p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddExerciseToSplit}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Insert Exercise into List</span>
                  </button>
                </div>
              </div>

              {/* Save Workout Button */}
              <button
                type="submit"
                disabled={isSavingWorkout}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-[#3D69EB] hover:from-[#3D69EB] hover:to-[#2B54D4] active:scale-95 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#4F7CFF]/25 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSavingWorkout ? 'Publishing to Database...' : `Save & Publish Workout to ${selectedMemberObj?.name || 'Member'}`}</span>
              </button>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUBPAGE 4: DEDICATED SET DIET SCREEN
        ═══════════════════════════════════════════════════════════ */}
        {currentScreen === 'set-diet' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Target Member Banner */}
            <div className="p-3.5 bg-[#101422] rounded-2xl border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={selectedMemberObj?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                  alt={selectedMemberObj?.name || 'Client'}
                  className="w-10 h-10 rounded-xl object-cover border border-emerald-500/40 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Assigning Diet To</span>
                  <select
                    value={targetMemberId}
                    onChange={(e) => {
                      setTargetMemberId(e.target.value);
                      const m = members.find(item => item.id === e.target.value);
                      if (m) setSelectedClient(m);
                    }}
                    className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer truncate max-w-[190px]"
                  >
                    {myClients.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#0B0E17] text-white">
                        {m.name} ({m.membershipNo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] text-emerald-400 font-bold block">{selectedMemberObj?.goal}</span>
                <span className="text-[9px] text-slate-400">{selectedMemberObj?.weightKg || 70} kg</span>
              </div>
            </div>

            {dietSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{dietSuccessMsg}</span>
              </div>
            )}

            {/* Quick 1-Click Templates */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                ⚡ 1-Click Nutrition Presets
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => loadDietTemplate('bulk')}
                  className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                >
                  Lean Bulk (2,600 kcal)
                </button>
                <button
                  type="button"
                  onClick={() => loadDietTemplate('cut')}
                  className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                >
                  Fat Loss (1,850 kcal)
                </button>
                <button
                  type="button"
                  onClick={() => loadDietTemplate('recomp')}
                  className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                >
                  Recomp (2,200 kcal)
                </button>
                <button
                  type="button"
                  onClick={() => loadDietTemplate('veg')}
                  className="px-3 py-1.5 rounded-xl bg-[#101422] hover:bg-[#1A2238] border border-white/10 text-[10px] font-bold text-white whitespace-nowrap active:scale-95"
                >
                  Vegetarian (2,300 kcal)
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveDietPlan} className="space-y-3.5">
              {/* Macro Targets Card */}
              <div className="bg-[#101422] p-4 rounded-3xl border border-white/10 space-y-3 shadow-xl">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Diet Plan Title
                  </label>
                  <input
                    type="text"
                    value={dietTitle}
                    onChange={(e) => setDietTitle(e.target.value)}
                    placeholder="e.g. Muscle Recomposition & Shred"
                    required
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 bg-[#0B0E17] rounded-2xl border border-white/10">
                    <span className="text-[9px] font-black text-amber-400 uppercase block">Calories</span>
                    <input
                      type="number"
                      value={targetCalories}
                      onChange={(e) => setTargetCalories(Number(e.target.value))}
                      className="w-full text-center bg-transparent font-black text-xs text-white focus:outline-none mt-0.5"
                    />
                    <span className="text-[8px] text-slate-500 block">kcal</span>
                  </div>

                  <div className="p-2.5 bg-[#0B0E17] rounded-2xl border border-white/10">
                    <span className="text-[9px] font-black text-red-400 uppercase block">Protein</span>
                    <input
                      type="number"
                      value={targetProtein}
                      onChange={(e) => setTargetProtein(Number(e.target.value))}
                      className="w-full text-center bg-transparent font-black text-xs text-white focus:outline-none mt-0.5"
                    />
                    <span className="text-[8px] text-slate-500 block">grams</span>
                  </div>

                  <div className="p-2.5 bg-[#0B0E17] rounded-2xl border border-white/10">
                    <span className="text-[9px] font-black text-[#4F7CFF] uppercase block">Carbs</span>
                    <input
                      type="number"
                      value={targetCarbs}
                      onChange={(e) => setTargetCarbs(Number(e.target.value))}
                      className="w-full text-center bg-transparent font-black text-xs text-white focus:outline-none mt-0.5"
                    />
                    <span className="text-[8px] text-slate-500 block">grams</span>
                  </div>

                  <div className="p-2.5 bg-[#0B0E17] rounded-2xl border border-white/10">
                    <span className="text-[9px] font-black text-emerald-400 uppercase block">Water</span>
                    <input
                      type="number"
                      step="0.5"
                      value={waterTarget}
                      onChange={(e) => setWaterTarget(Number(e.target.value))}
                      className="w-full text-center bg-transparent font-black text-xs text-white focus:outline-none mt-0.5"
                    />
                    <span className="text-[8px] text-slate-500 block">liters</span>
                  </div>
                </div>
              </div>

              {/* 4 Meal Category Breakdown */}
              <div className="space-y-3">
                {/* Breakfast */}
                <div className="bg-[#101422] p-3.5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                      <Sun className="w-4 h-4" />
                      <span>Breakfast ({breakfastMeals.length} items)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {breakfastMeals.reduce((acc, m) => acc + m.calories, 0)} kcal • {breakfastMeals.reduce((acc, m) => acc + m.proteinG, 0)}g P
                    </span>
                  </div>
                  {breakfastMeals.map(m => (
                    <div key={m.id} className="p-2.5 bg-[#0B0E17] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.portion} • <strong className="text-amber-400">{m.calories} kcal</strong> ({m.proteinG}g P)</div>
                      </div>
                      <button type="button" onClick={() => handleRemoveMealItem('breakfast', m.id)} className="text-red-400 p-1 hover:bg-red-500/10 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Lunch */}
                <div className="bg-[#101422] p-3.5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                      <Utensils className="w-4 h-4" />
                      <span>Lunch ({lunchMeals.length} items)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {lunchMeals.reduce((acc, m) => acc + m.calories, 0)} kcal • {lunchMeals.reduce((acc, m) => acc + m.proteinG, 0)}g P
                    </span>
                  </div>
                  {lunchMeals.map(m => (
                    <div key={m.id} className="p-2.5 bg-[#0B0E17] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.portion} • <strong className="text-emerald-400">{m.calories} kcal</strong> ({m.proteinG}g P)</div>
                      </div>
                      <button type="button" onClick={() => handleRemoveMealItem('lunch', m.id)} className="text-red-400 p-1 hover:bg-red-500/10 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Snacks */}
                <div className="bg-[#101422] p-3.5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-400 flex items-center gap-1.5">
                      <Cookie className="w-4 h-4" />
                      <span>Snacks ({snackMeals.length} items)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {snackMeals.reduce((acc, m) => acc + m.calories, 0)} kcal • {snackMeals.reduce((acc, m) => acc + m.proteinG, 0)}g P
                    </span>
                  </div>
                  {snackMeals.map(m => (
                    <div key={m.id} className="p-2.5 bg-[#0B0E17] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.portion} • <strong className="text-purple-400">{m.calories} kcal</strong> ({m.proteinG}g P)</div>
                      </div>
                      <button type="button" onClick={() => handleRemoveMealItem('snack', m.id)} className="text-red-400 p-1 hover:bg-red-500/10 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Dinner */}
                <div className="bg-[#101422] p-3.5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#4F7CFF] flex items-center gap-1.5">
                      <Moon className="w-4 h-4" />
                      <span>Dinner ({dinnerMeals.length} items)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {dinnerMeals.reduce((acc, m) => acc + m.calories, 0)} kcal • {dinnerMeals.reduce((acc, m) => acc + m.proteinG, 0)}g P
                    </span>
                  </div>
                  {dinnerMeals.map(m => (
                    <div key={m.id} className="p-2.5 bg-[#0B0E17] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.portion} • <strong className="text-[#4F7CFF]">{m.calories} kcal</strong> ({m.proteinG}g P)</div>
                      </div>
                      <button type="button" onClick={() => handleRemoveMealItem('dinner', m.id)} className="text-red-400 p-1 hover:bg-red-500/10 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Insert Meal Form */}
                <div className="bg-[#101422] p-3.5 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                    + Add Custom Food Item
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newMealCategory}
                      onChange={(e) => setNewMealCategory(e.target.value as any)}
                      className="p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="snack">Snack</option>
                      <option value="dinner">Dinner</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Food Name (e.g. Scrambled Eggs)"
                      value={newMealName}
                      onChange={(e) => setNewMealName(e.target.value)}
                      className="p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Portion (1 Bowl / 200g)"
                      value={newMealPortion}
                      onChange={(e) => setNewMealPortion(e.target.value)}
                      className="p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Calories (kcal)"
                      value={newMealCals}
                      onChange={(e) => setNewMealCals(Number(e.target.value))}
                      className="p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Protein (g)"
                      value={newMealProtein}
                      onChange={(e) => setNewMealProtein(Number(e.target.value))}
                      className="p-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMealItem}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to {newMealCategory.toUpperCase()}</span>
                  </button>
                </div>
              </div>

              {/* Save Diet Button */}
              <button
                type="submit"
                disabled={isSavingDiet}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSavingDiet ? 'Publishing to Database...' : `Save & Publish Diet to ${selectedMemberObj?.name || 'Member'}`}</span>
              </button>
            </form>
          </div>
        )}

      </main>

      {/* ── 3. FIXED BOTTOM MOBILE NAVIGATION ── */}
      <MobileBottomNav
        tabs={bottomNavTabs}
        activeTab={
          ['add-client', 'client-profile'].includes(currentScreen) ? 'clients' :
          ['set-workout', 'set-diet'].includes(currentScreen) ? 'plans' :
          currentScreen === 'broadcast' ? 'more' :
          currentScreen
        }
        onSelectTab={(tabId) => navigateTo(tabId as TrainerScreen)}
        accentColor="#00D4FF"
      />

      {/* ── 4. TRAINER COLLECT PAYMENT MODAL ── */}
      <TrainerCollectPaymentModal
        isOpen={isCollectPaymentOpen}
        onClose={() => {
          setIsCollectPaymentOpen(false);
          setPaymentTargetMember(null);
        }}
        preSelectedMember={paymentTargetMember}
        currentTrainer={currentTrainer}
      />

      {/* ── 5. TRAINER ADD EXPENSE MODAL ── */}
      <TrainerAddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        trainerName={currentTrainer?.name}
      />

    </div>
  );
};
