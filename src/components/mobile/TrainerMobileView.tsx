import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { QuickDailyPlanner } from '../planner/QuickDailyPlanner';
import { Dumbbell, Users, Plus, X, ChevronRight, User, Zap } from 'lucide-react';

export const TrainerMobileView: React.FC = () => {
  const { employees, members, setActiveMemberId, setPerspective } = useGym();
  
  const currentTrainer = employees.find((e) => e.role === 'Trainer') || employees[0];
  const assignedMembers = members.filter((m) => m.assignedTrainerId === currentTrainer.id) || members;

  const [showQuickModal, setShowQuickModal] = useState(false);

  const handlePreviewMemberApp = (memberId: string) => {
    setActiveMemberId(memberId);
    setPerspective('mobile');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 text-xs">
      
      {/* Trainer Badge Banner */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-[#4F7CFF]/20 to-purple-600/20 border border-[#4F7CFF]/40 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#4F7CFF] uppercase">Trainer Workspace</span>
          <h3 className="text-xs font-extrabold text-white">{currentTrainer.name}</h3>
          <span className="text-[10px] text-gym-subtext">{assignedMembers.length} Active PT Clients</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-[#27D980]">{currentTrainer.ptSessionsCompleted}</span>
          <div className="text-[9px] text-gym-subtext">Sessions Logged</div>
        </div>
      </div>

      {/* Quick Action Button: 1-Click Easy Daily Plan Assign */}
      <button
        onClick={() => setShowQuickModal(true)}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#4F7CFF] via-[#27D980] to-emerald-400 text-gym-dark font-black text-xs shadow-lg shadow-[#27D980]/20 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
      >
        <Zap className="w-4 h-4 text-gym-dark" />
        <span>⚡ 1-Click Easy Daily Workout & Diet Assign</span>
      </button>

      {/* Modal: Quick 1-Page Daily Plan Creator */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#14171F] border border-gym-border rounded-3xl max-w-lg w-full p-4 shadow-2xl space-y-3 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gym-border pb-2 sticky top-0 bg-[#14171F] z-10">
              <h4 className="font-extrabold text-white text-xs flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#27D980]" />
                Easy Daily Plan Assign
              </h4>
              <button onClick={() => setShowQuickModal(false)} className="text-gym-subtext"><X className="w-4 h-4" /></button>
            </div>

            <QuickDailyPlanner />
          </div>
        </div>
      )}

      {/* Client List Section */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold text-white flex items-center justify-between border-b border-gym-border/60 pb-1">
          <span>Assigned Clients</span>
          <span className="text-gym-subtext text-[10px]">{assignedMembers.length} Members</span>
        </h4>

        {assignedMembers.map((mem) => (
          <div
            key={mem.id}
            className="p-3 rounded-2xl bg-[#14171F] border border-gym-border hover:border-[#4F7CFF]/50 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={mem.photoUrl} alt={mem.name} className="w-10 h-10 rounded-xl object-cover border border-[#4F7CFF]" />
                <div>
                  <h5 className="font-extrabold text-white text-xs">{mem.name}</h5>
                  <span className="text-[10px] text-[#27D980] font-semibold">{mem.goal} • {mem.weightKg}kg</span>
                </div>
              </div>

              <button
                onClick={() => handlePreviewMemberApp(mem.id)}
                className="px-2.5 py-1 rounded-xl bg-[#1E2330] hover:bg-[#272E40] text-[#4F7CFF] text-[10px] font-bold border border-gym-border"
              >
                View App →
              </button>
            </div>

            <div className="bg-[#0B0D12] p-2 rounded-xl border border-gym-border/40 text-[10px] flex items-center justify-between text-gym-subtext">
              <span>Active Plan: <strong className="text-white">Daily Split</strong></span>
              <span className="text-emerald-400 font-semibold">94% Compliance</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
