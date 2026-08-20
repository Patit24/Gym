import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useGym } from '../../context/GymContext';
import { Activity } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { firebaseUser, isAuthLoading, appUserAccount, subscriptionStatus } = useGym();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <Activity className="w-8 h-8 text-[#27D980] animate-spin" />
      </div>
    );
  }

  // Not logged in -> go to login
  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  // AppUser record not found yet in Firebase -> wait or deny
  if (!appUserAccount) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <Activity className="w-8 h-8 text-[#27D980] animate-spin" />
      </div>
    );
  }

  // If user is a regular member with no active subscription -> go to subscription page
  const isStaffOrAdmin = appUserAccount.role !== 'Member';
  if (!isStaffOrAdmin && subscriptionStatus !== 'active') {
    return <Navigate to="/subscription" replace />;
  }

  // Authenticated (or Admin/Staff) -> render child routes
  return <Outlet />;
};
