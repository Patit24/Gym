import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { Member, BranchId } from '../../types/gym';
import { compressImage, capturePhoto } from '../../utils/imageUtils';
import {
  X,
  UserCheck,
  CheckCircle2,
  Dumbbell,
  CalendarRange,
  Hash,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

interface MemberRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberRegistrationModal: React.FC<MemberRegistrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addMember, plans, branches, employees } = useGym();

  const trainers = employees.filter((e) => e.role === 'Trainer');
  const dietitians = employees.filter((e) => e.role === 'Dietitian');

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    dob: '1998-01-01',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    heightCm: 175,
    weightKg: 70.0,
    chestCm: 100,
    branchId: 'branch-1' as BranchId,
    planId: 'plan-1',
    assignedTrainerId: trainers[0]?.id || '',
    assignedDietitianId: dietitians[0]?.id || '',
  });

  const [photoUrl, setPhotoUrl] = useState('');

  // Custom duration state
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customMonths, setCustomMonths] = useState(3);
  const [customStartDate, setCustomStartDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );

  const [createdMember, setCreatedMember] = useState<Member | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleReset();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  // Derive the effective plan and dates
  const selectedPlan = plans.find((p) => p.id === formData.planId) || plans[0];

  const getEffectiveDates = () => {
    const startStr = isCustomDuration ? customStartDate : new Date().toISOString().split('T')[0];
    const months = isCustomDuration ? customMonths : (selectedPlan?.durationMonths || 12);
    const endObj = new Date(startStr);
    endObj.setMonth(endObj.getMonth() + months);
    return { startStr, endStr: endObj.toISOString().split('T')[0], months };
  };

  const getEffectivePrice = () => {
    if (!selectedPlan) return 0;
    if (!isCustomDuration) return selectedPlan.totalPrice || 0;
    // Prorate: (base price / plan months) × custom months + joining fee
    const planMonths = selectedPlan.durationMonths || 1;
    const basePerMonth = (selectedPlan.basePrice || selectedPlan.totalPrice || 0) / planMonths;
    const joiningFee = selectedPlan.joiningFee || 0;
    return Math.round(basePerMonth * customMonths) + joiningFee;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      // Auto-calculate BMI
      const heightInM = Math.max(1, formData.heightCm) / 100;
      const bmiVal = Number((formData.weightKg / (heightInM * heightInM)).toFixed(1));

      const { startStr, endStr } = getEffectiveDates();
      const effectivePrice = getEffectivePrice();
      const effectiveMonths = isCustomDuration ? customMonths : (selectedPlan?.durationMonths || 12);

      const customPlanName = isCustomDuration
        ? `${selectedPlan?.name || 'Custom'} (${effectiveMonths} Months)`
        : selectedPlan?.name || 'Standard Plan';

      const newMem = await addMember({
        name: formData.name.trim() || 'New Member',
        photoUrl: photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name || 'Member')}`,
        faceEnrolled: !!photoUrl,
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        dob: formData.dob,
        gender: formData.gender,
        heightCm: Number(formData.heightCm) || 170,
        weightKg: Number(formData.weightKg) || 70,
        startWeightKg: Number(formData.weightKg) || 70,
        bmi: bmiVal,
        chestCm: Number(formData.chestCm) || 95,
        waistCm: 0,
        armsCm: 0,
        thighsCm: 0,
        bloodGroup: '',
        emergencyContactName: '',
        emergencyMobile: '',
        address: '',
        medicalHistory: 'None',
        goal: 'Muscle Building',
        referralSource: 'Direct',
        branchId: formData.branchId,
        planId: isCustomDuration ? `${formData.planId}-custom-${effectiveMonths}m` : formData.planId,
        planName: customPlanName,
        startDate: startStr,
        endDate: endStr,
        expiryDate: endStr,
        paidAmount: effectivePrice,
        totalPlanAmount: effectivePrice,
        assignedTrainerId: formData.assignedTrainerId,
        assignedDietitianId: formData.assignedDietitianId,
        pendingDues: 0,
      });

      setCreatedMember(newMem);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to create member. Please check the details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedMember(null);
    setSubmitError('');
    setPhotoUrl('');
    onClose();
  };

  const effectivePrice = getEffectivePrice();
  const { startStr, endStr, months: effMonths } = getEffectiveDates();

  return (
    <div
      onClick={handleReset}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#14171F] border border-gym-border rounded-[32px] shadow-2xl shadow-[#27D980]/10 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95"
      >

        {/* Header */}
        <div className="px-6 py-4 border-b border-gym-border flex items-center justify-between bg-[#0B0D12] shrink-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#27D980]/20 text-[#27D980]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="member-modal-title" className="text-base font-extrabold text-white">Add New Gym Member</h3>
              <p className="text-xs text-gym-subtext">Admin Member Onboarding (Credentials Sent via WhatsApp)</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-[#1E2330] text-gym-subtext hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {createdMember ? (
          <div className="p-8 text-center space-y-6 overflow-y-auto overscroll-contain flex-1 min-h-0">
            <div className="w-16 h-16 rounded-full bg-[#27D980]/20 text-[#27D980] flex items-center justify-center mx-auto border-2 border-[#27D980] animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">Member Enrolled Successfully! 🎉</h3>
              <p className="text-xs text-gym-subtext mt-1">
                Auto-Issued Member ID: <strong className="text-[#27D980]">{createdMember.id}</strong> | Username: <strong className="text-[#4F7CFF]">{createdMember.username || createdMember.id}</strong>
              </p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-gym-border max-w-md mx-auto space-y-2 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Member Name:</span> <strong className="text-white">{createdMember.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mobile / WhatsApp:</span> <strong className="text-white font-mono">{createdMember.mobile}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Physical Metrics:</span> <strong className="text-[#27D980]">Height: {createdMember.heightCm}cm | Weight: {createdMember.weightKg}kg | Chest: {createdMember.chestCm}cm</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Plan:</span> <strong className="text-[#4F7CFF]">{createdMember.planName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valid:</span> <strong className="text-emerald-400">{createdMember.startDate} → {createdMember.endDate}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 mt-2">
                ✓ Temporary password auto-generated and dispatched via WhatsApp.
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-[#27D980] text-gym-dark font-extrabold text-xs shadow-lg cursor-pointer"
            >
              Done &amp; Return to Console
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto overscroll-contain flex-1 min-h-0">

            {/* Section 1: Basic Profile */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-[#27D980] uppercase tracking-wider border-b border-gym-border/60 pb-1">
                1. Member Personal &amp; Contact Information
              </h4>

              {/* Photo Upload Avatar */}
              <div className="flex items-center gap-3.5 p-3 bg-[#0B0D12] rounded-2xl border border-gym-border/80">
                <div className="relative group shrink-0">
                  <img
                    src={photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name || 'Member')}`}
                    alt="Member Preview"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#27D980] bg-[#141722]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const photo = await capturePhoto('camera');
                      if (photo) setPhotoUrl(photo);
                    }}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#27D980] text-black flex items-center justify-center shadow-md border border-white/20 active:scale-95 cursor-pointer hover:bg-emerald-400 transition-all"
                    title="Direct Camera Capture"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-black text-white block">Member Profile Photo</span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        const photo = await capturePhoto('camera');
                        if (photo) setPhotoUrl(photo);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#27D980]/20 border border-[#27D980]/40 text-[#27D980] text-[10px] font-bold cursor-pointer active:scale-95 hover:bg-[#27D980]/30 transition-all"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Take Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const photo = await capturePhoto('photos');
                        if (photo) setPhotoUrl(photo);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold cursor-pointer active:scale-95 hover:bg-white/10 transition-all"
                    >
                      <ImageIcon className="w-3 h-3 text-slate-400" />
                      <span>Gallery</span>
                    </button>
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="text-[10px] text-red-400 font-bold hover:underline cursor-pointer ml-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white outline-none focus:border-[#27D980]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Mobile (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white outline-none focus:border-[#27D980]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="member@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white outline-none focus:border-[#27D980]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white outline-none focus:border-[#27D980]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white outline-none focus:border-[#27D980]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Core Physical Measurements */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gym-border/60 pb-1">
                <h4 className="text-xs font-extrabold text-[#4F7CFF] uppercase tracking-wider">
                  2. Core Physical Measurements
                </h4>
                <span className="text-[10px] text-slate-400 italic">Admin Initial Baseline</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1 font-bold">Weight (kg) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g. 72.5"
                      value={formData.weightKg || ''}
                      onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) || 0 })}
                      className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 pr-7 py-2 text-white font-bold text-[#27D980] outline-none focus:border-[#4F7CFF]"
                    />
                    {formData.weightKg > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, weightKg: 0 })}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-[10px] cursor-pointer"
                        title="Clear"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1 font-bold">Height (cm) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="e.g. 175"
                      value={formData.heightCm || ''}
                      onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) || 0 })}
                      className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 pr-7 py-2 text-white font-bold outline-none focus:border-[#4F7CFF]"
                    />
                    {formData.heightCm > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, heightCm: 0 })}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-[10px] cursor-pointer"
                        title="Clear"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1 font-bold">Chest (cm) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="e.g. 100"
                      value={formData.chestCm || ''}
                      onChange={(e) => setFormData({ ...formData, chestCm: Number(e.target.value) || 0 })}
                      className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 pr-7 py-2 text-white font-bold outline-none focus:border-[#4F7CFF]"
                    />
                    {formData.chestCm > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, chestCm: 0 })}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-[10px] cursor-pointer"
                        title="Clear"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-300">
                💡 <span className="font-semibold text-white">Member Self-Service Notice:</span> Extended measurements (Waist, Arms, Thighs, Medical Notes, Emergency Contact, Fitness Goals) will be completed by the member directly inside their mobile app profile upon first login.
              </div>
            </div>

            {/* Section 3: Branch, Plan & Staff Assignment */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider border-b border-gym-border/60 pb-1">
                3. Branch &amp; Membership Plan
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Branch *</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value as BranchId })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white outline-none focus:border-purple-400"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Membership Plan *</label>
                  <select
                    value={formData.planId}
                    onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-purple-400"
                  >
                    {plans.filter(p => p.durationMonths !== 6 && p.duration !== 'Half-Yearly').map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (₹{p.totalPrice.toLocaleString('en-IN')})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Assigned Trainer</label>
                  <select
                    value={formData.assignedTrainerId}
                    onChange={(e) => setFormData({ ...formData, assignedTrainerId: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white outline-none focus:border-purple-400"
                  >
                    <option value="">None / General Floor</option>
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Duration Toggle */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCustomDuration(!isCustomDuration)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                    isCustomDuration
                      ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <CalendarRange className="w-3.5 h-3.5" />
                  {isCustomDuration ? 'Custom Duration ON' : 'Set Custom Duration'}
                </button>
                {isCustomDuration && (
                  <span className="text-[10px] text-orange-300">
                    Pricing is prorated from the selected plan's monthly rate
                  </span>
                )}
              </div>

              {/* Custom Duration Inputs */}
              {isCustomDuration && (
                <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/25 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-orange-300 uppercase tracking-wider">
                    <Hash className="w-3.5 h-3.5" />
                    Custom Subscription Period
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] text-slate-400">Number of Months *</label>
                        {customMonths > 0 && (
                          <button
                            type="button"
                            onClick={() => setCustomMonths(1)}
                            className="text-[9px] text-orange-400/80 hover:text-orange-300 font-bold cursor-pointer"
                            title="Reset months"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          max={36}
                          required
                          value={customMonths || ''}
                          onChange={(e) => setCustomMonths(e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-[#0B0D12] border border-orange-500/40 rounded-xl px-3 pr-7 py-2 text-white font-bold text-orange-300 outline-none focus:border-orange-400"
                        />
                        {customMonths > 0 && (
                          <button
                            type="button"
                            onClick={() => setCustomMonths(1)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-[10px] cursor-pointer"
                            title="Clear"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Start Date *</label>
                      <input
                        type="date"
                        required
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full bg-[#0B0D12] border border-orange-500/40 rounded-xl px-3 py-2 text-white outline-none focus:border-orange-400"
                      />
                    </div>
                  </div>
                  {/* Custom date range preview */}
                  <div className="flex items-center justify-between text-[10px] text-slate-300 px-1">
                    <span>Subscription: <strong className="text-orange-300">{startStr}</strong> → <strong className="text-orange-300">{endStr}</strong></span>
                    <span className="text-[10px] text-slate-400">({effMonths} month{effMonths !== 1 ? 's' : ''})</span>
                  </div>
                </div>
              )}

              {/* Fee Structure Summary Preview */}
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-extrabold text-white">
                    {selectedPlan?.name}{isCustomDuration ? ` — ${effMonths} Month${effMonths !== 1 ? 's' : ''} (Custom)` : ` (${selectedPlan?.durationMonths} Months)`}
                  </span>
                  <p className="text-[10px] text-purple-300">
                    {isCustomDuration
                      ? `₹${Math.round((selectedPlan?.basePrice || selectedPlan?.totalPrice || 0) / (selectedPlan?.durationMonths || 1)).toLocaleString('en-IN')}/mo × ${effMonths} months${(selectedPlan?.joiningFee || 0) > 0 ? ` + Admission ₹${(selectedPlan?.joiningFee || 0).toLocaleString('en-IN')}` : ''}`
                      : `Base: ₹${(selectedPlan?.basePrice || selectedPlan?.totalPrice || 0).toLocaleString('en-IN')}${(selectedPlan?.joiningFee || 0) > 0 ? ` + Admission ₹${(selectedPlan?.joiningFee || 0).toLocaleString('en-IN')}` : ''}`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Due</span>
                  <span className={`text-sm font-black ${isCustomDuration ? 'text-orange-400' : 'text-emerald-400'}`}>
                    ₹{effectivePrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4F7CFF] via-[#27D980] to-emerald-400 text-gym-dark font-black text-sm shadow-xl shadow-[#27D980]/20 hover:scale-[1.01] transition-all cursor-pointer active:scale-95"
            >
              ENROLL MEMBER &amp; AUTO-DISPATCH WHATSAPP PASS 🚀
            </button>

          </form>
        )}

      </div>

    </div>
  );
};
