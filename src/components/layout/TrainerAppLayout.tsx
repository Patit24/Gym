import React from 'react';
import { Outlet } from 'react-router-dom';

export const TrainerAppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-ambient-mesh text-slate-100 selection:bg-[#00D4FF] selection:text-black">
      <Outlet />
    </div>
  );
};
