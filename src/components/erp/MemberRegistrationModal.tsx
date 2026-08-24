import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { Member, BranchId } from '../../types/gym';
import {
  X,
  UserCheck,
  CheckCircle2,
  Dumbbell
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

  const [createdMember, setCreatedMember] = useState<Member | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPlan = plans.find((p) => p.id === formData.planId) || plans[0];
    
    // Auto-calculate BMI
    const heightInM = Math.max(1, formData.heightCm) / 100;
    const bmiVal = Number((formData.weightKg / (heightInM * heightInM)).toFixed(1));

    const startDateStr = new Date().toISOString().split('T')[0];
    const endDateObj = new Date();
    endDateObj.setMonth(endDateObj.getMonth() + (selectedPlan?.durationMonths || 12));
    const endDateStr = endDateObj.toISOString().split('T')[0];

    const newMem = await addMember({
      name: formData.name.trim() || 'New Member',
      photoUrl: '',
      faceEnrolled: false,
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
      planId: formData.planId,
      planName: selectedPlan?.name || 'Standard Plan',
      startDate: startDateStr,
      endDate: endDateStr,
      assignedTrainerId: formData.assignedTrainerId,
      assignedDietitianId: formData.assignedDietitianId,
      pendingDues: 0,
    });

    setCreatedMember(newMem);
  };

  const handleReset = () => {
    setCreatedMember(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#14171F] border border-gym-border rounded-[32px] shadow-2xl shadow-[#27D980]/10 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gym-border flex items-center justify-between bg-[#0B0D12]">
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
            className="p-1.5 rounded-xl bg-[#1E2330] text-gym-subtext hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {createdMember ? (
          <div className="p-8 text-center space-y-6">
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
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 mt-2">
                ✓ Temporary password auto-generated and dispatched via WhatsApp.
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-[#27D980] text-gym-dark font-extrabold text-xs shadow-lg"
            >
              Done & Return to Console
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
            
            {/* Section 1: Basic Profile */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-[#27D980] uppercase tracking-wider border-b border-gym-border/60 pb-1">
                1. Member Personal & Contact Information
              </h4>

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
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 72.5"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white font-bold text-[#27D980] outline-none focus:border-[#4F7CFF]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1 font-bold">Height (cm) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 175"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-[#4F7CFF]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1 font-bold">Chest (cm) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 100"
                    value={formData.chestCm}
                    onChange={(e) => setFormData({ ...formData, chestCm: Number(e.target.value) })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-[#4F7CFF]"
                  />
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-300">
                💡 <span className="font-semibold text-white">Member Self-Service Notice:</span> Extended measurements (Waist, Arms, Thighs, Medical Notes, Emergency Contact, Fitness Goals) will be completed by the member directly inside their mobile app profile upon first login.
              </div>
            </div>

            {/* Section 3: Branch, Plan & Staff Assignment */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider border-b border-gym-border/60 pb-1">
                3. Branch & Membership Plan
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
                    {plans.map((p) => (
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4F7CFF] via-[#27D980] to-emerald-400 text-gym-dark font-black text-sm shadow-xl shadow-[#27D980]/20 hover:scale-[1.01] transition-all cursor-pointer active:scale-95"
            >
              ENROLL MEMBER & AUTO-DISPATCH WHATSAPP PASS 🚀
            </button>

          </form>
        )}

      </div>

    </div>
  );
};
