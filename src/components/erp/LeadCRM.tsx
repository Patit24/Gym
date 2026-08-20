import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Lead, GoalType } from '../../types/gym';
import {
  Users,
  Plus,
  Phone,
  Calendar,
  ChevronRight,
  TrendingUp,
  Target,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';

export const LeadCRM: React.FC = () => {
  const { leads, addLead, updateLeadStage, selectedBranchId } = useGym();
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<Lead['source']>('Instagram');
  const [interestGoal, setInterestGoal] = useState<GoalType>('Muscle Building');
  const [notes, setNotes] = useState('');

  const stages: Lead['stage'][] = ['Walk-in', 'Interested', 'Trial Scheduled', 'Joined', 'Lost'];

  const branchLeads = leads.filter((l) => l.branchId === selectedBranchId);

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addLead({
      name,
      phone,
      email,
      source,
      interestGoal,
      branchId: selectedBranchId,
      stage: 'Walk-in',
      followUpDate: new Date().toISOString().split('T')[0],
      notes,
      assignedStaff: 'Karan Mehra (Reception)',
    });

    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setShowAddLeadModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-[#4F7CFF]" />
            Sales Lead & Conversion CRM ({branchLeads.length} Total Leads)
          </h2>
          <p className="text-xs text-gym-subtext">Kanban conversion pipeline, follow-up calendar, and lead attribution</p>
        </div>

        <button
          onClick={() => setShowAddLeadModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-blue-600 text-white font-semibold text-xs shadow-lg shadow-[#4F7CFF]/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Lead</span>
        </button>
      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#14171F] border border-gym-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gym-border pb-3">
              <h3 className="font-extrabold text-white text-base">Add Lead</h3>
              <button onClick={() => setShowAddLeadModal(false)} className="text-gym-subtext hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-gym-subtext mb-1">Lead Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Siddharth Varma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-gym-subtext mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98000 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-gym-subtext mb-1">Lead Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as Lead['source'])}
                  className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                >
                  <option value="Google">Google</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>
              <div>
                <label className="block text-gym-subtext mb-1">Fitness Goal</label>
                <select
                  value={interestGoal}
                  onChange={(e) => setInterestGoal(e.target.value as GoalType)}
                  className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                >
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Building">Muscle Building</option>
                  <option value="Body Recomposition">Body Recomposition</option>
                </select>
              </div>
              <div>
                <label className="block text-gym-subtext mb-1">Notes</label>
                <textarea
                  placeholder="Inquired about annual VIP membership..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white h-20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#27D980] text-gym-dark font-extrabold text-xs shadow-lg shadow-[#27D980]/20"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = branchLeads.filter((l) => l.stage === stage);

          return (
            <div key={stage} className="bg-[#14171F]/80 rounded-2xl p-4 border border-gym-border flex flex-col min-w-[240px]">
              
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gym-border/60 mb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${stage === 'Joined' ? 'bg-[#27D980]' : stage === 'Lost' ? 'bg-rose-500' : 'bg-[#4F7CFF]'}`} />
                  {stage}
                </span>
                <span className="text-[11px] font-bold text-gym-subtext bg-[#0B0D12] px-2 py-0.5 rounded-md border border-gym-border">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[60vh] pr-1">
                {stageLeads.map((l) => (
                  <div
                    key={l.id}
                    className="p-3.5 rounded-xl bg-[#0B0D12] border border-gym-border/60 hover:border-[#4F7CFF]/40 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white group-hover:text-[#4F7CFF] transition-colors">{l.name}</h4>
                      <span className="text-[9px] font-semibold text-gym-subtext bg-[#1E2330] px-2 py-0.5 rounded border border-gym-border">
                        {l.source}
                      </span>
                    </div>

                    <p className="text-[11px] text-gym-subtext leading-snug line-clamp-2">{l.notes}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-gym-border/40">
                      <span className="flex items-center gap-1 text-[#27D980]">
                        <Phone className="w-3 h-3" /> {l.phone}
                      </span>
                    </div>

                    {/* Stage Switcher buttons */}
                    <div className="pt-2 flex items-center justify-between gap-1 text-[10px]">
                      {stage !== 'Walk-in' && (
                        <button
                          onClick={() => updateLeadStage(l.id, stages[stages.indexOf(stage) - 1])}
                          className="px-2 py-1 rounded bg-[#1E2330] text-slate-400 hover:text-white"
                        >
                          ← Prev
                        </button>
                      )}
                      {stage !== 'Lost' && (
                        <button
                          onClick={() => updateLeadStage(l.id, stages[stages.indexOf(stage) + 1])}
                          className="px-2 py-1 rounded bg-[#4F7CFF]/20 text-[#4F7CFF] hover:bg-[#4F7CFF] hover:text-white ml-auto font-bold"
                        >
                          Next →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
