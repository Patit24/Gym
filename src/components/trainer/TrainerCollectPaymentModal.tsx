import React, { useState, useMemo } from 'react';
import { useGym } from '../../context/GymContext';
import { Member, Employee, Transaction } from '../../types/gym';
import {
  CreditCard,
  CheckCircle2,
  X,
  User,
  Calendar,
  IndianRupee,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  Receipt,
  Share2,
  AlertCircle,
  Search,
  RefreshCw
} from 'lucide-react';

interface TrainerCollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedMember?: Member | null;
  currentTrainer: Employee;
  onPaymentRecorded?: (tx: Transaction) => void;
}

export const TrainerCollectPaymentModal: React.FC<TrainerCollectPaymentModalProps> = ({
  isOpen,
  onClose,
  preSelectedMember,
  currentTrainer,
  onPaymentRecorded,
}) => {
  const { members, plans, renewSubscription, selectedBranchId } = useGym();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    preSelectedMember?.id || ''
  );
  const [isChangingMember, setIsChangingMember] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [durationMonths, setDurationMonths] = useState<number>(2); // Default 2 Months
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    plans[0]?.id || 'plan-monthly'
  );
  const [amount, setAmount] = useState<number>(2500);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer'>('Cash');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successReceipt, setSuccessReceipt] = useState<{
    tx: Transaction;
    newEndDate: string;
    memberName: string;
    months: number;
    amount: number;
  } | null>(null);

  // Sync preSelectedMember if changed
  React.useEffect(() => {
    if (preSelectedMember?.id) {
      setSelectedMemberId(preSelectedMember.id);
      // Auto suggest appropriate plan if available
      if (preSelectedMember.planId) {
        setSelectedPlanId(preSelectedMember.planId);
      }
    } else if (!selectedMemberId && members.length > 0) {
      setSelectedMemberId(members[0].id);
    }
  }, [preSelectedMember, members, selectedMemberId]);

  // Selected Member Object
  const currentMember = useMemo(() => {
    return members.find((m) => m.id === selectedMemberId) || preSelectedMember || null;
  }, [members, selectedMemberId, preSelectedMember]);

  // Filtered members list for search
  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members.slice(0, 8);
    const q = memberSearch.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.mobile.includes(q) ||
        m.membershipNo.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [members, memberSearch]);

  // Calculate live extended expiry date preview
  const liveExtendedExpiry = useMemo(() => {
    const today = new Date();
    let baseDate = new Date(today);
    
    if (currentMember?.expiryDate || currentMember?.endDate) {
      const exp = new Date(currentMember.expiryDate || currentMember.endDate || '');
      if (!isNaN(exp.getTime()) && exp > today) {
        baseDate = new Date(exp);
      }
    }
    
    const newExp = new Date(baseDate);
    newExp.setMonth(newExp.getMonth() + (Number(durationMonths) || 1));
    return newExp.toISOString().split('T')[0];
  }, [currentMember, durationMonths]);

  // Handle Duration Change
  const handleDurationChange = (months: number) => {
    setDurationMonths(months);
    // Suggest standard pricing based on months if available
    const matchingPlan = plans.find((p) => p.durationMonths === months);
    if (matchingPlan) {
      setSelectedPlanId(matchingPlan.id);
      setAmount(matchingPlan.totalPrice || matchingPlan.basePrice || months * 1250);
    } else {
      // Default ₹1,250 - ₹1,500/mo calculation
      setAmount(months * 1250);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setErrorMsg('Please select a member.');
      return;
    }

    if (!amount || amount <= 0) {
      setErrorMsg('Please enter a valid payment amount.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const trainerNoteText = `Collected by Trainer ${currentTrainer.name} (${currentTrainer.role}) | ${durationMonths} Months pass extended${notes ? ' - ' + notes : ''}`;

      const result = await renewSubscription(
        selectedMemberId,
        selectedPlanId,
        paymentMethod,
        Number(amount),
        Number(durationMonths),
        trainerNoteText
      );

      if (result.success) {
        setSuccessReceipt({
          tx: result.transaction,
          newEndDate: result.newEndDate,
          memberName: currentMember?.name || 'Member',
          months: result.durationMonths,
          amount: result.amount,
        });
        if (onPaymentRecorded) {
          onPaymentRecorded(result.transaction);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to record payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessReceipt(null);
    setErrorMsg('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={handleResetAndClose}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0B0E17] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#101422] to-[#151A2E] border-b border-white/10 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Collect Subscription Fee
              </h2>
              <p className="text-[11px] text-slate-400">
                Coach: <strong className="text-white">{currentTrainer.name}</strong> • Manual Fee Collection
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success View */}
        {successReceipt ? (
          <div className="p-6 space-y-5 text-center animate-in zoom-in-95 duration-200 overflow-y-auto overscroll-contain flex-1 min-h-0">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
                ✓ Payment Recorded Successfully
              </span>
              <h3 className="text-xl font-black text-white mt-2.5">
                ₹{successReceipt.amount.toLocaleString('en-IN')} Received
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Extended <strong className="text-white">{successReceipt.memberName}</strong>'s subscription by{' '}
                <strong className="text-emerald-400">{successReceipt.months} Month(s)</strong>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 bg-[#101422] rounded-2xl border border-white/10 text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-slate-400">Receipt Number</span>
                <span className="font-mono font-bold text-white">{successReceipt.tx.receiptNo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Member Name</span>
                <span className="font-bold text-white">{successReceipt.memberName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Duration Added</span>
                <span className="font-bold text-emerald-400">+{successReceipt.months} Months</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">New Expiry Date</span>
                <span className="font-bold text-white">{successReceipt.newEndDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment Mode</span>
                <span className="font-bold text-white">{successReceipt.tx.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <span className="text-slate-400">Recorded By</span>
                <span className="text-[11px] text-slate-300">Coach {currentTrainer.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const msg = `*SMART GYM RECEIPT*\nMember: ${successReceipt.memberName}\nAmount: ₹${successReceipt.amount}\nDuration: ${successReceipt.months} Months\nValid Until: ${successReceipt.newEndDate}\nReceipt No: ${successReceipt.tx.receiptNo}\nCollected By: Coach ${currentTrainer.name}`;
                  const waUrl = `https://wa.me/${currentMember?.mobile?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(msg)}`;
                  window.open(waUrl, '_blank');
                }}
                className="flex-1 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp Receipt</span>
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-indigo-600 hover:from-[#3D69EB] hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#4F7CFF]/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Done</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain flex-1 min-h-0">
            
            {errorMsg && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1: Member Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  1. Select Member *
                </label>
                <button
                  type="button"
                  onClick={() => setIsChangingMember(!isChangingMember)}
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Search className="w-3 h-3" />
                  <span>{isChangingMember ? '✕ Hide Search' : '🔄 Change / Search Member'}</span>
                </button>
              </div>

              {/* Current Selected Member Card */}
              {currentMember && !isChangingMember && (
                <div
                  onClick={() => setIsChangingMember(true)}
                  className="p-3 bg-[#101422] hover:bg-[#151A2E] rounded-2xl border border-white/10 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={currentMember.photoUrl}
                      alt={currentMember.name}
                      className="w-10 h-10 rounded-xl object-cover border border-white/20 group-hover:border-cyan-400 transition-colors"
                    />
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>{currentMember.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {currentMember.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {currentMember.membershipNo} • {currentMember.mobile}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block">Current Expiry</span>
                    <span className="text-[10px] font-bold text-amber-400">
                      {currentMember.expiryDate || currentMember.endDate || 'Expired'}
                    </span>
                    <span className="text-[9px] text-cyan-400 font-bold block mt-0.5 group-hover:underline">
                      Click to Change →
                    </span>
                  </div>
                </div>
              )}

              {/* Search & Selector Drawer */}
              {(isChangingMember || !currentMember) && (
                <div className="p-3 bg-[#101422] rounded-2xl border border-cyan-500/30 space-y-2.5 animate-in fade-in">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Type member name, mobile, or ID to search..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      autoFocus
                      className="w-full pl-9 pr-3 py-2 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Filtered Members Quick Click List */}
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {filteredMembers.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400 font-medium">
                        No members found matching "{memberSearch}"
                      </div>
                    ) : (
                      filteredMembers.map((m) => {
                        const isChosen = m.id === selectedMemberId;
                        return (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedMemberId(m.id);
                              if (m.planId) setSelectedPlanId(m.planId);
                              setIsChangingMember(false);
                            }}
                            className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                              isChosen
                                ? 'bg-cyan-500/15 border-cyan-500 text-white'
                                : 'bg-[#0B0E17] border-white/5 hover:border-white/20 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={m.photoUrl}
                                alt={m.name}
                                className="w-7 h-7 rounded-lg object-cover border border-white/10"
                              />
                              <div>
                                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                  <span>{m.name}</span>
                                  {isChosen && <span className="text-[9px] text-cyan-400 font-bold">✓ Selected</span>}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {m.membershipNo} • {m.mobile}
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-[10px]">
                              <span className="text-slate-400 block">{m.planName}</span>
                              <span className="text-amber-400 font-medium">Exp: {m.expiryDate || m.endDate || 'N/A'}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Duration Selector (1M, 2M, 3M, 6M, 12M) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  2. Subscription Duration (Months) *
                </label>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {durationMonths} Month{durationMonths > 1 ? 's' : ''} Extension
                </span>
              </div>

              {/* Quick Duration Buttons */}
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {[1, 2, 3, 6, 12].map((m) => {
                  const isSelected = durationMonths === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleDurationChange(m)}
                      className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30 scale-105'
                          : 'bg-[#101422] text-slate-300 border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {m}M {m === 2 ? '⭐' : ''}
                    </button>
                  );
                })}
              </div>

              {/* Custom Month Stepper */}
              <div className="p-2.5 bg-[#101422] rounded-xl border border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-bold">Custom Duration:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDurationChange(Math.max(1, durationMonths - 1))}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-black text-white px-2 min-w-[30px] text-center">
                    {durationMonths} M
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDurationChange(durationMonths + 1)}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Expiry Extension Live Preview Card */}
            <div className="p-3 bg-gradient-to-r from-emerald-500/10 via-[#101422] to-cyan-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Current Status</span>
                  <span className="text-xs font-bold text-slate-200">
                    {currentMember?.expiryDate || currentMember?.endDate || 'Expired / New'}
                  </span>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />

              <div className="text-right">
                <span className="text-[10px] text-emerald-400 font-bold block">New Extended Expiry</span>
                <span className="text-xs font-black text-white">
                  {liveExtendedExpiry}
                </span>
              </div>
            </div>

            {/* Step 3: Payment Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  3. Enter Amount Received (₹) *
                </label>
                <span className="text-[10px] text-slate-400">Strictly single fee input</span>
              </div>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">
                  ₹
                </div>
                <input
                  type="number"
                  min="1"
                  step="50"
                  required
                  placeholder="e.g. 2500"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 bg-[#101422] rounded-2xl border border-white/10 text-base font-black text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
                {[1200, 2000, 2500, 3500, 5000, 7500, 10000].map((quickAmt) => (
                  <button
                    key={quickAmt}
                    type="button"
                    onClick={() => setAmount(quickAmt)}
                    className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-slate-300 shrink-0 cursor-pointer"
                  >
                    ₹{quickAmt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Payment Mode */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                4. Payment Mode *
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Cash', 'UPI', 'Card', 'Bank Transfer'] as const).map((mode) => {
                  const isSelected = paymentMethod === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMethod(mode)}
                      className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#4F7CFF] text-white border-[#4F7CFF] shadow-md shadow-[#4F7CFF]/30'
                          : 'bg-[#101422] text-slate-300 border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {mode === 'Cash' ? '💵 Cash' : mode === 'UPI' ? '📱 UPI' : mode === 'Card' ? '💳 Card' : '🏦 Bank'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 5: Optional Notes */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                Optional Reference / Remarks
              </label>
              <input
                type="text"
                placeholder="e.g. Paid in cash on floor / GPay Ref #12345"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-[#101422] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF]"
              />
            </div>

            {/* Privacy & Restriction Notice */}
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2 text-[10px] text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>
                Trainer Security Protected: Recording this payment automatically extends the member's subscription and emits a verified transaction receipt. Financial dashboard is restricted.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing || !selectedMemberId || !amount}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 disabled:opacity-50 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Recording Payment & Extending...'
                    : `Confirm & Extend by ${durationMonths} Month(s) (₹${(amount || 0).toLocaleString('en-IN')})`}
                </span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
