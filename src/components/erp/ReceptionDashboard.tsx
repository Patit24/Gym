import React from 'react';
import { useGym } from '../../context/GymContext';
import { QrCode, UserPlus, ShoppingBag, DollarSign, Clock, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReceptionDashboardProps {
  onOpenNewMemberModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const ReceptionDashboard: React.FC<ReceptionDashboardProps> = ({ onOpenNewMemberModal, onNavigateTab }) => {
  const { members, attendance, selectedBranchId, branches, transactions, setPerspective } = useGym();

  const currentBranch = (branches || []).find((b) => b?.id === selectedBranchId) || branches?.[0] || {
    id: 'branch-1',
    name: 'Main Club',
    code: 'HQ',
    city: 'Metro',
    activeMembers: 0,
    currentCheckIns: 0,
    monthlyRevenue: 0
  };
  const branchMembers = members.filter((m) => m.branchId === selectedBranchId);

  const pendingDuesMembers = branchMembers.filter((m) => m.pendingDues > 0 || m.status === 'Renewal Due');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Front Desk Hero Header */}
      <div className="relative rounded-3xl p-6 lg:p-8 bg-gradient-to-r from-[#14171F] via-[#1E2330] to-[#14171F] border border-gym-border overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Front Desk Reception Console
            </span>
            <h1 className="text-2xl font-extrabold text-white">
              Reception Desk - <span className="text-[#4F7CFF]">{currentBranch.name}</span>
            </h1>
            <p className="text-xs text-gym-subtext">
              Manage member admissions, check-in counter, walk-in inquiries, and POS sales.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenNewMemberModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F7CFF] to-[#27D980] text-gym-dark font-extrabold text-xs shadow-lg shadow-[#27D980]/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>New Admission</span>
            </button>
            <button
              onClick={() => setPerspective('hardware')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-gym-dark font-extrabold text-xs shadow-md shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Door Scanner Terminal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Front Desk KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-gym-border">
          <span className="text-[11px] font-semibold text-gym-subtext uppercase">Currently Inside Gym</span>
          <div className="text-2xl font-black text-white mt-1">{currentBranch.currentCheckIns} Members</div>
          <span className="text-[11px] text-[#27D980] font-medium">Smart Door Relay Active</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-gym-border">
          <span className="text-[11px] font-semibold text-gym-subtext uppercase">Pending Dues & Renewals</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{pendingDuesMembers.length} Members</div>
          <span className="text-[11px] text-amber-400 font-medium">Collect Fees at Desk</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-gym-border">
          <span className="text-[11px] font-semibold text-gym-subtext uppercase">Supplement POS Counter</span>
          <div className="text-2xl font-black text-[#4F7CFF] mt-1">Ready</div>
          <button onClick={() => onNavigateTab('pos')} className="text-[11px] text-[#4F7CFF] font-bold hover:underline">
            Open POS Billing →
          </button>
        </div>
      </div>

      {/* Pending Dues & Today's Check-ins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Fee Collector Desk */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gym-border">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Pending Fee & Renewal Collection Queue
            </h3>
            <span className="text-xs text-amber-400 font-bold">{pendingDuesMembers.length} Dues</span>
          </div>

          <div className="space-y-3">
            {pendingDuesMembers.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-[#14171F] border border-gym-border/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img src={m.photoUrl} alt={m.name} className="w-10 h-10 rounded-full object-cover border border-amber-500" />
                  <div>
                    <h4 className="font-bold text-white">{m.name}</h4>
                    <p className="text-[11px] text-gym-subtext">{m.planName} • Exp: {m.expiryDate}</p>
                    <span className="text-[11px] text-rose-400 font-semibold">Pending: ₹{m.pendingDues || 5000}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('pos')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gym-dark font-extrabold text-xs shadow-md"
                >
                  Collect Dues
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Front Desk Check-in Feed */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gym-border">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4F7CFF]" />
              Front Desk Check-in Activity Log
            </h3>
          </div>

          <div className="space-y-3">
            {attendance.map((att) => (
              <div key={att.id} className="p-3 rounded-2xl bg-[#14171F] border border-gym-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={att.memberPhoto} alt={att.memberName} className="w-9 h-9 rounded-full object-cover border border-[#4F7CFF]" />
                  <div>
                    <h4 className="font-bold text-white">{att.memberName}</h4>
                    <span className="text-[10px] text-gym-subtext">{att.verificationMethod} • {att.entryTime}</span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Inside Gym
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
