import React, { createContext, useContext, useState, useEffect } from 'react';
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
  LockerItem,
  ComplaintTicket,
  SystemNotification,
  Transaction,
  Expense,
  ExpenseType,
  AppUser,
  WebsiteCustomer,
  AuditLog
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
  INITIAL_LOCKERS,
  INITIAL_COMPLAINTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_EXPENSES,
  INITIAL_EXPENSE_TYPES,
  INITIAL_WEBSITE_CUSTOMERS,
  INITIAL_APP_USERS
} from '../data/initialData';
import { db, auth } from '../firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';

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
  setActiveMemberId: (id: string) => void;
  workout: WorkoutPlan;
  diet: DietPlan;
  progress: ProgressMetric[];
  leads: Lead[];
  employees: Employee[];
  supplements: SupplementProduct[];
  lockers: LockerItem[];
  complaints: ComplaintTicket[];
  notifications: SystemNotification[];
  transactions: Transaction[];
  expenses: Expense[];
  expenseTypes: ExpenseType[];
  appUsers: AppUser[];
  auditLogs: AuditLog[];

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
  addMember: (newMember: Omit<Member, 'id' | 'membershipNo' | 'status' | 'rewardPoints' | 'referralCode'>) => Promise<Member>;
  updateMember: (id: string, updatedData: Partial<Member>) => Promise<void>;
  recordMemberPayment: (memberId: string, amount: number, paymentMethod: Transaction['paymentMethod'], notes?: string) => Promise<Transaction>;
  
  toggleExerciseCompleted: (weekNumber: number, day: string, exerciseId: string) => Promise<void>;
  toggleMealCompleted: (monthNumber: number, mealCategory: 'breakfast' | 'lunch' | 'snack' | 'dinner', mealId: string) => Promise<void>;
  addWaterIntake: (amountLiters: number) => Promise<void>;
  
  addWeeklyWorkout: (targetMemberId: string, weekNumber: number, weekTitle: string, splits: DailyWorkoutSplit[]) => Promise<void>;
  addMonthlyDiet: (targetMemberId: string, monthPlan: MonthlyDietPlan) => Promise<void>;

  buySupplements: (cartItems: { product: SupplementProduct; qty: number }[], paymentMethod: 'Cash' | 'UPI' | 'Card' | 'NetBanking') => Promise<Transaction>;
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

// Safe background write wrapper with timeout so offline or disabled Firestore never hangs UI
const safeDbWrite = (promise: Promise<any>, timeoutMs = 1500) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Firestore operation timeout')), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]).catch((err) => {
    console.warn('Firestore sync completed in local mode:', err?.message || err);
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
  const [activeMemberId, setActiveMemberIdState] = useState<string>('MEM-2026-001');

  const [workout, setWorkout] = useState<WorkoutPlan>(INITIAL_WORKOUT);
  const [diet, setDiet] = useState<DietPlan>(INITIAL_DIET);
  const [progress, setProgress] = useState<ProgressMetric[]>(INITIAL_PROGRESS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [supplements, setSupplements] = useState<SupplementProduct[]>(INITIAL_SUPPLEMENTS);
  const [lockers, setLockers] = useState<LockerItem[]>(INITIAL_LOCKERS);
  const [complaints, setComplaints] = useState<ComplaintTicket[]>(INITIAL_COMPLAINTS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>(INITIAL_EXPENSE_TYPES);
  const [appUsers, setAppUsers] = useState<AppUser[]>(INITIAL_APP_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

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

    return () => {
      unsubBranches();
      unsubPlans();
      unsubMembers();
      unsubEmployees();
      unsubAttendance();
      unsubSupplements();
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
    };
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      setAppUserAccount(null);
      setSubscriptionStatus('none');
      return;
    }

    const rawEmail = (firebaseUser.email || '').toLowerCase();
    const emailPrefix = rawEmail.includes('@') ? rawEmail.split('@')[0] : rawEmail;

    // 1. Master Admin resolution
    if (rawEmail === 'masteradmin@smartgym.internal' || emailPrefix === 'masteradmin') {
      const existingMaster = appUsers.find(u => u.username.toUpperCase() === 'MASTERADMIN' || (u.email && u.email.toLowerCase() === 'masteradmin@smartgym.internal'));
      const masterAccount: AppUser = {
        id: firebaseUser.uid,
        username: 'MASTERADMIN',
        email: 'masteradmin@smartgym.internal',
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
        }
      };
      setAppUserAccount(masterAccount);
      setCurrentRole('Super Admin');
      setSelectedBranchId(branches[0]?.id || 'all');
      setSubscriptionStatus('active');
      return;
    }

    // 2. Look up user account from Firestore `users` collection
    const foundUser = appUsers.find(
      u =>
        (u.email && u.email.toLowerCase() === rawEmail) ||
        u.username.toLowerCase() === rawEmail ||
        u.username.toLowerCase() === emailPrefix ||
        u.id === firebaseUser.uid ||
        u.linkedId === firebaseUser.uid
    );

    if (foundUser) {
      setAppUserAccount(foundUser);
      setCurrentRole(foundUser.role);
      setSelectedBranchId(foundUser.branchId || branches[0]?.id || 'all');

      if (foundUser.role === 'Member') {
        const memberRec = members.find(
          m =>
            m.id === foundUser.linkedId ||
            (m.username && m.username.toLowerCase() === foundUser.username.toLowerCase()) ||
            (m.email && m.email.toLowerCase() === rawEmail)
        );
        if (memberRec) {
          setActiveMemberIdState(memberRec.id);
          const isExpired = memberRec.status === 'Expired' || new Date(memberRec.expiryDate || memberRec.endDate) < new Date();
          setSubscriptionStatus(isExpired ? 'expired' : 'active');
        } else {
          setSubscriptionStatus('active');
        }
      } else {
        setSubscriptionStatus('active');
      }
      return;
    }

    // 3. Check if this Firebase User corresponds directly to a member in members collection
    const matchingMember = members.find(
      m =>
        (m.email && m.email.toLowerCase() === rawEmail) ||
        (m.username && m.username.toLowerCase() === emailPrefix) ||
        (m.membershipNo && m.membershipNo.toLowerCase() === emailPrefix) ||
        m.id === firebaseUser.uid ||
        m.userId === firebaseUser.uid
    );

    if (matchingMember) {
      const memberAccount: AppUser = {
        id: matchingMember.userId || firebaseUser.uid,
        username: matchingMember.username || emailPrefix.toUpperCase(),
        email: matchingMember.email || rawEmail,
        role: 'Member',
        linkedId: matchingMember.id,
        linkedName: matchingMember.name,
        branchId: matchingMember.branchId || branches[0]?.id || 'all',
        createdAt: matchingMember.startDate || new Date().toISOString(),
        createdByAdminId: 'system',
        isActive: matchingMember.status !== 'Cancelled' && matchingMember.status !== 'Suspended',
        permissions: {
          canViewDashboard: true,
          canEditWorkouts: false,
          canEditDiets: false,
          canViewMembers: false,
          canManageFinance: false,
          canAccessAdmin: false,
        }
      };
      setAppUserAccount(memberAccount);
      setCurrentRole('Member');
      setActiveMemberIdState(matchingMember.id);
      const isExpired = matchingMember.status === 'Expired' || new Date(matchingMember.expiryDate || matchingMember.endDate) < new Date();
      setSubscriptionStatus(isExpired ? 'expired' : 'active');
      return;
    }

    // 4. Check matching employee
    const matchingEmployee = employees.find(e => e.email?.toLowerCase() === rawEmail || (e as any).mobile === emailPrefix);
    if (matchingEmployee) {
      const empAccount: AppUser = {
        id: firebaseUser.uid,
        username: emailPrefix.toUpperCase(),
        email: matchingEmployee.email || rawEmail,
        role: matchingEmployee.role,
        linkedId: matchingEmployee.id,
        linkedName: matchingEmployee.name,
        branchId: matchingEmployee.branchId || branches[0]?.id || 'all',
        createdAt: matchingEmployee.joiningDate || new Date().toISOString(),
        createdByAdminId: 'system',
        isActive: true,
        permissions: {
          canViewDashboard: true,
          canEditWorkouts: matchingEmployee.role === 'Trainer',
          canEditDiets: matchingEmployee.role === 'Dietitian',
          canViewMembers: matchingEmployee.role !== 'Employee',
          canManageFinance: matchingEmployee.role === 'Super Admin' || matchingEmployee.role === 'Owner',
          canAccessAdmin: matchingEmployee.role === 'Super Admin' || matchingEmployee.role === 'Owner' || matchingEmployee.role === 'Branch Manager',
        }
      };
      setAppUserAccount(empAccount);
      setCurrentRole(empAccount.role);
      setSelectedBranchId(empAccount.branchId);
      setSubscriptionStatus('active');
      return;
    }

    // 5. Default safe role
    const dynamicUser: AppUser = {
      id: firebaseUser.uid,
      username: rawEmail || firebaseUser.uid,
      email: rawEmail,
      role: 'Member',
      linkedId: firebaseUser.uid,
      linkedName: firebaseUser.displayName || 'Member',
      branchId: branches[0]?.id || 'all',
      createdAt: new Date().toISOString(),
      createdByAdminId: 'system',
      isActive: true,
      permissions: {
        canViewDashboard: true,
        canEditWorkouts: false,
        canEditDiets: false,
        canViewMembers: false,
        canManageFinance: false,
        canAccessAdmin: false,
      }
    };
    setAppUserAccount(dynamicUser);
    setCurrentRole('Member');
    setSelectedBranchId(branches[0]?.id || 'all');
    setSubscriptionStatus('active');
  }, [firebaseUser, appUsers, members, employees, branches]);

  // Workout & Diet active member sync
  useEffect(() => {
    if (!activeMemberId) return;
    const unsubWorkout = onSnapshot(doc(db, 'workouts', activeMemberId), (docSnap) => {
      if (docSnap.exists()) {
        setWorkout(docSnap.data() as WorkoutPlan);
      }
    });
    const unsubDiet = onSnapshot(doc(db, 'diets', activeMemberId), (docSnap) => {
      if (docSnap.exists()) {
        setDiet(docSnap.data() as DietPlan);
      }
    });
    return () => {
      unsubWorkout();
      unsubDiet();
    };
  }, [activeMemberId]);

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0] || ({
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
    rewardPoints: 350,
    referralCode: 'ALEX2026',
    pendingDues: 0,
    paidAmount: 35400,
    totalPlanAmount: 35400,
    lastPaymentDate: '2026-01-01',
    nextDueDate: '2027-01-01',
    paymentStatus: 'Paid',
    lockerNumber: 'L-101'
  } as Member);

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
  };

  const signOutApp = async () => {
    localStorage.removeItem('gym_app_user_account');
    localStorage.removeItem('gym_auth_context');
    try {
      await signOut(auth);
    } catch {}
    setFirebaseUser(null);
    setAppUserAccount(null);
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
    const randomHex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    return `SMARTGYM-${memberId}-${timestamp}-${randomHex}`.toUpperCase();
  };

  const scanDoorQR = (
    qrToken: string,
    targetBranchId: BranchId,
    verificationMethod: 'Dynamic QR' | 'Face ID' = 'Dynamic QR'
  ) => {
    let scannedMember = activeMember;
    if (qrToken.startsWith('SMARTGYM-') || qrToken.startsWith('PULSEFIT-')) {
      const parts = qrToken.split('-');
      const mId = `${parts[1]}-${parts[2]}-${parts[3]}`;
      const found = members.find((m) => m.id === mId || m.membershipNo === qrToken);
      if (found) scannedMember = found;
    }

    if (scannedMember.status === 'Expired' || scannedMember.status === 'Cancelled') {
      return {
        success: false,
        message: `ACCESS DENIED: Membership is ${scannedMember.status}. Please renew at front desk.`,
        member: scannedMember,
      };
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      memberId: scannedMember.id,
      memberName: scannedMember.name,
      memberPhoto: scannedMember.photoUrl,
      branchId: targetBranchId,
      entryTime: timeStr,
      verificationMethod,
      deviceInfo: `SmartRelay-Pro #${targetBranchId} (Main Gate)`,
      date: dateStr,
      status: 'Active In Gym',
    };

    setAttendance(prev => [newRecord, ...prev]);
    safeDbWrite(setDoc(doc(db, 'attendance', newRecord.id), newRecord));

    return {
      success: true,
      message: `GATE UNLOCKED: Welcome back ${scannedMember.name}! Entry logged at ${timeStr}.`,
      member: scannedMember,
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

    // 5. Build Member Record
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
      userId: options.createLogin ? userId : undefined,
      username: options.createLogin ? username : undefined,
      tempPassword: options.createLogin ? tempPassword : undefined,
      mustChangePassword: options.createLogin ? true : false,
      whatsappStatus: initialWhatsAppStatus,
      whatsappSentAt: initialWhatsAppStatus === 'SENT' ? new Date().toISOString() : undefined,
    };

    setMembers((prev) => [newMember, ...prev]);
    safeDbWrite(setDoc(doc(db, 'members', memberId), newMember));

    // 6. Record Member Creation Audit
    await recordAuditLog(
      'MEMBER_CREATED',
      memberId,
      newMember.name,
      `Member enrolled with plan ${newMember.planName} (ID: ${membershipNo})`
    );

    // 7. Build and persist AppUser if requested
    let createdAppUser: AppUser | undefined;
    if (options.createLogin) {
      createdAppUser = {
        id: userId,
        username,
        email: newMemberData.email || `${username.toLowerCase()}@smartgym.internal`,
        password: tempPassword,
        tempPassword,
        role: 'Member',
        linkedId: memberId,
        linkedName: newMember.name,
        branchId: newMember.branchId,
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
      safeDbWrite(setDoc(doc(db, 'users', userId), createdAppUser));

      await recordAuditLog(
        'ACCOUNT_PROVISIONED',
        memberId,
        newMember.name,
        `Member login account provisioned with username ${username} (Role: Member)`
      );
    }

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
    const employeeId = `EMP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const existingUsernames = appUsers.map((u) => u.username);
    const username = generateUniqueStaffUsername('TRN', employees.length + 1, existingUsernames);
    const tempPassword = generateSecureTemporaryPassword();
    const userId = `USR-TRN-${Date.now()}`;
    const normalizedPhone = normalizePhoneNumber(empData.mobile);

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

    const newEmployee: Employee = {
      ...empData,
      id: employeeId,
      email: empData.email || `${username.toLowerCase()}@smartgym.internal`,
    };

    setEmployees((prev) => [newEmployee, ...prev]);
    safeDbWrite(setDoc(doc(db, 'employees', employeeId), newEmployee));

    const createdAppUser: AppUser = {
      id: userId,
      username,
      email: newEmployee.email,
      password: tempPassword,
      tempPassword,
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
        canManageFinance: false, // Strict financial restriction
        canAccessAdmin: false,   // Strict admin restriction
      },
    };

    setAppUsers((prev) => [createdAppUser, ...prev]);
    safeDbWrite(setDoc(doc(db, 'users', userId), createdAppUser));

    await recordAuditLog(
      'ACCOUNT_PROVISIONED',
      employeeId,
      newEmployee.name,
      `Trainer account provisioned with username ${username} (Role: ${newEmployee.role})`
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
    const user = appUsers.find((u) => u.id === userId || u.username.toLowerCase() === userId.toLowerCase());
    if (!user) throw new Error('User not found');

    const updatedUserPartial: Partial<AppUser> = {
      password: newPassword,
      tempPassword: '',
      mustChangePassword: false,
      lastLoginAt: new Date().toISOString(),
    };

    setAppUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updatedUserPartial } : u)));
    safeDbWrite(updateDoc(doc(db, 'users', user.id), updatedUserPartial));

    // Also update linked member if present
    if (user.linkedId) {
      const updatedMemberPartial: Partial<Member> = {
        tempPassword: '',
        mustChangePassword: false,
        lastLoginAt: new Date().toISOString(),
      };
      setMembers((prev) => prev.map((m) => (m.id === user.linkedId ? { ...m, ...updatedMemberPartial } : m)));
      safeDbWrite(updateDoc(doc(db, 'members', user.linkedId), updatedMemberPartial));
    }

    if (appUserAccount && appUserAccount.id === user.id) {
      setAppUserAccount((prev) => (prev ? { ...prev, ...updatedUserPartial } : null));
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
    const newWeek: WeeklyWorkoutPlan = {
      weekNumber,
      weekTitle,
      splits,
    };

    const existingWeeks = workout.weeklyPlans.filter((w) => w.weekNumber !== weekNumber);
    const updatedWorkout: WorkoutPlan = {
      id: `wpt-${targetMemberId}`,
      memberId: targetMemberId,
      weeklyPlans: [...existingWeeks, newWeek].sort((a, b) => a.weekNumber - b.weekNumber),
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setWorkout(updatedWorkout);
    safeDbWrite(setDoc(doc(db, 'workouts', targetMemberId), updatedWorkout));
  };

  const addMonthlyDiet = async (targetMemberId: string, monthPlan: MonthlyDietPlan) => {
    const existingMonths = diet.monthlyPlans.filter((m) => m.monthNumber !== monthPlan.monthNumber);
    const updatedDiet: DietPlan = {
      id: `dpt-${targetMemberId}`,
      memberId: targetMemberId,
      waterCurrentLiters: diet.waterCurrentLiters || 2.5,
      monthlyPlans: [...existingMonths, monthPlan].sort((a, b) => a.monthNumber - b.monthNumber),
    };

    setDiet(updatedDiet);
    safeDbWrite(setDoc(doc(db, 'diets', targetMemberId), updatedDiet));
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
    setAppUsers(prev => [user, ...prev]);
    safeDbWrite(setDoc(doc(db, 'users', user.id), user));
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
        setActiveMemberId,
        workout,
        diet,
        progress,
        leads,
        employees,
        supplements,
        lockers,
        complaints,
        notifications,
        transactions,
        expenses,
        expenseTypes,
        appUsers,
        auditLogs,
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
        addMember,
        updateMember,
        recordMemberPayment,
        toggleExerciseCompleted,
        toggleMealCompleted,
        addWaterIntake,
        addWeeklyWorkout,
        addMonthlyDiet,
        buySupplements,
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
