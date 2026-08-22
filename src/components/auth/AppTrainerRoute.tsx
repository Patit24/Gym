import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useGym } from '../../context/GymContext';
import { Activity } from 'lucide-react';

export const AppTrainerRoute: React.FC = () => {
  const { firebaseUser, isAuthLoading, appUserAccount } = useGym();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <Activity className="w-8 h-8 text-[#27D980] animate-spin" />
      </div>
    );
  }

  // Not logged in -> redirect to App Login
  if (!firebaseUser && !appUserAccount) {
    return <Navigate to="/app/login" replace />;
  }

  // Account not resolved yet
  if (!appUserAccount) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <Activity className="w-8 h-8 text-[#27D980] animate-spin" />
      </div>
    );
  }

  // STRICT ROLE CHECK:
  // If user is Member, boot to User App
  if (appUserAccount.role === 'Member') {
    return <Navigate to="/app/user/dashboard" replace />;
  }

  // Allow Trainer, Dietitian, Super Admin, Owner to view Trainer App
  return <Outlet />;
};
