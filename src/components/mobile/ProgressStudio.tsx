import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { MemberProfileEditor } from './MemberProfileEditor';
import { Activity, TrendingDown, Award, Sparkles, Scale, Ruler, HeartPulse, User, Edit3 } from 'lucide-react';

export const ProgressStudio: React.FC = () => {
  const { activeMember, progress } = useGym();
  const [showEditor, setShowEditor] = useState(false);

  const startWeight = activeMember?.startWeightKg || activeMember?.weightKg || 0;
  const currentWeight = activeMember?.weightKg || 0;
  const totalDifference = (currentWeight - startWeight).toFixed(1);

  if (showEditor) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setShowEditor(false)}
          className="text-xs font-bold text-[#27D980] hover:underline flex items-center gap-1 mb-2"
        >
          ← Back to Progress View
        </button>
        <MemberProfileEditor />
      </div>
    );
  }

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300 text-xs">
      
      {/* Weight Transformation Header */}
      <div className="glass-card rounded-[24px] p-4 border border-purple-500/30 bg-gradient-to-br from-[#1E1138] via-[#130B24] to-[#0B0614] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Body Transformation
            </span>
            <h2 className="text-sm font-black text-white mt-0.5">{activeMember?.name || 'Member'}'s Progress</h2>
          </div>

          <button
            onClick={() => setShowEditor(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#27D980] text-black font-black text-[10px] flex items-center gap-1 shadow-md active:scale-95 transition-all"
          >
            <Edit3 className="w-3 h-3" />
            <span>Update Metrics</span>
          </button>
        </div>

        {/* Current Weight & BMI Display */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-[#070A10] border border-white/10 space-y-0.5">
            <span className="text-[9px] text-gym-subtext uppercase font-bold">Current Weight</span>
            <strong className="text-white text-sm font-black block">{currentWeight > 0 ? `${currentWeight} kg` : 'Not Set'}</strong>
            <span className="text-[9px] text-emerald-400 font-bold">Start: {startWeight > 0 ? `${startWeight} kg` : '—'}</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#070A10] border border-white/10 space-y-0.5">
            <span className="text-[9px] text-gym-subtext uppercase font-bold">Current BMI</span>
            <strong className="text-cyan-400 text-sm font-black block">{activeMember?.bmi > 0 ? activeMember.bmi : '—'}</strong>
            <span className="text-[9px] text-gym-subtext">{activeMember?.bmi > 0 ? 'Recorded' : 'Update in Profile'}</span>
          </div>
        </div>
      </div>

      {/* Body Measurements Grid */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-extrabold text-white uppercase tracking-wider flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5 text-cyan-400" />
            <span>Body Measurements (cm)</span>
          </h4>
          <button
            onClick={() => setShowEditor(true)}
            className="text-[10px] font-bold text-[#4F7CFF] hover:underline"
          >
            Edit Measurements →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-[#0F1420] border border-white/10 space-y-0.5">
            <span className="text-[9px] text-gym-subtext uppercase font-bold">Chest</span>
            <strong className="text-white text-xs font-bold block">
              {activeMember?.chestCm ? `${activeMember.chestCm} cm` : '—'}
            </strong>
          </div>
          <div className="p-3 rounded-2xl bg-[#0F1420] border border-white/10 space-y-0.5">
            <span className="text-[9px] text-gym-subtext uppercase font-bold">Waist</span>
            <strong className="text-white text-xs font-bold block">
              {activeMember?.waistCm ? `${activeMember.waistCm} cm` : '— (Self Record)'}
            </strong>
          </div>
          <div className="p-3 rounded-2xl bg-[#0F1420] border border-white/10 space-y-0.5">
            <span className="text-[9px] text-gym-subtext uppercase font-bold">Arms / Biceps</span>
            <strong className="text-white text-xs font-bold block">
              {activeMember?.armsCm ? `${activeMember.armsCm} cm` : '— (Self Record)'}
            </strong>
          </div>
          <div className="p-3 rounded-2xl bg-[#0F1420] border border-white/10 space-y-0.5">
            <span className="text-[9px] text-gym-subtext uppercase font-bold">Thighs</span>
            <strong className="text-white text-xs font-bold block">
              {activeMember?.thighsCm ? `${activeMember.thighsCm} cm` : '— (Self Record)'}
            </strong>
          </div>
        </div>
      </div>

      {/* Weight History Chart */}
      {progress.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[#0F1420] border border-white/10 space-y-2">
          <h4 className="text-[11px] font-extrabold text-white">Weight Trend</h4>
          
          <div className="flex items-end justify-between h-24 pt-4 px-2">
            {progress.map((p) => (
              <div key={p.date} className="flex flex-col items-center gap-1 text-[9px] text-gym-subtext">
                <span className="text-white font-bold text-[9px]">{p.weightKg}</span>
                <div
                  className="w-5 rounded-t-lg bg-gradient-to-t from-cyan-500 to-emerald-400 transition-all"
                  style={{ height: `${Math.min(100, (p.weightKg / 120) * 100)}%` }}
                />
                <span>{p.date.split('-')[1]}/{p.date.split('-')[2]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
