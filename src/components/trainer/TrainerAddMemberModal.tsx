import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
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
  ShieldCheck
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
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [goal, setGoal] = useState<'Weight Loss' | 'Muscle Building' | 'Body Recomposition' | 'Endurance & Cardio' | 'Rehab & Mobility'>('Muscle Building');
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [medicalHistory, setMedicalHistory] = useState('None');
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || 'plan-1');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];
      const startDate = new Date().toISOString().split('T')[0];
      const endDateObj = new Date();
      endDateObj.setMonth(endDateObj.getMonth() + (selectedPlan?.durationMonths || 3));
      const endDate = endDateObj.toISOString().split('T')[0];

      // Auto-calculate BMI
      const heightM = heightCm / 100;
      const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1)) || 22.5;

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
        planId: selectedPlan?.id || 'plan-1',
        planName: selectedPlan?.name || 'Standard Package',
        startDate,
        endDate,
        expiryDate: endDate,
        faceEnrolled: false,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        pendingDues: 0,
        assignedTrainerId: currentTrainer?.id, // AUTOMATICALLY ASSIGNED TO THIS TRAINER
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#121724] border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
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
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="p-2.5 rounded-2xl bg-[#4F7CFF]/10 border border-[#4F7CFF]/20 flex items-center gap-2 text-[11px] text-[#4F7CFF]">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Newly registered member will be automatically assigned to you for workout & diet planning.</span>
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
                <option value="Endurance & Cardio">Cardio & VO2</option>
                <option value="Rehab & Mobility">Rehab & Mobility</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase">Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                className="w-full bg-[#0A0D15] border border-white/10 focus:border-[#4F7CFF] rounded-2xl px-3 py-2 text-white outline-none font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(parseFloat(e.target.value) || 175)}
                className="w-full bg-[#0A0D15] border border-white/10 focus:border-[#4F7CFF] rounded-2xl px-3 py-2 text-white outline-none font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-300 uppercase">Membership Plan</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full bg-[#0A0D15] border border-white/10 focus:border-[#4F7CFF] rounded-2xl px-3 py-2 text-white outline-none font-medium"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.durationMonths} Months)
                </option>
              ))}
            </select>
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
  );
};
