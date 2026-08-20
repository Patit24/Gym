import React from 'react';
import { useGym } from '../../context/GymContext';
import { Lock, Wrench, ShieldCheck, AlertCircle } from 'lucide-react';

export const InventoryLockers: React.FC = () => {
  const { lockers, selectedBranchId } = useGym();

  const branchLockers = lockers.filter((l) => l.branchId === selectedBranchId);

  const equipmentList = [
    { id: 'eq-1', name: 'Hammer Strength Iso-Lateral Chest Press', category: 'Machines', status: 'Operational', lastService: '2026-07-15', nextAMC: '2026-10-15' },
    { id: 'eq-2', name: 'Life Fitness Platinum Treadmill #4', category: 'Cardio', status: 'Needs Cable Inspection', lastService: '2026-06-01', nextAMC: '2026-08-20' },
    { id: 'eq-3', name: 'Eleiko Olympic Power Rack & Barbell', category: 'Free Weights', status: 'Operational', lastService: '2026-08-01', nextAMC: '2026-12-01' },
    { id: 'eq-4', name: 'Rogue Rubber Dumbbell Set (5kg - 50kg)', category: 'Accessories', status: 'Operational', lastService: '2026-07-20', nextAMC: '2026-11-20' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Locker Management Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Lock className="w-6 h-6 text-[#4F7CFF]" />
              Smart Locker Allocations ({branchLockers.length} Lockers)
            </h2>
            <p className="text-xs text-gym-subtext">Real-time locker occupancy map, deposit records, and assignment status</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {branchLockers.map((locker) => (
            <div
              key={locker.id}
              className={`p-4 rounded-2xl border text-center transition-all ${
                locker.status === 'Occupied'
                  ? 'bg-[#14171F] border-[#4F7CFF]/50 shadow-md shadow-[#4F7CFF]/10'
                  : locker.status === 'Available'
                  ? 'bg-[#0B0D12] border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              <div className="text-sm font-extrabold text-white">{locker.lockerNumber}</div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                locker.status === 'Occupied' ? 'bg-[#4F7CFF]/20 text-[#4F7CFF]' : 'bg-emerald-500/15 text-emerald-400'
              }`}>
                {locker.status}
              </span>

              {locker.assignedMemberName && (
                <div className="mt-2 text-[11px] text-slate-300 font-medium line-clamp-1">
                  {locker.assignedMemberName}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Maintenance */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            Equipment Inventory & AMC Maintenance Log
          </h3>
        </div>

        <div className="glass-panel rounded-3xl p-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gym-subtext uppercase border-b border-gym-border pb-3">
                <th className="pb-3">Machine / Equipment</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Last Service</th>
                <th className="pb-3">Next AMC Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-border/40 text-slate-200">
              {equipmentList.map((eq) => (
                <tr key={eq.id} className="hover:bg-[#14171F]/60 transition-colors">
                  <td className="py-3.5 font-bold text-white">{eq.name}</td>
                  <td className="py-3.5 text-gym-subtext">{eq.category}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                      eq.status === 'Operational' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {eq.status}
                    </span>
                  </td>
                  <td className="py-3.5">{eq.lastService}</td>
                  <td className="py-3.5 text-[#4F7CFF] font-semibold">{eq.nextAMC}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
