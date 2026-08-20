import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useGym } from '../../context/GymContext';
import { Activity } from 'lucide-react';

export const AdminRoute: React.FC = () => {
  const { firebaseUser, isAuthLoading, appUserAccount } = useGym();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <Activity className="w-8 h-8 text-[#4F7CFF] animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (!appUserAccount) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <Activity className="w-8 h-8 text-[#4F7CFF] animate-spin" />
      </div>
    );
  }

  // Strictly enforce Staff/Admin roles for /admin routes
  const isMember = appUserAccount.role === 'Member';

  if (isMember) {
    // If a customer/member attempts to visit /admin/* routes, reject access and redirect to /dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
