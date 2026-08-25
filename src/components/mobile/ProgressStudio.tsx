import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { MemberProfileEditor } from './MemberProfileEditor';
import {
  Activity,
  Award,
  Sparkles,
  Scale,
  Ruler,
  HeartPulse,
  Edit3,
  Plus,
  Camera,
  MessageSquare,
  Trophy,
  Flame
} from 'lucide-react';

export const ProgressStudio: React.FC = () => {
  const { activeMember, progress, addProgressMetric } = useGym();
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'measurements' | 'photos' | 'remarks'>('overview');

  // Log Check-In Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [logWeight, setLogWeight] = useState<number>(activeMember?.weightKg || 70);
  const [logChest, setLogChest] = useState<number>(activeMember?.chestCm || 95);
  const [logWaist, setLogWaist] = useState<number>(activeMember?.waistCm || 82);
  const [logArms, setLogArms] = useState<number>(activeMember?.armsCm || 36);
  const [logForearms, setLogForearms] = useState<number>(activeMember?.forearmsCm || 30);
  const [logHips, setLogHips] = useState<number>(activeMember?.hipsCm || 96);
  const [logThighs, setLogThighs] = useState<number>(activeMember?.thighsCm || 56);
  const [logCalves, setLogCalves] = useState<number>(activeMember?.calvesCm || 38);
  const [logShoulders, setLogShoulders] = useState<number>(activeMember?.shouldersCm || 118);
  const [logNeck, setLogNeck] = useState<number>(activeMember?.neckCm || 39);
  const [logBeforePhoto, setLogBeforePhoto] = useState('');
  const [logAfterPhoto, setLogAfterPhoto] = useState('');
  const [logRemarks, setLogRemarks] = useState('');

  const startWeight = activeMember?.startWeightKg || activeMember?.weightKg || 70;
  const currentWeight = activeMember?.weightKg || 70;
  const goalWeight = activeMember?.goalWeightKg || 68;
  const heightM = Math.max(1, activeMember?.heightCm || 170) / 100;
  const bmi = Number((currentWeight / (heightM * heightM)).toFixed(1));

  // Weight change
  const weightDiff = (currentWeight - startWeight).toFixed(1);
  const isLoss = Number(weightDiff) < 0;

  // BMI Category
  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (val < 25) return { label: 'Normal Weight (Optimal)', color: 'text-[#27D980] bg-[#27D980]/10 border-[#27D980]/30' };
    if (val < 30) return { label: 'Overweight', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Obese', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const bmiCat = getBmiCategory(bmi);

  const handleSaveCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMember?.id || logWeight <= 0) return;

    const logHeightM = Math.max(1, activeMember.heightCm || 170) / 100;
    const computedBmi = Number((logWeight / (logHeightM * logHeightM)).toFixed(1));

    await addProgressMetric({
      memberId: activeMember.id,
      date: new Date().toISOString().split('T')[0],
      weightKg: logWeight,
      bmi: computedBmi,
      chestCm: logChest,
      waistCm: logWaist,
      armsCm: logArms,
      forearmsCm: logForearms,
      hipsCm: logHips,
      thighsCm: logThighs,
      calvesCm: logCalves,
      shouldersCm: logShoulders,
      neckCm: logNeck,
      photoBeforeUrl: logBeforePhoto.trim(),
      photoAfterUrl: logAfterPhoto.trim(),
      trainerRemarks: logRemarks.trim(),
    });

    setShowLogModal(false);
  };

  if (showEditor) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setShowEditor(false)}
          className="text-xs font-bold text-[#27D980] hover:underline flex items-center gap-1 mb-2 cursor-pointer"
        >
          ← Back to Progress Dashboard
        </button>
        <MemberProfileEditor />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300 text-xs">
      
      {/* Transformation Hero Card */}
      <div className="glass-card rounded-3xl p-5 border border-purple-500/30 bg-gradient-to-br from-[#1E1138] via-[#130B24] to-[#0B0614] space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Body Transformation Studio
            </span>
            <h2 className="text-base font-black text-white mt-0.5">{activeMember?.name || 'Member'}'s Fitness Journey</h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowLogModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#27D980] hover:bg-[#20BE6F] text-black font-black text-[11px] flex items-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Metric</span>
            </button>
            <button
              onClick={() => setShowEditor(true)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
              title="Edit Profile"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3-Point Metric Stat Tiles */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-[#070A10]/90 border border-white/10 space-y-0.5">
            <span className="text-[9px] text-slate-400 uppercase font-bold">Start Weight</span>
            <strong className="text-slate-300 text-xs font-black block">{startWeight > 0 ? `${startWeight} kg` : '—'}</strong>
            <span className="text-[9px] text-slate-500">Day 1</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#070A10]/90 border border-emerald-500/30 space-y-0.5">
            <span className="text-[9px] text-emerald-400 uppercase font-black">Current Weight</span>
            <strong className="text-white text-sm font-black block">{currentWeight} kg</strong>
            <span className={`text-[9px] font-black ${isLoss ? 'text-emerald-400' : 'text-amber-400'}`}>
              {Number(weightDiff) >= 0 ? `+${weightDiff}` : weightDiff} kg
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#070A10]/90 border border-purple-500/30 space-y-0.5">
            <span className="text-[9px] text-purple-400 uppercase font-bold">Goal Target</span>
            <strong className="text-[#27D980] text-xs font-black block">{goalWeight > 0 ? `${goalWeight} kg` : '—'}</strong>
            <span className="text-[9px] text-purple-300 font-bold">
              {goalWeight > 0 ? `${Math.abs(currentWeight - goalWeight).toFixed(1)} kg to go` : 'Set Goal'}
            </span>
          </div>
        </div>

        {/* BMI Banner */}
        <div className="p-3 rounded-2xl bg-[#070A10]/80 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Body Mass Index (BMI)</span>
              <strong className="text-white text-xs font-black">{bmi > 0 ? bmi : '—'} kg/m²</strong>
            </div>
          </div>
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${bmiCat.color}`}>
            {bmiCat.label}
          </span>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-gym-border/40 pb-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview & Trends', icon: Activity },
          { id: 'measurements', label: '8-Point Tape Log', icon: Ruler },
          { id: 'photos', label: 'Progress Photos', icon: Camera },
          { id: 'remarks', label: `Trainer Remarks (${progress.filter(p => p.trainerRemarks).length})`, icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#4F7CFF] text-white shadow-md shadow-[#4F7CFF]/20 font-black'
                  : 'bg-[#101422] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & TRENDS */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Weight History Bar Chart */}
          <div className="p-4 rounded-3xl bg-[#101422] border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#27D980]" />
                <span>Weight Timeline (Last {progress.length} Check-ins)</span>
              </h4>
              <button
                onClick={() => setShowLogModal(true)}
                className="text-[10px] font-bold text-[#27D980] hover:underline cursor-pointer"
              >
                + Record Entry
              </button>
            </div>

            {progress.length === 0 ? (
              <div className="p-6 text-center text-slate-400 font-bold">
                No weigh-in logs yet. Click "+ Record Entry" above to log your first milestone!
              </div>
            ) : (
              <div className="flex items-end justify-between h-28 pt-4 px-2">
                {progress.map((p) => (
                  <div key={p.id} className="flex flex-col items-center gap-1 text-[9px] text-slate-400 flex-1">
                    <span className="text-white font-black text-[10px]">{p.weightKg}kg</span>
                    <div
                      className="w-6 rounded-t-lg bg-gradient-to-t from-[#4F7CFF] to-[#27D980] transition-all shadow-md"
                      style={{ height: `${Math.max(15, Math.min(100, (p.weightKg / 120) * 100))}%` }}
                    />
                    <span className="text-[8px] font-bold">{p.date.split('-')[1]}/{p.date.split('-')[2]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Body Stats Grid */}
          <div className="p-4 rounded-3xl bg-[#101422] border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-[#4F7CFF]" />
                <span>Current Body Proportions</span>
              </h4>
              <button
                onClick={() => setShowEditor(true)}
                className="text-[10px] font-bold text-[#4F7CFF] hover:underline cursor-pointer"
              >
                Edit Values →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: 'Chest', val: activeMember?.chestCm },
                { label: 'Waist', val: activeMember?.waistCm },
                { label: 'Arms', val: activeMember?.armsCm },
                { label: 'Forearms', val: activeMember?.forearmsCm },
                { label: 'Hips', val: activeMember?.hipsCm },
                { label: 'Thighs', val: activeMember?.thighsCm },
                { label: 'Calves', val: activeMember?.calvesCm },
                { label: 'Shoulders', val: activeMember?.shouldersCm },
              ].map((item) => (
                <div key={item.label} className="p-2.5 rounded-2xl bg-[#0B0E17] border border-white/5 space-y-0.5 text-center">
                  <span className="text-[9px] text-slate-400 uppercase font-bold">{item.label}</span>
                  <strong className="text-white text-xs font-black block">
                    {item.val ? `${item.val} cm` : '—'}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 8-POINT TAPE LOG */}
      {activeTab === 'measurements' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-[#101422] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0E17] text-slate-400 uppercase font-black text-[9px] border-b border-white/10">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Chest</th>
                    <th className="p-3">Waist</th>
                    <th className="p-3">Arms</th>
                    <th className="p-3">Hips</th>
                    <th className="p-3">Thighs</th>
                    <th className="p-3">Calves</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {progress.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                        No measurement logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    progress.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors text-[11px]">
                        <td className="p-3 font-bold text-[#4F7CFF]">{p.date}</td>
                        <td className="p-3 font-black text-white">{p.weightKg} kg</td>
                        <td className="p-3 text-slate-300">{p.chestCm ? `${p.chestCm} cm` : '—'}</td>
                        <td className="p-3 text-slate-300">{p.waistCm ? `${p.waistCm} cm` : '—'}</td>
                        <td className="p-3 text-slate-300">{p.armsCm ? `${p.armsCm} cm` : '—'}</td>
                        <td className="p-3 text-slate-300">{p.hipsCm ? `${p.hipsCm} cm` : '—'}</td>
                        <td className="p-3 text-slate-300">{p.thighsCm ? `${p.thighsCm} cm` : '—'}</td>
                        <td className="p-3 text-slate-300">{p.calvesCm ? `${p.calvesCm} cm` : '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROGRESS PHOTOS */}
      {activeTab === 'photos' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-purple-400" />
              <span>Before & After Transformation Gallery</span>
            </h4>
            <button
              onClick={() => setShowLogModal(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-black flex items-center gap-1 shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Photo Check-in</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-3xl bg-[#101422] border border-white/10 space-y-2 text-center">
              <span className="text-[10px] uppercase font-black text-slate-400">Day 1 / Baseline</span>
              <div className="h-44 rounded-2xl bg-[#0B0E17] border border-dashed border-white/15 flex flex-col items-center justify-center p-3 text-slate-400 space-y-1">
                <Camera className="w-8 h-8 text-slate-500" />
                <span className="text-[10px] font-bold">Initial Photo Check-in</span>
                <span className="text-[9px] text-slate-500">{startWeight} kg Baseline</span>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-[#101422] border border-purple-500/30 space-y-2 text-center shadow-lg shadow-purple-500/5">
              <span className="text-[10px] uppercase font-black text-[#27D980]">Current Transformation</span>
              <div className="h-44 rounded-2xl bg-[#0B0E17] border border-dashed border-[#27D980]/30 flex flex-col items-center justify-center p-3 text-slate-400 space-y-1">
                <Flame className="w-8 h-8 text-[#27D980]" />
                <span className="text-[10px] font-bold text-white">Latest Physique Update</span>
                <span className="text-[9px] text-[#27D980] font-bold">{currentWeight} kg Today</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TRAINER REMARKS */}
      {activeTab === 'remarks' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Trainer Assessments & Coaching Feedback</span>
            </h4>
          </div>

          <div className="space-y-2.5">
            {progress.filter((p) => p.trainerRemarks).length === 0 ? (
              <div className="p-6 rounded-3xl bg-[#101422] border border-white/10 text-center text-slate-400 font-bold space-y-2">
                <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
                <p>No coach remarks recorded yet. Log a check-in to get coach feedback!</p>
              </div>
            ) : (
              progress.filter((p) => p.trainerRemarks).map((p) => (
                <div key={p.id} className="p-4 rounded-3xl bg-[#101422] border border-white/10 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-xs">
                        PT
                      </div>
                      <div>
                        <strong className="text-white text-xs font-bold block">Assigned Coach Assessment</strong>
                        <span className="text-[9px] text-slate-400">{p.date} • {p.weightKg} kg Check-in</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#0B0E17] p-3 rounded-2xl border border-white/5">
                    "{p.trainerRemarks}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: LOG CHECK-IN */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101422] border border-white/15 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white">Log Progress Check-in</h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCheckIn} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Current Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={logWeight || ''}
                    onChange={(e) => setLogWeight(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 focus:border-[#27D980] rounded-xl px-3 py-2 text-[#27D980] font-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    value={logWaist || ''}
                    onChange={(e) => setLogWaist(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    value={logChest || ''}
                    onChange={(e) => setLogChest(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Arms / Biceps (cm)</label>
                  <input
                    type="number"
                    value={logArms || ''}
                    onChange={(e) => setLogArms(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Thighs (cm)</label>
                  <input
                    type="number"
                    value={logThighs || ''}
                    onChange={(e) => setLogThighs(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Hips (cm)</label>
                  <input
                    type="number"
                    value={logHips || ''}
                    onChange={(e) => setLogHips(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Coach / Trainer Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Excellent shoulder definition and waist reduction this week!"
                  value={logRemarks}
                  onChange={(e) => setLogRemarks(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#27D980] hover:bg-[#20BE6F] active:scale-95 text-black font-black text-xs shadow-xl cursor-pointer transition-all"
              >
                Save Milestone Check-in 🚀
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
