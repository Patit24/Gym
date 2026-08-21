import React from 'react';
import { Outlet } from 'react-router-dom';

export const UserAppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-[#27D980] selection:text-black">
      <Outlet />
    </div>
  );
};
