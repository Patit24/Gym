import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useGym } from '../../context/GymContext';
import { Activity } from 'lucide-react';

export const WebsiteCustomerRoute: React.FC = () => {
  const { websiteCustomer, isAuthLoading } = useGym();

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Activity className="w-8 h-8 text-[#27D980] animate-spin" />
      </div>
    );
  }

  // If not authenticated as a website customer -> redirect strictly to Website Login
  if (!websiteCustomer) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
