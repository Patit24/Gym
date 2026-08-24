import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Member } from '../../types/gym';
import {
  User,
  Ruler,
  Scale,
  HeartPulse,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Activity
} from 'lucide-react';

export const MemberProfileEditor: React.FC = () => {
  const { activeMember, updateMember } = useGym();

  const [formData, setFormData] = useState({
    name: activeMember?.name || '',
    mobile: activeMember?.mobile || '',
    email: activeMember?.email || '',
    dob: activeMember?.dob || '1998-01-01',
    gender: activeMember?.gender || 'Male',
    heightCm: activeMember?.heightCm || 170,
    weightKg: activeMember?.weightKg || 70,
    chestCm: activeMember?.chestCm || 95,
    waistCm: activeMember?.waistCm || 0,
    armsCm: activeMember?.armsCm || 0,
    thighsCm: activeMember?.thighsCm || 0,
    bloodGroup: activeMember?.bloodGroup || '',
    emergencyContactName: activeMember?.emergencyContactName || '',
    emergencyMobile: activeMember?.emergencyMobile || '',
    address: activeMember?.address || '',
    medicalHistory: activeMember?.medicalHistory || 'None',
    goal: (activeMember?.goal || 'Muscle Building') as Member['goal'],
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMember?.id) {
      setError('No active member session found.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const heightInM = Math.max(1, formData.heightCm) / 100;
      const bmiVal = Number((formData.weightKg / (heightInM * heightInM)).toFixed(1));

      const updatedPayload: Partial<Member> = {
        name: formData.name.trim() || activeMember.name,
        email: formData.email.trim(),
        dob: formData.dob,
        gender: formData.gender,
        heightCm: Number(formData.heightCm) || activeMember.heightCm,
        weightKg: Number(formData.weightKg) || activeMember.weightKg,
        bmi: bmiVal,
        chestCm: Number(formData.chestCm) || activeMember.chestCm,
        waistCm: Number(formData.waistCm) || 0,
        armsCm: Number(formData.armsCm) || 0,
        thighsCm: Number(formData.thighsCm) || 0,
        bloodGroup: formData.bloodGroup.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyMobile: formData.emergencyMobile.trim(),
        address: formData.address.trim(),
        medicalHistory: formData.medicalHistory.trim(),
        goal: formData.goal,
      };

      await updateMember(activeMember.id, updatedPayload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 text-xs">
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#121E19] via-[#0E1714] to-[#0A100E] border border-[#27D980]/30 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#27D980]/20 text-[#27D980] flex items-center justify-center border border-[#27D980]/40">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">My Fitness & Health Profile</h3>
            <p className="text-[10px] text-slate-400">Manage body tape measurements & medical info</p>
          </div>
        </div>
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30">
          Member Self-Service
        </span>
      </div>

      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#27D980] shrink-0" />
          <span>✓ Profile & body measurements updated in database successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-xs font-extrabold text-[#4F7CFF] uppercase tracking-wider flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-[#4F7CFF]" />
              <span>Body Measurements (cm)</span>
            </h4>
            <span className="text-[10px] text-slate-400">Keep updated weekly</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold">Current Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                className="w-full bg-[#0B0E17] border border-white/15 focus:border-[#27D980] rounded-xl px-3 py-2 text-white font-black text-[#27D980] outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold">Height (cm) *</label>
              <input
                type="number"
                required
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                className="w-full bg-[#0B0E17] border border-white/15 focus:border-[#4F7CFF] rounded-xl px-3 py-2 text-white font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold">Chest (cm)</label>
              <input
                type="number"
                value={formData.chestCm}
                onChange={(e) => setFormData({ ...formData, chestCm: Number(e.target.value) })}
                className="w-full bg-[#0B0E17] border border-white/15 focus:border-[#4F7CFF] rounded-xl px-3 py-2 text-white font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold">Waist (cm)</label>
              <input
                type="number"
                placeholder="e.g. 82"
                value={formData.waistCm || ''}
                onChange={(e) => setFormData({ ...formData, waistCm: Number(e.target.value) })}
                className="w-full bg-[#0B0E17] border border-white/15 focus:border-[#27D980] rounded-xl px-3 py-2 text-white font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold">Arms / Biceps (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 38"
                value={formData.armsCm || ''}
                onChange={(e) => setFormData({ ...formData, armsCm: Number(e.target.value) })}
                className="w-full bg-[#0B0E17] border border-white/15 focus:border-[#27D980] rounded-xl px-3 py-2 text-white font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold">Thighs (cm)</label>
              <input
                type="number"
                placeholder="e.g. 56"
                value={formData.thighsCm || ''}
                onChange={(e) => setFormData({ ...formData, thighsCm: Number(e.target.value) })}
                className="w-full bg-[#0B0E17] border border-white/15 focus:border-[#27D980] rounded-xl px-3 py-2 text-white font-bold outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-xs font-extrabold text-[#27D980] uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-[#27D980]" />
              <span>Goal & Health Profile</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold">Primary Fitness Goal</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value as any })}
                className="w-full bg-[#0B0E17] border border-white/15 focus:border-[#27D980] rounded-xl px-3 py-2 text-white font-bold outline-none"
              >
                <option value="Muscle Building">Muscle Building</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Body Recomposition">Body Recomposition</option>
                <option value="Endurance & Cardio">Endurance & Cardio</option>
                <option value="Rehab & Mobility">Rehab & Mobility</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold">Blood Group</label>
              <input
                type="text"
                placeholder="e.g. O+, B+, A+"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full bg-[#0B0E17] border border-white/15 focus:border-[#27D980] rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1 font-bold">Medical Conditions & Injury Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Lower back pain, asthma, food allergies, or None"
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              className="w-full bg-[#0B0E17] border border-white/15 focus:border-[#27D980] rounded-xl px-3 py-2 text-white outline-none resize-none"
            />
          </div>
        </div>

        <div className="p-4 bg-[#101422] rounded-3xl border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Emergency Contact & Address</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold">Emergency Contact Name</label>
              <input
                type="text"
                placeholder="e.g. Parent / Spouse Name"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                className="w-full bg-[#0B0E17] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold">Emergency Contact Mobile</label>
              <input
                type="tel"
                placeholder="+91 98765 00000"
                value={formData.emergencyMobile}
                onChange={(e) => setFormData({ ...formData, emergencyMobile: e.target.value })}
                className="w-full bg-[#0B0E17] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1 font-bold">Residential Address</label>
            <input
              type="text"
              placeholder="e.g. Flat 301, Lakeview Heights, Bangalore"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-[#0B0E17] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-[#27D980] hover:bg-[#20BE6F] active:scale-95 text-black font-black text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving to Database...' : 'Save Profile & Body Metrics'}</span>
        </button>
      </form>
    </div>
  );
};
