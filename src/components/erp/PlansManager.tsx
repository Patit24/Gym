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
  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

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

  const calculateTotal = (base: number, joining: number, gst: number) => {
    const subtotal = base + joining;
    return Math.round(subtotal * (1 + gst / 100));
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
