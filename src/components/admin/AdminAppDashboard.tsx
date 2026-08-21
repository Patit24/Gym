import React from 'react';
import { MobileOwnerApp } from '../mobile-app/MobileOwnerApp';

interface AdminAppDashboardProps {
  erpContent?: React.ReactNode;
}

export const AdminAppDashboard: React.FC<AdminAppDashboardProps> = () => {
  return <MobileOwnerApp />;
};
