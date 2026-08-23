import {
  Branch,
  MembershipPlan,
  Member,
  WorkoutPlan,
  DietPlan,
  ProgressMetric,
  AttendanceRecord,
  Lead,
  Employee,
  SupplementProduct,
  LockerItem,
  ComplaintTicket,
  SystemNotification,
  Transaction,
  Expense,
  ExpenseType,
  WebsiteCustomer,
  AppUser
} from '../types/gym';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    name: 'Smart Gym Premier',
    code: 'SGP-01',
    city: 'Downtown Core',
    address: 'Suite 400, Financial District Center',
    phone: '+91 98765 43210',
    activeMembers: 4,
    currentCheckIns: 2,
    monthlyRevenue: 86342,
    capacity: 150,
    manager: 'System Admin',
  }
];

export const INITIAL_PLANS: MembershipPlan[] = [
  {
    id: 'plan-1',
    name: 'Annual VIP All-Access Franchise',
    durationMonths: 12,
    duration: 'Yearly',
    basePrice: 28000,
    joiningFee: 2000,
    gstPercent: 18,
    totalPrice: 35400,
    description: 'Full 12-month unlimited franchise access with personal trainer support and premium steam/sauna.',
    includedAddons: ['Multi-Branch Gate Pass', 'Unlimited Personal Training', 'Steam & Sauna Suite', 'Custom Macro Diet'],
    pricePerBranch: { 'branch-1': 35400 },
    includedFeatures: { personalTraining: true, dietPlan: true, locker: true, steam: true },
    isActive: true,
    isPopular: true
  },
  {
    id: 'plan-2',
    name: 'Quarterly Pro Fitness Pass',
    durationMonths: 3,
    duration: 'Quarterly',
    basePrice: 8500,
    joiningFee: 1000,
    gstPercent: 18,
    totalPrice: 11210,
    description: '3-month intense body transformation plan with bi-weekly trainer assessments.',
    includedAddons: ['Single Branch Access', 'Bi-weekly Trainer Assessment', 'Locker Room Pass'],
    pricePerBranch: { 'branch-1': 11210 },
    includedFeatures: { personalTraining: true, dietPlan: true, locker: true, steam: false },
    isActive: true
  },
  {
    id: 'plan-3',
    name: 'Monthly Flexible Membership',
    durationMonths: 1,
    duration: 'Monthly',
    basePrice: 3200,
    joiningFee: 500,
    gstPercent: 18,
    totalPrice: 4366,
    description: 'No long-term commitment, month-to-month gym floor access.',
    includedAddons: ['Gym Floor Access', 'Locker Access'],
    pricePerBranch: { 'branch-1': 4366 },
    includedFeatures: { personalTraining: false, dietPlan: false, locker: true, steam: false },
    isActive: true
  },
  {
    id: 'plan-4',
    name: 'Half-Yearly Elite Pass',
    durationMonths: 6,
    duration: 'Half-Yearly',
    basePrice: 15500,
    joiningFee: 1500,
    gstPercent: 18,
    totalPrice: 20060,
    description: '6-month balanced fitness & strength program with nutrition consulting.',
    includedAddons: ['Gym Floor Access', 'Diet Consultation', 'Dedicated Locker'],
    pricePerBranch: { 'branch-1': 20060 },
    includedFeatures: { personalTraining: true, dietPlan: true, locker: true, steam: false },
    isActive: true
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'MEM-2026-001',
    membershipNo: 'SG-90210',
    name: 'Alex Morgan',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    faceEnrolled: true,
    mobile: '+91 98765 43210',
    email: 'member@smartgym.com',
    dob: '1998-05-14',
    gender: 'Female',
    heightCm: 172,
    weightKg: 64,
    startWeightKg: 68,
    bmi: 21.6,
    chestCm: 92,
    waistCm: 68,
    armsCm: 32,
    thighsCm: 54,
    bloodGroup: 'O+',
    emergencyContactName: 'Robert Morgan',
    emergencyMobile: '+91 98765 00000',
    address: 'Flat 402, Skyline Residency, Tech City',
    medicalHistory: 'None',
    goal: 'Muscle Building',
    referralSource: 'Instagram',
    branchId: 'branch-1',
    planId: 'plan-1',
    planName: 'Annual VIP All-Access Franchise',
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    expiryDate: '2027-01-01',
    status: 'Active',
    assignedTrainerId: 'emp-1',
    assignedDietitianId: 'emp-2',
    rewardPoints: 350,
    referralCode: 'ALEX2026',
    pendingDues: 0,
    paidAmount: 35400,
    totalPlanAmount: 35400,
    lastPaymentDate: '2026-01-01',
    nextDueDate: '2027-01-01',
    paymentStatus: 'Paid',
    lockerNumber: 'L-101'
  },
  {
    id: 'MEM-2026-002',
    membershipNo: 'SG-90211',
    name: 'Rahul Sharma',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    faceEnrolled: false,
    mobile: '+91 98765 11223',
    email: 'rahul.s@example.com',
    dob: '1995-11-20',
    gender: 'Male',
    heightCm: 178,
    weightKg: 82,
    startWeightKg: 86,
    bmi: 25.9,
    chestCm: 102,
    waistCm: 88,
    armsCm: 36,
    thighsCm: 60,
    bloodGroup: 'B+',
    emergencyContactName: 'Pooja Sharma',
    emergencyMobile: '+91 98765 22334',
    address: '14, Bandra West, Mumbai',
    medicalHistory: 'Mild Knee Pain',
    goal: 'Weight Loss',
    referralSource: 'Walk-in',
    branchId: 'branch-1',
    planId: 'plan-2',
    planName: 'Quarterly Pro Fitness Pass',
    startDate: '2026-02-01',
    endDate: '2026-05-01',
    expiryDate: '2026-05-01',
    status: 'Active',
    assignedTrainerId: 'emp-1',
    rewardPoints: 120,
    referralCode: 'RAHUL2026',
    pendingDues: 3210,
    paidAmount: 8000,
    totalPlanAmount: 11210,
    lastPaymentDate: '2026-02-01',
    nextDueDate: '2026-03-01',
    paymentStatus: 'Partially Paid',
    lockerNumber: 'L-102'
  },
  {
    id: 'MEM-2026-003',
    membershipNo: 'SG-90212',
    name: 'Sneha Patel',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    faceEnrolled: true,
    mobile: '+91 98765 33445',
    email: 'sneha.p@example.com',
    dob: '2001-03-15',
    gender: 'Female',
    heightCm: 165,
    weightKg: 58,
    startWeightKg: 60,
    bmi: 21.3,
    chestCm: 86,
    waistCm: 66,
    armsCm: 28,
    thighsCm: 50,
    bloodGroup: 'A+',
    emergencyContactName: 'Anil Patel',
    emergencyMobile: '+91 98765 44556',
    address: 'A-201, Green Meadows, Andheri',
    medicalHistory: 'None',
    goal: 'Endurance & Cardio',
    referralSource: 'Website',
    branchId: 'branch-1',
    planId: 'plan-3',
    planName: 'Monthly Flexible Membership',
    startDate: '2026-01-24',
    endDate: '2026-02-24',
    expiryDate: '2026-02-24',
    status: 'Expiring Soon',
    rewardPoints: 80,
    referralCode: 'SNEHA2026',
    pendingDues: 0,
    paidAmount: 4366,
    totalPlanAmount: 4366,
    lastPaymentDate: '2026-01-24',
    nextDueDate: '2026-02-24',
    paymentStatus: 'Paid',
    lockerNumber: 'L-103'
  },
  {
    id: 'MEM-2026-004',
    membershipNo: 'SG-90213',
    name: 'Vikram Mehta',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    faceEnrolled: false,
    mobile: '+91 98765 55667',
    email: 'vikram.m@example.com',
    dob: '1992-08-10',
    gender: 'Male',
    heightCm: 182,
    weightKg: 88,
    startWeightKg: 90,
    bmi: 26.6,
    chestCm: 106,
    waistCm: 90,
    armsCm: 38,
    thighsCm: 62,
    bloodGroup: 'AB+',
    emergencyContactName: 'Meera Mehta',
    emergencyMobile: '+91 98765 66778',
    address: '77, Ocean View Towers, Worli',
    medicalHistory: 'Asthma (controlled)',
    goal: 'Body Recomposition',
    referralSource: 'Friend Referral',
    branchId: 'branch-1',
    planId: 'plan-3',
    planName: 'Monthly Flexible Membership',
    startDate: '2026-01-01',
    endDate: '2026-02-01',
    expiryDate: '2026-02-01',
    status: 'Expired',
    rewardPoints: 40,
    referralCode: 'VIKRAM2026',
    pendingDues: 4366,
    paidAmount: 0,
    totalPlanAmount: 4366,
    lastPaymentDate: '2026-01-01',
    nextDueDate: '2026-02-01',
    paymentStatus: 'Pending',
    lockerNumber: undefined
  },
  {
    id: 'MEM-2026-005',
    membershipNo: 'SG-90214',
    name: 'Priya Nair',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    faceEnrolled: true,
    mobile: '+91 98765 77889',
    email: 'priya.n@example.com',
    dob: '1996-07-22',
    gender: 'Female',
    heightCm: 168,
    weightKg: 60,
    startWeightKg: 63,
    bmi: 21.3,
    chestCm: 88,
    waistCm: 69,
    armsCm: 30,
    thighsCm: 52,
    bloodGroup: 'O+',
    emergencyContactName: 'Suresh Nair',
    emergencyMobile: '+91 98765 88990',
    address: 'Villa 12, Palm Grove, Powai',
    medicalHistory: 'None',
    goal: 'Muscle Building',
    referralSource: 'Instagram',
    branchId: 'branch-1',
    planId: 'plan-1',
    planName: 'Annual VIP All-Access Franchise',
    startDate: '2026-02-10',
    endDate: '2027-02-10',
    expiryDate: '2027-02-10',
    status: 'Active',
    assignedTrainerId: 'emp-1',
    rewardPoints: 200,
    referralCode: 'PRIYA2026',
    pendingDues: 15400,
    paidAmount: 20000,
    totalPlanAmount: 35400,
    lastPaymentDate: '2026-02-10',
    nextDueDate: '2026-03-10',
    paymentStatus: 'Partially Paid',
    lockerNumber: 'L-104'
  }
];

export const INITIAL_WORKOUT: WorkoutPlan = {
  id: 'wpt-001',
  memberId: 'MEM-2026-001',
  updatedAt: new Date().toISOString().split('T')[0],
  weeklyPlans: [
    {
      weekNumber: 1,
      weekTitle: 'Hypertrophy Foundations & Structural Balance',
      splits: [
        {
          day: 'Monday',
          title: 'Push Day (Chest, Shoulders, Triceps)',
          exercises: [
            { id: 'ex-1', name: 'Barbell Incline Bench Press', category: 'Chest', targetSets: 4, targetReps: 10, weightKg: 65, restSeconds: 90, completed: false, notes: 'Focus on 3-sec eccentric lowering' },
            { id: 'ex-2', name: 'Seated Dumbbell Shoulder Press', category: 'Shoulders', targetSets: 4, targetReps: 12, weightKg: 20, restSeconds: 60, completed: false },
            { id: 'ex-3', name: 'Incline Cable Chest Flyes', category: 'Chest', targetSets: 3, targetReps: 15, weightKg: 15, restSeconds: 45, completed: false },
            { id: 'ex-4', name: 'Overhead Rope Tricep Extensions', category: 'Arms', targetSets: 4, targetReps: 12, weightKg: 25, restSeconds: 45, completed: false }
          ]
        },
        {
          day: 'Tuesday',
          title: 'Pull Day (Back, Rear Delts, Biceps)',
          exercises: [
            { id: 'ex-5', name: 'Wide Grip Lat Pulldown', category: 'Back', targetSets: 4, targetReps: 10, weightKg: 55, restSeconds: 75, completed: false },
            { id: 'ex-6', name: 'Chest-Supported T-Bar Row', category: 'Back', targetSets: 4, targetReps: 10, weightKg: 40, restSeconds: 90, completed: false },
            { id: 'ex-7', name: 'Face Pulls with External Rotation', category: 'Shoulders', targetSets: 3, targetReps: 15, weightKg: 20, restSeconds: 45, completed: false },
            { id: 'ex-8', name: 'Incline Dumbbell Bicep Curls', category: 'Arms', targetSets: 4, targetReps: 12, weightKg: 12.5, restSeconds: 60, completed: false }
          ]
        },
        {
          day: 'Wednesday',
          title: 'Legs & Core Power',
          exercises: [
            { id: 'ex-9', name: 'Barbell Back Squats', category: 'Legs', targetSets: 4, targetReps: 8, weightKg: 80, restSeconds: 120, completed: false },
            { id: 'ex-10', name: 'Romanian Deadlifts', category: 'Legs', targetSets: 4, targetReps: 10, weightKg: 70, restSeconds: 90, completed: false },
            { id: 'ex-11', name: 'Seated Leg Extensions', category: 'Legs', targetSets: 3, targetReps: 15, weightKg: 45, restSeconds: 60, completed: false },
            { id: 'ex-12', name: 'Hanging Knee/Leg Raises', category: 'Core', targetSets: 3, targetReps: 15, weightKg: 0, restSeconds: 45, completed: false }
          ]
        },
        {
          day: 'Thursday',
          title: 'Active Mobility & Recovery Flow',
          exercises: [
            { id: 'ex-13', name: 'Incline Treadmill Zone 2 Walk', category: 'Cardio', targetSets: 1, targetReps: 30, weightKg: 0, restSeconds: 0, completed: false, notes: '30 mins at 12% incline, 4.5 km/h' },
            { id: 'ex-14', name: 'Hip 90/90 & Thoracic Spine Rotations', category: 'Core', targetSets: 3, targetReps: 10, weightKg: 0, restSeconds: 30, completed: false }
          ]
        },
        {
          day: 'Friday',
          title: 'Upper Body Pump & Symmetry',
          exercises: [
            { id: 'ex-15', name: 'Flat Dumbbell Press', category: 'Chest', targetSets: 4, targetReps: 10, weightKg: 28, restSeconds: 90, completed: false },
            { id: 'ex-16', name: 'Neutral Grip Cable Rows', category: 'Back', targetSets: 4, targetReps: 12, weightKg: 50, restSeconds: 60, completed: false },
            { id: 'ex-17', name: 'Cable Lateral Raises', category: 'Shoulders', targetSets: 4, targetReps: 15, weightKg: 7.5, restSeconds: 45, completed: false },
            { id: 'ex-18', name: 'EZ Bar Preacher Curls', category: 'Arms', targetSets: 3, targetReps: 12, weightKg: 25, restSeconds: 60, completed: false }
          ]
        },
        {
          day: 'Saturday',
          title: 'Lower Body & Hamstring Focus',
          exercises: [
            { id: 'ex-19', name: 'Leg Press (45 Degree Plate Loaded)', category: 'Legs', targetSets: 4, targetReps: 12, weightKg: 160, restSeconds: 90, completed: false },
            { id: 'ex-20', name: 'Lying Hamstring Leg Curls', category: 'Legs', targetSets: 4, targetReps: 12, weightKg: 40, restSeconds: 60, completed: false },
            { id: 'ex-21', name: 'Standing Calf Raises', category: 'Legs', targetSets: 4, targetReps: 20, weightKg: 50, restSeconds: 45, completed: false }
          ]
        },
        {
          day: 'Sunday',
          title: 'Full Rest & Central Nervous System Recovery',
          exercises: []
        }
      ]
    }
  ]
};

export const INITIAL_DIET: DietPlan = {
  id: 'dpt-001',
  memberId: 'MEM-2026-001',
  waterCurrentLiters: 2.2,
  monthlyPlans: [
    {
      monthNumber: 1,
      monthTitle: 'Lean Bulk High-Protein Nutrition Matrix',
      targetCalories: 2450,
      targetProteinG: 165,
      targetCarbsG: 280,
      targetFatG: 65,
      waterTargetLiters: 3.5,
      meals: {
        breakfast: [
          { id: 'm-1', name: 'Oatmeal with Whey Isolate, Chia Seeds & Blueberries', portion: '1 Bowl (80g Oats + 30g Whey)', calories: 480, proteinG: 38, carbsG: 62, fatG: 9, completed: true },
          { id: 'm-2', name: 'Whole Boiled Eggs + 2 Egg Whites', portion: '3 Eggs', calories: 210, proteinG: 18, carbsG: 1, fatG: 14, completed: true }
        ],
        lunch: [
          { id: 'm-3', name: 'Grilled Herb Chicken Breast with Steamed Quinoa & Asparagus', portion: '200g Chicken + 100g Quinoa', calories: 620, proteinG: 54, carbsG: 58, fatG: 12, completed: false },
          { id: 'm-4', name: 'Avocado Greek Yogurt Dressing Salad', portion: '1 Medium Bowl', calories: 140, proteinG: 6, carbsG: 10, fatG: 8, completed: false }
        ],
        snack: [
          { id: 'm-5', name: 'Pre-Workout Rice Cakes with Natural Almond Butter & Banana', portion: '2 Rice Cakes + 20g Butter', calories: 310, proteinG: 9, carbsG: 45, fatG: 10, completed: false },
          { id: 'm-6', name: 'Post-Workout Whey Protein Shake with 5g Creatine Monohydrate', portion: '1 Scoop in 300ml Water', calories: 130, proteinG: 26, carbsG: 2, fatG: 1, completed: false }
        ],
        dinner: [
          { id: 'm-7', name: 'Baked Atlantic Salmon with Sweet Potato Mash & Broccoli', portion: '180g Salmon + 150g Potato', calories: 560, proteinG: 42, carbsG: 48, fatG: 18, completed: false }
        ]
      }
    }
  ]
};

export const INITIAL_PROGRESS: ProgressMetric[] = [
  { id: 'prg-1', memberId: 'MEM-2026-001', date: '2026-01-01', weightKg: 68, bodyFatPercent: 24, chestCm: 90, waistCm: 72, armsCm: 30 },
  { id: 'prg-2', memberId: 'MEM-2026-001', date: '2026-01-15', weightKg: 66.5, bodyFatPercent: 22.8, chestCm: 91, waistCm: 70, armsCm: 31 },
  { id: 'prg-3', memberId: 'MEM-2026-001', date: '2026-02-01', weightKg: 64.8, bodyFatPercent: 21.6, chestCm: 92, waistCm: 68.5, armsCm: 31.8 },
  { id: 'prg-4', memberId: 'MEM-2026-001', date: '2026-02-15', weightKg: 64, bodyFatPercent: 20.9, chestCm: 92, waistCm: 68, armsCm: 32 }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    memberId: 'MEM-2026-001',
    memberName: 'Alex Morgan',
    memberPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    branchId: 'branch-1',
    entryTime: '06:45 AM',
    verificationMethod: 'Dynamic QR',
    deviceInfo: 'Gate Turnstile #1',
    date: new Date().toISOString().split('T')[0],
    status: 'Active In Gym'
  },
  {
    id: 'att-2',
    memberId: 'MEM-2026-002',
    memberName: 'Rahul Sharma',
    memberPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    branchId: 'branch-1',
    entryTime: '07:15 AM',
    verificationMethod: 'Face ID',
    deviceInfo: 'Main Entry Terminal',
    date: new Date().toISOString().split('T')[0],
    status: 'Active In Gym'
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Karan Malhotra',
    phone: '+91 98111 22334',
    mobile: '+91 98111 22334',
    email: 'karan@example.com',
    source: 'Instagram Ad',
    interestGoal: 'Muscle Building & PT',
    goal: 'Muscle Building & PT',
    assignedStaff: 'Vikram Sethi',
    assignedStaffName: 'Vikram Sethi',
    assignedStaffId: 'emp-1',
    branchId: 'branch-1',
    stage: 'Trial Scheduled',
    followUpDate: '2026-02-20',
    notes: 'Requested demo trial session for evening slot'
  },
  {
    id: 'lead-2',
    name: 'Ananya Deshmukh',
    phone: '+91 98222 33445',
    mobile: '+91 98222 33445',
    email: 'ananya@example.com',
    source: 'Walk-in',
    interestGoal: 'Weight Loss & Pilates',
    goal: 'Weight Loss & Pilates',
    assignedStaff: 'Pooja Verma',
    assignedStaffName: 'Pooja Verma',
    assignedStaffId: 'emp-2',
    branchId: 'branch-1',
    stage: 'Interested',
    followUpDate: '2026-02-19',
    notes: 'Inquired about annual pass and female trainer availability'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Vikram Sethi',
    photoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
    role: 'Trainer',
    mobile: '+91 98333 44556',
    email: 'vikram.trainer@smartgym.com',
    branchId: 'branch-1',
    baseSalary: 35000,
    ptCommissionRate: 40,
    ptSessionsCompleted: 24,
    joiningDate: '2025-06-01',
    shift: 'Morning 6AM-2PM',
    attendanceDays: 26
  },
  {
    id: 'emp-2',
    name: 'Pooja Verma',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'Dietitian',
    mobile: '+91 98444 55667',
    email: 'pooja.diet@smartgym.com',
    branchId: 'branch-1',
    baseSalary: 30000,
    ptCommissionRate: 20,
    ptSessionsCompleted: 15,
    joiningDate: '2025-08-15',
    shift: 'General 10AM-6PM',
    attendanceDays: 25
  }
];

export const INITIAL_SUPPLEMENTS: SupplementProduct[] = [
  {
    id: 'supp-1',
    name: 'Gold Standard 100% Whey Isolate (Double Rich Chocolate 2kg)',
    brand: 'Optimum Nutrition',
    category: 'Protein',
    price: 6499,
    stockQty: 24,
    barcode: 'ON-WHEY-2KG-DRC',
    imageUrl: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&auto=format&fit=crop&q=80',
    gstPercent: 18
  },
  {
    id: 'supp-2',
    name: 'Micronized Creatine Monohydrate (Creapure 300g)',
    brand: 'MuscleBlaze',
    category: 'Creatine',
    price: 1299,
    stockQty: 35,
    barcode: 'MB-CREA-300G-RAW',
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&auto=format&fit=crop&q=80',
    gstPercent: 18
  },
  {
    id: 'supp-3',
    name: 'C4 Extreme Pre-Workout High Explosive Energy (Fruit Punch)',
    brand: 'Cellucor',
    category: 'Pre-Workout',
    price: 2499,
    stockQty: 18,
    barcode: 'CEL-C4-FP-30S',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
    gstPercent: 18
  },
  {
    id: 'supp-4',
    name: 'Smart Gym High Energy Daily Multivitamins (60 Capsules)',
    brand: 'PulseFit Nutrition',
    category: 'Vitamins',
    price: 999,
    stockQty: 40,
    barcode: 'PF-VIT-60CAP',
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=80',
    gstPercent: 18
  },
  {
    id: 'supp-5',
    name: 'Smart Gym Stainless Steel Thermal Shaker Bottle 750ml',
    brand: 'PulseFit Gear',
    category: 'Accessories',
    price: 899,
    stockQty: 50,
    barcode: 'PF-SHK-750ML-SS',
    imageUrl: 'https://images.unsplash.com/photo-1570824104453-508955ab713e?w=400&auto=format&fit=crop&q=80',
    gstPercent: 18
  }
];

export const INITIAL_LOCKERS: LockerItem[] = [
  { id: 'lck-1', lockerNumber: 'L-101', branchId: 'branch-1', status: 'Occupied', occupiedByMemberId: 'MEM-2026-001', occupiedByMemberName: 'Alex Morgan' },
  { id: 'lck-2', lockerNumber: 'L-102', branchId: 'branch-1', status: 'Occupied', occupiedByMemberId: 'MEM-2026-002', occupiedByMemberName: 'Rahul Sharma' },
  { id: 'lck-3', lockerNumber: 'L-103', branchId: 'branch-1', status: 'Occupied', occupiedByMemberId: 'MEM-2026-003', occupiedByMemberName: 'Sneha Patel' },
  { id: 'lck-4', lockerNumber: 'L-104', branchId: 'branch-1', status: 'Occupied', occupiedByMemberId: 'MEM-2026-005', occupiedByMemberName: 'Priya Nair' },
  { id: 'lck-5', lockerNumber: 'L-105', branchId: 'branch-1', status: 'Available' }
];

export const INITIAL_COMPLAINTS: ComplaintTicket[] = [
  { id: 'TKT-901', memberId: 'MEM-2026-001', memberName: 'Alex Morgan', category: 'Equipment Maintenance', title: 'Steam room temperature adjustment', description: 'Steam room was operating slightly above set temperature in morning slot.', branchId: 'branch-1', status: 'Resolved', createdAt: '2026-02-10 08:30 AM' }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  { id: 'notif-1', targetRole: 'All', title: 'Welcome to Smart Gym OS 2026', message: 'Your digital gym access, workout logs, and nutrition plans are ready.', timestamp: 'Just now', type: 'system', read: false },
  { id: 'notif-2', targetRole: 'Member', memberId: 'MEM-2026-003', title: 'Membership Expiring Soon', message: 'Your Monthly Flexible pass expires in 4 days. Please renew to avoid gate access interruptions.', timestamp: '2 hours ago', type: 'reminder', read: false }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'TXN-INIT-01', memberId: 'MEM-2026-001', memberName: 'Alex Morgan', branchId: 'branch-1', amount: 35400, paymentMethod: 'UPI', category: 'Membership Dues', date: '2026-01-01', receiptNo: 'RCP-SG-9901', planName: 'Annual VIP All-Access Franchise' },
  { id: 'TXN-INIT-02', memberId: 'MEM-2026-002', memberName: 'Rahul Sharma', branchId: 'branch-1', amount: 8000, paymentMethod: 'Card', category: 'Membership Dues', date: '2026-02-01', receiptNo: 'RCP-SG-9902', planName: 'Quarterly Pro Fitness Pass' },
  { id: 'TXN-INIT-03', memberId: 'MEM-2026-003', memberName: 'Sneha Patel', branchId: 'branch-1', amount: 4366, paymentMethod: 'UPI', category: 'Membership Dues', date: '2026-01-24', receiptNo: 'RCP-SG-9903', planName: 'Monthly Flexible Membership' },
  { id: 'TXN-INIT-04', memberId: 'MEM-2026-005', memberName: 'Priya Nair', branchId: 'branch-1', amount: 20000, paymentMethod: 'Bank Transfer', category: 'Membership Dues', date: '2026-02-10', receiptNo: 'RCP-SG-9904', planName: 'Annual VIP All-Access Franchise' },
  { id: 'TXN-INIT-05', memberId: 'MEM-2026-001', memberName: 'Alex Morgan', branchId: 'branch-1', amount: 6499, paymentMethod: 'UPI', category: 'Supplement Sale', date: '2026-02-12', receiptNo: 'RCP-POS-1001', notes: 'Gold Standard 100% Whey Isolate' },
  { id: 'TXN-INIT-06', memberId: 'MEM-2026-002', memberName: 'Rahul Sharma', branchId: 'branch-1', amount: 1299, paymentMethod: 'Cash', category: 'Supplement Sale', date: '2026-02-14', receiptNo: 'RCP-POS-1002', notes: 'Micronized Creatine Monohydrate' }
];

export const INITIAL_EXPENSE_TYPES: ExpenseType[] = [
  { id: 'ext-1', name: 'Salary', description: 'Employee, trainer, and cleaning staff monthly payroll', isDefault: true, color: '#4F7CFF' },
  { id: 'ext-2', name: 'Rent', description: 'Commercial premises rental fees', isDefault: true, color: '#27D980' },
  { id: 'ext-3', name: 'Electricity', description: 'Commercial power & HVAC electricity bills', isDefault: true, color: '#FFB800' },
  { id: 'ext-4', name: 'Water', description: 'Water supply & sanitation charges', isDefault: true, color: '#00E5FF' },
  { id: 'ext-5', name: 'Internet', description: 'High-speed fiber internet and IoT network gateway', isDefault: true, color: '#7C4DFF' },
  { id: 'ext-6', name: 'Equipment', description: 'Purchase of new fitness machines, weights, and racks', isDefault: true, color: '#FF5252' },
  { id: 'ext-7', name: 'Equipment Repair', description: 'Cables, pulley adjustments, and motor servicing', isDefault: true, color: '#FF6D00' },
  { id: 'ext-8', name: 'Maintenance', description: 'Facility maintenance, paint, and repairs', isDefault: true, color: '#FF4081' },
  { id: 'ext-9', name: 'Cleaning', description: 'Sanitization, towels, and cleaning supplies', isDefault: true, color: '#69F0AE' },
  { id: 'ext-10', name: 'Marketing', description: 'Digital advertising, Instagram ads, print banners', isDefault: true, color: '#E040FB' },
  { id: 'ext-11', name: 'Software', description: 'Cloud hosting, SaaS tools, and domain renewal', isDefault: true, color: '#536DFE' },
  { id: 'ext-12', name: 'Subscription', description: 'Music licenses, gym management integrations', isDefault: true, color: '#448AFF' },
  { id: 'ext-13', name: 'Office Supplies', description: 'Stationery, printer cartridges, and ID cards', isDefault: true, color: '#B0BEC5' },
  { id: 'ext-14', name: 'Transportation', description: 'Equipment delivery and staff logistics', isDefault: true, color: '#FFAB00' },
  { id: 'ext-15', name: 'Utilities', description: 'Municipal taxes, waste management fees', isDefault: true, color: '#00BFA5' },
  { id: 'ext-16', name: 'Other', description: 'Miscellaneous operational expenses', isDefault: true, color: '#9E9E9E' }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'EXP-2026-001',
    name: 'February Trainer & Staff Payroll',
    category: 'Salary',
    amount: 35000,
    date: '2026-02-01',
    paymentMethod: 'Bank Transfer',
    description: 'Monthly payroll for head trainers and support staff',
    branchId: 'branch-1',
    status: 'Paid',
    createdBy: 'System Admin'
  },
  {
    id: 'EXP-2026-002',
    name: 'Gym Floor Monthly Rent',
    category: 'Rent',
    amount: 25000,
    date: '2026-02-01',
    paymentMethod: 'Bank Transfer',
    description: 'Suite 400 commercial rental lease',
    branchId: 'branch-1',
    status: 'Paid',
    createdBy: 'System Admin'
  },
  {
    id: 'EXP-2026-003',
    name: 'Commercial Electricity & AC Bill',
    category: 'Electricity',
    amount: 8500,
    date: '2026-02-05',
    paymentMethod: 'UPI',
    description: 'Monthly electricity bill for heavy HVAC & lighting',
    branchId: 'branch-1',
    status: 'Paid',
    createdBy: 'System Admin'
  },
  {
    id: 'EXP-2026-004',
    name: 'Treadmill Cable & Motor Maintenance',
    category: 'Equipment Repair',
    amount: 3200,
    date: '2026-02-11',
    paymentMethod: 'Card',
    description: 'Lubrication and belt alignment for Cardio Zone #3 & #4',
    branchId: 'branch-1',
    status: 'Paid',
    createdBy: 'System Admin'
  },
  {
    id: 'EXP-2026-005',
    name: 'High-Speed Fiber IoT Internet',
    category: 'Internet',
    amount: 1499,
    date: '2026-02-08',
    paymentMethod: 'UPI',
    description: 'Dedicated 300Mbps fiber line for gate turnstiles and member Wi-Fi',
    branchId: 'branch-1',
    status: 'Paid',
    createdBy: 'System Admin'
  },
  {
    id: 'EXP-2026-006',
    name: 'Instagram & Meta Lead Generation Campaign',
    category: 'Marketing',
    amount: 4500,
    date: '2026-02-14',
    paymentMethod: 'Card',
    description: 'Targeted local geo-ads for New Year fitness transformation packages',
    branchId: 'branch-1',
    status: 'Paid',
    createdBy: 'System Admin'
  }
];

export const INITIAL_WEBSITE_CUSTOMERS: WebsiteCustomer[] = [
  {
    id: 'CUST-001',
    name: 'Priya Sharma',
    email: 'customer@smartgym.com',
    phone: '+91 98765 11223',
    registeredDate: '2026-02-10',
    trialPassUsed: false,
    activePassName: '3-Day Free VIP Trial Pass',
    bookedClasses: [
      {
        id: 'BK-101',
        className: 'HIIT & Functional Core Blast',
        instructor: 'Rohan Verma (Master Trainer)',
        dateTime: 'Tomorrow, 07:00 AM',
        branchName: 'Downtown Premier Club',
        status: 'Confirmed'
      },
      {
        id: 'BK-102',
        className: 'Power Vinyasa Yoga Flow',
        instructor: 'Ananya Sen (Yoga Specialist)',
        dateTime: 'Saturday, 08:30 AM',
        branchName: 'Downtown Premier Club',
        status: 'Confirmed'
      }
    ],
    purchasedPasses: [
      {
        id: 'PASS-9901',
        passName: '3-Day VIP Club Trial Pass',
        purchaseDate: '2026-02-18',
        expiryDate: '2026-02-28',
        price: 0,
        qrToken: 'SG-TRIAL-9901-PRIYA-2026',
        status: 'Active'
      }
    ]
  }
];

export const INITIAL_APP_USERS: AppUser[] = [
  {
    id: 'USR-ADMIN-01',
    username: 'admin@smartgym.com',
    email: 'admin@smartgym.com',
    password: 'admin123',
    tempPassword: 'admin123',
    role: 'Super Admin',
    linkedId: 'EMP-ADMIN',
    linkedName: 'System Super Admin',
    branchId: 'branch-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    createdByAdminId: 'system',
    isActive: true,
    mustChangePassword: false,
    permissions: {
      canViewDashboard: true,
      canEditWorkouts: true,
      canEditDiets: true,
      canViewMembers: true,
      canManageFinance: true,
      canAccessAdmin: true,
    }
  },
  {
    id: 'USR-ADMIN-02',
    username: 'ADMIN01',
    email: 'admin@smartgym.com',
    password: 'admin123',
    tempPassword: 'admin123',
    role: 'Super Admin',
    linkedId: 'EMP-ADMIN',
    linkedName: 'System Super Admin',
    branchId: 'branch-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    createdByAdminId: 'system',
    isActive: true,
    mustChangePassword: false,
    permissions: {
      canViewDashboard: true,
      canEditWorkouts: true,
      canEditDiets: true,
      canViewMembers: true,
      canManageFinance: true,
      canAccessAdmin: true,
    }
  },
  {
    id: 'USR-TRN-01',
    username: 'trainer@smartgym.com',
    email: 'trainer@smartgym.com',
    password: 'trainer123',
    tempPassword: 'trainer123',
    role: 'Trainer',
    linkedId: 'EMP-001',
    linkedName: 'Vikram Rajput',
    branchId: 'branch-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    createdByAdminId: 'system',
    isActive: true,
    mustChangePassword: false,
    permissions: {
      canViewDashboard: true,
      canEditWorkouts: true,
      canEditDiets: true,
      canViewMembers: true,
      canManageFinance: false,
      canAccessAdmin: false,
    }
  },
  {
    id: 'USR-MEM-01',
    username: 'member@smartgym.com',
    email: 'member@smartgym.com',
    password: 'member123',
    tempPassword: 'member123',
    role: 'Member',
    linkedId: 'MEM-2026-001',
    linkedName: 'Alex Morgan',
    branchId: 'branch-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    createdByAdminId: 'system',
    isActive: true,
    mustChangePassword: false,
    permissions: {
      canViewDashboard: true,
      canEditWorkouts: false,
      canEditDiets: false,
      canViewMembers: false,
      canManageFinance: false,
      canAccessAdmin: false,
    }
  }
];

