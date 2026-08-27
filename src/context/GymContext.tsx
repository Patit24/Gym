import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Role,
  BranchId,
  Branch,
  Member,
  MembershipPlan,
  AttendanceRecord,
  WorkoutPlan,
  WeeklyWorkoutPlan,
  DietPlan,
  MonthlyDietPlan,
  DailyWorkoutSplit,
  ProgressMetric,
  Lead,
  Employee,
  SupplementProduct,
  EquipmentItem,
  MaintenanceLog,
  StockPurchase,
  LockerItem,
  ComplaintTicket,
  SystemNotification,
  Transaction,
  Expense,
  ExpenseType,
  AppUser,
  WebsiteCustomer,
  AuditLog,
  WorkoutSessionLog,
  WorkoutSetLog,
  PersonalRecord,
  TrainerNote,
  DailyWellnessCheckin,
  MembershipFreezeRecord,
  GymChallenge,
  ReferralRecord
} from '../types/gym';
import {
  generateUniqueUsername,
  generateUniqueStaffUsername,
  generateSecureTemporaryPassword,
  normalizePhoneNumber,
  buildWhatsAppCredentialMessage,
  dispatchWhatsAppCredentials
} from '../services/memberProvisioningService';
import {
  INITIAL_BRANCHES,
  INITIAL_PLANS,
  INITIAL_MEMBERS,
  INITIAL_WORKOUT,
  INITIAL_DIET,
  INITIAL_PROGRESS,
  INITIAL_ATTENDANCE,
  INITIAL_LEADS,
  INITIAL_EMPLOYEES,
  INITIAL_SUPPLEMENTS,
  INITIAL_EQUIPMENT,
  INITIAL_MAINTENANCE_LOGS,
  INITIAL_STOCK_PURCHASES,
  INITIAL_LOCKERS,
  INITIAL_COMPLAINTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_EXPENSES,
  INITIAL_EXPENSE_TYPES,
  INITIAL_WEBSITE_CUSTOMERS,
  INITIAL_APP_USERS
} from '../data/initialData';
import { db, auth, createIsolatedAuthUser } from '../firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDocs, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User, signOut, updatePassword } from 'firebase/auth';

interface GymContextType {
  firebaseUser: User | null;
  isAuthLoading: boolean;
  appUserAccount: AppUser | null;
  subscriptionStatus: 'active' | 'expired' | 'none';
  signOutApp: () => Promise<void>;
  setLocalSessionUser: (user: AppUser) => void;

  // Website Customer Authentication & Experience
  authContext: 'app' | 'website' | null;
  websiteCustomer: WebsiteCustomer | null;
  websiteCustomers: WebsiteCustomer[];
  signInWebsiteCustomer: (email: string, pass: string) => Promise<WebsiteCustomer>;
  signUpWebsiteCustomer: (data: { name: string; email: string; phone: string }) => Promise<WebsiteCustomer>;
  signOutWebsite: () => Promise<void>;
  claimWebsiteTrialPass: (customerId: string, passName: string) => Promise<void>;
  bookWebsiteClass: (customerId: string, booking: any) => Promise<void>;
  
  perspective: 'mobile' | 'erp' | 'hardware';
  setPerspective: (p: 'mobile' | 'erp' | 'hardware') => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  selectedBranchId: BranchId;
  setSelectedBranchId: (id: BranchId) => void;
  
  branches: Branch[];
  plans: MembershipPlan[];
  members: Member[];
  attendance: AttendanceRecord[];
  activeMember: Member;
  activeMemberId: string;
  setActiveMemberId: (id: string) => void;
  workout: WorkoutPlan;
  diet: DietPlan;
  progress: ProgressMetric[];
  leads: Lead[];
  employees: Employee[];
  supplements: SupplementProduct[];
  equipment: EquipmentItem[];
  maintenanceLogs: MaintenanceLog[];
  stockPurchases: StockPurchase[];
  lockers: LockerItem[];
  complaints: ComplaintTicket[];
  notifications: SystemNotification[];
  transactions: Transaction[];
  expenses: Expense[];
  expenseTypes: ExpenseType[];
  appUsers: AppUser[];
  auditLogs: AuditLog[];
  workoutLogs: WorkoutSessionLog[];
  personalRecords: PersonalRecord[];
  trainerNotes: TrainerNote[];
  wellnessCheckins: DailyWellnessCheckin[];
  freezeRecords: MembershipFreezeRecord[];
  membershipFreezes: MembershipFreezeRecord[];
  challenges: GymChallenge[];
  gymChallenges: GymChallenge[];
  referrals: ReferralRecord[];

  // Dynamic Actions & Provisioning
  provisionMemberWithAccount: (
    newMemberData: Omit<Member, 'id' | 'membershipNo' | 'status' | 'rewardPoints' | 'referralCode'>,
    options?: { createLogin?: boolean; sendWhatsApp?: boolean }
  ) => Promise<{
    member: Member;
    appUser?: AppUser;
    tempPassword?: string;
    whatsappDirectUrl?: string;
    whatsappStatus: 'SENT' | 'FAILED' | 'NOT_SENT';
  }>;
  provisionTrainerWithAccount: (
    empData: Omit<Employee, 'id'>,
    options?: { sendWhatsApp?: boolean }
  ) => Promise<{
    employee: Employee;
    appUser: AppUser;
    tempPassword: string;
    whatsappDirectUrl?: string;
    whatsappStatus: 'SENT' | 'FAILED' | 'NOT_SENT';
  }>;
  resetMemberPassword: (memberId: string) => Promise<{ newTempPassword: string; whatsappDirectUrl?: string }>;
  updateAccountStatus: (memberId: string, isActive: boolean) => Promise<void>;
  updateUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  forceUserPasswordChange: (userId: string) => Promise<void>;
  updateUserRoleAndBranch: (userId: string, role: Role, branchId: string) => Promise<void>;
  deleteUserAccount: (userId: string) => Promise<void>;
  completeFirstLoginPasswordChange: (userId: string, newPassword: string) => Promise<void>;
  resendMemberCredentials: (memberId: string) => Promise<{ success: boolean; whatsappDirectUrl?: string }>;
  addBranch: (newBranchData: Omit<Branch, 'id' | 'activeMembers' | 'currentCheckIns' | 'monthlyRevenue'>) => Promise<Branch>;

  generateNewToken: (memberId: string) => string;
  scanDoorQR: (qrToken: string, targetBranchId: BranchId, verificationMethod?: 'Dynamic QR' | 'Face ID') => { success: boolean; message: string; member?: Member };
  manualCheckIn: (targetMemberId?: string, targetBranchId?: string) => Promise<{ success: boolean; message: string; record?: AttendanceRecord }>;
  manualCheckOut: (targetMemberId?: string) => Promise<{ success: boolean; message: string }>;
  addMember: (newMember: Omit<Member, 'id' | 'membershipNo' | 'status' | 'rewardPoints' | 'referralCode'>) => Promise<Member>;
  updateMember: (id: string, updatedData: Partial<Member>) => Promise<void>;
  recordMemberPayment: (memberId: string, amount: number, paymentMethod: Transaction['paymentMethod'], notes?: string) => Promise<Transaction>;
  
  toggleExerciseCompleted: (weekNumber: number, day: string, exerciseId: string) => Promise<void>;
  toggleMealCompleted: (monthNumber: number, mealCategory: 'breakfast' | 'lunch' | 'snack' | 'dinner', mealId: string) => Promise<void>;
  addWaterIntake: (amountLiters: number) => Promise<void>;
  
  addWeeklyWorkout: (targetMemberId: string, weekNumber: number, weekTitle: string, splits: DailyWorkoutSplit[]) => Promise<void>;
  addMonthlyDiet: (targetMemberId: string, monthPlan: MonthlyDietPlan) => Promise<void>;

  logWorkoutSession: (session: Omit<WorkoutSessionLog, 'id'>) => Promise<WorkoutSessionLog>;
  addTrainerNote: (note: Omit<TrainerNote, 'id' | 'createdAt'>) => Promise<TrainerNote>;
  addWellnessCheckin: (checkin: Omit<DailyWellnessCheckin, 'id' | 'recordedAt'>) => Promise<DailyWellnessCheckin>;
  freezeMembership: (freeze: Partial<MembershipFreezeRecord> & { memberId: string; startDate: string; endDate: string; reason: string }) => Promise<MembershipFreezeRecord>;
  addChallenge: (challenge: Omit<GymChallenge, 'id'>) => Promise<GymChallenge>;
  joinChallenge: (challengeId: string, memberId: string, memberName?: string) => Promise<void>;
  addReferral: (ref: Omit<ReferralRecord, 'id'>) => Promise<ReferralRecord>;
  rewardReferral: (referralId: string) => Promise<void>;
  convertLeadToMember: (leadId: string, planId?: string, trainerId?: string) => Promise<Member>;

  buySupplements: (cartItems: { product: SupplementProduct; qty: number }[], paymentMethod: 'Cash' | 'UPI' | 'Card' | 'NetBanking') => Promise<Transaction>;
  addSupplement: (product: Omit<SupplementProduct, 'id'>) => Promise<SupplementProduct>;
  updateSupplement: (id: string, updated: Partial<SupplementProduct>) => Promise<void>;
  addEquipment: (item: Omit<EquipmentItem, 'id'>) => Promise<EquipmentItem>;
  updateEquipment: (id: string, updated: Partial<EquipmentItem>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id'>) => Promise<MaintenanceLog>;
  addStockPurchase: (purchase: Omit<StockPurchase, 'id'>) => Promise<StockPurchase>;
  addProgressMetric: (metric: Omit<ProgressMetric, 'id'>) => Promise<ProgressMetric>;
  addLead: (lead: Omit<Lead, 'id'>) => Promise<void>;
  updateLeadStage: (id: string, stage: Lead['stage']) => Promise<void>;
  createComplaint: (complaint: Omit<ComplaintTicket, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  resolveComplaint: (id: string) => Promise<void>;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  sendBulkNotification: (targetFilter: 'all' | 'unpaid' | 'expiring' | 'expired' | 'single', title: string, message: string, singleMemberId?: string) => Promise<void>;
  renewSubscription: (memberId: string, planId: string) => Promise<void>;
  
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>;
  updateExpense: (id: string, updated: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addExpenseType: (name: string, description?: string) => Promise<void>;
  deleteExpenseType: (id: string) => Promise<{ success: boolean; message?: string }>;
  
  addMembershipPlan: (plan: MembershipPlan) => Promise<void>;
  updateMembershipPlan: (id: string, updated: Partial<MembershipPlan>) => Promise<void>;
  deleteMembershipPlan: (id: string) => Promise<{ success: boolean; message?: string }>;
  
  addAppUser: (user: AppUser) => Promise<void>;
  addEmployee: (emp: Employee) => Promise<void>;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

// Safe background write wrapper with 15s timeout so cloud latency never triggers false local-mode warnings
const safeDbWrite = (promise: Promise<any>, timeoutMs = 15000) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Firestore operation timeout')), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]).catch((err) => {
    if (err?.message !== 'Firestore operation timeout') {
      console.warn('Firestore sync note:', err?.message || err);
    }
    return null;
  });
};

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authResolved, setAuthResolved] = useState<boolean>(false);
  const [appUsersLoaded, setAppUsersLoaded] = useState<boolean>(false);
  const [appUserAccount, setAppUserAccount] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('gym_app_user_account');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'expired' | 'none'>('none');

  const isAuthLoading = !authResolved;

  const [perspective, setPerspectiveState] = useState<'mobile' | 'erp' | 'hardware'>('erp');
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    try {
      const saved = localStorage.getItem('gym_app_user_account');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role) return u.role;
      }
    } catch {}
    return 'Super Admin';
  });
  const [selectedBranchId, setSelectedBranchId] = useState<BranchId>('branch-1');

  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [plans, setPlans] = useState<MembershipPlan[]>(INITIAL_PLANS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [activeMemberId, setActiveMemberIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('gym_app_user_account');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'Member' && u.linkedId) return u.linkedId;
      }
    } catch {}
    return '';
  });

  const [workout, setWorkout] = useState<WorkoutPlan>(INITIAL_WORKOUT);
  const [diet, setDiet] = useState<DietPlan>(INITIAL_DIET);
  const [progress, setProgress] = useState<ProgressMetric[]>(INITIAL_PROGRESS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [supplements, setSupplements] = useState<SupplementProduct[]>(INITIAL_SUPPLEMENTS);
  const [equipment, setEquipment] = useState<EquipmentItem[]>(INITIAL_EQUIPMENT);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(INITIAL_MAINTENANCE_LOGS);
  const [stockPurchases, setStockPurchases] = useState<StockPurchase[]>(INITIAL_STOCK_PURCHASES);
  const [lockers, setLockers] = useState<LockerItem[]>(INITIAL_LOCKERS);
  const [complaints, setComplaints] = useState<ComplaintTicket[]>(INITIAL_COMPLAINTS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>(INITIAL_EXPENSE_TYPES);
  const [appUsers, setAppUsers] = useState<AppUser[]>(INITIAL_APP_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [wellnessCheckins, setWellnessCheckins] = useState<DailyWellnessCheckin[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutSessionLog[]>([]);
  const [trainerNotes, setTrainerNotes] = useState<TrainerNote[]>([]);
  const [freezeRecords, setFreezeRecords] = useState<MembershipFreezeRecord[]>([]);
  const [challenges, setChallenges] = useState<GymChallenge[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);

  const activeMember: Member = useMemo(() => {
    // 1. If authenticated user is a Member, their own profile is ALWAYS top priority
    if (appUserAccount && appUserAccount.role === 'Member') {
      const targetId = appUserAccount.linkedId || appUserAccount.id;
      const targetUname = (appUserAccount.username || '').toLowerCase();
      const targetEmail = (appUserAccount.email || '').toLowerCase();

      const foundByUser = members.find(
        (m) =>
          m.id === targetId ||
          m.id === appUserAccount.id ||
          m.userId === appUserAccount.id ||
          m.userId === targetId ||
          (m.username && m.username.toLowerCase() === targetUname) ||
          (m.email && m.email.toLowerCase() === targetEmail) ||
          (m.membershipNo && m.membershipNo.toLowerCase() === targetUname) ||
          (m.membershipNo && targetUname && m.membershipNo.toLowerCase().replace(/\D/g, '') === targetUname.replace(/\D/g, ''))
      );
      if (foundByUser) return foundByUser;

      // If member record is still syncing from Firestore, synthesize their exact profile from appUserAccount (NEVER leak another member's profile!)
      return {
        id: targetId,
        membershipNo: `SG-${appUserAccount.username || 'NEW'}`,
        name: appUserAccount.linkedName || appUserAccount.username || 'Member',
        photoUrl: '',
        faceEnrolled: false,
        mobile: '',
        email: appUserAccount.email || '',
        dob: '',
        gender: 'Male',
        heightCm: 0,
        weightKg: 0,
        startWeightKg: 0,
        bmi: 0,
        chestCm: 0,
        waistCm: 0,
        armsCm: 0,
        thighsCm: 0,
        bloodGroup: '',
        emergencyContactName: '',
        emergencyMobile: '',
        address: '',
        medicalHistory: '',
        goal: 'Muscle Building',
        referralSource: 'Direct',
        branchId: appUserAccount.branchId || 'branch-1',
        planId: 'plan-1',
        planName: 'Standard Plan',
        startDate: appUserAccount.createdAt ? appUserAccount.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'Active',
        pendingDues: 0,
        paidAmount: 0,
        totalPlanAmount: 0,
      } as Member;
    }

    // 2. For Admin or Trainer inspecting a specific trainee via activeMemberId:
    if (activeMemberId) {
      const foundById = members.find((m) => m.id === activeMemberId);
      if (foundById) return foundById;
    }

    // 3. For Staff/Admin when no specific trainee is selected, return clean empty record (NEVER leak another member's profile)
    return {
      id: '',
      membershipNo: '',
      name: '',
      photoUrl: '',
      faceEnrolled: false,
      mobile: '',
      email: '',
      dob: '',
      gender: 'Male',
      heightCm: 0,
      weightKg: 0,
      startWeightKg: 0,
      bmi: 0,
      chestCm: 0,
      waistCm: 0,
      armsCm: 0,
      thighsCm: 0,
      bloodGroup: '',
      emergencyContactName: '',
      emergencyMobile: '',
      address: '',
      medicalHistory: '',
      goal: 'General Fitness',
      referralSource: 'Direct',
      branchId: '',
      planId: '',
      planName: '',
      startDate: '',
      endDate: '',
      status: 'Expired',
      pendingDues: 0,
      paidAmount: 0,
      totalPlanAmount: 0,
      rewardPoints: 0,
      referralCode: '',
    } as unknown as Member;
  }, [appUserAccount, members, activeMemberId]);

  const personalRecords = useMemo<PersonalRecord[]>(() => {
    const prMap: { [exerciseName: string]: PersonalRecord } = {};
    const sortedLogs = [...workoutLogs].sort((a, b) => a.date.localeCompare(b.date));
    sortedLogs.forEach((session) => {
      session.exercises?.forEach((ex) => {
        const exName = ex.exerciseName?.trim();
        if (!exName) return;
        const completedSets = ex.sets?.filter((s) => s.completed && s.weightKg > 0) || [];
        completedSets.forEach((s) => {
          const existing = prMap[exName];
          if (!existing || s.weightKg > existing.maxWeightKg) {
            prMap[exName] = {
              id: `PR-${session.memberId}-${exName.replace(/\s+/g, '-')}`,
              memberId: session.memberId,
              exerciseName: exName,
              maxWeightKg: s.weightKg,
              reps: s.reps,
              achievedDate: session.date,
              previousMaxWeightKg: existing ? existing.maxWeightKg : undefined,
            };
          }
        });
      });
    });
    return Object.values(prMap);
  }, [workoutLogs]);

  // Website Customer State & Persistence
  const [authContext, setAuthContext] = useState<'app' | 'website' | null>(() => {
    return (localStorage.getItem('gym_auth_context') as 'app' | 'website') || null;
  });
  const [websiteCustomers, setWebsiteCustomers] = useState<WebsiteCustomer[]>(INITIAL_WEBSITE_CUSTOMERS);
  const [websiteCustomer, setWebsiteCustomer] = useState<WebsiteCustomer | null>(() => {
    const storedId = localStorage.getItem('gym_website_customer_id');
    if (storedId) {
      const found = INITIAL_WEBSITE_CUSTOMERS.find(c => c.id === storedId || c.email.toLowerCase() === storedId.toLowerCase());
      return found || INITIAL_WEBSITE_CUSTOMERS[0];
    }
    return null;
  });

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthResolved(true);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore listeners
  useEffect(() => {
    const unsubBranches = onSnapshot(collection(db, 'branches'), (snap) => {
      if (!snap.empty) {
        const list: Branch[] = [];
        snap.forEach(doc => list.push(doc.data() as Branch));
        setBranches(list);
      }
    });

    const unsubPlans = onSnapshot(collection(db, 'plans'), (snap) => {
      if (!snap.empty) {
        const list: MembershipPlan[] = [];
        snap.forEach(doc => list.push(doc.data() as MembershipPlan));
        setPlans(list);
      }
    });

    const unsubMembers = onSnapshot(collection(db, 'members'), (snap) => {
      if (!snap.empty) {
        const list: Member[] = [];
        snap.forEach(doc => list.push(doc.data() as Member));
        setMembers(list);
      }
    });

    const unsubEmployees = onSnapshot(collection(db, 'employees'), (snap) => {
      if (!snap.empty) {
        const list: Employee[] = [];
        snap.forEach(doc => list.push(doc.data() as Employee));
        setEmployees(list);
      }
    });

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snap) => {
      if (!snap.empty) {
        const list: AttendanceRecord[] = [];
        snap.forEach(doc => list.push(doc.data() as AttendanceRecord));
        setAttendance(list.sort((a, b) => b.id.localeCompare(a.id)));
      }
    });

    const unsubSupplements = onSnapshot(collection(db, 'supplements'), (snap) => {
      if (!snap.empty) {
        const list: SupplementProduct[] = [];
        snap.forEach(doc => list.push(doc.data() as SupplementProduct));
        setSupplements(list);
      }
    });

    const unsubEquipment = onSnapshot(collection(db, 'equipment'), (snap) => {
      if (!snap.empty) {
        const list: EquipmentItem[] = [];
        snap.forEach(doc => list.push(doc.data() as EquipmentItem));
        setEquipment(list);
      }
    });

    const unsubMaintenanceLogs = onSnapshot(collection(db, 'maintenance_logs'), (snap) => {
      if (!snap.empty) {
        const list: MaintenanceLog[] = [];
        snap.forEach(doc => list.push(doc.data() as MaintenanceLog));
        setMaintenanceLogs(list.sort((a, b) => b.serviceDate.localeCompare(a.serviceDate)));
      }
    });

    const unsubStockPurchases = onSnapshot(collection(db, 'stock_purchases'), (snap) => {
      if (!snap.empty) {
        const list: StockPurchase[] = [];
        snap.forEach(doc => list.push(doc.data() as StockPurchase));
        setStockPurchases(list.sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate)));
      }
    });

    const unsubLockers = onSnapshot(collection(db, 'lockers'), (snap) => {
      if (!snap.empty) {
        const list: LockerItem[] = [];
        snap.forEach(doc => list.push(doc.data() as LockerItem));
        setLockers(list);
      }
    });

    const unsubComplaints = onSnapshot(collection(db, 'complaints'), (snap) => {
      if (!snap.empty) {
        const list: ComplaintTicket[] = [];
        snap.forEach(doc => list.push(doc.data() as ComplaintTicket));
        setComplaints(list);
      }
    });

    const unsubNotifications = onSnapshot(collection(db, 'notifications'), (snap) => {
      if (!snap.empty) {
        const list: SystemNotification[] = [];
        snap.forEach(doc => list.push(doc.data() as SystemNotification));
        setNotifications(list.sort((a, b) => b.id.localeCompare(a.id)));
      }
    });

    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snap) => {
      if (!snap.empty) {
        const list: Transaction[] = [];
        snap.forEach(doc => list.push(doc.data() as Transaction));
        setTransactions(list.sort((a, b) => b.id.localeCompare(a.id)));
      }
    });

    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snap) => {
      if (!snap.empty) {
        const list: Expense[] = [];
        snap.forEach(doc => list.push(doc.data() as Expense));
        setExpenses(list.sort((a, b) => b.date.localeCompare(a.date)));
      }
    });

    const unsubExpenseTypes = onSnapshot(collection(db, 'expense_types'), (snap) => {
      if (!snap.empty) {
        const list: ExpenseType[] = [];
        snap.forEach(doc => list.push(doc.data() as ExpenseType));
        setExpenseTypes(list);
      }
    });

    const unsubProgress = onSnapshot(collection(db, 'progress'), (snap) => {
      if (!snap.empty) {
        const list: ProgressMetric[] = [];
        snap.forEach(doc => list.push(doc.data() as ProgressMetric));
        setProgress(list);
      }
    });

    const unsubLeads = onSnapshot(collection(db, 'leads'), (snap) => {
      if (!snap.empty) {
        const list: Lead[] = [];
        snap.forEach(doc => list.push(doc.data() as Lead));
        setLeads(list);
      }
    });

    const unsubAppUsers = onSnapshot(collection(db, 'users'), (snap) => {
      if (!snap.empty) {
        const list: AppUser[] = [];
        snap.forEach(doc => list.push(doc.data() as AppUser));
        const merged = [...list];
        INITIAL_APP_USERS.forEach((initU) => {
          if (!merged.some(u => u.username.toLowerCase() === initU.username.toLowerCase() || (u.email && u.email.toLowerCase() === initU.email?.toLowerCase()))) {
            merged.push(initU);
          }
        });
        setAppUsers(merged);
      } else {
        setAppUsers(INITIAL_APP_USERS);
      }
      setAppUsersLoaded(true);
    }, (error) => {
      console.warn("Firestore sync in local memory mode:", error);
      setAppUsers(INITIAL_APP_USERS);
      setAppUsersLoaded(true);
    });

    const unsubAuditLogs = onSnapshot(collection(db, 'audit_logs'), (snap) => {
      if (!snap.empty) {
        const list: AuditLog[] = [];
        snap.forEach(doc => list.push(doc.data() as AuditLog));
        setAuditLogs(list.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
      }
    });

    const unsubWorkoutLogs = onSnapshot(collection(db, 'workout_logs'), (snap) => {
      if (!snap.empty) {
        const list: WorkoutSessionLog[] = [];
        snap.forEach(doc => list.push(doc.data() as WorkoutSessionLog));
        setWorkoutLogs(list.sort((a, b) => b.date.localeCompare(a.date)));
      }
    });

    const unsubTrainerNotes = onSnapshot(collection(db, 'trainer_notes'), (snap) => {
      if (!snap.empty) {
        const list: TrainerNote[] = [];
        snap.forEach(doc => list.push(doc.data() as TrainerNote));
        setTrainerNotes(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      }
    });

    const unsubWellnessCheckins = onSnapshot(collection(db, 'wellness_checkins'), (snap) => {
      if (!snap.empty) {
        const list: DailyWellnessCheckin[] = [];
        snap.forEach(doc => list.push(doc.data() as DailyWellnessCheckin));
        setWellnessCheckins(list.sort((a, b) => b.date.localeCompare(a.date)));
      }
    });

    const unsubFreezeRecords = onSnapshot(collection(db, 'membership_freezes'), (snap) => {
      if (!snap.empty) {
        const list: MembershipFreezeRecord[] = [];
        snap.forEach(doc => list.push(doc.data() as MembershipFreezeRecord));
        setFreezeRecords(list.sort((a, b) => b.startDate.localeCompare(a.startDate)));
      }
    });

    const unsubChallenges = onSnapshot(collection(db, 'gym_challenges'), (snap) => {
      if (!snap.empty) {
        const list: GymChallenge[] = [];
        snap.forEach(doc => list.push(doc.data() as GymChallenge));
        setChallenges(list);
      }
    });

    const unsubReferrals = onSnapshot(collection(db, 'member_referrals'), (snap) => {
      if (!snap.empty) {
        const list: ReferralRecord[] = [];
        snap.forEach(doc => list.push(doc.data() as ReferralRecord));
        setReferrals(list.sort((a, b) => b.date.localeCompare(a.date)));
      }
    });

    return () => {
      unsubBranches();
      unsubPlans();
      unsubMembers();
      unsubEmployees();
      unsubAttendance();
      unsubSupplements();
      unsubEquipment();
      unsubMaintenanceLogs();
      unsubStockPurchases();
      unsubLockers();
      unsubComplaints();
      unsubNotifications();
      unsubTransactions();
      unsubExpenses();
      unsubExpenseTypes();
      unsubProgress();
      unsubLeads();
      unsubAppUsers();
      unsubAuditLogs();
      unsubWorkoutLogs();
      unsubTrainerNotes();
      unsubWellnessCheckins();
      unsubFreezeRecords();
      unsubChallenges();
      unsubReferrals();
    };
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      // Strict session flush: NEVER retain previous profile or role across sessions
      setAppUserAccount(null);
      setCurrentRole('Member');
      setActiveMemberIdState('');
      setWorkout(INITIAL_WORKOUT);
      setDiet(INITIAL_DIET);
      setProgress([]);
      setWorkoutLogs([]);
      setTrainerNotes([]);
      setWellnessCheckins([]);
      setFreezeRecords([]);
      setReferrals([]);
      setSubscriptionStatus('none');
      try {
        localStorage.removeItem('gym_app_user_account');
        localStorage.removeItem('gym_auth_context');
      } catch {}
      return;
    }

    const authUid = firebaseUser.uid;
    const rawEmail = (firebaseUser.email || '').toLowerCase().trim();
    const emailPrefix = rawEmail.includes('@') ? rawEmail.split('@')[0] : rawEmail;

    const resolveAuthProfile = async () => {
      // 1. Master Administrator Direct Bootstrap Resolution
      if (
        rawEmail === 'masteradmin@smartgym.com' ||
        rawEmail === 'masteradmin@smartgym.internal' ||
        emailPrefix === 'masteradmin'
      ) {
        const existingMaster = appUsers.find(
          (u) => u.username?.toUpperCase() === 'MASTERADMIN' || u.email?.toLowerCase().includes('masteradmin')
        );
        const masterAccount: AppUser = {
          id: authUid,
          username: 'MASTERADMIN',
          email: 'masteradmin@smartgym.com',
          role: 'Super Admin',
          linkedId: 'EMP-MASTERADMIN',
          linkedName: 'Master Administrator',
          branchId: 'all',
          createdAt: existingMaster?.createdAt || new Date().toISOString(),
          createdByAdminId: 'system',
          isActive: true,
          mustChangePassword: existingMaster ? (existingMaster.mustChangePassword ?? false) : false,
          isProtected: true,
          permissions: {
            canViewDashboard: true,
            canEditWorkouts: true,
            canEditDiets: true,
            canViewMembers: true,
            canManageFinance: true,
            canAccessAdmin: true,
          },
        };
        setAppUserAccount(masterAccount);
        setCurrentRole('Super Admin');
        setSelectedBranchId(branches[0]?.id || 'all');
        setSubscriptionStatus('active');
        localStorage.setItem('gym_app_user_account', JSON.stringify(masterAccount));
        return;
      }

      // 2. Authoritative Database Profile Lookup: Primary Key in `users/{authUid}`
      try {
        const userDocSnap = await getDoc(doc(db, 'users', authUid));
        if (userDocSnap.exists()) {
          const userDocData = userDocSnap.data() as AppUser;
          const verifiedUser: AppUser = {
            ...userDocData,
            id: authUid,
          };
          setAppUserAccount(verifiedUser);
          setCurrentRole(verifiedUser.role);
          setSelectedBranchId(verifiedUser.branchId || branches[0]?.id || 'all');
          localStorage.setItem('gym_app_user_account', JSON.stringify(verifiedUser));

          if (verifiedUser.role === 'Member') {
            const memberTargetId = verifiedUser.linkedId || authUid;
            setActiveMemberIdState(memberTargetId);
            const memberRec = members.find(
              (m) =>
                m.id === memberTargetId ||
                m.userId === authUid ||
                (m.email && m.email.toLowerCase() === rawEmail)
            );
            if (memberRec) {
              const isExpired =
                memberRec.status === 'Expired' ||
                (memberRec.expiryDate && new Date(memberRec.expiryDate) < new Date());
              setSubscriptionStatus(isExpired ? 'expired' : 'active');
            } else {
              setSubscriptionStatus('active');
            }
          } else {
            setActiveMemberIdState('');
            setSubscriptionStatus('active');
          }
          return;
        }
      } catch (docErr) {
        console.warn('Direct user document fetch notice:', docErr);
      }

      // 3. Check memory store `appUsers` for matching UID
      const foundInAppUsers = (appUsers || []).find((u) => u.id === authUid || (u as any).uid === authUid);
      if (foundInAppUsers) {
        setAppUserAccount(foundInAppUsers);
        setCurrentRole(foundInAppUsers.role);
        setSelectedBranchId(foundInAppUsers.branchId || branches[0]?.id || 'all');
        localStorage.setItem('gym_app_user_account', JSON.stringify(foundInAppUsers));
        if (foundInAppUsers.role === 'Member') {
          setActiveMemberIdState(foundInAppUsers.linkedId || authUid);
        } else {
          setActiveMemberIdState('');
        }
        setSubscriptionStatus('active');
        return;
      }

      // 4. Check matching employee record in `employees`
      const matchingEmployee = employees.find(
        (e) =>
          e.id === authUid ||
          (e.email && e.email.toLowerCase() === rawEmail) ||
          ((e as any).username && (e as any).username.toLowerCase() === emailPrefix)
      );

      if (matchingEmployee) {
        const isTrainerOrDietitian = matchingEmployee.role === 'Trainer' || matchingEmployee.role === 'Dietitian';
        const empAccount: AppUser = {
          id: authUid,
          username: (matchingEmployee as any).username || emailPrefix.toUpperCase(),
          email: matchingEmployee.email || rawEmail,
          role: matchingEmployee.role,
          linkedId: matchingEmployee.id,
          linkedName: matchingEmployee.name,
          branchId: matchingEmployee.branchId || branches[0]?.id || 'all',
          createdAt: matchingEmployee.joiningDate || new Date().toISOString(),
          createdByAdminId: 'system',
          isActive: (matchingEmployee as any).status !== 'Inactive',
          mustChangePassword: false,
          permissions: {
            canViewDashboard: true,
            canEditWorkouts: matchingEmployee.role === 'Trainer' || isTrainerOrDietitian,
            canEditDiets: matchingEmployee.role === 'Dietitian' || isTrainerOrDietitian,
            canViewMembers: true,
            canManageFinance: matchingEmployee.role === 'Accountant' || matchingEmployee.role === 'Manager',
            canAccessAdmin:
              matchingEmployee.role === 'Manager' ||
              matchingEmployee.role === 'Super Admin' ||
              matchingEmployee.role === 'Owner',
          },
        };
        setAppUserAccount(empAccount);
        setCurrentRole(matchingEmployee.role);
        setSelectedBranchId(matchingEmployee.branchId || branches[0]?.id || 'all');
        setActiveMemberIdState('');
        setSubscriptionStatus('active');
        localStorage.setItem('gym_app_user_account', JSON.stringify(empAccount));
        safeDbWrite(setDoc(doc(db, 'users', authUid), empAccount));
        return;
      }

      // 5. Check matching member record in `members`
      const matchingMember = members.find(
        (m) =>
          m.userId === authUid ||
          m.id === authUid ||
          (m.email && m.email.toLowerCase() === rawEmail) ||
          (m.username && m.username.toLowerCase() === emailPrefix)
      );

      if (matchingMember) {
        const memberAccount: AppUser = {
          id: authUid,
          username: matchingMember.username || emailPrefix.toUpperCase(),
          email: matchingMember.email || rawEmail,
          role: 'Member',
          linkedId: matchingMember.id,
          linkedName: matchingMember.name,
          branchId: matchingMember.branchId || branches[0]?.id || 'all',
          createdAt: matchingMember.startDate || new Date().toISOString(),
          createdByAdminId: 'system',
          isActive: matchingMember.status !== 'Cancelled' && matchingMember.status !== 'Suspended',
          mustChangePassword: matchingMember.mustChangePassword ?? false,
          permissions: {
            canViewDashboard: true,
            canEditWorkouts: false,
            canEditDiets: false,
            canViewMembers: false,
            canManageFinance: false,
            canAccessAdmin: false,
          },
        };
        setAppUserAccount(memberAccount);
        setCurrentRole('Member');
        setActiveMemberIdState(matchingMember.id);
        localStorage.setItem('gym_app_user_account', JSON.stringify(memberAccount));
        safeDbWrite(setDoc(doc(db, 'users', authUid), memberAccount));
        safeDbWrite(updateDoc(doc(db, 'members', matchingMember.id), { userId: authUid }));
        const isExpired =
          matchingMember.status === 'Expired' ||
          (matchingMember.expiryDate && new Date(matchingMember.expiryDate) < new Date());
        setSubscriptionStatus(isExpired ? 'expired' : 'active');
        return;
      }

      // 6. Fail-closed: If profile is unverified or unregistered, do not assign a fake role
      console.warn('Unverified identity profile for UID:', authUid);
    };

    resolveAuthProfile();
  }, [firebaseUser, appUsers, members, employees, branches]);

  // Workout & Diet active member sync
  useEffect(() => {
    if (!activeMemberId) return;
    const unsubWorkout = onSnapshot(doc(db, 'workouts', activeMemberId), (docSnap) => {
      if (docSnap.exists()) {
        setWorkout(docSnap.data() as WorkoutPlan);
      } else {
        setWorkout({
          id: `wpt-${activeMemberId}`,
          memberId: activeMemberId,
          weeklyPlans: [],
          updatedAt: new Date().toISOString().split('T')[0],
        });
      }
    });
    const unsubDiet = onSnapshot(doc(db, 'diets', activeMemberId), (docSnap) => {
      if (docSnap.exists()) {
        setDiet(docSnap.data() as DietPlan);
      } else {
        setDiet({
          id: `dpt-${activeMemberId}`,
          memberId: activeMemberId,
          waterCurrentLiters: 0,
          monthlyPlans: [],
        });
      }
    });
    return () => {
      unsubWorkout();
      unsubDiet();
    };
  }, [activeMemberId]);

  const setActiveMemberId = (id: string) => {
    setActiveMemberIdState(id);
  };

  const setPerspective = (p: 'mobile' | 'erp' | 'hardware') => {
    setPerspectiveState(p);
  };

  const setLocalSessionUser = (user: AppUser) => {
    localStorage.setItem('gym_app_user_account', JSON.stringify(user));
    localStorage.setItem('gym_auth_context', 'app');
    setAppUserAccount(user);
    setCurrentRole(user.role);
    setSelectedBranchId(user.branchId || 'branch-1');
    setSubscriptionStatus('active');
    setAuthContext('app');
    if (user.role === 'Member' && user.linkedId) {
      setActiveMemberIdState(user.linkedId);
    }
  };

  const signOutApp = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    try {
      await signOut(auth);
    } catch {}
    setFirebaseUser(null);
    setAppUserAccount(null);
    setCurrentRole('Member');
    setActiveMemberIdState('');
    setWorkout(INITIAL_WORKOUT);
    setDiet(INITIAL_DIET);
    setProgress([]);
    setWorkoutLogs([]);
    setTrainerNotes([]);
    setWellnessCheckins([]);
    setFreezeRecords([]);
    setReferrals([]);
    setSubscriptionStatus('none');
    setAuthContext(null);
  };

  const signInWebsiteCustomer = async (email: string, pass: string): Promise<WebsiteCustomer> => {
    const cleanEmail = email.trim().toLowerCase();
    const found = websiteCustomers.find(c => c.email.toLowerCase() === cleanEmail);
    if (found) {
      localStorage.setItem('gym_website_customer_id', found.id);
      localStorage.setItem('gym_auth_context', 'website');
      setWebsiteCustomer(found);
      setAuthContext('website');
      return found;
    }

    // Auto-create customer if demo or first login
    const newCustomer: WebsiteCustomer = {
      id: `CUST-${Date.now()}`,
      name: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
      email: cleanEmail,
      phone: '+91 98765 00000',
      registeredDate: new Date().toISOString().split('T')[0],
      trialPassUsed: false,
      bookedClasses: [],
      purchasedPasses: [
        {
          id: `PASS-${Date.now()}`,
          passName: '3-Day VIP Club Trial Pass',
          purchaseDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          price: 0,
          qrToken: `SG-TRIAL-${Date.now()}`,
          status: 'Active'
        }
      ]
    };

    setWebsiteCustomers(prev => [...prev, newCustomer]);
    setWebsiteCustomer(newCustomer);
    localStorage.setItem('gym_website_customer_id', newCustomer.id);
    localStorage.setItem('gym_auth_context', 'website');
    setAuthContext('website');
    return newCustomer;
  };

  const signUpWebsiteCustomer = async (data: { name: string; email: string; phone: string }): Promise<WebsiteCustomer> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = websiteCustomers.find(c => c.email.toLowerCase() === cleanEmail);
    if (existing) {
      localStorage.setItem('gym_website_customer_id', existing.id);
      localStorage.setItem('gym_auth_context', 'website');
      setWebsiteCustomer(existing);
      setAuthContext('website');
      return existing;
    }

    const newCustomer: WebsiteCustomer = {
      id: `CUST-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      registeredDate: new Date().toISOString().split('T')[0],
      trialPassUsed: false,
      activePassName: '3-Day Free VIP Trial Pass',
      bookedClasses: [],
      purchasedPasses: [
        {
          id: `PASS-${Date.now()}`,
          passName: '3-Day Free VIP Trial Pass',
          purchaseDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          price: 0,
          qrToken: `SG-FREE-TRIAL-${Date.now()}`,
          status: 'Active'
        }
      ]
    };

    setWebsiteCustomers(prev => [...prev, newCustomer]);
    setWebsiteCustomer(newCustomer);
    localStorage.setItem('gym_website_customer_id', newCustomer.id);
    localStorage.setItem('gym_auth_context', 'website');
    setAuthContext('website');
    return newCustomer;
  };

  const signOutWebsite = async () => {
    localStorage.removeItem('gym_website_customer_id');
    setWebsiteCustomer(null);
    setAuthContext(null);
  };

  const claimWebsiteTrialPass = async (customerId: string, passName: string) => {
    const newPass = {
      id: `PASS-${Date.now()}`,
      passName: passName || '3-Day VIP All-Access Trial Pass',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: 0,
      qrToken: `SG-VIP-${Date.now()}`,
      status: 'Active' as const
    };

    setWebsiteCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          trialPassUsed: true,
          purchasedPasses: [newPass, ...(c.purchasedPasses || [])]
        };
      }
      return c;
    }));

    if (websiteCustomer?.id === customerId) {
      setWebsiteCustomer(prev => prev ? {
        ...prev,
        trialPassUsed: true,
        purchasedPasses: [newPass, ...(prev.purchasedPasses || [])]
      } : null);
    }
  };

  const bookWebsiteClass = async (customerId: string, booking: any) => {
    const newBooking = {
      id: `BK-${Date.now()}`,
      className: booking.className || 'High Energy Fitness Class',
      instructor: booking.instructor || 'Certified Master Trainer',
      dateTime: booking.dateTime || 'Tomorrow, 07:00 AM',
      branchName: booking.branchName || 'Downtown Premier Club',
      status: 'Confirmed' as const
    };

    setWebsiteCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          bookedClasses: [newBooking, ...(c.bookedClasses || [])]
        };
      }
      return c;
    }));

    if (websiteCustomer?.id === customerId) {
      setWebsiteCustomer(prev => prev ? {
        ...prev,
        bookedClasses: [newBooking, ...(prev.bookedClasses || [])]
      } : null);
    }
  };

  const generateNewToken = (memberId: string) => {
    const timestamp = Date.now();
    const tokenSecret = 'SG-SECURE-KEY-2026';
    let hash = 0;
    const rawStr = `${memberId}:${timestamp}:${tokenSecret}`;
    for (let i = 0; i < rawStr.length; i++) {
      const char = rawStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const sig = Math.abs(hash).toString(36).padStart(8, '0');
    return `SGQR.v2.${memberId}.${timestamp}.${sig}`.toUpperCase();
  };

  const scanDoorQR = (
    qrToken: string,
    targetBranchId: BranchId,
    verificationMethod: 'Dynamic QR' | 'Face ID' = 'Dynamic QR'
  ) => {
    if (!qrToken || typeof qrToken !== 'string') {
      return {
        success: false,
        message: 'ACCESS DENIED: Invalid QR code payload.',
      };
    }

    const cleanToken = qrToken.trim().toUpperCase();
    let memberId = '';
    let tokenTimestamp = 0;

    // Format 1: SGQR.v2.<memberId>.<timestamp>.<sig>
    if (cleanToken.startsWith('SGQR.V2.')) {
      const parts = cleanToken.split('.');
      if (parts.length >= 5) {
        memberId = parts[2];
        tokenTimestamp = parseInt(parts[3], 10);
      }
    } else if (cleanToken.startsWith('SMARTGYM-') || cleanToken.startsWith('PULSEFIT-')) {
      const parts = cleanToken.split('-');
      if (parts.length >= 4) {
        memberId = `${parts[1]}-${parts[2]}-${parts[3]}`;
        tokenTimestamp = parseInt(parts[parts.length - 2], 10);
      }
    } else {
      const foundByNo = members.find((m) => m.membershipNo.toUpperCase() === cleanToken);
      if (foundByNo) memberId = foundByNo.id;
    }

    // Replay attack check: If token has a timestamp, reject if older than 90 seconds (1.5 min)
    if (tokenTimestamp > 0) {
      const ageMs = Date.now() - tokenTimestamp;
      if (ageMs > 90 * 1000) {
        return {
          success: false,
          message: 'ACCESS DENIED: QR pass has expired. Please present a live active QR.',
        };
      }
      if (ageMs < -15 * 1000) {
        return {
          success: false,
          message: 'ACCESS DENIED: Invalid timestamp on QR pass.',
        };
      }
    }

    if (!memberId) {
      return {
        success: false,
        message: 'ACCESS DENIED: Member credentials not recognized.',
      };
    }

    // Authoritative lookup from database members list
    const scannedMember = members.find(
      (m) => m.id === memberId || m.membershipNo.toUpperCase() === memberId.toUpperCase()
    );
    if (!scannedMember) {
      return {
        success: false,
        message: 'ACCESS DENIED: Member record not found in system.',
      };
    }

    // Status checks
    const rawStatus = (scannedMember.status as string) || '';
    if (rawStatus === 'Cancelled' || rawStatus === 'Suspended' || rawStatus === 'Inactive' || rawStatus === 'Expired') {
      return {
        success: false,
        message: `ACCESS DENIED: Membership is ${scannedMember.status}. Access blocked.`,
        member: scannedMember,
      };
    }

    if (scannedMember.status === 'Frozen') {
      return {
        success: false,
        message: 'ACCESS DENIED: Membership is currently frozen.',
        member: scannedMember,
      };
    }

    // Expiry check
    const expiryStr = scannedMember.expiryDate || scannedMember.endDate;
    if (expiryStr) {
      const expDate = new Date(expiryStr);
      expDate.setHours(23, 59, 59, 999);
      if (expDate < new Date()) {
        return {
          success: false,
          message: `ACCESS DENIED: Membership expired on ${expiryStr}. Please renew at reception.`,
          member: scannedMember,
        };
      }
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      memberId: scannedMember.id,
      memberName: scannedMember.name,
      memberPhoto: scannedMember.photoUrl,
      branchId: targetBranchId || scannedMember.branchId || 'branch-1',
      entryTime: timeStr,
      verificationMethod,
      deviceInfo: `SmartRelay-Pro #${targetBranchId || scannedMember.branchId || 'main'} (Main Gate)`,
      date: dateStr,
      status: 'Active In Gym',
    };

    setAttendance((prev) => [newRecord, ...prev]);
    safeDbWrite(setDoc(doc(db, 'attendance', newRecord.id), newRecord));

    return {
      success: true,
      message: `GATE UNLOCKED: Welcome ${scannedMember.name}! Entry recorded at ${timeStr}.`,
      member: scannedMember,
    };
  };

  const manualCheckIn = async (
    targetMemberId?: string,
    targetBranchId?: string
  ): Promise<{ success: boolean; message: string; record?: AttendanceRecord }> => {
    const member = (targetMemberId ? members.find((m) => m.id === targetMemberId) : activeMember) || activeMember;

    if (!member || !member.id) {
      return { success: false, message: 'No member record selected for check-in.' };
    }

    const todayDateStr = new Date().toISOString().split('T')[0];

    // Check if already active in gym today
    const existingActive = attendance.find(
      (a) =>
        (a.memberId === member.id || a.memberName?.toLowerCase() === member.name?.toLowerCase()) &&
        a.date === todayDateStr &&
        a.status === 'Active In Gym'
    );
    if (existingActive) {
      return {
        success: false,
        message: `Already checked in at ${existingActive.entryTime}. Tap Check Out when leaving.`,
        record: existingActive,
      };
    }

    // Status / Expiration checks
    const rawStatus = (member.status as string) || '';
    if (rawStatus === 'Cancelled' || rawStatus === 'Suspended' || rawStatus === 'Inactive' || rawStatus === 'Expired') {
      return {
        success: false,
        message: `Check-in blocked: Membership status is ${member.status}. Please renew your plan.`,
      };
    }
    if (rawStatus === 'Frozen') {
      return {
        success: false,
        message: 'Check-in blocked: Membership is currently frozen.',
      };
    }

    const expiryStr = member.expiryDate || member.endDate;
    if (expiryStr) {
      const expDate = new Date(expiryStr);
      expDate.setHours(23, 59, 59, 999);
      if (expDate < new Date()) {
        return {
          success: false,
          message: `Check-in blocked: Membership expired on ${expiryStr}. Please renew.`,
        };
      }
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const branchToUse = targetBranchId || member.branchId || selectedBranchId || 'branch-1';

    const newRecord: AttendanceRecord = {
      id: `att-man-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      memberId: member.id,
      memberName: member.name,
      memberPhoto: member.photoUrl || '',
      branchId: branchToUse,
      entryTime: timeStr,
      verificationMethod: 'Dynamic QR',
      deviceInfo: `Member App Manual Check-In (${branchToUse})`,
      date: todayDateStr,
      status: 'Active In Gym',
    };

    setAttendance((prev) => [newRecord, ...prev]);
    safeDbWrite(setDoc(doc(db, 'attendance', newRecord.id), newRecord));

    await recordAuditLog(
      'MEMBER_CHECKIN' as any,
      member.id,
      member.name,
      `Manual check-in recorded at ${timeStr} (${branchToUse})`
    );

    return {
      success: true,
      message: `Checked in successfully at ${timeStr}! Welcome to the gym, ${member.name}.`,
      record: newRecord,
    };
  };

  const manualCheckOut = async (
    targetMemberId?: string
  ): Promise<{ success: boolean; message: string }> => {
    const member = (targetMemberId ? members.find((m) => m.id === targetMemberId) : activeMember) || activeMember;

    if (!member || !member.id) {
      return { success: false, message: 'No member record selected for check-out.' };
    }

    const todayDateStr = new Date().toISOString().split('T')[0];

    // Find active check-in record
    const activeRecord =
      attendance.find(
        (a) =>
          (a.memberId === member.id || a.memberName?.toLowerCase() === member.name?.toLowerCase()) &&
          a.date === todayDateStr &&
          a.status === 'Active In Gym'
      ) ||
      attendance.find(
        (a) =>
          (a.memberId === member.id || a.memberName?.toLowerCase() === member.name?.toLowerCase()) &&
          a.status === 'Active In Gym'
      );

    if (!activeRecord) {
      return {
        success: false,
        message: 'No active check-in found for today. You are currently not marked inside the gym.',
      };
    }

    const now = new Date();
    const exitTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedRecord: AttendanceRecord = {
      ...activeRecord,
      exitTime: exitTimeStr,
      status: 'Checked Out',
    };

    setAttendance((prev) => prev.map((a) => (a.id === activeRecord.id ? updatedRecord : a)));
    safeDbWrite(setDoc(doc(db, 'attendance', activeRecord.id), updatedRecord));

    await recordAuditLog(
      'MEMBER_CHECKOUT' as any,
      member.id,
      member.name,
      `Manual check-out recorded at ${exitTimeStr} (Entry was ${activeRecord.entryTime})`
    );

    return {
      success: true,
      message: `Checked out successfully at ${exitTimeStr}. Great workout today!`,
    };
  };

  const recordAuditLog = async (
    eventType: AuditLog['eventType'],
    memberId: string,
    memberName: string,
    details: string,
    status: 'SUCCESS' | 'FAILED' = 'SUCCESS'
  ) => {
    const logItem: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      eventType,
      memberId,
      memberName,
      actorId: appUserAccount?.id || firebaseUser?.uid || 'admin-system',
      actorRole: appUserAccount?.role || 'Super Admin',
      details,
      timestamp: new Date().toISOString(),
      status,
    };
    setAuditLogs((prev) => [logItem, ...prev]);
    safeDbWrite(setDoc(doc(db, 'audit_logs', logItem.id), logItem));
  };

  const provisionMemberWithAccount = async (
    newMemberData: Omit<Member, 'id' | 'membershipNo' | 'status' | 'rewardPoints' | 'referralCode'>,
    options: { createLogin?: boolean; sendWhatsApp?: boolean } = { createLogin: true, sendWhatsApp: true }
  ): Promise<{
    member: Member;
    appUser?: AppUser;
    tempPassword?: string;
    whatsappDirectUrl?: string;
    whatsappStatus: 'SENT' | 'FAILED' | 'NOT_SENT';
  }> => {
    const memberId = `MEM-2026-${String(members.length + 1).padStart(3, '0')}`;
    const membershipNo = `SG-${Math.floor(10000 + Math.random() * 90000)}`;
    const referralCode = `${(newMemberData.name || 'MEMBER').split(' ')[0].toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
    const plan = plans.find((p) => p.id === newMemberData.planId) || plans[0];

    // 1. Generate unique username e.g. MEM00125
    const existingUsernames = appUsers.map((u) => u.username);
    const username = generateUniqueUsername(members.length + 1, existingUsernames);

    // 2. Generate strong temporary password e.g. Gym@48291
    const tempPassword = generateSecureTemporaryPassword();

    // 3. User account ID
    const userId = `USR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const normalizedPhone = normalizePhoneNumber(newMemberData.mobile);

    let initialWhatsAppStatus: 'NOT_SENT' | 'SENT' | 'FAILED' = 'NOT_SENT';
    let whatsappDirectUrl = '';

    // 4. Send WhatsApp if requested
    if (options.sendWhatsApp && normalizedPhone) {
      const msg = buildWhatsAppCredentialMessage({
        memberName: newMemberData.name,
        memberId: membershipNo,
        username,
        tempPassword,
      });

      const res = await dispatchWhatsAppCredentials(normalizedPhone, msg);
      initialWhatsAppStatus = res.status;
      whatsappDirectUrl = res.directUrl || '';

      await recordAuditLog(
        res.success ? 'WHATSAPP_SENT' : 'WHATSAPP_FAILED',
        memberId,
        newMemberData.name,
        `WhatsApp credential transmission: ${res.status} to ${normalizedPhone}`,
        res.success ? 'SUCCESS' : 'FAILED'
      );
    }

    // 5. Build and persist AppUser if login account requested
    let createdAppUser: AppUser | undefined;
    let authUid = `USR-MEM-${Date.now()}`;

    if (options.createLogin) {
      const memberAuthEmail = newMemberData.email || `${username.toLowerCase()}@smartgym.com`;
      try {
        authUid = await createIsolatedAuthUser(memberAuthEmail, tempPassword);
      } catch (authErr: any) {
        console.warn('createIsolatedAuthUser notice (proceeding with UID fallback):', authErr);
      }

      createdAppUser = {
        id: authUid,
        username,
        email: memberAuthEmail,
        role: 'Member',
        linkedId: memberId,
        linkedName: newMemberData.name,
        branchId: newMemberData.branchId,
        createdAt: new Date().toISOString(),
        createdByAdminId: appUserAccount?.id || 'admin-system',
        isActive: true,
        mustChangePassword: true,
        whatsappStatus: initialWhatsAppStatus,
        whatsappSentAt: initialWhatsAppStatus === 'SENT' ? new Date().toISOString() : undefined,
        permissions: {
          canViewDashboard: true,
          canEditWorkouts: false,
          canEditDiets: false,
          canViewMembers: false,
          canManageFinance: false,
          canAccessAdmin: false,
        },
      };

      setAppUsers((prev) => [createdAppUser!, ...prev]);
      safeDbWrite(setDoc(doc(db, 'users', authUid), createdAppUser));

      await recordAuditLog(
        'ACCOUNT_PROVISIONED',
        memberId,
        newMemberData.name,
        `Member login account provisioned with username ${username} (UID: ${authUid})`
      );
    }

    // 6. Build Member Record
    const newMember: Member = {
      ...newMemberData,
      id: memberId,
      membershipNo,
      referralCode,
      rewardPoints: 100,
      status: 'Active',
      paidAmount: plan ? (plan.totalPrice || plan.basePrice) : (newMemberData.paidAmount || 0),
      totalPlanAmount: plan ? (plan.totalPrice || plan.basePrice) : (newMemberData.totalPlanAmount || 0),
      lastPaymentDate: new Date().toISOString().split('T')[0],
      nextDueDate: newMemberData.endDate || newMemberData.expiryDate,
      paymentStatus: newMemberData.pendingDues > 0 ? 'Partially Paid' : 'Paid',
      userId: options.createLogin ? authUid : undefined,
      username: options.createLogin ? username : undefined,
      mustChangePassword: options.createLogin ? true : false,
      whatsappStatus: initialWhatsAppStatus,
      whatsappSentAt: initialWhatsAppStatus === 'SENT' ? new Date().toISOString() : undefined,
    };

    setMembers((prev) => [newMember, ...prev]);
    safeDbWrite(setDoc(doc(db, 'members', memberId), newMember));

    // 7. Record Member Creation Audit
    await recordAuditLog(
      'MEMBER_CREATED',
      memberId,
      newMember.name,
      `Member enrolled with plan ${newMember.planName} (ID: ${membershipNo})`
    );

    // 8. Record initial payment transaction if paid
    if (newMember.paidAmount && newMember.paidAmount > 0) {
      const initialTxn: Transaction = {
        id: `TXN-${Date.now()}`,
        memberId: newMember.id,
        memberName: newMember.name,
        branchId: newMember.branchId,
        amount: newMember.paidAmount,
        paymentMethod: 'UPI',
        category: 'Membership Dues',
        date: new Date().toISOString().split('T')[0],
        receiptNo: `RCP-SG-${Math.floor(1000 + Math.random() * 9000)}`,
        planName: newMember.planName,
      };
      setTransactions((prev) => [initialTxn, ...prev]);
      safeDbWrite(setDoc(doc(db, 'transactions', initialTxn.id), initialTxn));
    }

    return {
      member: newMember,
      appUser: createdAppUser,
      tempPassword,
      whatsappDirectUrl,
      whatsappStatus: initialWhatsAppStatus,
    };
  };

  const provisionTrainerWithAccount = async (
    empData: Omit<Employee, 'id'>,
    options: { sendWhatsApp?: boolean } = { sendWhatsApp: true }
  ): Promise<{
    employee: Employee;
    appUser: AppUser;
    tempPassword: string;
    whatsappDirectUrl?: string;
    whatsappStatus: 'SENT' | 'FAILED' | 'NOT_SENT';
  }> => {
    const existingUsernames = appUsers.map((u) => u.username);
    const username = generateUniqueStaffUsername('TRN', employees.length + 1, existingUsernames);
    const tempPassword = generateSecureTemporaryPassword();
    const trainerEmail = empData.email || `${username.toLowerCase()}@smartgym.com`;

    // 1. Create real Firebase Auth user in isolated secondary app instance
    let authUid = `TRN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    try {
      authUid = await createIsolatedAuthUser(trainerEmail, tempPassword);
    } catch (authErr: any) {
      console.warn('createIsolatedAuthUser notice for trainer (proceeding with UID fallback):', authErr);
    }

    const employeeId = authUid;
    const userId = authUid;
    const normalizedPhone = normalizePhoneNumber(empData.mobile || empData.phone || '');

    let initialWhatsAppStatus: 'NOT_SENT' | 'SENT' | 'FAILED' = 'NOT_SENT';
    let whatsappDirectUrl = '';

    if (options.sendWhatsApp && normalizedPhone) {
      const msg = buildWhatsAppCredentialMessage({
        memberName: empData.name,
        memberId: employeeId,
        username,
        tempPassword,
        role: empData.role || 'Trainer',
      });
      const res = await dispatchWhatsAppCredentials(normalizedPhone, msg);
      initialWhatsAppStatus = res.status;
      whatsappDirectUrl = res.directUrl || '';

      await recordAuditLog(
        res.success ? 'WHATSAPP_SENT' : 'WHATSAPP_FAILED',
        employeeId,
        empData.name,
        `Trainer credentials sent via WhatsApp (${res.status}) to ${normalizedPhone}`
      );
    }

    // 2. Build 1:1 UID Employee Profile
    const newEmployee: Employee = {
      ...empData,
      id: employeeId,
      email: trainerEmail,
    };

    setEmployees((prev) => [newEmployee, ...prev]);
    safeDbWrite(setDoc(doc(db, 'employees', employeeId), newEmployee));

    // 3. Build 1:1 UID User Document (excluding plaintext credentials)
    const createdAppUser: AppUser = {
      id: userId,
      username,
      email: trainerEmail,
      role: newEmployee.role || 'Trainer',
      linkedId: employeeId,
      linkedName: newEmployee.name,
      branchId: newEmployee.branchId || selectedBranchId || 'branch-1',
      createdAt: new Date().toISOString(),
      createdByAdminId: appUserAccount?.id || 'admin-system',
      isActive: true,
      mustChangePassword: true,
      whatsappStatus: initialWhatsAppStatus,
      whatsappSentAt: initialWhatsAppStatus === 'SENT' ? new Date().toISOString() : undefined,
      permissions: {
        canViewDashboard: true,
        canEditWorkouts: true,
        canEditDiets: true,
        canViewMembers: true,
        canManageFinance: false,
        canAccessAdmin: false,
      },
    };

    setAppUsers((prev) => [createdAppUser, ...prev]);
    safeDbWrite(setDoc(doc(db, 'users', userId), createdAppUser));

    await recordAuditLog(
      'ACCOUNT_PROVISIONED',
      employeeId,
      newEmployee.name,
      `Trainer account provisioned with username ${username} (UID: ${employeeId}, Role: ${newEmployee.role})`
    );

    return {
      employee: newEmployee,
      appUser: createdAppUser,
      tempPassword,
      whatsappDirectUrl,
      whatsappStatus: initialWhatsAppStatus,
    };
  };

  const addBranch = async (
    newBranchData: Omit<Branch, 'id' | 'activeMembers' | 'currentCheckIns' | 'monthlyRevenue'>
  ): Promise<Branch> => {
    const branchId = `branch-${branches.length + 1}`;
    const newBranch: Branch = {
      ...newBranchData,
      id: branchId,
      activeMembers: 0,
      currentCheckIns: 0,
      monthlyRevenue: 0,
    };

    setBranches((prev) => [...prev, newBranch]);
    safeDbWrite(setDoc(doc(db, 'branches', branchId), newBranch));

    await recordAuditLog(
      'ACCOUNT_ENABLED',
      branchId,
      newBranch.name,
      `New gym branch "${newBranch.name}" (${newBranch.code}) added to network.`
    );

    return newBranch;
  };

  const resetMemberPassword = async (
    memberId: string
  ): Promise<{ newTempPassword: string; whatsappDirectUrl?: string }> => {
    const member = members.find((m) => m.id === memberId);
    if (!member) throw new Error('Member not found');

    const newTempPassword = generateSecureTemporaryPassword();
    const now = new Date().toISOString();

    // Update member record
    const updatedMemberPartial: Partial<Member> = {
      tempPassword: newTempPassword,
      mustChangePassword: true,
      lastPasswordResetAt: now,
    };
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, ...updatedMemberPartial } : m)));
    safeDbWrite(updateDoc(doc(db, 'members', memberId), updatedMemberPartial));

    // Update user record
    const user = appUsers.find((u) => u.linkedId === memberId || u.id === member.userId);
    if (user) {
      const updatedUserPartial: Partial<AppUser> = {
        password: newTempPassword,
        tempPassword: newTempPassword,
        mustChangePassword: true,
        lastPasswordResetAt: now,
      };
      setAppUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updatedUserPartial } : u)));
      safeDbWrite(updateDoc(doc(db, 'users', user.id), updatedUserPartial));
    }

    // Prepare WhatsApp transmission
    let whatsappDirectUrl = '';
    const normalizedPhone = normalizePhoneNumber(member.mobile);
    if (normalizedPhone) {
      const msg = buildWhatsAppCredentialMessage({
        memberName: member.name,
        memberId: member.membershipNo,
        username: member.username || user?.username || `MEM${memberId.replace(/\D/g, '')}`,
        tempPassword: newTempPassword,
      });
      const res = await dispatchWhatsAppCredentials(normalizedPhone, msg);
      whatsappDirectUrl = res.directUrl || '';

      await recordAuditLog(
        'WHATSAPP_SENT',
        memberId,
        member.name,
        `Password reset credentials sent via WhatsApp to ${normalizedPhone}`
      );
    }

    await recordAuditLog(
      'PASSWORD_RESET',
      memberId,
      member.name,
      `Login password reset. Previous credential invalidated.`
    );

    return { newTempPassword, whatsappDirectUrl };
  };

  const updateAccountStatus = async (memberId: string, isActive: boolean) => {
    const member = members.find((m) => m.id === memberId);
    const user = appUsers.find((u) => u.linkedId === memberId || u.id === member?.userId);

    if (user) {
      setAppUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive } : u)));
      safeDbWrite(updateDoc(doc(db, 'users', user.id), { isActive }));
    }

    if (member) {
      await recordAuditLog(
        isActive ? 'ACCOUNT_ENABLED' : 'ACCOUNT_DISABLED',
        memberId,
        member.name,
        `Account ${isActive ? 'enabled' : 'disabled / suspended'} by admin`
      );
    }
  };

  const completeFirstLoginPasswordChange = async (userId: string, newPassword: string) => {
    let user = appUsers.find((u) => u.id === userId || u.username.toLowerCase() === userId.toLowerCase());
    
    // If Master Admin record is being completed for the first time
    if (!user && (userId === 'USR-MASTERADMIN' || userId.toLowerCase().includes('master') || appUserAccount?.username === 'MASTERADMIN')) {
      const masterUser: AppUser = {
        id: userId || 'USR-MASTERADMIN',
        username: 'MASTERADMIN',
        email: 'masteradmin@smartgym.com',
        role: 'Super Admin',
        linkedId: 'EMP-MASTERADMIN',
        linkedName: 'Master Administrator',
        branchId: 'all',
        createdAt: new Date().toISOString(),
        createdByAdminId: 'system',
        isActive: true,
        mustChangePassword: false,
        isProtected: true,
        permissions: {
          canViewDashboard: true,
          canEditWorkouts: true,
          canEditDiets: true,
          canViewMembers: true,
          canManageFinance: true,
          canAccessAdmin: true,
        }
      };
      setAppUsers((prev) => [masterUser, ...prev.filter(u => u.username !== 'MASTERADMIN')]);
      safeDbWrite(setDoc(doc(db, 'users', masterUser.id), masterUser));
      setAppUserAccount(masterUser);
      setLocalSessionUser(masterUser);
      return;
    }

    if (!user) {
      // Fallback: check if active logged-in user account exists
      if (appUserAccount) {
        user = appUserAccount;
      } else {
        throw new Error('User not found');
      }
    }

    const updatedUserPartial: Partial<AppUser> = {
      password: newPassword,
      tempPassword: '',
      mustChangePassword: false,
      lastLoginAt: new Date().toISOString(),
    };

    // 1. Update Firebase Auth password on the authenticated user without changing UID
    if (auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, newPassword);
      } catch (authPassErr: any) {
        console.warn('Firebase Auth updatePassword notice (kept Firestore in sync):', authPassErr);
      }
    }

    setAppUsers((prev) => prev.map((u) => (u.id === user!.id ? { ...u, ...updatedUserPartial } : u)));
    safeDbWrite(updateDoc(doc(db, 'users', user.id), updatedUserPartial));

    // Also update linked member if present
    if (user.linkedId) {
      const updatedMemberPartial: Partial<Member> = {
        tempPassword: '',
        mustChangePassword: false,
        lastLoginAt: new Date().toISOString(),
      };
      setMembers((prev) => prev.map((m) => (m.id === user!.linkedId ? { ...m, ...updatedMemberPartial } : m)));
      safeDbWrite(updateDoc(doc(db, 'members', user.linkedId), updatedMemberPartial));
    }

    if (appUserAccount && appUserAccount.id === user.id) {
      const updatedFull = { ...appUserAccount, ...updatedUserPartial };
      setAppUserAccount(updatedFull);
      setLocalSessionUser(updatedFull);
    }

    await recordAuditLog(
      'FIRST_LOGIN_COMPLETED',
      user.linkedId || user.id,
      user.linkedName || user.username,
      `First login completed and new personal password established.`
    );
  };

  const resendMemberCredentials = async (
    memberId: string
  ): Promise<{ success: boolean; whatsappDirectUrl?: string }> => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return { success: false };

    const user = appUsers.find((u) => u.linkedId === memberId || u.id === member.userId);
    const username = member.username || user?.username || 'MEM00125';
    const tempPassword = member.tempPassword || user?.tempPassword || 'Fit#73192';

    const normalizedPhone = normalizePhoneNumber(member.mobile);
    if (!normalizedPhone) return { success: false };

    const msg = buildWhatsAppCredentialMessage({
      memberName: member.name,
      memberId: member.membershipNo,
      username,
      tempPassword,
    });

    const res = await dispatchWhatsAppCredentials(normalizedPhone, msg);

    const updatedStatus = res.status;
    const now = new Date().toISOString();

    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, whatsappStatus: updatedStatus, whatsappSentAt: now } : m
      )
    );
    safeDbWrite(
      updateDoc(doc(db, 'members', memberId), {
        whatsappStatus: updatedStatus,
        whatsappSentAt: now,
      })
    );

    await recordAuditLog(
      res.success ? 'WHATSAPP_SENT' : 'WHATSAPP_FAILED',
      memberId,
      member.name,
      `Resent credentials via WhatsApp: ${res.status} to ${normalizedPhone}`
    );

    return { success: res.success, whatsappDirectUrl: res.directUrl };
  };

  const addMember = async (newMemberData: Omit<Member, 'id' | 'membershipNo' | 'status' | 'rewardPoints' | 'referralCode'>): Promise<Member> => {
    const res = await provisionMemberWithAccount(newMemberData, { createLogin: true, sendWhatsApp: true });
    return res.member;
  };

  const updateMember = async (id: string, updatedData: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedData } : m));
    safeDbWrite(updateDoc(doc(db, 'members', id), updatedData));
  };

  const recordMemberPayment = async (
    memberId: string,
    amount: number,
    paymentMethod: Transaction['paymentMethod'],
    notes?: string
  ): Promise<Transaction> => {
    const member = members.find(m => m.id === memberId);
    const receiptNo = `RCP-SG-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = new Date().toISOString().split('T')[0];

    const newTxn: Transaction = {
      id: `TXN-${Date.now()}`,
      memberId,
      memberName: member?.name || 'Member',
      branchId: member?.branchId || selectedBranchId,
      amount,
      paymentMethod,
      category: 'Membership Dues',
      date,
      receiptNo,
      planName: member?.planName,
      notes
    };

    // Update transactions synchronously
    setTransactions(prev => [newTxn, ...prev]);
    safeDbWrite(setDoc(doc(db, 'transactions', newTxn.id), newTxn));

    // Update member dues synchronously
    if (member) {
      const newPaid = (member.paidAmount || 0) + amount;
      const newDues = Math.max(0, (member.pendingDues || 0) - amount);
      const newStatus = newDues === 0 ? 'Paid' : 'Partially Paid';

      const updatedMember: Partial<Member> = {
        paidAmount: newPaid,
        pendingDues: newDues,
        paymentStatus: newStatus as any,
        lastPaymentDate: date,
      };

      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, ...updatedMember } : m));
      safeDbWrite(updateDoc(doc(db, 'members', memberId), updatedMember));
    }

    // Send receipt notification
    safeDbWrite(addNotification({
      targetRole: 'Member',
      memberId,
      title: 'Payment Received & Verified',
      message: `Received ₹${amount.toLocaleString('en-IN')} via ${paymentMethod}. Receipt #${receiptNo}.`,
      type: 'billing'
    }));

    return newTxn;
  };

  const toggleExerciseCompleted = async (weekNumber: number, day: string, exerciseId: string) => {
    const updatedWeeklyPlans = workout.weeklyPlans.map((wp) => {
      if (wp.weekNumber !== weekNumber) return wp;
      return {
        ...wp,
        splits: wp.splits.map((split) => {
          if (split.day !== day) return split;
          return {
            ...split,
            exercises: split.exercises.map((ex) => {
              if (ex.id !== exerciseId) return ex;
              return { ...ex, completed: !ex.completed };
            }),
          };
        }),
      };
    });

    const updatedWorkout: WorkoutPlan = {
      ...workout,
      weeklyPlans: updatedWeeklyPlans,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setWorkout(updatedWorkout);
    safeDbWrite(setDoc(doc(db, 'workouts', workout.memberId || activeMemberId), updatedWorkout));
  };

  const toggleMealCompleted = async (
    monthNumber: number,
    mealCategory: 'breakfast' | 'lunch' | 'snack' | 'dinner',
    mealId: string
  ) => {
    const updatedMonthlyPlans = diet.monthlyPlans.map((mp) => {
      if (mp.monthNumber !== monthNumber) return mp;
      return {
        ...mp,
        meals: {
          ...mp.meals,
          [mealCategory]: mp.meals[mealCategory].map((m) => {
            if (m.id !== mealId) return m;
            return { ...m, completed: !m.completed };
          }),
        },
      };
    });

    const updatedDiet: DietPlan = {
      ...diet,
      monthlyPlans: updatedMonthlyPlans,
    };

    setDiet(updatedDiet);
    safeDbWrite(setDoc(doc(db, 'diets', diet.memberId || activeMemberId), updatedDiet));
  };

  const addWaterIntake = async (amountLiters: number) => {
    const updatedLiters = Math.min(6.0, parseFloat((diet.waterCurrentLiters + amountLiters).toFixed(1)));
    const updatedDiet: DietPlan = {
      ...diet,
      waterCurrentLiters: updatedLiters,
    };

    setDiet(updatedDiet);
    safeDbWrite(setDoc(doc(db, 'diets', diet.memberId || activeMemberId), updatedDiet));
  };

  const addWeeklyWorkout = async (
    targetMemberId: string,
    weekNumber: number,
    weekTitle: string,
    splits: DailyWorkoutSplit[]
  ) => {
    if (!targetMemberId) return;

    // 1. Fetch current existing workout for targetMemberId from Firestore or local state
    let existingWeeklyPlans: WeeklyWorkoutPlan[] = [];
    try {
      const docSnap = await getDoc(doc(db, 'workouts', targetMemberId));
      if (docSnap.exists()) {
        const data = docSnap.data() as WorkoutPlan;
        if (data && Array.isArray(data.weeklyPlans)) {
          existingWeeklyPlans = data.weeklyPlans;
        }
      } else if (workout && workout.memberId === targetMemberId && Array.isArray(workout.weeklyPlans)) {
        existingWeeklyPlans = workout.weeklyPlans;
      }
    } catch {
      if (workout && workout.memberId === targetMemberId && Array.isArray(workout.weeklyPlans)) {
        existingWeeklyPlans = workout.weeklyPlans;
      }
    }

    // 2. Find if target weekNumber already exists
    const existingWeekIndex = existingWeeklyPlans.findIndex((w) => w.weekNumber === weekNumber);

    let updatedWeeklyPlans: WeeklyWorkoutPlan[];
    if (existingWeekIndex >= 0) {
      const targetWeek = existingWeeklyPlans[existingWeekIndex];
      const existingSplits = targetWeek.splits || [];

      // Merge new splits into existing splits (replace matching day, append new day)
      let mergedSplits = [...existingSplits];
      for (const newSplit of splits) {
        const splitIdx = mergedSplits.findIndex(s => s.day.toLowerCase() === newSplit.day.toLowerCase());
        if (splitIdx >= 0) {
          mergedSplits[splitIdx] = newSplit;
        } else {
          mergedSplits.push(newSplit);
        }
      }

      const updatedWeek: WeeklyWorkoutPlan = {
        ...targetWeek,
        weekTitle: weekTitle || targetWeek.weekTitle,
        splits: mergedSplits,
      };

      updatedWeeklyPlans = [...existingWeeklyPlans];
      updatedWeeklyPlans[existingWeekIndex] = updatedWeek;
    } else {
      const newWeek: WeeklyWorkoutPlan = {
        weekNumber,
        weekTitle: weekTitle || `Week ${weekNumber}: Custom Program`,
        splits,
      };
      updatedWeeklyPlans = [...existingWeeklyPlans, newWeek];
    }

    const updatedWorkout: WorkoutPlan = {
      id: `wpt-${targetMemberId}`,
      memberId: targetMemberId,
      weeklyPlans: updatedWeeklyPlans.sort((a, b) => a.weekNumber - b.weekNumber),
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (activeMemberId === targetMemberId) {
      setWorkout(updatedWorkout);
    }
    await safeDbWrite(setDoc(doc(db, 'workouts', targetMemberId), updatedWorkout));
  };

  const addMonthlyDiet = async (targetMemberId: string, monthPlan: MonthlyDietPlan) => {
    if (!targetMemberId) return;

    // 1. Fetch current existing diet for targetMemberId from Firestore or local state
    let existingMonthlyPlans: MonthlyDietPlan[] = [];
    let currentWater = 2.5;
    try {
      const docSnap = await getDoc(doc(db, 'diets', targetMemberId));
      if (docSnap.exists()) {
        const data = docSnap.data() as DietPlan;
        if (data && Array.isArray(data.monthlyPlans)) {
          existingMonthlyPlans = data.monthlyPlans;
        }
        if (data && typeof data.waterCurrentLiters === 'number') {
          currentWater = data.waterCurrentLiters;
        }
      } else if (diet && diet.memberId === targetMemberId && Array.isArray(diet.monthlyPlans)) {
        existingMonthlyPlans = diet.monthlyPlans;
        currentWater = diet.waterCurrentLiters || 2.5;
      }
    } catch {
      if (diet && diet.memberId === targetMemberId && Array.isArray(diet.monthlyPlans)) {
        existingMonthlyPlans = diet.monthlyPlans;
        currentWater = diet.waterCurrentLiters || 2.5;
      }
    }

    // 2. Replace or insert monthPlan
    const existingMonthIndex = existingMonthlyPlans.findIndex((m) => m.monthNumber === monthPlan.monthNumber);
    let updatedMonthlyPlans: MonthlyDietPlan[];
    if (existingMonthIndex >= 0) {
      updatedMonthlyPlans = [...existingMonthlyPlans];
      updatedMonthlyPlans[existingMonthIndex] = monthPlan;
    } else {
      updatedMonthlyPlans = [...existingMonthlyPlans, monthPlan];
    }

    const updatedDiet: DietPlan = {
      id: `dpt-${targetMemberId}`,
      memberId: targetMemberId,
      waterCurrentLiters: currentWater,
      monthlyPlans: updatedMonthlyPlans.sort((a, b) => a.monthNumber - b.monthNumber),
    };

    if (activeMemberId === targetMemberId) {
      setDiet(updatedDiet);
    }
    await safeDbWrite(setDoc(doc(db, 'diets', targetMemberId), updatedDiet));
  };

  const buySupplements = async (
    cartItems: { product: SupplementProduct; qty: number }[],
    paymentMethod: 'Cash' | 'UPI' | 'Card' | 'NetBanking'
  ): Promise<Transaction> => {
    const totalAmount = cartItems.reduce((acc, item) => acc + item.product.price * item.qty, 0);
    const receiptNo = `RCP-POS-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTxn: Transaction = {
      id: `TXN-${Date.now()}`,
      memberId: activeMember.id,
      memberName: activeMember.name,
      branchId: selectedBranchId,
      amount: totalAmount,
      paymentMethod,
      category: 'Supplement Sale',
      date: new Date().toISOString().split('T')[0],
      receiptNo,
      notes: cartItems.map(i => `${i.product.name} (x${i.qty})`).join(', ')
    };

    setTransactions(prev => [newTxn, ...prev]);
    safeDbWrite(setDoc(doc(db, 'transactions', newTxn.id), newTxn));

    // Deduct inventory stock
    cartItems.forEach((item) => {
      const updatedStock = Math.max(0, item.product.stockQty - item.qty);
      setSupplements(prev => prev.map(p => p.id === item.product.id ? { ...p, stockQty: updatedStock } : p));
      safeDbWrite(updateDoc(doc(db, 'supplements', item.product.id), { stockQty: updatedStock }));
    });

    return newTxn;
  };

  const addSupplement = async (product: Omit<SupplementProduct, 'id'>): Promise<SupplementProduct> => {
    const newId = `SUP-${Date.now()}`;
    const newProduct: SupplementProduct = {
      ...product,
      id: newId
    };
    setSupplements(prev => [newProduct, ...prev]);
    safeDbWrite(setDoc(doc(db, 'supplements', newId), newProduct));
    return newProduct;
  };

  const updateSupplement = async (id: string, updated: Partial<SupplementProduct>) => {
    setSupplements(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    safeDbWrite(updateDoc(doc(db, 'supplements', id), updated));
  };

  const addEquipment = async (item: Omit<EquipmentItem, 'id'>): Promise<EquipmentItem> => {
    const newId = `EQ-${Date.now()}`;
    const newEquipment: EquipmentItem = {
      ...item,
      id: newId
    };
    setEquipment(prev => [newEquipment, ...prev]);
    safeDbWrite(setDoc(doc(db, 'equipment', newId), newEquipment));
    return newEquipment;
  };

  const updateEquipment = async (id: string, updated: Partial<EquipmentItem>) => {
    setEquipment(prev => prev.map(eq => eq.id === id ? { ...eq, ...updated } : eq));
    safeDbWrite(updateDoc(doc(db, 'equipment', id), updated));
  };

  const deleteEquipment = async (id: string) => {
    setEquipment(prev => prev.filter(eq => eq.id !== id));
    safeDbWrite(deleteDoc(doc(db, 'equipment', id)));
  };

  const addMaintenanceLog = async (log: Omit<MaintenanceLog, 'id'>): Promise<MaintenanceLog> => {
    const newId = `MN-${Date.now()}`;
    const newLog: MaintenanceLog = {
      ...log,
      id: newId
    };
    setMaintenanceLogs(prev => [newLog, ...prev]);
    safeDbWrite(setDoc(doc(db, 'maintenance_logs', newId), newLog));

    if (log.status === 'Completed') {
      const followUp = log.nextFollowUpDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
      updateEquipment(log.equipmentId, {
        status: 'Operational',
        lastServiceDate: log.serviceDate,
        nextServiceDate: followUp
      });
    }
    return newLog;
  };

  const addStockPurchase = async (purchase: Omit<StockPurchase, 'id'>): Promise<StockPurchase> => {
    const newId = `PO-${Date.now()}`;
    const newPurchase: StockPurchase = {
      ...purchase,
      id: newId
    };
    setStockPurchases(prev => [newPurchase, ...prev]);
    safeDbWrite(setDoc(doc(db, 'stock_purchases', newId), newPurchase));

    // Automatically increase product stock in inventory
    const targetProduct = supplements.find(p => p.id === purchase.productId);
    if (targetProduct) {
      const updatedStock = (targetProduct.stockQty || 0) + purchase.quantity;
      updateSupplement(purchase.productId, {
        stockQty: updatedStock,
        costPrice: purchase.unitCost
      });
    }

    return newPurchase;
  };

  const addProgressMetric = async (metric: Omit<ProgressMetric, 'id'>): Promise<ProgressMetric> => {
    const newId = `PRG-${Date.now()}`;
    const newMetric: ProgressMetric = {
      ...metric,
      id: newId
    };
    setProgress(prev => [newMetric, ...prev]);
    safeDbWrite(setDoc(doc(db, 'progress', newId), newMetric));

    if (metric.memberId) {
      updateMember(metric.memberId, {
        weightKg: metric.weightKg,
        bmi: metric.bmi,
        chestCm: metric.chestCm,
        waistCm: metric.waistCm,
        armsCm: metric.armsCm,
        thighsCm: metric.thighsCm,
      });
    }
    return newMetric;
  };

  const logWorkoutSession = async (session: Omit<WorkoutSessionLog, 'id'>): Promise<WorkoutSessionLog> => {
    const newId = `WLOG-${Date.now()}`;
    const newSession: WorkoutSessionLog = {
      ...session,
      id: newId,
    };
    setWorkoutLogs(prev => [newSession, ...prev]);
    safeDbWrite(setDoc(doc(db, 'workout_logs', newId), newSession));
    return newSession;
  };

  const addTrainerNote = async (note: Omit<TrainerNote, 'id' | 'createdAt'>): Promise<TrainerNote> => {
    const newId = `TNOTE-${Date.now()}`;
    const newNote: TrainerNote = {
      ...note,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setTrainerNotes(prev => [newNote, ...prev]);
    safeDbWrite(setDoc(doc(db, 'trainer_notes', newId), newNote));
    return newNote;
  };

  const addWellnessCheckin = async (checkin: Omit<DailyWellnessCheckin, 'id' | 'recordedAt'>): Promise<DailyWellnessCheckin> => {
    const newId = `WELL-${Date.now()}`;
    const newCheckin: DailyWellnessCheckin = {
      ...checkin,
      id: newId,
      recordedAt: new Date().toISOString(),
    };
    setWellnessCheckins(prev => [newCheckin, ...prev]);
    safeDbWrite(setDoc(doc(db, 'wellness_checkins', newId), newCheckin));
    return newCheckin;
  };

  const freezeMembership = async (
    freeze: Partial<MembershipFreezeRecord> & { memberId: string; startDate: string; endDate: string; reason: string }
  ): Promise<MembershipFreezeRecord> => {
    const member = members.find(m => m.id === freeze.memberId);
    const start = new Date(freeze.startDate).getTime();
    const end = new Date(freeze.endDate).getTime();
    const calcDays = Math.max(1, Math.round((end - start) / 86400000));
    const extensionDays = freeze.extensionDays ?? calcDays;

    const newId = `FRZ-${Date.now()}`;
    const newFreeze: MembershipFreezeRecord = {
      id: newId,
      memberId: freeze.memberId,
      memberName: freeze.memberName || member?.name || 'Member',
      startDate: freeze.startDate,
      endDate: freeze.endDate,
      reason: freeze.reason,
      approvedBy: freeze.approvedBy || 'Admin Self-Service',
      approvedAt: new Date().toISOString(),
      status: freeze.status || 'Active Freeze',
      daysCount: calcDays,
      extensionDays,
    };
    setFreezeRecords(prev => [newFreeze, ...prev]);
    safeDbWrite(setDoc(doc(db, 'membership_freezes', newId), newFreeze));

    // Extend member subscription endDate by freeze days and mark Frozen
    if (member && extensionDays > 0) {
      const currentEnd = new Date(member.endDate || member.expiryDate || new Date().toISOString());
      const extendedEnd = new Date(currentEnd.getTime() + extensionDays * 86400000).toISOString().split('T')[0];
      updateMember(member.id, {
        endDate: extendedEnd,
        expiryDate: extendedEnd,
        status: 'Frozen',
      });
    }

    return newFreeze;
  };

  const addChallenge = async (challenge: Omit<GymChallenge, 'id'>): Promise<GymChallenge> => {
    const newId = `CHAL-${Date.now()}`;
    const newChallenge: GymChallenge = {
      ...challenge,
      id: newId,
    };
    setChallenges(prev => [newChallenge, ...prev]);
    safeDbWrite(setDoc(doc(db, 'gym_challenges', newId), newChallenge));
    return newChallenge;
  };

  const joinChallenge = async (challengeId: string, memberId: string, memberName?: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    const member = members.find(m => m.id === memberId);
    if (!challenge) return;
    if (challenge.participants && challenge.participants.some(p => p.memberId === memberId || p === memberId)) return;

    const newParticipant = {
      memberId,
      memberName: memberName || member?.name || 'Member',
      currentScore: 0,
      joinedAt: new Date().toISOString().split('T')[0],
    };

    const updatedParticipants = [...(challenge.participants || []), newParticipant];
    setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, participants: updatedParticipants } : c));
    safeDbWrite(updateDoc(doc(db, 'gym_challenges', challengeId), { participants: updatedParticipants }));
  };

  const addReferral = async (ref: Omit<ReferralRecord, 'id'>): Promise<ReferralRecord> => {
    const newId = `REF-${Date.now()}`;
    const newRef: ReferralRecord = {
      ...ref,
      id: newId,
    };
    setReferrals(prev => [newRef, ...prev]);
    safeDbWrite(setDoc(doc(db, 'member_referrals', newId), newRef));
    return newRef;
  };

  const rewardReferral = async (referralId: string) => {
    const ref = referrals.find(r => r.id === referralId);
    if (!ref) return;
    setReferrals(prev => prev.map(r => r.id === referralId ? { ...r, status: 'Rewarded', rewardClaimed: true } : r));
    safeDbWrite(updateDoc(doc(db, 'member_referrals', referralId), { status: 'Rewarded', rewardClaimed: true }));

    // Add reward points to referrer member
    const referrer = members.find(m => m.id === ref.referrerMemberId);
    if (referrer) {
      updateMember(referrer.id, {
        rewardPoints: (referrer.rewardPoints || 0) + (ref.rewardPoints || 100),
      });
    }
  };

  const convertLeadToMember = async (leadId: string, planId?: string, trainerId?: string): Promise<Member> => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    const selectedPlan = plans.find(p => p.id === planId) || plans[0];
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + (selectedPlan.durationMonths || 1) * 30 * 86400000).toISOString().split('T')[0];

    const newMemberResult = await provisionMemberWithAccount({
      name: lead.name,
      mobile: lead.phone || lead.mobile || '+91 98765 00000',
      email: lead.email || `${lead.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      faceEnrolled: false,
      dob: '1998-05-15',
      gender: 'Male',
      heightCm: 175,
      weightKg: 75,
      startWeightKg: 75,
      bmi: 24.5,
      chestCm: 100,
      waistCm: 84,
      armsCm: 35,
      thighsCm: 56,
      bloodGroup: 'O+',
      emergencyContactName: 'Family Contact',
      emergencyMobile: '+91 98765 00001',
      address: 'Smart Gym Franchise Area',
      medicalHistory: 'None',
      goal: (lead.interestGoal as any) || (lead.goal as any) || 'Muscle Building',
      referralSource: lead.source || 'Walk-in',
      branchId: lead.branchId || selectedBranchId || 'branch-1',
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      assignedTrainerId: trainerId,
      startDate,
      endDate,
      expiryDate: endDate,
      pendingDues: 0,
      paidAmount: selectedPlan.totalPrice,
      totalPlanAmount: selectedPlan.totalPrice,
    }, { createLogin: true, sendWhatsApp: true });

    updateLeadStage(leadId, 'Joined');
    return newMemberResult.member;
  };

  const addLead = async (leadData: Omit<Lead, 'id'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
    };
    setLeads(prev => [newLead, ...prev]);
    safeDbWrite(setDoc(doc(db, 'leads', newLead.id), newLead));
  };

  const updateLeadStage = async (id: string, stage: Lead['stage']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
    safeDbWrite(updateDoc(doc(db, 'leads', id), { stage }));
  };

  const createComplaint = async (complaintData: Omit<ComplaintTicket, 'id' | 'createdAt' | 'status'>) => {
    const newComplaint: ComplaintTicket = {
      ...complaintData,
      id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toLocaleString(),
      status: 'Open',
    };
    setComplaints(prev => [newComplaint, ...prev]);
    safeDbWrite(setDoc(doc(db, 'complaints', newComplaint.id!), newComplaint));
  };

  const resolveComplaint = async (id: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'Resolved' } : c));
    safeDbWrite(updateDoc(doc(db, 'complaints', id), { status: 'Resolved' }));
  };

  const addNotification = async (notifData: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: SystemNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    safeDbWrite(setDoc(doc(db, 'notifications', newNotif.id), newNotif));
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    safeDbWrite(updateDoc(doc(db, 'notifications', id), { read: true }));
  };

  const sendBulkNotification = async (
    targetFilter: 'all' | 'unpaid' | 'expiring' | 'expired' | 'single',
    title: string,
    message: string,
    singleMemberId?: string
  ) => {
    const now = new Date();
    const createdNotifs: SystemNotification[] = [];

    if (targetFilter === 'single' && singleMemberId) {
      createdNotifs.push({
        id: `notif-${Date.now()}`,
        targetRole: 'Member',
        memberId: singleMemberId,
        title,
        message,
        timestamp: 'Just now',
        type: 'reminder',
        read: false
      });
    } else if (targetFilter === 'all') {
      members.forEach(m => {
        createdNotifs.push({
          id: `notif-${Date.now()}-${m.id}`,
          targetRole: 'Member',
          memberId: m.id,
          title,
          message,
          timestamp: 'Just now',
          type: 'general',
          read: false
        });
      });
    } else if (targetFilter === 'unpaid') {
      members.filter(m => (m.pendingDues || 0) > 0).forEach(m => {
        createdNotifs.push({
          id: `notif-${Date.now()}-${m.id}`,
          targetRole: 'Member',
          memberId: m.id,
          title,
          message,
          timestamp: 'Just now',
          type: 'billing',
          read: false
        });
      });
    } else if (targetFilter === 'expiring') {
      members.filter(m => m.status === 'Expiring Soon').forEach(m => {
        createdNotifs.push({
          id: `notif-${Date.now()}-${m.id}`,
          targetRole: 'Member',
          memberId: m.id,
          title,
          message,
          timestamp: 'Just now',
          type: 'reminder',
          read: false
        });
      });
    } else if (targetFilter === 'expired') {
      members.filter(m => m.status === 'Expired').forEach(m => {
        createdNotifs.push({
          id: `notif-${Date.now()}-${m.id}`,
          targetRole: 'Member',
          memberId: m.id,
          title,
          message,
          timestamp: 'Just now',
          type: 'reminder',
          read: false
        });
      });
    }

    setNotifications(prev => [...createdNotifs, ...prev]);
    createdNotifs.forEach(n => safeDbWrite(setDoc(doc(db, 'notifications', n.id), n)));
  };

  const renewSubscription = async (memberId: string, planId: string) => {
    const targetPlan = plans.find((p) => p.id === planId) || plans[0];
    const targetMemberId = memberId || activeMemberId;

    const startDateObj = new Date();
    const newStartDate = startDateObj.toISOString().split('T')[0];
    const endDateObj = new Date();
    endDateObj.setMonth(endDateObj.getMonth() + targetPlan.durationMonths);
    const newEndDate = endDateObj.toISOString().split('T')[0];

    const updatedData = {
      planId: targetPlan.id,
      planName: targetPlan.name,
      startDate: newStartDate,
      endDate: newEndDate,
      expiryDate: newEndDate,
      status: 'Active' as const,
      pendingDues: 0,
      paidAmount: targetPlan.totalPrice,
      totalPlanAmount: targetPlan.totalPrice,
      lastPaymentDate: newStartDate,
      nextDueDate: newEndDate,
      paymentStatus: 'Paid' as const
    };

    setMembers((prevMembers) => {
      const exists = prevMembers.some((m) => m.id === targetMemberId);
      if (exists) {
        return prevMembers.map((m) => (m.id === targetMemberId ? { ...m, ...updatedData } : m));
      } else {
        const fullNewMember: Member = {
          id: targetMemberId,
          membershipNo: `SG-${Math.floor(10000 + Math.random() * 90000)}`,
          name: appUserAccount?.linkedName || firebaseUser?.displayName || 'Member User',
          photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetMemberId}`,
          faceEnrolled: false,
          mobile: '+91 98765 00000',
          email: firebaseUser?.email || 'member@smartgym.com',
          dob: '1998-01-01',
          gender: 'Other',
          heightCm: 175,
          weightKg: 70,
          startWeightKg: 70,
          bmi: 22.8,
          chestCm: 0,
          waistCm: 0,
          armsCm: 0,
          thighsCm: 0,
          bloodGroup: 'O+',
          emergencyContactName: '',
          emergencyMobile: '',
          address: 'Smart Gym City',
          medicalHistory: 'None',
          goal: 'Muscle Building',
          referralSource: 'App Subscription',
          branchId: appUserAccount?.branchId || selectedBranchId || 'branch-1',
          planId: targetPlan.id,
          planName: targetPlan.name,
          startDate: newStartDate,
          endDate: newEndDate,
          status: 'Active',
          rewardPoints: 100,
          referralCode: 'MEMBER2026',
          pendingDues: 0,
          paidAmount: targetPlan.totalPrice,
          totalPlanAmount: targetPlan.totalPrice,
          lastPaymentDate: newStartDate,
          nextDueDate: newEndDate,
          paymentStatus: 'Paid'
        };
        return [...prevMembers, fullNewMember];
      }
    });

    setActiveMemberIdState(targetMemberId);
    setSubscriptionStatus('active');

    safeDbWrite(setDoc(doc(db, 'members', targetMemberId), updatedData, { merge: true }));
    safeDbWrite(addNotification({
      targetRole: 'Member',
      memberId: targetMemberId,
      title: '🎉 Subscription Renewed & Active!',
      message: `Your ${targetPlan.name} membership is now active until ${newEndDate}.`,
      type: 'billing',
    }));
  };

  // === EXPENSE MANAGEMENT ===
  const addExpense = async (expenseData: Omit<Expense, 'id'>): Promise<Expense> => {
    const newExpense: Expense = {
      ...expenseData,
      id: `EXP-2026-${String(expenses.length + 1).padStart(3, '0')}`
    };

    setExpenses(prev => [newExpense, ...prev]);
    safeDbWrite(setDoc(doc(db, 'expenses', newExpense.id), newExpense));
    return newExpense;
  };

  const updateExpense = async (id: string, updated: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    safeDbWrite(updateDoc(doc(db, 'expenses', id), updated));
  };

  const deleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    safeDbWrite(deleteDoc(doc(db, 'expenses', id)));
  };

  const addExpenseType = async (name: string, description?: string) => {
    const newType: ExpenseType = {
      id: `ext-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || '',
      isDefault: false,
      color: '#4F7CFF'
    };
    setExpenseTypes(prev => [...prev, newType]);
    safeDbWrite(setDoc(doc(db, 'expense_types', newType.id), newType));
  };

  const deleteExpenseType = async (id: string): Promise<{ success: boolean; message?: string }> => {
    const target = expenseTypes.find(t => t.id === id);
    if (!target) return { success: false, message: 'Expense type not found.' };

    const isUsed = expenses.some(e => e.category.toLowerCase() === target.name.toLowerCase());
    if (isUsed) {
      return { success: false, message: `Cannot delete "${target.name}" because it is used by existing expense records.` };
    }

    setExpenseTypes(prev => prev.filter(t => t.id !== id));
    safeDbWrite(deleteDoc(doc(db, 'expense_types', id)));
    return { success: true };
  };

  // === PACKAGE MANAGEMENT ===
  const addMembershipPlan = async (newPlan: MembershipPlan) => {
    setPlans(prev => [...prev, newPlan]);
    safeDbWrite(setDoc(doc(db, 'plans', newPlan.id), newPlan));
  };

  const updateMembershipPlan = async (id: string, updated: Partial<MembershipPlan>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    safeDbWrite(updateDoc(doc(db, 'plans', id), updated));
  };

  const deleteMembershipPlan = async (id: string): Promise<{ success: boolean; message?: string }> => {
    const isUsed = members.some(m => m.planId === id && m.status === 'Active');
    if (isUsed) {
      return { success: false, message: 'Cannot delete package because active members are enrolled in it.' };
    }
    setPlans(prev => prev.filter(p => p.id !== id));
    safeDbWrite(deleteDoc(doc(db, 'plans', id)));
    return { success: true };
  };

  // === MASTER ADMIN ACCOUNT MANAGEMENT ===
  const updateUserStatus = async (userId: string, isActive: boolean) => {
    const target = appUsers.find(u => u.id === userId || u.username === userId);
    if (target?.username === 'MASTERADMIN' || target?.isProtected) {
      throw new Error('Master Admin account is protected and cannot be deactivated or suspended.');
    }

    setAppUsers(prev => prev.map(u => (u.id === userId || u.username === userId) ? { ...u, isActive } : u));
    safeDbWrite(updateDoc(doc(db, 'users', userId), { isActive }));

    const auditRecord: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      eventType: isActive ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_SUSPENDED',
      actorId: appUserAccount?.id || 'system',
      actorName: appUserAccount?.linkedName || 'Master Admin',
      actorRole: appUserAccount?.role || 'Super Admin',
      targetId: userId,
      targetType: 'UserAccount',
      details: `User account ${target?.username || userId} status updated to ${isActive ? 'Active' : 'Suspended'}.`,
      status: 'SUCCESS'
    };
    setAuditLogs(prev => [auditRecord, ...prev]);
    safeDbWrite(setDoc(doc(db, 'audit_logs', auditRecord.id), auditRecord));
  };

  const forceUserPasswordChange = async (userId: string) => {
    setAppUsers(prev => prev.map(u => (u.id === userId || u.username === userId) ? { ...u, mustChangePassword: true } : u));
    safeDbWrite(updateDoc(doc(db, 'users', userId), { mustChangePassword: true }));

    const auditRecord: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      eventType: 'FORCE_PASSWORD_CHANGE',
      actorId: appUserAccount?.id || 'system',
      actorName: appUserAccount?.linkedName || 'Master Admin',
      actorRole: appUserAccount?.role || 'Super Admin',
      targetId: userId,
      targetType: 'UserAccount',
      details: `Password reset forced for account ${userId}. User will be prompted on next login.`,
      status: 'SUCCESS'
    };
    setAuditLogs(prev => [auditRecord, ...prev]);
    safeDbWrite(setDoc(doc(db, 'audit_logs', auditRecord.id), auditRecord));
  };

  const updateUserRoleAndBranch = async (userId: string, role: Role, branchId: string) => {
    const target = appUsers.find(u => u.id === userId || u.username === userId);
    if ((target?.username === 'MASTERADMIN' || target?.isProtected) && role !== 'Super Admin') {
      throw new Error('Master Admin role is protected and cannot be changed.');
    }

    const permissions = {
      canViewDashboard: true,
      canEditWorkouts: role === 'Super Admin' || role === 'Owner' || role === 'Trainer',
      canEditDiets: role === 'Super Admin' || role === 'Owner' || role === 'Dietitian',
      canViewMembers: role !== 'Member',
      canManageFinance: role === 'Super Admin' || role === 'Owner',
      canAccessAdmin: role === 'Super Admin' || role === 'Owner' || role === 'Branch Manager',
    };

    setAppUsers(prev => prev.map(u => (u.id === userId || u.username === userId) ? { ...u, role, branchId, permissions } : u));
    safeDbWrite(updateDoc(doc(db, 'users', userId), { role, branchId, permissions }));

    const auditRecord: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      eventType: 'ROLE_PERMISSION_CHANGE',
      actorId: appUserAccount?.id || 'system',
      actorName: appUserAccount?.linkedName || 'Master Admin',
      actorRole: appUserAccount?.role || 'Super Admin',
      targetId: userId,
      targetType: 'UserAccount',
      details: `Account role updated to ${role}, assigned branch: ${branchId}.`,
      status: 'SUCCESS'
    };
    setAuditLogs(prev => [auditRecord, ...prev]);
    safeDbWrite(setDoc(doc(db, 'audit_logs', auditRecord.id), auditRecord));
  };

  const deleteUserAccount = async (userId: string) => {
    const target = appUsers.find(u => u.id === userId || u.username === userId);
    if (target?.username === 'MASTERADMIN' || target?.isProtected) {
      throw new Error('Master Admin account is protected and cannot be deleted.');
    }

    setAppUsers(prev => prev.filter(u => u.id !== userId && u.username !== userId));
    safeDbWrite(deleteDoc(doc(db, 'users', userId)));

    const auditRecord: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      eventType: 'ACCOUNT_DELETION',
      actorId: appUserAccount?.id || 'system',
      actorName: appUserAccount?.linkedName || 'Master Admin',
      actorRole: appUserAccount?.role || 'Super Admin',
      targetId: userId,
      targetType: 'UserAccount',
      details: `User account ${target?.username || userId} permanently removed by Master Admin.`,
      status: 'SUCCESS'
    };
    setAuditLogs(prev => [auditRecord, ...prev]);
    safeDbWrite(setDoc(doc(db, 'audit_logs', auditRecord.id), auditRecord));
  };

  const addAppUser = async (user: AppUser) => {
    let finalUser = { ...user };
    if (user.tempPassword || user.password) {
      const pass = user.tempPassword || user.password || 'SmartGym@2026';
      const userEmail = user.email || `${user.username.toLowerCase()}@smartgym.com`;
      try {
        const authUid = await createIsolatedAuthUser(userEmail, pass);
        finalUser.id = authUid;
        if (!finalUser.linkedId) {
          finalUser.linkedId = authUid;
        }
      } catch (authErr: any) {
        console.warn('createIsolatedAuthUser notice in addAppUser (proceeding with user.id):', authErr);
      }
    }
    const { password, tempPassword, ...sanitizedDoc } = finalUser;
    setAppUsers(prev => [finalUser, ...prev]);
    safeDbWrite(setDoc(doc(db, 'users', finalUser.id), sanitizedDoc));
  };

  const addEmployee = async (emp: Employee) => {
    setEmployees(prev => [emp, ...prev]);
    safeDbWrite(setDoc(doc(db, 'employees', emp.id), emp));
  };

  return (
    <GymContext.Provider
      value={{
        firebaseUser,
        isAuthLoading,
        appUserAccount,
        subscriptionStatus,
        signOutApp,
        setLocalSessionUser,
        
        authContext,
        websiteCustomer,
        websiteCustomers,
        signInWebsiteCustomer,
        signUpWebsiteCustomer,
        signOutWebsite,
        claimWebsiteTrialPass,
        bookWebsiteClass,

        perspective,
        setPerspective,
        currentRole,
        setCurrentRole,
        selectedBranchId,
        setSelectedBranchId,
        branches,
        plans,
        members,
        attendance,
        activeMember,
        activeMemberId,
        setActiveMemberId,
        workout,
        diet,
        progress,
        leads,
        employees,
        supplements,
        equipment,
        maintenanceLogs,
        stockPurchases,
        lockers,
        complaints,
        notifications,
        transactions,
        expenses,
        expenseTypes,
        appUsers,
        auditLogs,
        workoutLogs,
        personalRecords,
        trainerNotes,
        wellnessCheckins,
        freezeRecords,
        membershipFreezes: freezeRecords,
        challenges,
        gymChallenges: challenges,
        referrals,
        logWorkoutSession,
        addTrainerNote,
        addWellnessCheckin,
        freezeMembership,
        addChallenge,
        joinChallenge,
        addReferral,
        rewardReferral,
        convertLeadToMember,
        provisionMemberWithAccount,
        provisionTrainerWithAccount,
        resetMemberPassword,
        updateAccountStatus,
        updateUserStatus,
        forceUserPasswordChange,
        updateUserRoleAndBranch,
        deleteUserAccount,
        completeFirstLoginPasswordChange,
        resendMemberCredentials,
        addBranch,
        generateNewToken,
        scanDoorQR,
        manualCheckIn,
        manualCheckOut,
        addMember,
        updateMember,
        recordMemberPayment,
        toggleExerciseCompleted,
        toggleMealCompleted,
        addWaterIntake,
        addWeeklyWorkout,
        addMonthlyDiet,
        buySupplements,
        addSupplement,
        updateSupplement,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        addMaintenanceLog,
        addStockPurchase,
        addProgressMetric,
        addLead,
        updateLeadStage,
        createComplaint,
        resolveComplaint,
        addNotification,
        markNotificationRead,
        sendBulkNotification,
        renewSubscription,
        addExpense,
        updateExpense,
        deleteExpense,
        addExpenseType,
        deleteExpenseType,
        addMembershipPlan,
        updateMembershipPlan,
        deleteMembershipPlan,
        addAppUser,
        addEmployee,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};
