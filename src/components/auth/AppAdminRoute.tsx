import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useGym } from '../../context/GymContext';
import { Activity } from 'lucide-react';

export const AppAdminRoute: React.FC = () => {
  const { firebaseUser, isAuthLoading, appUserAccount } = useGym();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <Activity className="w-8 h-8 text-[#4F7CFF] animate-spin" />
      </div>
    );
  }

  // Not logged in -> redirect to App Login
  if (!firebaseUser) {
    return <Navigate to="/app/login" replace />;
  }

  // Wait for account resolution
  if (!appUserAccount) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <Activity className="w-8 h-8 text-[#4F7CFF] animate-spin" />
      </div>
    );
  }

  // STRICT SERVER/ROLE CHECK: Normal gym members are forbidden from accessing /app/admin/*
  if (appUserAccount.role === 'Member') {
    return <Navigate to="/app/user/dashboard" replace />;
  }

  // Trainers are strictly restricted to Trainer App
  if (appUserAccount.role === 'Trainer' || appUserAccount.role === 'Dietitian') {
    return <Navigate to="/app/trainer/dashboard" replace />;
  }

  return <Outlet />;
};
