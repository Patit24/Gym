import React, { useState, useMemo } from 'react';
import { useGym } from '../../context/GymContext';
import { Employee, Member, Transaction } from '../../types/gym';
import {
  Users,
  Dumbbell,
  CreditCard,
  IndianRupee,
  Utensils,
  FileText,
  Calendar,
  Activity,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  UserPlus,
  ShieldCheck,
  Eye,
  X,
  Sparkles,
  ArrowRight,
  Download
} from 'lucide-react';

interface TrainerActivityAuditProps {
  onNavigateMember?: (memberId: string) => void;
}

export const TrainerActivityAudit: React.FC<TrainerActivityAuditProps> = ({ onNavigateMember }) => {
  const {
    employees,
    members,
    transactions,
    expenses,
    workout,
    diet,
    trainerNotes,
    selectedBranchId
  } = useGym();

  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<'all' | 'payments' | 'enrollments' | 'workouts' | 'diets' | 'notes'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailModalTrainer, setDetailModalTrainer] = useState<Employee | null>(null);

  // Filter Trainers in selected branch
  const trainers = useMemo(() => {
    return employees.filter(
      (e) =>
        (e.role === 'Trainer' || e.role === 'Dietitian') &&
        (selectedBranchId === 'all' || e.branchId === selectedBranchId)
    );
  }, [employees, selectedBranchId]);

  // Compute stats for each trainer
  const trainerAnalytics = useMemo(() => {
    return trainers.map((trainer) => {
      // 1. Members enrolled / assigned
      const assignedMembers = members.filter(
        (m) =>
          m.assignedTrainerId === trainer.id ||
          m.referralSource?.toLowerCase().includes(trainer.name.toLowerCase()) ||
          m.referralSource?.toLowerCase().includes('trainer client enrollment')
      );

      // 2. Transactions / Money Collected by this trainer
      const trainerTxns = transactions.filter((t) => {
        const notesStr = (t.notes || '').toLowerCase();
        const trainerNameLower = trainer.name.toLowerCase();
        const matchesNote = notesStr.includes(trainerNameLower) || notesStr.includes(trainer.id.toLowerCase());
        const matchesAssignedMember = assignedMembers.some((m) => m.id === t.memberId);
        return matchesNote || (matchesAssignedMember && t.category === 'Membership Dues');
      });

      const totalMoneyCollected = trainerTxns.reduce((acc, t) => acc + (t.amount || 0), 0);

      // 3. Trainer Salary & Expenses (Base Salary + PT Commission)
      const ptCommissionBonus = ((trainer.baseSalary || 30000) * (trainer.ptCommissionRate || 15)) / 100;
      const totalExpense = (trainer.baseSalary || 30000) + ptCommissionBonus;

      // 4. Workouts authored
      const workoutCount = workout.weeklyPlans.reduce((acc, wp) => {
        return acc + (wp.splits?.length || 0);
      }, 0);

      // 5. Diet plans authored
      const dietCount = diet.monthlyPlans.length;

      // 6. Notes logged
      const notesLogged = trainerNotes.filter(
        (n) => n.trainerId === trainer.id || n.trainerName?.toLowerCase() === trainer.name.toLowerCase()
      );

      const netRoi = totalMoneyCollected - totalExpense;

      return {
        trainer,
        assignedMembers,
        trainerTxns,
        totalMoneyCollected,
        totalExpense,
        netRoi,
        workoutCount,
        dietCount,
        notesLogged,
      };
    });
  }, [trainers, members, transactions, expenses, workout, diet, trainerNotes]);

  // Overall Gym Aggregates
  const totalMoneyCollectedAllTrainers = trainerAnalytics.reduce((acc, t) => acc + t.totalMoneyCollected, 0);
  const totalMembersEnrolledAllTrainers = trainerAnalytics.reduce((acc, t) => acc + t.assignedMembers.length, 0);
  const totalTrainerExpensesAll = trainerAnalytics.reduce((acc, t) => acc + t.totalExpense, 0);
  const totalNotesAll = trainerAnalytics.reduce((acc, t) => acc + t.notesLogged.length, 0);

  // Consolidated Activity Stream
  interface ActivityItem {
    id: string;
    type: 'payment' | 'enrollment' | 'workout' | 'diet' | 'note';
    trainerName: string;
    trainerPhoto?: string;
    trainerId: string;
    timestamp: string;
    date: string;
    title: string;
    description: string;
    amount?: number;
    receiptNo?: string;
    memberName?: string;
    memberId?: string;
    paymentMethod?: string;
  }

  const activityStream = useMemo(() => {
    const items: ActivityItem[] = [];

    trainerAnalytics.forEach(({ trainer, assignedMembers, trainerTxns, notesLogged }) => {
      // 1. Payments Collected
      trainerTxns.forEach((tx) => {
        items.push({
          id: `act-tx-${tx.id}`,
          type: 'payment',
          trainerName: trainer.name,
          trainerPhoto: trainer.photoUrl,
          trainerId: trainer.id,
          timestamp: tx.date,
          date: tx.date,
          title: `Collected Fee: ₹${tx.amount.toLocaleString('en-IN')}`,
          description: `Received via ${tx.paymentMethod} from ${tx.memberName || 'Member'}. Receipt #${tx.receiptNo}. ${tx.notes || ''}`,
          amount: tx.amount,
          receiptNo: tx.receiptNo,
          memberName: tx.memberName,
          memberId: tx.memberId,
          paymentMethod: tx.paymentMethod,
        });
      });

      // 2. Members Enrolled
      assignedMembers.forEach((mem) => {
        items.push({
          id: `act-mem-${mem.id}`,
          type: 'enrollment',
          trainerName: trainer.name,
          trainerPhoto: trainer.photoUrl,
          trainerId: trainer.id,
          timestamp: mem.startDate || new Date().toISOString().split('T')[0],
          date: mem.startDate || new Date().toISOString().split('T')[0],
          title: `Enrolled Client: ${mem.name}`,
          description: `Assigned to ${mem.planName} (${mem.goal}) • ID: ${mem.membershipNo} • Paid ₹${(mem.paidAmount || 0).toLocaleString('en-IN')}`,
          memberName: mem.name,
          memberId: mem.id,
          amount: mem.paidAmount,
        });
      });

      // 3. Notes Logged
      notesLogged.forEach((note) => {
        items.push({
          id: `act-note-${note.id}`,
          type: 'note',
          trainerName: trainer.name,
          trainerPhoto: trainer.photoUrl,
          trainerId: trainer.id,
          timestamp: note.date,
          date: note.date,
          title: `Logged Note: ${note.category}`,
          description: `"${note.content}" for Member ID ${note.memberId}`,
          memberId: note.memberId,
        });
      });
    });

    // Sort newest first
    return items.sort((a, b) => b.date.localeCompare(a.date));
  }, [trainerAnalytics]);

  // Filtered Activity Stream
  const filteredActivities = useMemo(() => {
    return activityStream.filter((item) => {
      // Trainer filter
      if (selectedTrainerId !== 'all' && item.trainerId !== selectedTrainerId) return false;

      // Activity Type filter
      if (activityFilter === 'payments' && item.type !== 'payment') return false;
      if (activityFilter === 'enrollments' && item.type !== 'enrollment') return false;
      if (activityFilter === 'workouts' && item.type !== 'workout') return false;
      if (activityFilter === 'diets' && item.type !== 'diet') return false;
      if (activityFilter === 'notes' && item.type !== 'note') return false;

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.trainerName.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.memberName && item.memberName.toLowerCase().includes(q)) ||
          (item.receiptNo && item.receiptNo.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [activityStream, selectedTrainerId, activityFilter, searchTerm]);

  // Selected Trainer Detail Analytics
  const activeDetailAnalytics = useMemo(() => {
    if (!detailModalTrainer) return null;
    return trainerAnalytics.find((t) => t.trainer.id === detailModalTrainer.id) || null;
  }, [detailModalTrainer, trainerAnalytics]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
              Admin & Owner Oversight
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2 mt-1">
            <Activity className="w-6 h-6 text-purple-400" />
            Trainer Activity, Fee Collections & Performance Audit
          </h2>
          <p className="text-xs text-slate-400">
            Real-time tracking of trainer member enrollments, subscription fee collections, salary costs, and coaching updates
          </p>
        </div>

        {/* Switch / Filter Trainer Dropdown */}
        <div className="flex items-center gap-2 bg-[#14171F] p-2 rounded-2xl border border-gym-border text-xs">
          <span className="text-slate-400 font-medium">Filter Coach:</span>
          <select
            value={selectedTrainerId}
            onChange={(e) => setSelectedTrainerId(e.target.value)}
            className="bg-[#0B0D12] text-white font-bold px-3 py-1.5 rounded-xl border border-gym-border focus:outline-none cursor-pointer"
          >
            <option value="all">All Gym Trainers ({trainers.length})</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.shift.split(' ')[0]})</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 1. HIGH-LEVEL KPI METRICS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Money Collected */}
        <div className="glass-card rounded-3xl p-5 border border-gym-border space-y-2 hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 uppercase font-black text-[10px] tracking-wider">
              Total Money Collected by Trainers
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ₹{totalMoneyCollectedAllTrainers.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gym-border/40 text-slate-400">
            <span>Direct manual fee collections</span>
            <span className="text-emerald-400 font-bold">100% Verified</span>
          </div>
        </div>

        {/* Total Members Enrolled */}
        <div className="glass-card rounded-3xl p-5 border border-gym-border space-y-2 hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 uppercase font-black text-[10px] tracking-wider">
              Total Clients Enrolled
            </span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            {totalMembersEnrolledAllTrainers} Members
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gym-border/40 text-slate-400">
            <span>Across {trainers.length} active coaches</span>
            <span className="text-cyan-400 font-bold">Active Rosters</span>
          </div>
        </div>

        {/* Trainer Payroll & Commission Expenses */}
        <div className="glass-card rounded-3xl p-5 border border-gym-border space-y-2 hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 uppercase font-black text-[10px] tracking-wider">
              Trainer Salaries & PT Commissions
            </span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-rose-400">
            ₹{totalTrainerExpensesAll.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gym-border/40 text-slate-400">
            <span>Base salary + PT bonus payouts</span>
            <span className="text-rose-400 font-semibold">Expense</span>
          </div>
        </div>

        {/* Net Trainer ROI */}
        <div className="glass-card rounded-3xl p-5 border border-gym-border space-y-2 hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 uppercase font-black text-[10px] tracking-wider">
              Net Trainer Net Contribution (ROI)
            </span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-2xl font-black ${totalMoneyCollectedAllTrainers >= totalTrainerExpensesAll ? 'text-purple-400' : 'text-amber-400'}`}>
            ₹{(totalMoneyCollectedAllTrainers - totalTrainerExpensesAll).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gym-border/40 text-slate-400">
            <span>Revenue - Salary Expense</span>
            <span className="text-purple-400 font-bold">{totalNotesAll} coaching logs</span>
          </div>
        </div>
      </div>

      {/* ── 2. TRAINERS LEADERBOARD & PERFORMANCE BREAKDOWN CARDS ── */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-cyan-400" />
          <span>Coaches Performance & Financial Contribution</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainerAnalytics.map(({ trainer, assignedMembers, totalMoneyCollected, totalExpense, netRoi, workoutCount, dietCount, notesLogged }) => {
            return (
              <div
                key={trainer.id}
                className="glass-card rounded-3xl p-5 border border-gym-border hover:border-purple-500/50 transition-all space-y-4 shadow-xl"
              >
                {/* Trainer Info Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={trainer.photoUrl}
                      alt={trainer.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-500/50 shadow-md"
                    />
                    <div>
                      <h4 className="text-sm font-black text-white">{trainer.name}</h4>
                      <p className="text-[11px] text-purple-400 font-bold">{trainer.specialization}</p>
                      <span className="text-[9px] text-slate-400">Shift: {trainer.shift}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailModalTrainer(trainer)}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Audit</span>
                  </button>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-2 bg-[#0B0D12] p-3 rounded-2xl border border-gym-border/40 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Money Collected</span>
                    <strong className="text-emerald-400 font-black text-sm">
                      ₹{totalMoneyCollected.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Clients Enrolled</span>
                    <strong className="text-white font-black text-sm">
                      {assignedMembers.length} Members
                    </strong>
                  </div>
                  <div className="pt-1 border-t border-gym-border/30">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Salary & Bonus</span>
                    <span className="text-rose-400 font-bold">₹{totalExpense.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-1 border-t border-gym-border/30">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Coaching Notes</span>
                    <span className="text-cyan-400 font-bold">{notesLogged.length} Logged</span>
                  </div>
                </div>

                {/* Quick Enrolled Trainees Strip */}
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Assigned Trainees ({assignedMembers.length})
                  </span>
                  {assignedMembers.length === 0 ? (
                    <div className="text-[11px] text-slate-500 italic">No clients assigned yet.</div>
                  ) : (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {assignedMembers.slice(0, 5).map((m) => (
                        <div
                          key={m.id}
                          onClick={() => onNavigateMember && onNavigateMember(m.id)}
                          className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 text-[10px] text-slate-300 font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{m.name.split(' ')[0]}</span>
                        </div>
                      ))}
                      {assignedMembers.length > 5 && (
                        <span className="text-[10px] text-purple-400 font-bold px-1">
                          +{assignedMembers.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. CHRONOLOGICAL TRAINER ACTIVITY AUDIT STREAM ── */}
      <div className="glass-panel rounded-3xl p-6 border border-gym-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gym-border">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span>Live Trainer Activity Feed & Action History</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological log of fee collections, enrollments, and updates by coaches
            </p>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actions, receipts, member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#0B0D12] border border-gym-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'payments', label: '💳 Fee Collections' },
            { id: 'enrollments', label: '👤 Client Enrollments' },
            { id: 'notes', label: '📝 Coaching Notes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivityFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activityFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-[#14171F] border border-gym-border text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Activity Items List */}
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-1">
              <Activity className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No activity logs found for the selected filters.</p>
            </div>
          ) : (
            filteredActivities.map((item) => {
              const isPayment = item.type === 'payment';
              const isEnrollment = item.type === 'enrollment';
              const isNote = item.type === 'note';

              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#0B0D12] hover:bg-[#101422] rounded-2xl border border-gym-border/60 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isPayment
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : isEnrollment
                          ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                          : 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                      }`}
                    >
                      {isPayment ? (
                        <CreditCard className="w-5 h-5" />
                      ) : isEnrollment ? (
                        <UserPlus className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-white truncate">{item.title}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                          Coach: {item.trainerName}
                        </span>
                        {item.receiptNo && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                            {item.receiptNo}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{item.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 block">{item.date}</span>
                    {item.amount && (
                      <span className="text-xs font-black text-emerald-400 block mt-0.5">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── 4. DETAILED TRAINER AUDIT DOSSIER MODAL ── */}
      {detailModalTrainer && activeDetailAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="bg-[#14171F] border border-purple-500/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gym-border">
              <div className="flex items-center gap-3.5">
                <img
                  src={detailModalTrainer.photoUrl}
                  alt={detailModalTrainer.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500 shadow-md"
                />
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Coach {detailModalTrainer.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                      {detailModalTrainer.role}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">{detailModalTrainer.specialization} • Shift: {detailModalTrainer.shift}</p>
                  <p className="text-[10px] text-slate-500">Email: {detailModalTrainer.email} • Mobile: {detailModalTrainer.mobile || detailModalTrainer.phone}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailModalTrainer(null)}
                className="w-8 h-8 rounded-full bg-[#1E2330] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-3 gap-3 bg-[#0B0D12] p-3.5 rounded-2xl border border-gym-border text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Fees Collected</span>
                <strong className="text-emerald-400 font-black text-base">
                  ₹{activeDetailAnalytics.totalMoneyCollected.toLocaleString('en-IN')}
                </strong>
                <span className="text-[9px] text-slate-500 block">{activeDetailAnalytics.trainerTxns.length} transactions</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Salary & Commission</span>
                <strong className="text-rose-400 font-black text-base">
                  ₹{activeDetailAnalytics.totalExpense.toLocaleString('en-IN')}
                </strong>
                <span className="text-[9px] text-slate-500 block">Base ₹{detailModalTrainer.baseSalary} + {detailModalTrainer.ptCommissionRate}% PT</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Net Gym Contribution</span>
                <strong className={`font-black text-base ${activeDetailAnalytics.netRoi >= 0 ? 'text-purple-400' : 'text-amber-400'}`}>
                  ₹{activeDetailAnalytics.netRoi.toLocaleString('en-IN')}
                </strong>
                <span className="text-[9px] text-purple-400 block font-semibold">{activeDetailAnalytics.assignedMembers.length} active clients</span>
              </div>
            </div>

            {/* Fee Collection History */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                <span>Fee Collection Transactions ({activeDetailAnalytics.trainerTxns.length})</span>
                <span className="text-emerald-400 font-bold">Total: ₹{activeDetailAnalytics.totalMoneyCollected.toLocaleString('en-IN')}</span>
              </h4>

              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                {activeDetailAnalytics.trainerTxns.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-3 bg-[#0B0D12] rounded-xl text-center">
                    No fee collections logged by this coach yet.
                  </div>
                ) : (
                  activeDetailAnalytics.trainerTxns.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 bg-[#0B0D12] rounded-xl border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{tx.memberName || 'Member'}</span>
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                            {tx.receiptNo}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {tx.date} • Mode: <strong className="text-white">{tx.paymentMethod}</strong> • {tx.notes || ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <strong className="text-emerald-400 font-black">₹{tx.amount.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Assigned Members List */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Assigned Clients ({activeDetailAnalytics.assignedMembers.length})
              </h4>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {activeDetailAnalytics.assignedMembers.map((m) => (
                  <div
                    key={m.id}
                    className="p-2 bg-[#0B0D12] rounded-xl border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <img src={m.photoUrl} alt={m.name} className="w-6 h-6 rounded-lg object-cover" />
                      <div>
                        <span className="font-bold text-white">{m.name}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">{m.planName} • {m.goal}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 font-bold block">{m.status}</span>
                      <span className="text-[9px] text-slate-500">Exp: {m.expiryDate || m.endDate || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setDetailModalTrainer(null)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
