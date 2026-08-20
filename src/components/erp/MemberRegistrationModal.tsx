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
    dob: '1996-05-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    heightCm: 175,
    weightKg: 78.0,
    startWeightKg: 82.5,
    chestCm: 104,
    waistCm: 84,
    armsCm: 38.5,
    thighsCm: 56,
    bloodGroup: 'O+',
    emergencyContactName: '',
    emergencyMobile: '',
    address: '',
    medicalHistory: 'None',
    goal: 'Muscle Building' as Member['goal'],
    referralSource: 'Walk-in',
    branchId: 'branch-1' as BranchId,
    planId: 'plan-1',
    assignedTrainerId: trainers[0]?.id || '',
    assignedDietitianId: dietitians[0]?.id || '',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    faceEnrolled: true,
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
    const heightInM = formData.heightCm / 100;
    const bmiVal = Number((formData.weightKg / (heightInM * heightInM)).toFixed(1));

    const startDateStr = new Date().toISOString().split('T')[0];
    const endDateObj = new Date();
    endDateObj.setMonth(endDateObj.getMonth() + selectedPlan.durationMonths);
    const endDateStr = endDateObj.toISOString().split('T')[0];

    const newMem = await addMember({
      name: formData.name || 'New Member',
      photoUrl: formData.photoUrl,
      faceEnrolled: formData.faceEnrolled,
      mobile: formData.mobile || '+91 98765 43210',
      email: formData.email || 'member@smartgym.com',
      dob: formData.dob,
      gender: formData.gender,
      heightCm: formData.heightCm,
      weightKg: formData.weightKg,
      startWeightKg: formData.startWeightKg,
      bmi: bmiVal,
      chestCm: formData.chestCm,
      waistCm: formData.waistCm,
      armsCm: formData.armsCm,
      thighsCm: formData.thighsCm,
      bloodGroup: formData.bloodGroup,
      emergencyContactName: formData.emergencyContactName || 'Emergency Contact',
      emergencyMobile: formData.emergencyMobile || '+91 98765 00000',
      address: formData.address || 'Smart Gym City',
      medicalHistory: formData.medicalHistory,
      goal: formData.goal,
      referralSource: formData.referralSource,
      branchId: formData.branchId,
      planId: formData.planId,
      planName: selectedPlan.name,
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
      <div className="relative w-full max-w-3xl bg-[#14171F] border border-gym-border rounded-[32px] shadow-2xl shadow-[#27D980]/10 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gym-border flex items-center justify-between bg-[#0B0D12]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#27D980]/20 text-[#27D980]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="member-modal-title" className="text-base font-extrabold text-white">New Member Registration</h3>
              <p className="text-xs text-gym-subtext">2026 Smart Gym Onboarding Form</p>
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
              <h3 className="text-xl font-extrabold text-white">Registration Successful! 🎉</h3>
              <p className="text-xs text-gym-subtext mt-1">
                Auto-Issued Member ID: <strong className="text-[#27D980]">{createdMember.id}</strong> | Membership No: <strong className="text-[#4F7CFF]">{createdMember.membershipNo}</strong>
              </p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-gym-border max-w-sm mx-auto space-y-2 text-xs text-left">
              <div className="flex justify-between">
                <span>Member Name:</span> <strong className="text-white">{createdMember.name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Starting Weight:</span> <strong className="text-white">{createdMember.startWeightKg} kg</strong>
              </div>
              <div className="flex justify-between">
                <span>Body Measurements:</span> <strong className="text-[#27D980]">Chest: {createdMember.chestCm}cm | Waist: {createdMember.waistCm}cm | Arms: {createdMember.armsCm}cm</strong>
              </div>
              <div className="flex justify-between">
                <span>Assigned Plan:</span> <strong className="text-[#4F7CFF]">{createdMember.planName}</strong>
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
                1. Basic Personal Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="member@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Fitness Goal</label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value as any })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Body Recomposition">Body Recomposition</option>
                    <option value="Endurance & Cardio">Endurance & Cardio</option>
                    <option value="Rehab & Mobility">Rehab & Mobility</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Weight & Body Measurements (REQUESTED BY USER) */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-[#4F7CFF] uppercase tracking-wider border-b border-gym-border/60 pb-1">
                2. Starting Weight & Body Measurements
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Starting Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.startWeightKg}
                    onChange={(e) => setFormData({ ...formData, startWeightKg: Number(e.target.value) })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Current Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white font-bold text-[#27D980]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Chest Size (cm)</label>
                  <input
                    type="number"
                    value={formData.chestCm}
                    onChange={(e) => setFormData({ ...formData, chestCm: Number(e.target.value) })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Waist Size (cm)</label>
                  <input
                    type="number"
                    value={formData.waistCm}
                    onChange={(e) => setFormData({ ...formData, waistCm: Number(e.target.value) })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Arms Size (cm)</label>
                  <input
                    type="number"
                    value={formData.armsCm}
                    onChange={(e) => setFormData({ ...formData, armsCm: Number(e.target.value) })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Thighs Size (cm)</label>
                  <input
                    type="number"
                    value={formData.thighsCm}
                    onChange={(e) => setFormData({ ...formData, thighsCm: Number(e.target.value) })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Medical & Emergency */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider border-b border-gym-border/60 pb-1">
                3. Medical History & Emergency Contact
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Medical Conditions / History</label>
                  <input
                    type="text"
                    placeholder="e.g. Lower Back Tightness / None"
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Anita Sharma"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Emergency Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98112 00000"
                    value={formData.emergencyMobile}
                    onChange={(e) => setFormData({ ...formData, emergencyMobile: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Branch, Plan & Staff Assignment */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider border-b border-gym-border/60 pb-1">
                4. Plan & Staff Assignment
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Assign Branch</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value as BranchId })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Membership Plan</label>
                  <select
                    value={formData.planId}
                    onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white font-bold"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (₹{p.totalPrice.toLocaleString('en-IN')})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gym-subtext mb-1">Assign Personal Trainer</label>
                  <select
                    value={formData.assignedTrainerId}
                    onChange={(e) => setFormData({ ...formData, assignedTrainerId: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                  >
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
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4F7CFF] via-[#27D980] to-emerald-400 text-gym-dark font-black text-sm shadow-xl shadow-[#27D980]/20 hover:scale-[1.01] transition-all cursor-pointer"
            >
              COMPLETE MEMBER REGISTRATION & AUTO-ISSUE DYNAMIC QR PASS 🚀
            </button>

          </form>
        )}

      </div>

    </div>
  );
};
