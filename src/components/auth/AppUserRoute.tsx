import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useGym } from '../../context/GymContext';
import { Activity } from 'lucide-react';

export const AppUserRoute: React.FC = () => {
  const { firebaseUser, isAuthLoading, appUserAccount, subscriptionStatus } = useGym();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <Activity className="w-8 h-8 text-[#27D980] animate-spin" />
      </div>
    );
  }

  // Not logged in -> go to App Login
  if (!firebaseUser && !appUserAccount) {
    return <Navigate to="/app/login" replace />;
  }

  // AppUser record not resolved yet
  if (!appUserAccount) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <Activity className="w-8 h-8 text-[#27D980] animate-spin" />
      </div>
    );
  }

  // Strict Role Check: If user is Trainer or Dietitian, redirect to Trainer Dashboard
  if (appUserAccount.role === 'Trainer' || appUserAccount.role === 'Dietitian') {
    return <Navigate to="/app/trainer/dashboard" replace />;
  }

  // If user is actually an Admin trying to visit user routes, let them proceed or redirect to admin dashboard
  return <Outlet />;
};
