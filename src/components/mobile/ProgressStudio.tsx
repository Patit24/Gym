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
  Flame,
  TrendingDown,
  TrendingUp,
  Shield,
  Smile,
  Moon,
  BatteryCharging,
  Zap,
  Info
} from 'lucide-react';

export const ProgressStudio: React.FC = () => {
  const { activeMember, progress, addProgressMetric, wellnessCheckins, addWellnessCheckin } = useGym();
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'measurements' | 'photos' | 'wellness' | 'remarks'>('overview');
  const [activeChartMetric, setActiveChartMetric] = useState<'weight' | 'waist' | 'bodyFat'>('weight');
  const [selectedPhotoAngle, setSelectedPhotoAngle] = useState<'Front' | 'Side' | 'Back'>('Front');

  // Log Check-In Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [logWeight, setLogWeight] = useState<number>(activeMember?.weightKg || 70);
  const [logBodyFat, setLogBodyFat] = useState<number>(activeMember?.bodyFatPercent || 18);
  const [logChest, setLogChest] = useState<number>(activeMember?.chestCm || 95);
  const [logWaist, setLogWaist] = useState<number>(activeMember?.waistCm || 82);
  const [logArms, setLogArms] = useState<number>(activeMember?.armsCm || 36);
  const [logForearms, setLogForearms] = useState<number>(activeMember?.forearmsCm || 30);
  const [logHips, setLogHips] = useState<number>(activeMember?.hipsCm || 96);
  const [logThighs, setLogThighs] = useState<number>(activeMember?.thighsCm || 56);
  const [logCalves, setLogCalves] = useState<number>(activeMember?.calvesCm || 38);
  const [logShoulders, setLogShoulders] = useState<number>(activeMember?.shouldersCm || 118);
  const [logNeck, setLogNeck] = useState<number>(activeMember?.neckCm || 39);
  const [logPhotoUrl, setLogPhotoUrl] = useState('');
  const [logPhotoAngle, setLogPhotoAngle] = useState<'Front' | 'Side' | 'Back'>('Front');
  const [logPhotoPrivacy, setLogPhotoPrivacy] = useState<'Private' | 'Trainer Only' | 'Authorized Staff'>('Trainer Only');
  const [logRemarks, setLogRemarks] = useState('');

  // Daily Wellness Modal State
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [wellMood, setWellMood] = useState<'Energized' | 'Good' | 'Neutral' | 'Tired' | 'Exhausted'>('Good');
  const [wellEnergy, setWellEnergy] = useState<number>(4);
  const [wellSleep, setWellSleep] = useState<number>(7.5);
  const [wellStress, setWellStress] = useState<'Low' | 'Moderate' | 'High'>('Low');
  const [wellSoreness, setWellSoreness] = useState<'None' | 'Mild' | 'Moderate' | 'Severe'>('Mild');
  const [wellNotes, setWellNotes] = useState('');

  // Filter progress entries strictly for this member
  const memberProgress = progress
    .filter((p) => p.memberId === activeMember?.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  const memberWellness = wellnessCheckins
    .filter((w) => w.memberId === activeMember?.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const startWeight = activeMember?.startWeightKg || activeMember?.weightKg || 70;
  const currentWeight = activeMember?.weightKg || 70;
  const goalWeight = activeMember?.goalWeightKg || 68;
  const heightM = Math.max(1, activeMember?.heightCm || 170) / 100;
  const bmi = Number((currentWeight / (heightM * heightM)).toFixed(1));

  // Weight change
  const weightDiff = (currentWeight - startWeight).toFixed(1);
  const isLoss = Number(weightDiff) < 0;

  // Real Progress Analytics
  const hasEnoughData = memberProgress.length >= 2;
  const firstEntry = memberProgress[0];
  const lastEntry = memberProgress[memberProgress.length - 1];

  const totalWeightChangeKg = hasEnoughData ? (lastEntry.weightKg - firstEntry.weightKg).toFixed(1) : '—';
  const totalWeightChangePct = hasEnoughData && firstEntry.weightKg > 0
    ? (((lastEntry.weightKg - firstEntry.weightKg) / firstEntry.weightKg) * 100).toFixed(1)
    : '—';

  const goalDiffTotal = Math.abs(startWeight - goalWeight);
  const goalDiffCurrent = Math.abs(startWeight - currentWeight);
  const goalProgressPct = goalDiffTotal > 0
    ? Math.min(100, Math.max(0, Math.round((goalDiffCurrent / goalDiffTotal) * 100)))
    : 0;

  const remainingWeightKg = Math.abs(currentWeight - goalWeight).toFixed(1);

  // Weekly rate of change
  const weeklyAvgChange = () => {
    if (!hasEnoughData) return 'Not enough data yet.';
    const d1 = new Date(firstEntry.date).getTime();
    const d2 = new Date(lastEntry.date).getTime();
    const days = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
    if (days < 7) return 'Not enough data yet.';
    const weeks = days / 7;
    const rate = (Number(totalWeightChangeKg) / weeks).toFixed(2);
    return `${rate} kg/week`;
  };

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
      bodyFatPercent: logBodyFat > 0 ? logBodyFat : undefined,
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
      photoAngle: logPhotoUrl.trim() ? logPhotoAngle : undefined,
      photoPrivacy: logPhotoUrl.trim() ? logPhotoPrivacy : undefined,
      photoFrontUrl: logPhotoAngle === 'Front' && logPhotoUrl.trim() ? logPhotoUrl.trim() : undefined,
      photoSideUrl: logPhotoAngle === 'Side' && logPhotoUrl.trim() ? logPhotoUrl.trim() : undefined,
      photoBackUrl: logPhotoAngle === 'Back' && logPhotoUrl.trim() ? logPhotoUrl.trim() : undefined,
      trainerRemarks: logRemarks.trim(),
    });

    setShowLogModal(false);
  };

  const handleSaveWellness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMember?.id) return;

    await addWellnessCheckin({
      memberId: activeMember.id,
      date: new Date().toISOString().split('T')[0],
      mood: wellMood,
      energyLevel: wellEnergy,
      sleepHours: wellSleep,
      stressLevel: wellStress,
      muscleSoreness: wellSoreness,
      notes: wellNotes.trim(),
    });

    setShowWellnessModal(false);
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
              onClick={() => setShowWellnessModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-[11px] flex items-center gap-1 border border-purple-500/30 cursor-pointer"
              title="Daily Wellness Check-in"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Check-in</span>
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
              {goalWeight > 0 ? `${remainingWeightKg} kg to go` : 'Set Goal'}
            </span>
          </div>
        </div>

        {/* Progress Analytics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/10 text-center">
          <div className="p-2 rounded-xl bg-white/5 space-y-0.5">
            <span className="text-[9px] text-slate-400 font-semibold uppercase">Goal Progress</span>
            <strong className="text-xs font-black text-[#27D980] block">{goalProgressPct}%</strong>
          </div>
          <div className="p-2 rounded-xl bg-white/5 space-y-0.5">
            <span className="text-[9px] text-slate-400 font-semibold uppercase">Weight Change</span>
            <strong className="text-xs font-black text-white block">
              {hasEnoughData ? `${totalWeightChangeKg} kg (${totalWeightChangePct}%)` : 'Not enough data yet.'}
            </strong>
          </div>
          <div className="p-2 rounded-xl bg-white/5 space-y-0.5">
            <span className="text-[9px] text-slate-400 font-semibold uppercase">Weekly Pace</span>
            <strong className="text-xs font-black text-cyan-300 block">{weeklyAvgChange()}</strong>
          </div>
          <div className="p-2 rounded-xl bg-white/5 space-y-0.5">
            <span className="text-[9px] text-slate-400 font-semibold uppercase">BMI (Status)</span>
            <strong className={`text-xs font-black block ${bmiCat.color.split(' ')[0]}`}>{bmi} • {bmiCat.label.split(' ')[0]}</strong>
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-gym-border/40 pb-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview & Trends', icon: Activity },
          { id: 'measurements', label: `8-Point Tape (${memberProgress.length})`, icon: Ruler },
          { id: 'photos', label: 'Progress Photos', icon: Camera },
          { id: 'wellness', label: `Daily Wellness (${memberWellness.length})`, icon: Smile },
          { id: 'remarks', label: `Coach Remarks (${memberProgress.filter(p => p.trainerRemarks).length})`, icon: MessageSquare },
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
          
          {/* Multi-Metric Historical Graph Card */}
          <div className="p-4 rounded-3xl bg-[#101422] border border-white/10 space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#27D980]" />
                <span>Historical Progress Trends</span>
              </h4>

              {/* Metric Selector Buttons */}
              <div className="flex items-center gap-1 bg-[#0B0E17] p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setActiveChartMetric('weight')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    activeChartMetric === 'weight' ? 'bg-[#27D980] text-black font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Weight (kg)
                </button>
                <button
                  onClick={() => setActiveChartMetric('waist')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    activeChartMetric === 'waist' ? 'bg-cyan-400 text-black font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Waist (cm)
                </button>
                <button
                  onClick={() => setActiveChartMetric('bodyFat')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    activeChartMetric === 'bodyFat' ? 'bg-purple-400 text-black font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Body Fat (%)
                </button>
              </div>
            </div>

            {memberProgress.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold border border-dashed border-white/10 rounded-2xl">
                No progress records yet. Click "+ Log Metric" above to record your first milestone!
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="flex items-end justify-between h-32 pt-4 px-2 gap-2">
                  {memberProgress.map((p) => {
                    let val = p.weightKg;
                    let label = `${p.weightKg}kg`;
                    let barColor = 'from-[#4F7CFF] to-[#27D980]';
                    let maxScale = 120;

                    if (activeChartMetric === 'waist') {
                      val = p.waistCm || 0;
                      label = p.waistCm ? `${p.waistCm}cm` : '—';
                      barColor = 'from-blue-600 to-cyan-400';
                      maxScale = 110;
                    } else if (activeChartMetric === 'bodyFat') {
                      val = p.bodyFatPercent || 0;
                      label = p.bodyFatPercent ? `${p.bodyFatPercent}%` : '—';
                      barColor = 'from-indigo-600 to-purple-400';
                      maxScale = 40;
                    }

                    const heightPct = val > 0 ? Math.max(15, Math.min(100, (val / maxScale) * 100)) : 10;

                    return (
                      <div key={p.id} className="flex flex-col items-center gap-1 text-[9px] text-slate-400 flex-1">
                        <span className="text-white font-black text-[9px]">{label}</span>
                        <div
                          className={`w-full max-w-[28px] rounded-t-lg bg-gradient-to-t ${barColor} transition-all shadow-md`}
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[8px] font-bold text-slate-500">{p.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-white/5">
                  <span>First Log: {firstEntry?.date || '—'} ({firstEntry?.weightKg || '—'} kg)</span>
                  <span className="text-emerald-400 font-bold">Latest: {lastEntry?.date || '—'} ({lastEntry?.weightKg || '—'} kg)</span>
                </div>
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
                  {memberProgress.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                        No progress records yet.
                      </td>
                    </tr>
                  ) : (
                    memberProgress.map((p) => (
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-purple-400" />
              <span>3-Angle Transformation Gallery</span>
            </h4>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#0B0E17] p-1 rounded-xl border border-white/10">
                {(['Front', 'Side', 'Back'] as const).map((angle) => (
                  <button
                    key={angle}
                    onClick={() => setSelectedPhotoAngle(angle)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      selectedPhotoAngle === angle ? 'bg-purple-500 text-white font-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {angle}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowLogModal(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-black flex items-center gap-1 shadow-md cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Upload Photo</span>
              </button>
            </div>
          </div>

          {/* Side-by-Side Comparison */}
          {(() => {
            const photoKey = selectedPhotoAngle === 'Front' ? 'photoFrontUrl' : selectedPhotoAngle === 'Side' ? 'photoSideUrl' : 'photoBackUrl';
            const entriesWithPhotos = memberProgress.filter((p) => p[photoKey] || p.photoBeforeUrl || p.photoAfterUrl);

            if (entriesWithPhotos.length === 0) {
              return (
                <div className="p-8 rounded-3xl bg-[#101422] border border-dashed border-white/10 text-center space-y-2">
                  <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                  <h4 className="text-xs font-black text-white">No {selectedPhotoAngle} photos uploaded yet</h4>
                  <p className="text-[10px] text-slate-400">
                    Upload your milestone photos with private permissions to track visual transformation!
                  </p>
                </div>
              );
            }

            const baselineEntry = entriesWithPhotos[0];
            const latestEntry = entriesWithPhotos[entriesWithPhotos.length - 1];

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-3xl bg-[#101422] border border-white/10 space-y-2 text-center">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black text-slate-400">Baseline ({selectedPhotoAngle})</span>
                    <span className="text-[9px] text-slate-500 font-bold">{baselineEntry.date}</span>
                  </div>
                  <div className="h-48 rounded-2xl bg-[#0B0E17] border border-white/10 overflow-hidden flex items-center justify-center">
                    {baselineEntry[photoKey] || baselineEntry.photoBeforeUrl ? (
                      <img
                        src={baselineEntry[photoKey] || baselineEntry.photoBeforeUrl}
                        alt="Baseline"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-500">
                        <Camera className="w-8 h-8" />
                        <span className="text-[10px]">No Baseline Photo</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-black text-slate-300">{baselineEntry.weightKg} kg</span>
                </div>

                <div className="p-4 rounded-3xl bg-[#101422] border border-purple-500/30 space-y-2 text-center shadow-lg shadow-purple-500/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black text-[#27D980]">Current ({selectedPhotoAngle})</span>
                    <span className="text-[9px] text-[#27D980] font-bold">{latestEntry.date}</span>
                  </div>
                  <div className="h-48 rounded-2xl bg-[#0B0E17] border border-[#27D980]/30 overflow-hidden flex items-center justify-center">
                    {latestEntry[photoKey] || latestEntry.photoAfterUrl ? (
                      <img
                        src={latestEntry[photoKey] || latestEntry.photoAfterUrl}
                        alt="Current"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-500">
                        <Flame className="w-8 h-8 text-[#27D980]" />
                        <span className="text-[10px]">No Latest Photo</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-black text-[#27D980]">{latestEntry.weightKg} kg</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 4: DAILY WELLNESS CHECK-INS */}
      {activeTab === 'wellness' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-emerald-400" />
              <span>Daily Readiness & Wellness Log</span>
            </h4>
            <button
              onClick={() => setShowWellnessModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#27D980] hover:bg-[#20BE6F] text-black font-black flex items-center gap-1 shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record Check-in</span>
            </button>
          </div>

          {memberWellness.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#101422] border border-white/10 text-center text-slate-400 font-bold space-y-2">
              <Smile className="w-8 h-8 text-emerald-400 mx-auto" />
              <p>No wellness check-ins recorded yet.</p>
              <p className="text-[10px] text-slate-500">Log energy, sleep, mood, and soreness to keep your trainer updated!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {memberWellness.map((w) => (
                <div key={w.id} className="p-4 rounded-3xl bg-[#101422] border border-white/10 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      {w.date} Readiness
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      Mood: {w.mood}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="p-2 rounded-xl bg-[#0B0E17] border border-white/5 space-y-0.5">
                      <span className="text-slate-400 font-semibold block">Energy Level</span>
                      <strong className="text-amber-400 font-black">{w.energyLevel} / 5</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[#0B0E17] border border-white/5 space-y-0.5">
                      <span className="text-slate-400 font-semibold block">Sleep</span>
                      <strong className="text-cyan-400 font-black">{w.sleepHours} hrs</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[#0B0E17] border border-white/5 space-y-0.5">
                      <span className="text-slate-400 font-semibold block">Stress</span>
                      <strong className="text-white font-black">{w.stressLevel}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[#0B0E17] border border-white/5 space-y-0.5">
                      <span className="text-slate-400 font-semibold block">Soreness</span>
                      <strong className="text-rose-400 font-black">{w.muscleSoreness}</strong>
                    </div>
                  </div>

                  {w.notes && (
                    <p className="text-[11px] text-slate-300 bg-[#0B0E17] p-2.5 rounded-xl border border-white/5">
                      "{w.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: TRAINER REMARKS */}
      {activeTab === 'remarks' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Trainer Assessments & Coaching Feedback</span>
            </h4>
          </div>

          <div className="space-y-2.5">
            {memberProgress.filter((p) => p.trainerRemarks).length === 0 ? (
              <div className="p-8 rounded-3xl bg-[#101422] border border-white/10 text-center text-slate-400 font-bold space-y-2">
                <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
                <p>No coach remarks recorded yet.</p>
              </div>
            ) : (
              memberProgress.filter((p) => p.trainerRemarks).map((p) => (
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

      {/* MODAL 1: LOG METRIC CHECK-IN */}
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
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Body Fat % (Optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={logBodyFat || ''}
                    onChange={(e) => setLogBodyFat(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    value={logWaist || ''}
                    onChange={(e) => setLogWaist(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    value={logChest || ''}
                    onChange={(e) => setLogChest(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Arms / Biceps (cm)</label>
                  <input
                    type="number"
                    value={logArms || ''}
                    onChange={(e) => setLogArms(Number(e.target.value))}
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

              {/* Photo Upload URL & Privacy */}
              <div className="p-3 bg-[#0B0E17] rounded-2xl border border-white/10 space-y-2">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block">Transformation Photo</span>
                
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold mb-1">Photo Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={logPhotoUrl}
                    onChange={(e) => setLogPhotoUrl(e.target.value)}
                    className="w-full bg-[#101422] border border-white/10 rounded-xl px-3 py-2 text-white outline-none text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-semibold mb-1">Angle</label>
                    <select
                      value={logPhotoAngle}
                      onChange={(e) => setLogPhotoAngle(e.target.value as any)}
                      className="w-full bg-[#101422] border border-white/10 rounded-xl px-2 py-1.5 text-white outline-none text-xs"
                    >
                      <option value="Front">Front Angle</option>
                      <option value="Side">Side Profile</option>
                      <option value="Back">Back View</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-semibold mb-1">Privacy Level</label>
                    <select
                      value={logPhotoPrivacy}
                      onChange={(e) => setLogPhotoPrivacy(e.target.value as any)}
                      className="w-full bg-[#101422] border border-white/10 rounded-xl px-2 py-1.5 text-white outline-none text-xs"
                    >
                      <option value="Private">Private (Self Only)</option>
                      <option value="Trainer Only">Trainer Only</option>
                      <option value="Authorized Staff">Authorized Staff</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Notes / Observations</label>
                <textarea
                  rows={2}
                  placeholder="Notes about energy, diet, or progress this week..."
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

      {/* MODAL 2: DAILY WELLNESS CHECK-IN */}
      {showWellnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101422] border border-white/15 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-emerald-400" />
                <span>Daily Wellness & Readiness Check-in</span>
              </h3>
              <button
                onClick={() => setShowWellnessModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWellness} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1.5">Today's Mood</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['Energized', 'Good', 'Neutral', 'Tired', 'Exhausted'] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setWellMood(m)}
                      className={`p-2 rounded-xl text-center text-[10px] font-bold border transition-all cursor-pointer ${
                        wellMood === m
                          ? 'bg-[#27D980]/20 border-[#27D980] text-[#27D980] font-black'
                          : 'bg-[#0B0E17] border-white/10 text-slate-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Energy Level (1-5)</label>
                  <select
                    value={wellEnergy}
                    onChange={(e) => setWellEnergy(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value={5}>5 - Super High</option>
                    <option value={4}>4 - High / Good</option>
                    <option value={3}>3 - Moderate</option>
                    <option value={2}>2 - Low</option>
                    <option value={1}>1 - Completely Drained</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Sleep (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={wellSleep}
                    onChange={(e) => setWellSleep(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Stress Level</label>
                  <select
                    value={wellStress}
                    onChange={(e) => setWellStress(e.target.value as any)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Low">Low / Relaxed</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High Stress</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Muscle Soreness</label>
                  <select
                    value={wellSoreness}
                    onChange={(e) => setWellSoreness(e.target.value as any)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="None">None / Fully Recovered</option>
                    <option value="Mild">Mild Soreness</option>
                    <option value="Moderate">Moderate DOMS</option>
                    <option value="Severe">Severe Soreness</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Wellness Notes</label>
                <textarea
                  rows={2}
                  placeholder="How your body feels today, hydration, recovery..."
                  value={wellNotes}
                  onChange={(e) => setWellNotes(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#27D980] hover:bg-[#20BE6F] active:scale-95 text-black font-black text-xs shadow-xl cursor-pointer transition-all"
              >
                Log Today's Wellness ✨
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
