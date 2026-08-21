import React from 'react';
import { Outlet } from 'react-router-dom';

export const AdminAppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-[#4F7CFF] selection:text-white">
      <Outlet />
    </div>
  );
};
