import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { compressImage, capturePhoto } from '../../utils/imageUtils';
import {
  UserPlus,
  X,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Phone,
  Sparkles,
  Dumbbell,
  ShieldCheck,
  CalendarRange,
  Hash,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

interface TrainerAddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrainerAddMemberModal: React.FC<TrainerAddMemberModalProps> = ({ isOpen, onClose }) => {
  const { addMember, employees, plans, appUserAccount } = useGym();

  const currentTrainer = employees.find(
    (e) =>
      e.id === appUserAccount?.id ||
      e.id === appUserAccount?.linkedId ||
      (e.email && e.email.toLowerCase() === (appUserAccount?.email || '').toLowerCase())
  ) || employees.find(e => e.role === 'Trainer') || employees[0];

  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [goal, setGoal] = useState<'Weight Loss' | 'Muscle Building' | 'Body Recomposition' | 'Endurance & Cardio' | 'Rehab & Mobility'>('Muscle Building');
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [medicalHistory, setMedicalHistory] = useState('None');
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || 'plan-1');

  // Custom duration state
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customMonths, setCustomMonths] = useState(3);
  const [customStartDate, setCustomStartDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [includeAdmissionFee, setIncludeAdmissionFee] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  const getEffectiveDates = () => {
    const startStr = isCustomDuration ? customStartDate : new Date().toISOString().split('T')[0];
    const months = isCustomDuration ? customMonths : (selectedPlan?.durationMonths || 3);
    const endObj = new Date(startStr);
    endObj.setMonth(endObj.getMonth() + months);
    return { startStr, endStr: endObj.toISOString().split('T')[0], months };
  };

  const getEffectivePrice = () => {
    if (!selectedPlan) return 0;
    const planMonths = selectedPlan.durationMonths || 1;
    const basePerMonth = (selectedPlan.basePrice || selectedPlan.totalPrice || 500) / planMonths;
    const packagePrice = isCustomDuration
      ? Math.round(basePerMonth * customMonths)
      : (selectedPlan.basePrice || selectedPlan.totalPrice || 500);
    const joiningFee = includeAdmissionFee ? (selectedPlan.joiningFee || 500) : 0;
    return packagePrice + joiningFee;
  };

  const { startStr, endStr, months: effMonths } = getEffectiveDates();
  const effectivePrice = getEffectivePrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      // Auto-calculate BMI
      const heightM = heightCm / 100;
      const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1)) || 22.5;

      const customPlanName = isCustomDuration
        ? `${selectedPlan?.name || 'Custom'} (${effMonths} Months)`
        : selectedPlan?.name || 'Standard Package';

      const newMember = await addMember({
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        dob: '1998-01-01',
        gender: 'Other',
        heightCm,
        weightKg,
        startWeightKg: weightKg,
        bmi,
        chestCm: 0,
        waistCm: 0,
        armsCm: 0,
        thighsCm: 0,
        bloodGroup: 'O+',
        emergencyContactName: '',
        emergencyMobile: '',
        address: 'Smart Gym City',
        medicalHistory: medicalHistory.trim() || 'None',
        goal,
        referralSource: `Trainer Registration (${currentTrainer?.name})`,
        branchId: currentTrainer?.branchId || 'branch-1',
        planId: isCustomDuration ? `${selectedPlan?.id || 'plan-1'}-custom-${effMonths}m` : (selectedPlan?.id || 'plan-1'),
        planName: customPlanName,
        startDate: startStr,
        endDate: endStr,
        expiryDate: endStr,
        paidAmount: effectivePrice,
        totalPlanAmount: effectivePrice,
        faceEnrolled: !!photoUrl,
        photoUrl: photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        pendingDues: 0,
        assignedTrainerId: currentTrainer?.id,
      });

      setSuccessMsg(`Member ${newMember.name} created and auto-assigned to your client list!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add member. Please verify fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121724] border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl my-auto max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
      >

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 shrink-0 bg-[#121724] z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4F7CFF]/20 border border-[#4F7CFF]/40 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#4F7CFF]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Add New PT Client</h3>
              <p className="text-[10px] text-slate-400">
                Assigned Trainer: <strong className="text-[#4F7CFF]">{currentTrainer?.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto overscroll-contain flex-1 min-h-0 space-y-4">
          {/* Security Notice */}
          <div className="p-2.5 rounded-2xl bg-[#4F7CFF]/10 border border-[#4F7CFF]/20 flex items-center gap-2 text-[11px] text-[#4F7CFF]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Newly registered member will be automatically assigned to you for workout &amp; diet planning.</span>
          </div>

          {/* Notifications */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">

            {/* Profile Photo Upload Field */}
            <div className="flex items-center gap-3.5 p-3 bg-[#0A0D15] rounded-2xl border border-white/10">
              <div className="relative group shrink-0">
                <img
                  src={photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'Client')}`}
                  alt="Client Preview"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#4F7CFF] bg-[#141722]"
                />
                  <button
                    type="button"
                    onClick={async () => {
                      const photo = await capturePhoto('camera');
                      if (photo) setPhotoUrl(photo);
                    }}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#4F7CFF] text-white flex items-center justify-center shadow-md border border-white/20 active:scale-95 cursor-pointer hover:bg-blue-400 transition-all"
                    title="Direct Camera Capture"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-black text-white block">Client Profile Picture</span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        const photo = await capturePhoto('camera');
                        if (photo) setPhotoUrl(photo);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#4F7CFF]/20 border border-[#4F7CFF]/40 text-[#4F7CFF] text-[10px] font-bold cursor-pointer active:scale-95 hover:bg-[#4F7CFF]/30 transition-all"
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

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase">Client Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0A0D15] border border-white/10 focus:border-[#4F7CFF] rounded-2xl pl-9 pr-3 py-2 text-white outline-none font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-300 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0A0D15] border border-white/10 focus:border-[#4F7CFF] rounded-2xl pl-9 pr-3 py-2 text-white outline-none font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-300 uppercase">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-[#0A0D15] border border-white/10 focus:border-[#4F7CFF] rounded-2xl pl-9 pr-3 py-2 text-white outline-none font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-300 uppercase">Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as any)}
                  className="w-full bg-[#0A0D15] border border-white/10 focus:border-[#4F7CFF] rounded-2xl px-2.5 py-2 text-white outline-none font-medium"
                >
                  <option value="Muscle Building">Muscle Building</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Body Recomposition">Body Recomp</option>
                  <option value="Endurance & Cardio">Cardio &amp; VO2</option>
                  <option value="Rehab & Mobility">Rehab &amp; Mobility</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-300 uppercase">Weight (kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={weightKg || ''}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0A0D15] border border-white/10 focus:border-[#4F7CFF] rounded-2xl px-3 pr-7 py-2 text-white outline-none font-medium"
                    required
                  />
                  {weightKg > 0 && (
                    <button
                      type="button"
                      onClick={() => setWeightKg(0)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-[10px] cursor-pointer"
                      title="Clear"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-300 uppercase">Height (cm)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={heightCm || ''}
                    onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0A0D15] border border-white/10 focus:border-[#4F7CFF] rounded-2xl px-3 pr-7 py-2 text-white outline-none font-medium"
                    required
                  />
                  {heightCm > 0 && (
                    <button
                      type="button"
                      onClick={() => setHeightCm(0)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-[10px] cursor-pointer"
                      title="Clear"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Plan selector */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-300 uppercase">Membership Plan &amp; Fee Structure</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full bg-[#0A0D15] border border-white/10 focus:border-[#4F7CFF] rounded-2xl px-3 py-2 text-white outline-none font-medium"
              >
                {plans.filter(p => p.durationMonths !== 6 && p.duration !== 'Half-Yearly').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{p.totalPrice.toLocaleString('en-IN')} ({p.durationMonths} Months)
                  </option>
                ))}
              </select>

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
                  <span className="text-[10px] text-orange-300">Prorated from monthly rate</span>
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
                  <div className="flex items-center justify-between text-[10px] text-slate-300 px-1">
                    <span>
                      Period: <strong className="text-orange-300">{startStr}</strong> → <strong className="text-orange-300">{endStr}</strong>
                    </span>
                    <span className="text-slate-400">({effMonths} month{effMonths !== 1 ? 's' : ''})</span>
                  </div>
                </div>
              )}

              {/* Admission / Registration Fee Checkbox */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-[10px]">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={includeAdmissionFee}
                    onChange={(e) => setIncludeAdmissionFee(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#4F7CFF] bg-[#101422] border-white/20 focus:ring-0"
                  />
                  <span>Registration / Admission Fee</span>
                </label>
                <span className="text-white font-extrabold">₹500</span>
              </div>

              {/* Fee Summary */}
              <div className="p-2.5 rounded-xl bg-[#4F7CFF]/10 border border-[#4F7CFF]/20 text-[10px] text-slate-300 flex items-center justify-between">
                <span>
                  {isCustomDuration
                    ? `₹${Math.round((selectedPlan?.basePrice || selectedPlan?.totalPrice || 500) / (selectedPlan?.durationMonths || 1)).toLocaleString('en-IN')}/mo × ${effMonths}mo${includeAdmissionFee ? ' + Admission ₹500' : ''}`
                    : `Tariff: ₹${(selectedPlan?.basePrice || selectedPlan?.totalPrice || 500).toLocaleString('en-IN')}${includeAdmissionFee ? ' + Admission ₹500' : ''}`
                  }
                </span>
                <span className={`font-black ${isCustomDuration ? 'text-orange-400' : 'text-[#27D980]'}`}>
                  Total: ₹{effectivePrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase">Medical History / Injuries</label>
              <input
                type="text"
                placeholder="e.g. Mild lower back strain, asthma, none"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                className="w-full bg-[#0A0D15] border border-white/10 focus:border-[#4F7CFF] rounded-2xl px-3 py-2 text-white outline-none font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] text-white font-black text-xs shadow-lg shadow-[#4F7CFF]/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating PT Client...' : 'Register & Assign to My List'}</span>
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};
