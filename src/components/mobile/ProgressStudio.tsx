import React from 'react';
import { useGym } from '../../context/GymContext';
import { Activity, TrendingDown, Award, Sparkles, Scale, Ruler, HeartPulse, User } from 'lucide-react';

export const ProgressStudio: React.FC = () => {
  const { activeMember, progress } = useGym();

  const startWeight = activeMember?.startWeightKg || 83.2;
  const currentWeight = activeMember?.weightKg || 78.5;
  const totalDifference = (currentWeight - startWeight).toFixed(1);

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300 text-xs">
      
      {/* Weight Transformation Header matching Reference Image */}
      <div className="glass-card rounded-[24px] p-4 border border-purple-500/30 bg-gradient-to-br from-[#1E1138] via-[#130B24] to-[#0B0614] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Body Transformation
            </span>
            <h2 className="text-sm font-black text-white mt-0.5">{activeMember?.name || 'Member'}'s Progress</h2>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-extrabold text-[11px] flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-purple-400" />
            <span>{totalDifference} kg</span>
          </div>
        </div>

        {/* Current Weight & BMI Display */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-[#070A10] border border-white/10 space-y-0.5">
            <span className="text-[9px] text-gym-subtext uppercase">Current Weight</span>
            <strong className="text-white text-sm font-extrabold block">{currentWeight} kg</strong>
            <span className="text-[9px] text-emerald-400 font-bold">Start: {startWeight} kg</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#070A10] border border-white/10 space-y-0.5">
            <span className="text-[9px] text-gym-subtext uppercase">Current BMI</span>
            <strong className="text-cyan-400 text-sm font-extrabold block">{activeMember?.bmi || 22.5}</strong>
            <span className="text-[9px] text-gym-subtext">Normal Range</span>
          </div>
        </div>
      </div>

      {/* Body Measurements Grid */}
      <div className="space-y-1.5">
        <h4 className="text-[11px] font-extrabold text-white uppercase tracking-wider flex items-center gap-1">
          <Ruler className="w-3.5 h-3.5 text-cyan-400" />
          Body Tape Measurements (cm)
        </h4>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-[#0F1420] border border-white/10 space-y-0.5">
            <span className="text-[9px] text-gym-subtext uppercase">Chest</span>
            <strong className="text-white text-xs font-bold block">{activeMember.chestCm || 102} cm</strong>
          </div>
          <div className="p-3 rounded-2xl bg-[#0F1420] border border-white/10 space-y-0.5">
            <span className="text-[9px] text-gym-subtext uppercase">Waist</span>
            <strong className="text-white text-xs font-bold block">{activeMember.waistCm || 82} cm</strong>
          </div>
          <div className="p-3 rounded-2xl bg-[#0F1420] border border-white/10 space-y-0.5">
            <span className="text-[9px] text-gym-subtext uppercase">Arms</span>
            <strong className="text-white text-xs font-bold block">{activeMember.armsCm || 39} cm</strong>
          </div>
          <div className="p-3 rounded-2xl bg-[#0F1420] border border-white/10 space-y-0.5">
            <span className="text-[9px] text-gym-subtext uppercase">Thighs</span>
            <strong className="text-white text-xs font-bold block">{activeMember.thighsCm || 58} cm</strong>
          </div>
        </div>
      </div>

      {/* 4-Month Weight History Chart */}
      <div className="p-3.5 rounded-2xl bg-[#0F1420] border border-white/10 space-y-2">
        <h4 className="text-[11px] font-extrabold text-white">4-Month Weight Trend</h4>
        
        <div className="flex items-end justify-between h-24 pt-4 px-2">
          {progress.map((p) => (
            <div key={p.date} className="flex flex-col items-center gap-1 text-[9px] text-gym-subtext">
              <span className="text-white font-bold text-[9px]">{p.weightKg}</span>
              <div
                className="w-5 rounded-t-lg bg-gradient-to-t from-cyan-500 to-emerald-400 transition-all"
                style={{ height: `${(p.weightKg / 90) * 100}%` }}
              />
              <span>{p.date.split('-')[1]}/{p.date.split('-')[2]}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
