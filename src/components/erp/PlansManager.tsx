import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { MembershipPlan } from '../../types/gym';
import {
  Check,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Users,
  Info,
  CheckCircle2,
  Tag
} from 'lucide-react';

export const PlansManager: React.FC = () => {
  const { plans, members, selectedBranchId, branches, addMembershipPlan, updateMembershipPlan, deleteMembershipPlan } = useGym();
  const currentBranch = (branches || []).find((b) => b?.id === selectedBranchId) || branches?.[0] || {
    id: 'all',
    name: 'All Branches',
    code: 'HQ',
    city: 'Metro',
    activeMembers: 0,
    currentCheckIns: 0,
    monthlyRevenue: 0
  };

  const [showModal, setShowModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Form State
  const [planName, setPlanName] = useState('');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [durationLabel, setDurationLabel] = useState<MembershipPlan['duration']>('Monthly');
  const [basePrice, setBasePrice] = useState<number>(3000);
  const [joiningFee, setJoiningFee] = useState<number>(500);
  const [gstPercent, setGstPercent] = useState<number>(18);
  const [description, setDescription] = useState('');
  const [ptFeature, setPtFeature] = useState(false);
  const [dietFeature, setDietFeature] = useState(false);
  const [lockerFeature, setLockerFeature] = useState(true);
  const [steamFeature, setSteamFeature] = useState(false);

  // Standard Rates Form State
  const monthlyPlan = plans.find(p => p.durationMonths === 1 || p.duration === 'Monthly');
  const quarterlyPlan = plans.find(p => p.durationMonths === 3 || p.duration === 'Quarterly');
  const yearlyPlan = plans.find(p => p.durationMonths === 12 || p.duration === 'Yearly');

  const [regFee, setRegFee] = useState<number>(monthlyPlan?.joiningFee || 500);
  const [monthlyFee, setMonthlyFee] = useState<number>(monthlyPlan?.basePrice || 1500);
  const [quarterlyFee, setQuarterlyFee] = useState<number>(quarterlyPlan?.basePrice || 4000);
  const [yearlyFee, setYearlyFee] = useState<number>(yearlyPlan?.basePrice || 12000);
  const [isSavingStandardFees, setIsSavingStandardFees] = useState(false);
  const [standardFeeSuccess, setStandardFeeSuccess] = useState(false);

  const calculateTotal = (base: number, joining: number, gst: number) => {
    const subtotal = base + joining;
    return Math.round(subtotal * (1 + gst / 100));
  };

  const handleSaveStandardFeeMatrix = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStandardFees(true);
    try {
      // 1. Update or create Monthly plan
      if (monthlyPlan) {
        await updateMembershipPlan(monthlyPlan.id, {
          basePrice: monthlyFee,
          joiningFee: regFee,
          totalPrice: calculateTotal(monthlyFee, regFee, monthlyPlan.gstPercent || 18)
        });
      } else {
        await addMembershipPlan({
          id: `plan-monthly-${Date.now()}`,
          name: 'Monthly Standard Membership',
          durationMonths: 1,
          duration: 'Monthly',
          basePrice: monthlyFee,
          joiningFee: regFee,
          gstPercent: 18,
          totalPrice: calculateTotal(monthlyFee, regFee, 18),
          description: 'Standard monthly gym pass with full facility access.',
          includedAddons: ['Gym Floor Access', 'Locker Room'],
          includedFeatures: { personalTraining: false, dietPlan: false, locker: true, steam: false },
          isActive: true
        });
      }

      // 2. Update or create Quarterly plan
      if (quarterlyPlan) {
        await updateMembershipPlan(quarterlyPlan.id, {
          basePrice: quarterlyFee,
          joiningFee: regFee,
          totalPrice: calculateTotal(quarterlyFee, regFee, quarterlyPlan.gstPercent || 18)
        });
      } else {
        await addMembershipPlan({
          id: `plan-quarterly-${Date.now()}`,
          name: 'Quarterly Transformation Pass',
          durationMonths: 3,
          duration: 'Quarterly',
          basePrice: quarterlyFee,
          joiningFee: regFee,
          gstPercent: 18,
          totalPrice: calculateTotal(quarterlyFee, regFee, 18),
          description: '3-month gym pass with trainer assessments.',
          includedAddons: ['Gym Floor Access', 'Locker Room', 'Trainer Assessment'],
          includedFeatures: { personalTraining: true, dietPlan: true, locker: true, steam: false },
          isActive: true
        });
      }

      // 3. Update or create Yearly plan
      if (yearlyPlan) {
        await updateMembershipPlan(yearlyPlan.id, {
          basePrice: yearlyFee,
          joiningFee: regFee,
          totalPrice: calculateTotal(yearlyFee, regFee, yearlyPlan.gstPercent || 18)
        });
      } else {
        await addMembershipPlan({
          id: `plan-yearly-${Date.now()}`,
          name: 'Annual VIP All-Access Pass',
          durationMonths: 12,
          duration: 'Yearly',
          basePrice: yearlyFee,
          joiningFee: regFee,
          gstPercent: 18,
          totalPrice: calculateTotal(yearlyFee, regFee, 18),
          description: 'Full 12-month unlimited gym floor and amenities pass.',
          includedAddons: ['Gym Floor Access', 'Locker Room', 'Steam & Sauna', 'Diet Plan'],
          includedFeatures: { personalTraining: true, dietPlan: true, locker: true, steam: true },
          isActive: true
        });
      }

      setStandardFeeSuccess(true);
      setTimeout(() => setStandardFeeSuccess(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingStandardFees(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingPlanId(null);
    setPlanName('');
    setDurationMonths(1);
    setDurationLabel('Monthly');
    setBasePrice(3000);
    setJoiningFee(500);
    setGstPercent(18);
    setDescription('');
    setPtFeature(false);
    setDietFeature(false);
    setLockerFeature(true);
    setSteamFeature(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (plan: MembershipPlan) => {
    setEditingPlanId(plan.id);
    setPlanName(plan.name);
    setDurationMonths(plan.durationMonths);
    setDurationLabel(plan.duration || 'Monthly');
    setBasePrice(plan.basePrice);
    setJoiningFee(plan.joiningFee);
    setGstPercent(plan.gstPercent);
    setDescription(plan.description || '');
    setPtFeature(plan.includedFeatures?.personalTraining || false);
    setDietFeature(plan.includedFeatures?.dietPlan || false);
    setLockerFeature(plan.includedFeatures?.locker || false);
    setSteamFeature(plan.includedFeatures?.steam || false);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName) return;

    const totalPrice = calculateTotal(basePrice, joiningFee, gstPercent);
    const addons: string[] = [];
    if (ptFeature) addons.push('Personal Trainer Guidance');
    if (dietFeature) addons.push('Custom Macro Diet Plan');
    if (lockerFeature) addons.push('Reserved Day Locker');
    if (steamFeature) addons.push('Steam & Sauna Suite');

    if (editingPlanId) {
      await updateMembershipPlan(editingPlanId, {
        name: planName,
        durationMonths,
        duration: durationLabel,
        basePrice,
        joiningFee,
        gstPercent,
        totalPrice,
        description,
        includedAddons: addons,
        includedFeatures: {
          personalTraining: ptFeature,
          dietPlan: dietFeature,
          locker: lockerFeature,
          steam: steamFeature
        }
      });
    } else {
      const newPlan: MembershipPlan = {
        id: `plan-${Date.now()}`,
        name: planName,
        durationMonths,
        duration: durationLabel,
        basePrice,
        joiningFee,
        gstPercent,
        totalPrice,
        description,
        includedAddons: addons,
        includedFeatures: {
          personalTraining: ptFeature,
          dietPlan: dietFeature,
          locker: lockerFeature,
          steam: steamFeature
        },
        pricePerBranch: { [selectedBranchId]: totalPrice },
        isActive: true
      };
      await addMembershipPlan(newPlan);
    }

    setShowModal(false);
  };

  const handleDeleteClick = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      const res = await deleteMembershipPlan(planId);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-[#4F7CFF]" />
            Membership Packages & Plans
          </h2>
          <p className="text-xs text-gym-subtext">
            Configure membership packages, duration terms, GST rates, and included feature sets
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-blue-600 text-white font-bold text-xs shadow-lg shadow-[#4F7CFF]/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Package</span>
        </button>
      </div>

      {/* Standard Gym Fee Rates & Admission Structure Matrix */}
      <div className="glass-card rounded-3xl p-6 border border-cyan-500/30 relative overflow-hidden bg-gradient-to-br from-[#0E1424] via-[#0B0F19] to-[#07090E] shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>Standard Membership Fee Matrix</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Admin Master Rates
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Manually configure standard admission fees and recurring subscription tariffs across your branches.
              </p>
            </div>
          </div>

          {standardFeeSuccess && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Standard rates applied & saved!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveStandardFeeMatrix} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* 1. Registration / Admission Fee */}
          <div className="p-4 rounded-2xl bg-[#070A12] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Registration Fee</span>
              <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">One-Time</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
              <input
                type="number"
                min="0"
                value={regFee}
                onChange={(e) => setRegFee(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-[#0E1322] rounded-xl border border-white/10 text-white font-extrabold text-sm focus:border-cyan-400 focus:outline-none"
                placeholder="500"
              />
            </div>
            <p className="text-[10px] text-slate-500">New member admission / joining fee</p>
          </div>

          {/* 2. Monthly Fee */}
          <div className="p-4 rounded-2xl bg-[#070A12] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Monthly Fee (1M)</span>
              <span className="text-[9px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">1 Month</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
              <input
                type="number"
                min="0"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-[#0E1322] rounded-xl border border-white/10 text-white font-extrabold text-sm focus:border-cyan-400 focus:outline-none"
                placeholder="1500"
              />
            </div>
            <p className="text-[10px] text-slate-500">Regular recurring 30-day pass</p>
          </div>

          {/* 3. Quarterly Fee */}
          <div className="p-4 rounded-2xl bg-[#070A12] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Quarterly Fee (3M)</span>
              <span className="text-[9px] font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md border border-purple-400/20">3 Months</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
              <input
                type="number"
                min="0"
                value={quarterlyFee}
                onChange={(e) => setQuarterlyFee(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-[#0E1322] rounded-xl border border-white/10 text-white font-extrabold text-sm focus:border-cyan-400 focus:outline-none"
                placeholder="4000"
              />
            </div>
            <p className="text-[10px] text-slate-500">90-day transformation package</p>
          </div>

          {/* 4. Yearly Fee */}
          <div className="p-4 rounded-2xl bg-[#070A12] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Yearly Fee (12M)</span>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">Annual VIP</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
              <input
                type="number"
                min="0"
                value={yearlyFee}
                onChange={(e) => setYearlyFee(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-[#0E1322] rounded-xl border border-white/10 text-white font-extrabold text-sm focus:border-cyan-400 focus:outline-none"
                placeholder="12000"
              />
            </div>
            <p className="text-[10px] text-slate-500">365-day all-access membership</p>
          </div>

          {/* Action Row */}
          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingStandardFees}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] via-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSavingStandardFees ? 'Updating Standard Rates...' : 'Save & Update Standard Fee Structure'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const activeMembersInPlan = members.filter(m => m.planId === p.id && m.status === 'Active').length;

          return (
            <div
              key={p.id}
              className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between hover:scale-[1.01] transition-all border border-gym-border group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                    {p.durationMonths} Month{p.durationMonths > 1 ? 's' : ''} Pass
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#27D980]" />
                </div>

                <h3 className="text-base font-extrabold text-white group-hover:text-[#4F7CFF] transition-colors mt-2">
                  {p.name}
                </h3>

                <p className="text-[11px] text-gym-subtext mt-1 line-clamp-2">
                  {p.description || 'Full branch gym floor access with training equipment.'}
                </p>

                {/* Price Display */}
                <div className="my-4 pt-2 border-t border-gym-border/40">
                  <div className="text-2xl font-black text-white">
                    ₹{(p.totalPrice || p.basePrice).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-gym-subtext mt-0.5">
                    Base: ₹{p.basePrice.toLocaleString('en-IN')} + {p.gstPercent}% GST
                    {p.joiningFee > 0 && ` + ₹${p.joiningFee} joining fee`}
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2 pt-3 border-t border-gym-border/40 text-xs">
                  <div className="flex items-center gap-2">
                    <Check className={`w-3.5 h-3.5 ${p.includedFeatures?.personalTraining ? 'text-[#27D980]' : 'text-slate-600'}`} />
                    <span className={p.includedFeatures?.personalTraining ? 'text-slate-200' : 'text-slate-500 line-through'}>
                      Personal Trainer
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`w-3.5 h-3.5 ${p.includedFeatures?.dietPlan ? 'text-[#27D980]' : 'text-slate-600'}`} />
                    <span className={p.includedFeatures?.dietPlan ? 'text-slate-200' : 'text-slate-500 line-through'}>
                      Custom Diet Plan
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`w-3.5 h-3.5 ${p.includedFeatures?.locker ? 'text-[#27D980]' : 'text-slate-600'}`} />
                    <span className={p.includedFeatures?.locker ? 'text-slate-200' : 'text-slate-500 line-through'}>
                      Reserved Locker
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`w-3.5 h-3.5 ${p.includedFeatures?.steam ? 'text-[#27D980]' : 'text-slate-600'}`} />
                    <span className={p.includedFeatures?.steam ? 'text-slate-200' : 'text-slate-500 line-through'}>
                      Steam & Sauna Access
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions & Enrolled Count */}
              <div className="pt-5 border-t border-gym-border/40 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gym-subtext">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" /> {activeMembersInPlan} active members
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="py-2 rounded-xl bg-[#1E2330] hover:bg-[#4F7CFF] text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(p.id)}
                    className="py-2 rounded-xl bg-[#1E2330] hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL: CREATE / EDIT PACKAGE
      ════════════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#14171F] border border-gym-border rounded-[32px] p-6 max-w-md w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {editingPlanId ? 'Edit Membership Package' : 'Create New Membership Package'}
                </h3>
                <p className="text-xs text-gym-subtext">Set plan duration, pricing rules, and amenities</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6-Month Transformation Elite"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full bg-[#121622] border border-gym-border focus:border-[#4F7CFF] rounded-xl px-3 py-2.5 text-white font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Duration Term *</label>
                  <select
                    value={durationLabel}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setDurationLabel(val);
                      if (val === 'Monthly') setDurationMonths(1);
                      else if (val === 'Quarterly') setDurationMonths(3);
                      else if (val === 'Half-Yearly') setDurationMonths(6);
                      else if (val === 'Yearly') setDurationMonths(12);
                    }}
                    className="w-full bg-[#121622] border border-gym-border rounded-xl px-3 py-2.5 text-white font-semibold outline-none"
                  >
                    <option value="Monthly">Monthly (1 Month)</option>
                    <option value="Quarterly">Quarterly (3 Months)</option>
                    <option value="Half-Yearly">Half-Yearly (6 Months)</option>
                    <option value="Yearly">Yearly (12 Months)</option>
                    <option value="Custom">Custom Duration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Duration (Months) *</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#121622] border border-gym-border rounded-xl px-3 py-2.5 text-white font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121622] border border-gym-border rounded-xl px-3 py-2 text-white font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Joining Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={joiningFee}
                    onChange={(e) => setJoiningFee(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121622] border border-gym-border rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">GST %</label>
                  <input
                    type="number"
                    min="0"
                    max="28"
                    value={gstPercent}
                    onChange={(e) => setGstPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121622] border border-gym-border rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              {/* Calculated Total Banner */}
              <div className="p-3 rounded-2xl bg-[#0B0D12] border border-gym-border flex items-center justify-between">
                <span className="text-gym-subtext font-semibold">Total Package Price (Incl. GST):</span>
                <strong className="text-[#27D980] font-black text-sm">
                  ₹{calculateTotal(basePrice, joiningFee, gstPercent).toLocaleString('en-IN')}
                </strong>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Best for beginners wanting a complete nutritional and physical start."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#121622] border border-gym-border rounded-xl p-3 text-white outline-none"
                />
              </div>

              {/* Included Amenities Checkboxes */}
              <div className="space-y-2 pt-1">
                <label className="block text-[10px] font-black text-slate-300 uppercase">Included Amenities</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-[#121622] border border-gym-border cursor-pointer">
                    <input type="checkbox" checked={ptFeature} onChange={(e) => setPtFeature(e.target.checked)} className="rounded" />
                    <span>Personal Trainer</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-[#121622] border border-gym-border cursor-pointer">
                    <input type="checkbox" checked={dietFeature} onChange={(e) => setDietFeature(e.target.checked)} className="rounded" />
                    <span>Diet Nutrition</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-[#121622] border border-gym-border cursor-pointer">
                    <input type="checkbox" checked={lockerFeature} onChange={(e) => setLockerFeature(e.target.checked)} className="rounded" />
                    <span>Day Locker</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-[#121622] border border-gym-border cursor-pointer">
                    <input type="checkbox" checked={steamFeature} onChange={(e) => setSteamFeature(e.target.checked)} className="rounded" />
                    <span>Steam & Sauna</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gym-border/40">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E2330] text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4F7CFF] text-white font-black shadow-lg"
                >
                  {editingPlanId ? 'Update Package' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
