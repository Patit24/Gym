import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { GymProvider, useGym } from './context/GymContext';

// Website Experience
import { WebsiteLayout } from './components/website/WebsiteLayout';
import { WebsiteHomePage } from './components/website/WebsiteHomePage';
import { WebsitePlansPage } from './components/website/WebsitePlansPage';
import { WebsiteSchedulePage } from './components/website/WebsiteSchedulePage';
import { WebsiteFacilitiesPage } from './components/website/WebsiteFacilitiesPage';
import { WebsiteLogin } from './components/website/WebsiteLogin';
import { WebsiteCustomerRoute } from './components/website/WebsiteCustomerRoute';
import { WebsiteCustomerDashboard } from './components/website/WebsiteCustomerDashboard';

// App Authentication & Guards
import { AppLogin } from './components/auth/AppLogin';
import { AppUserRoute } from './components/auth/AppUserRoute';
import { AppTrainerRoute } from './components/auth/AppTrainerRoute';
import { AppAdminRoute } from './components/auth/AppAdminRoute';
import { SubscriptionPage } from './components/auth/SubscriptionPage';

// App Layouts
import { UserAppLayout } from './components/layout/UserAppLayout';
import { TrainerAppLayout } from './components/layout/TrainerAppLayout';
import { AdminAppLayout } from './components/layout/AdminAppLayout';
import { UserAppDashboard } from './components/user/UserAppDashboard';
import { TrainerAppDashboard } from './components/trainer/TrainerAppDashboard';
import { AdminAppDashboard } from './components/admin/AdminAppDashboard';

// Lazy-loaded ERP Dashboards & Managers
const AdminDashboard = lazy(() => import('./components/erp/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const OwnerDashboard = lazy(() => import('./components/erp/OwnerDashboard').then(m => ({ default: m.OwnerDashboard })));
const TrainerDashboard = lazy(() => import('./components/erp/TrainerDashboard').then(m => ({ default: m.TrainerDashboard })));
const ReceptionDashboard = lazy(() => import('./components/erp/ReceptionDashboard').then(m => ({ default: m.ReceptionDashboard })));
const MembersManager = lazy(() => import('./components/erp/MembersManager').then(m => ({ default: m.MembersManager })));
const MemberRegistrationModal = lazy(() => import('./components/erp/MemberRegistrationModal').then(m => ({ default: m.MemberRegistrationModal })));
const PlansManager = lazy(() => import('./components/erp/PlansManager').then(m => ({ default: m.PlansManager })));
const POSStore = lazy(() => import('./components/erp/POSStore').then(m => ({ default: m.POSStore })));
const LeadCRM = lazy(() => import('./components/erp/LeadCRM').then(m => ({ default: m.LeadCRM })));
const PayrollHR = lazy(() => import('./components/erp/PayrollHR').then(m => ({ default: m.PayrollHR })));
const InventoryLockers = lazy(() => import('./components/erp/InventoryLockers').then(m => ({ default: m.InventoryLockers })));
const FinanceReports = lazy(() => import('./components/erp/FinanceReports').then(m => ({ default: m.FinanceReports })));
const ComplaintsDesk = lazy(() => import('./components/erp/ComplaintsDesk').then(m => ({ default: m.ComplaintsDesk })));
const AICoachStudio = lazy(() => import('./components/erp/AICoachStudio').then(m => ({ default: m.AICoachStudio })));
const AdvancedPlannerStudio = lazy(() => import('./components/planner/AdvancedPlannerStudio').then(m => ({ default: m.AdvancedPlannerStudio })));
const SmartDoorSimulator = lazy(() => import('./components/hardware/SmartDoorSimulator').then(m => ({ default: m.SmartDoorSimulator })));

import {
  Layers, Users, Dumbbell, ShoppingBag, Target, FileText, Lock, DollarSign, AlertCircle, Brain, BookOpen, Activity
} from 'lucide-react';

export const TabLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8 text-center" role="status" aria-live="polite">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#27D980] p-[2px] shadow-lg animate-pulse mb-3">
      <div className="w-full h-full bg-[#0B0D12] rounded-[10px] flex items-center justify-center">
        <Activity className="w-5 h-5 text-[#27D980] animate-spin" />
      </div>
    </div>
    <p className="text-xs font-semibold text-gym-subtext">Loading workspace...</p>
  </div>
);

// -------------------------------------------------------------
// ERP Admin Tabs Router (Inside Admin Portal)
// -------------------------------------------------------------
const ERpLayout: React.FC = () => {
  const { currentRole } = useGym();
  const [erpTab, setErpTab] = useState<string>('dashboard');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState<boolean>(false);

  const erpTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers, roles: ['Super Admin', 'Owner', 'Branch Manager', 'Receptionist', 'Trainer', 'Accountant'] },
    { id: 'members', label: 'Members', icon: Users, roles: ['Super Admin', 'Owner', 'Branch Manager', 'Receptionist', 'Trainer', 'Dietitian'] },
    { id: 'planner', label: 'Trainer & Diet Planner', icon: BookOpen, roles: ['Super Admin', 'Owner', 'Branch Manager', 'Trainer', 'Dietitian', 'Receptionist'] },
    { id: 'plans', label: 'Packages / Plans', icon: Dumbbell, roles: ['Super Admin', 'Owner', 'Branch Manager'] },
    { id: 'finance', label: 'Finance & P&L', icon: DollarSign, roles: ['Super Admin', 'Owner', 'Accountant'] },
    { id: 'pos', label: 'Supplement POS', icon: ShoppingBag, roles: ['Super Admin', 'Owner', 'Branch Manager', 'Receptionist', 'Accountant'] },
    { id: 'crm', label: 'Lead CRM', icon: Target, roles: ['Super Admin', 'Owner', 'Branch Manager', 'Receptionist'] },
    { id: 'payroll', label: 'Payroll & HR', icon: FileText, roles: ['Super Admin', 'Owner', 'Accountant'] },
    { id: 'lockers', label: 'Lockers & Equip', icon: Lock, roles: ['Super Admin', 'Owner', 'Branch Manager', 'Receptionist'] },
    { id: 'complaints', label: 'Complaints', icon: AlertCircle, roles: ['Super Admin', 'Owner', 'Branch Manager', 'Employee'] },
    { id: 'aistudio', label: 'AI Coach Studio', icon: Brain, roles: ['Super Admin', 'Trainer', 'Dietitian'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gym-border/60 scrollbar-none" role="tablist" aria-label="ERP Workspace Tabs">
        {erpTabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = erpTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setErpTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-[#4F7CFF] ${
                isActive
                  ? 'bg-[#4F7CFF] text-white shadow-lg shadow-[#4F7CFF]/20 font-extrabold'
                  : 'bg-[#14171F] text-gym-subtext hover:text-slate-200 border border-gym-border'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <Suspense fallback={<TabLoadingFallback />}>
        <div id={`tabpanel-${erpTab}`} role="tabpanel" tabIndex={0}>
          {erpTab === 'planner' && <AdvancedPlannerStudio />}
          {erpTab === 'dashboard' && (
            currentRole === 'Owner' ? (
              <OwnerDashboard />
            ) : currentRole === 'Trainer' ? (
              <TrainerDashboard />
            ) : currentRole === 'Receptionist' ? (
              <ReceptionDashboard onOpenNewMemberModal={() => setIsMemberModalOpen(true)} onNavigateTab={(t) => setErpTab(t)} />
            ) : (
              <AdminDashboard onOpenNewMemberModal={() => setIsMemberModalOpen(true)} onNavigateTab={(t) => setErpTab(t)} />
            )
          )}

          {erpTab === 'members' && <MembersManager onOpenNewMemberModal={() => setIsMemberModalOpen(true)} />}
          {erpTab === 'plans' && <PlansManager />}
          {erpTab === 'pos' && <POSStore />}
          {erpTab === 'crm' && <LeadCRM />}
          {erpTab === 'payroll' && <PayrollHR />}
          {erpTab === 'lockers' && <InventoryLockers />}
          {erpTab === 'finance' && <FinanceReports />}
          {erpTab === 'complaints' && <ComplaintsDesk />}
          {erpTab === 'aistudio' && <AICoachStudio />}
        </div>
      </Suspense>

      {isMemberModalOpen && (
        <Suspense fallback={null}>
          <MemberRegistrationModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} />
        </Suspense>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// App Entry Auto-Router
// -------------------------------------------------------------
const AppEntryRedirect: React.FC = () => {
  const { firebaseUser, appUserAccount, isAuthLoading } = useGym();

  if (isAuthLoading) {
    return <TabLoadingFallback />;
  }

  if (!firebaseUser || !appUserAccount) {
    return <AppLogin />;
  }

  if (appUserAccount.role === 'Member') {
    return <Navigate to="/app/user/dashboard" replace />;
  }

  if (appUserAccount.role === 'Trainer' || appUserAccount.role === 'Dietitian') {
    return <Navigate to="/app/trainer/dashboard" replace />;
  }

  return <Navigate to="/app/admin/dashboard" replace />;
};

// -------------------------------------------------------------
// Main Core Application Routes
// -------------------------------------------------------------
const MainAppRoutes: React.FC = () => {
  const { firebaseUser, isAuthLoading } = useGym();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center">
        <Activity className="w-10 h-10 text-[#27D980] animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      
      {/* ════════════════════════════════════════════════════════════════
          1. DEDICATED MOBILE APP ENTRY & LOGIN (OWNER, TRAINER, MEMBER)
      ════════════════════════════════════════════════════════════════ */}
      <Route path="/" element={<AppEntryRedirect />} />
      <Route path="/login" element={<AppLogin />} />
      <Route path="/app/login" element={<AppLogin />} />
      <Route path="/app" element={<AppEntryRedirect />} />
      <Route path="/subscription" element={firebaseUser ? <SubscriptionPage /> : <Navigate to="/app/login" />} />

      {/* ════════════════════════════════════════════════════════════════
          2. USER MEMBER APP (STRICT MEMBER ROLE)
      ════════════════════════════════════════════════════════════════ */}
      <Route path="/app/user" element={<AppUserRoute />}>
        <Route element={<UserAppLayout />}>
          <Route path="dashboard" element={<UserAppDashboard />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>

      {/* ════════════════════════════════════════════════════════════════
          3. TRAINER APP (STRICT TRAINER ROLE)
      ════════════════════════════════════════════════════════════════ */}
      <Route path="/app/trainer" element={<AppTrainerRoute />}>
        <Route element={<TrainerAppLayout />}>
          <Route path="dashboard" element={<TrainerAppDashboard />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>

      {/* ════════════════════════════════════════════════════════════════
          4. OWNER / ADMIN PORTAL (STRICT ADMIN & OWNER ROLES)
      ════════════════════════════════════════════════════════════════ */}
      <Route path="/app/admin" element={<AppAdminRoute />}>
        <Route element={<AdminAppLayout />}>
          <Route path="dashboard" element={<AdminAppDashboard erpContent={<ERpLayout />} />} />
          <Route path="terminal" element={
            <Suspense fallback={<TabLoadingFallback />}>
              <SmartDoorSimulator />
            </Suspense>
          } />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
      <Route path="/app/owner/*" element={<Navigate to="/app/admin/dashboard" replace />} />
      <Route path="/admin" element={<Navigate to="/app/admin/dashboard" replace />} />
      <Route path="/admin/*" element={<Navigate to="/app/admin/dashboard" replace />} />
      <Route path="/dashboard" element={<Navigate to="/app/user/dashboard" replace />} />

      {/* ════════════════════════════════════════════════════════════════
          5. PUBLIC WEBSITE EXPERIENCE (SEPARATE /website PREFIX)
      ════════════════════════════════════════════════════════════════ */}
      <Route path="/website" element={<WebsiteLayout />}>
        <Route index element={<WebsiteHomePage />} />
        <Route path="plans" element={<WebsitePlansPage />} />
        <Route path="schedule" element={<WebsiteSchedulePage />} />
        <Route path="facilities" element={<WebsiteFacilitiesPage />} />
        <Route path="login" element={<WebsiteLogin />} />

        {/* Website Customer Area */}
        <Route element={<WebsiteCustomerRoute />}>
          <Route path="account" element={<WebsiteCustomerDashboard />} />
        </Route>
      </Route>

      {/* Catch-all fallback directly to App Entry */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export function App() {
  return (
    <GymProvider>
      <BrowserRouter>
        <MainAppRoutes />
      </BrowserRouter>
    </GymProvider>
  );
}

export default App;
