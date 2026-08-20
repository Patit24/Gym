import React from 'react';
import { useGym } from '../../context/GymContext';
import { Building2, TrendingUp, DollarSign, Users, Award, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { branches, members, employees, transactions } = useGym();

  const totalRevenueAllBranches = branches.reduce((acc, b) => acc + b.monthlyRevenue, 0);
  const totalActiveMembers = members.filter((m) => m.status === 'Active').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Franchise Owner Banner */}
      <div className="relative rounded-3xl p-6 lg:p-8 bg-gradient-to-r from-[#14171F] via-[#1E2330] to-[#14171F] border border-gym-border overflow-hidden">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30">
            Franchise Owner Executive Suite
          </span>
          <h1 className="text-2xl font-extrabold text-white">
            Franchise Control Room & Multi-Branch P&L
          </h1>
          <p className="text-xs text-gym-subtext">
            High-level executive metrics across all {branches.length} gym branches, trainer performance, and franchise profitability.
          </p>
        </div>
      </div>

      {/* Owner Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card rounded-3xl p-6 border border-gym-border">
          <span className="text-xs text-gym-subtext font-semibold uppercase">Total Chain Revenue (Aug 2026)</span>
          <div className="text-3xl font-black text-white mt-2">₹{totalRevenueAllBranches.toLocaleString('en-IN')}</div>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-4 h-4" /> +22.5% YoY Chain Growth
          </span>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-gym-border">
          <span className="text-xs text-gym-subtext font-semibold uppercase">Total Active Franchise Members</span>
          <div className="text-3xl font-black text-[#27D980] mt-2">{totalActiveMembers} Members</div>
          <span className="text-xs text-gym-subtext mt-1 block">Across Mumbai & Bengaluru Branches</span>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-gym-border">
          <span className="text-xs text-gym-subtext font-semibold uppercase">Operating Profit Margin</span>
          <div className="text-3xl font-black text-[#4F7CFF] mt-2">42.8%</div>
          <span className="text-xs text-[#4F7CFF] font-medium mt-1 block">Net Profit: ₹19.2 Lakhs</span>
        </div>
      </div>

      {/* Branch Performance Comparison */}
      <div className="glass-panel rounded-3xl p-6 space-y-4 border border-gym-border">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2 pb-3 border-b border-gym-border">
          <Building2 className="w-5 h-5 text-[#4F7CFF]" />
          Multi-Branch Revenue & Operational Performance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branches.map((b) => (
            <div key={b.id} className="p-4 rounded-2xl bg-[#14171F] border border-gym-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#4F7CFF] uppercase bg-[#0B0D12] px-2 py-0.5 rounded border border-gym-border">
                  {b.code}
                </span>
                <span className="text-xs text-[#27D980] font-bold">{b.activeMembers} Members</span>
              </div>

              <h4 className="text-sm font-extrabold text-white">{b.name}</h4>
              <p className="text-[11px] text-gym-subtext">{b.city} • Manager: {b.manager}</p>

              <div className="pt-2 border-t border-gym-border/40 flex justify-between text-xs">
                <span className="text-gym-subtext">Monthly Revenue:</span>
                <strong className="text-white">₹{b.monthlyRevenue.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
