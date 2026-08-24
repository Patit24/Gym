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

export const INITIAL_BRANCHES: Branch[] = [];

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
    includedFeatures: { personalTraining: true, dietPlan: true, locker: true, steam: false },
    isActive: true
  }
];

export const INITIAL_MEMBERS: Member[] = [];

export const INITIAL_WORKOUT: WorkoutPlan = {
  id: '',
  memberId: '',
  updatedAt: new Date().toISOString().split('T')[0],
  weeklyPlans: []
};

export const INITIAL_DIET: DietPlan = {
  id: '',
  memberId: '',
  waterCurrentLiters: 0,
  monthlyPlans: []
};

export const INITIAL_PROGRESS: ProgressMetric[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_SUPPLEMENTS: SupplementProduct[] = [];

export const INITIAL_LOCKERS: LockerItem[] = [];

export const INITIAL_COMPLAINTS: ComplaintTicket[] = [];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

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

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_WEBSITE_CUSTOMERS: WebsiteCustomer[] = [];

export const INITIAL_APP_USERS: AppUser[] = [
  {
    id: 'USR-MASTERADMIN',
    username: 'MASTERADMIN',
    email: 'masteradmin@smartgym.com',
    role: 'Super Admin',
    linkedId: 'EMP-MASTERADMIN',
    linkedName: 'Master Administrator',
    branchId: 'all',
    createdAt: new Date().toISOString(),
    createdByAdminId: 'system',
    isActive: true,
    mustChangePassword: true,
    isProtected: true,
    permissions: {
      canViewDashboard: true,
      canEditWorkouts: true,
      canEditDiets: true,
      canViewMembers: true,
      canManageFinance: true,
      canAccessAdmin: true,
    }
  }
];

