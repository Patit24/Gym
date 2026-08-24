import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Building2, TrendingUp, DollarSign, Users, Award, ShieldCheck, ArrowUpRight, Plus, CheckCircle2, X } from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { branches, members, employees, transactions, addBranch, selectedBranchId, setSelectedBranchId } = useGym();

  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [brName, setBrName] = useState('');
  const [brCode, setBrCode] = useState('');
  const [brCity, setBrCity] = useState('');
  const [brAddress, setBrAddress] = useState('');
  const [brPhone, setBrPhone] = useState('+91 98765 00000');
  const [brCapacity, setBrCapacity] = useState(150);
  const [brManager, setBrManager] = useState('');
  const [isSubmittingBranch, setIsSubmittingBranch] = useState(false);

  const totalRevenueAllBranches = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalActiveMembers = members.filter((m) => m.status === 'Active').length;

  const handleAddBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brName.trim() || !brCode.trim()) return;
    setIsSubmittingBranch(true);

    try {
      const newB = await addBranch({
        name: brName.trim(),
        code: brCode.trim().toUpperCase(),
        city: brCity.trim() || 'Smart City',
        address: brAddress.trim() || 'Central Avenue',
        phone: brPhone.trim() || '+91 98765 00000',
        capacity: brCapacity || 150,
        manager: brManager.trim() || 'General Manager',
      });
      setSelectedBranchId(newB.id);
      setBrName('');
      setBrCode('');
      setBrCity('');
      setBrAddress('');
      setBrManager('');
      setShowAddBranchModal(false);
    } finally {
      setIsSubmittingBranch(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Franchise Owner Banner */}
      <div className="relative rounded-3xl p-6 lg:p-8 bg-gradient-to-r from-[#14171F] via-[#1E2330] to-[#14171F] border border-gym-border overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30">
              Franchise Owner Executive Suite
            </span>
            <h1 className="text-2xl font-extrabold text-white">
              Franchise Control Room & Multi-Branch Network
            </h1>
            <p className="text-xs text-gym-subtext">
              High-level executive metrics across all {branches.length} gym branches, trainer performance, and franchise profitability.
            </p>
          </div>

          <button
            onClick={() => setShowAddBranchModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F7CFF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-[#4F7CFF]/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Branch</span>
          </button>
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
          <span className="text-xs text-gym-subtext mt-1 block">Across {branches.length} Franchise Locations</span>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-gym-border">
          <span className="text-xs text-gym-subtext font-semibold uppercase">Operating Profit Margin</span>
          <div className="text-3xl font-black text-[#4F7CFF] mt-2">42.8%</div>
          <span className="text-xs text-[#4F7CFF] font-medium mt-1 block">Net Profit: ₹19.2 Lakhs</span>
        </div>
      </div>

      {/* Branch Performance Comparison */}
      <div className="glass-panel rounded-3xl p-6 space-y-4 border border-gym-border">
        <div className="flex items-center justify-between pb-3 border-b border-gym-border">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#4F7CFF]" />
            Multi-Branch Locations & Operational Performance
          </h3>
          <span className="text-xs text-gym-subtext">{branches.length} Active Gym Branches</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branches.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBranchId(b.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                selectedBranchId === b.id
                  ? 'bg-[#1E2330] border-[#4F7CFF] shadow-lg shadow-[#4F7CFF]/15 ring-1 ring-[#4F7CFF]'
                  : 'bg-[#14171F] border-gym-border/80 hover:border-slate-500'
              }`}
            >
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

              {selectedBranchId === b.id && (
                <div className="text-[10px] font-bold text-[#4F7CFF] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selected Active Branch
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Branch Modal */}
      {showAddBranchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101422] border border-white/15 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#4F7CFF]" />
                <span>Add New Gym Branch</span>
              </h3>
              <button
                onClick={() => setShowAddBranchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBranchSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Branch Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kolkata South Flagship"
                  value={brName}
                  onChange={(e) => setBrName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Branch Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KS"
                    value={brCode}
                    onChange={(e) => setBrCode(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kolkata"
                    value={brCity}
                    onChange={(e) => setBrCity(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="14 Park Street"
                  value={brAddress}
                  onChange={(e) => setBrAddress(e.target.value)}
                  className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Manager Name
                  </label>
                  <input
                    type="text"
                    placeholder="Rohit Deshmukh"
                    value={brManager}
                    onChange={(e) => setBrManager(e.target.value)}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={brCapacity}
                    onChange={(e) => setBrCapacity(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBranch}
                  className="flex-1 py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-[#3D69EB] text-white font-black text-xs flex items-center justify-center gap-1 shadow-lg shadow-[#4F7CFF]/20"
                >
                  <span>{isSubmittingBranch ? 'Creating...' : 'Create Branch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
