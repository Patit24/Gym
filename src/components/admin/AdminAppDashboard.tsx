import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { AdminMobileAppSimulator } from '../mobile/AdminMobileAppSimulator';
import { 
  Smartphone, 
  Layers, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';

interface AdminAppDashboardProps {
  erpContent: React.ReactNode;
}

export const AdminAppDashboard: React.FC<AdminAppDashboardProps> = ({ erpContent }) => {
  const { currentRole, selectedBranchId, branches } = useGym();
  // Default to Mobile Phone Frame Simulator just like User App!
  const [viewMode, setViewMode] = useState<'mobile' | 'web'>('mobile');

  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner: Admin Welcome & View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#101422] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4F7CFF] to-[#27D980] p-[2px] shadow-lg shadow-gym-accentGlow">
            <div className="w-full h-full bg-[#0B0D12] rounded-[14px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#4F7CFF]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">Admin Management Portal</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30 text-[10px] font-black uppercase">
                {currentRole}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Active Facility: <strong className="text-slate-200">{currentBranch?.name}</strong> ({currentBranch?.city})
            </p>
          </div>
        </div>

        {/* Mode Selector Toggle: Mobile Phone Frame vs Responsive Widescreen */}
        <div className="flex items-center bg-[#07090E] p-1 rounded-2xl border border-white/10 text-xs font-bold self-end sm:self-auto">
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'mobile'
                ? 'bg-[#4F7CFF] text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App UI</span>
          </button>
          <button
            onClick={() => setViewMode('web')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'web'
                ? 'bg-[#27D980] text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Widescreen ERP</span>
          </button>
        </div>
      </div>

      {/* ── 1. MOBILE PHONE APP SIMULATOR VIEW (DEFAULT) ── */}
      {viewMode === 'mobile' && (
        <div className="flex justify-center py-2">
          <AdminMobileAppSimulator />
        </div>
      )}

      {/* ── 2. WIDESCREEN ERP VIEW ── */}
      {viewMode === 'web' && (
        <div className="animate-in fade-in duration-300">
          {erpContent}
        </div>
      )}

    </div>
  );
};
