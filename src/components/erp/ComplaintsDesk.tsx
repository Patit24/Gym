import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { ComplaintTicket } from '../../types/gym';
import { AlertCircle, CheckCircle2, Clock, Plus, X } from 'lucide-react';

export const ComplaintsDesk: React.FC = () => {
  const { complaints, resolveComplaint, createComplaint, selectedBranchId, activeMember } = useGym();
  const [showNewModal, setShowNewModal] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintTicket['category']>('Machine Broken');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [description, setDescription] = useState('');

  const branchComplaints = complaints.filter((c) => c.branchId === selectedBranchId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    createComplaint({
      memberOrStaffName: activeMember?.name || 'Walk-in Member',
      role: 'Member',
      branchId: selectedBranchId,
      category,
      title,
      description,
      priority,
    });

    setTitle('');
    setDescription('');
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#14171F] border border-gym-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gym-border pb-3">
              <h3 className="font-extrabold text-white text-base">Submit Support & Facility Ticket</h3>
              <button onClick={() => setShowNewModal(false)} className="text-gym-subtext hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-gym-subtext mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComplaintTicket['category'])}
                  className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                >
                  <option value="Machine Broken">Machine Broken</option>
                  <option value="AC/Ventilation">AC / Ventilation</option>
                  <option value="Washroom">Washroom / Hygiene</option>
                  <option value="Trainer Issue">Trainer Issue</option>
                  <option value="Payment Issue">Payment Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-gym-subtext mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AC in Zone B not cooling"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gym-subtext mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                  className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                >
                  <option value="High">High (Immediate Action)</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-gym-subtext mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the problem..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0B0D12] border border-gym-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#4F7CFF] text-white font-extrabold text-xs shadow-lg shadow-[#4F7CFF]/20"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-amber-400" />
            Facility Complaint & Ticket Management ({branchComplaints.length})
          </h2>
          <p className="text-xs text-gym-subtext">Track equipment failures, air conditioning tickets, and service requests</p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-blue-600 text-white font-semibold text-xs shadow-lg shadow-[#4F7CFF]/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Report Issue</span>
        </button>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {branchComplaints.map((tkt) => (
          <div
            key={tkt.id}
            className="glass-card rounded-2xl p-5 border border-gym-border hover:border-[#4F7CFF]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gym-subtext bg-[#0B0D12] px-2.5 py-0.5 rounded border border-gym-border">
                  {tkt.id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  tkt.priority === 'High' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {tkt.priority} Priority
                </span>
                <span className="text-xs text-gym-subtext">• {tkt.category}</span>
              </div>

              <h4 className="text-base font-extrabold text-white">{tkt.title}</h4>
              <p className="text-xs text-gym-subtext">{tkt.description}</p>
              <div className="text-[11px] text-slate-400 pt-1">
                Reported by <strong className="text-slate-200">{tkt.memberOrStaffName}</strong> ({tkt.role}) on {tkt.createdAt}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                tkt.status === 'Resolved'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                {tkt.status}
              </span>

              {tkt.status !== 'Resolved' && (
                <button
                  onClick={() => tkt.id && resolveComplaint(tkt.id)}
                  className="px-4 py-2 rounded-xl bg-[#27D980] hover:bg-emerald-400 text-gym-dark font-extrabold text-xs shadow-md shadow-[#27D980]/20 flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Resolved</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
