import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { PrivilegePassCard } from '../shared/PrivilegePassCard';
import {
  CreditCard,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  PauseCircle,
  Receipt,
  Download,
  DollarSign,
  ArrowUpRight,
  X,
  Lock
} from 'lucide-react';

export const SubscriptionCard: React.FC = () => {
  const { activeMember, plans, renewSubscription, freezeMembership, membershipFreezes } = useGym();
  const [renewSuccess, setRenewSuccess] = useState(false);
  const [freezeSuccess, setFreezeSuccess] = useState(false);
  
  // Freeze Modal State
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeStartDate, setFreezeStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [freezeEndDate, setFreezeEndDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [freezeReason, setFreezeReason] = useState('Medical / Travel');

  // Pay Dues Modal
  const [showPayDuesModal, setShowPayDuesModal] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const currentPlan = plans.find((p) => p.id === activeMember?.planId) || plans[0] || {
    id: 'PLAN-001',
    name: 'Platinum Annual VIP',
    totalPrice: 18999,
    includedAddons: ['VIP Lounge', 'Sauna Access', 'Trainer Guidance']
  };

  const startDateStr = activeMember?.startDate || '2026-01-10';
  const endDateStr = activeMember?.endDate || activeMember?.expiryDate || '2027-01-09';

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const today = new Date();

  const totalDurationDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const usagePercent = Math.min(100, Math.round((daysElapsed / totalDurationDays) * 100));
  const isExpiringSoon = daysRemaining <= 30 || activeMember?.status === 'Expiring Soon' || activeMember?.status === 'Renewal Due';
  const isFrozen = activeMember?.status === 'Frozen';

  const memberFreezes = membershipFreezes.filter((f) => f.memberId === activeMember?.id);

  const handleRenew = () => {
    if (renewSubscription && activeMember) {
      renewSubscription(activeMember.id, currentPlan.id);
    }
    setRenewSuccess(true);
    setTimeout(() => setRenewSuccess(false), 4000);
  };

  const handleFreezeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMember) return;

    await freezeMembership({
      memberId: activeMember.id,
      startDate: freezeStartDate,
      endDate: freezeEndDate,
      reason: freezeReason,
      approvedBy: 'Admin / Self Service',
    });

    setShowFreezeModal(false);
    setFreezeSuccess(true);
    setTimeout(() => setFreezeSuccess(false), 4000);
  };

  const handlePayDues = () => {
    setPaySuccess(true);
    setTimeout(() => {
      setPaySuccess(false);
      setShowPayDuesModal(false);
    }, 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 text-xs">
      
      {/* ── LUXURY PRIVILEGE MEMBERSHIP CARD ── */}
      <div className="flex justify-center">
        <PrivilegePassCard
          member={activeMember}
          priorityText={activeMember?.planName?.includes('VIP') ? 'PRIORITY' : 'VIP PASS'}
          showFlipButton={true}
        />
      </div>

      {/* Subscription Summary Glass Panel */}
      <div className="rounded-[28px] p-5 border border-white/15 bg-gradient-to-br from-[#1A1F30]/90 to-[#0F1322]/90 space-y-4 shadow-2xl backdrop-blur-xl">
        
        {/* Status Badge & Plan Title */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span className="text-[10px] font-black text-[#E5A93C] uppercase tracking-wider">Current Active Plan</span>
            <h3 className="text-sm font-extrabold text-white mt-0.5">{activeMember?.planName || currentPlan.name}</h3>
          </div>

          <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
            isFrozen
              ? 'bg-blue-500/20 text-cyan-300 border-cyan-400'
              : isExpiringSoon
              ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse'
              : 'bg-emerald-500/20 text-[#27D980] border-[#27D980]/40'
          }`}>
            {activeMember?.status || 'Active Pass'}
          </span>
        </div>

        {/* Start Date & Expiry Date Cards */}
        <div className="grid grid-cols-2 gap-2.5 text-center">
          <div className="p-3 rounded-2xl bg-[#0B0E17] border border-white/10 space-y-1 shadow-inner">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Valid From
            </span>
            <strong className="text-white text-xs font-black block font-mono">{startDateStr}</strong>
          </div>

          <div className="p-3 rounded-2xl bg-[#0B0E17] border border-white/10 space-y-1 shadow-inner">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#E5A93C]" />
              Expiry Date
            </span>
            <strong className="text-[#E5A93C] text-xs font-black block font-mono">{endDateStr}</strong>
          </div>
        </div>

        {/* Days Remaining Countdown Meter */}
        <div className="space-y-2 bg-[#0B0E17] p-3.5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Validity Meter:
            </span>
            <span className="font-extrabold text-white text-xs">
              <strong className={isExpiringSoon ? 'text-amber-400 font-black' : 'text-[#27D980] font-black'}>
                {daysRemaining} Days
              </strong> Remaining
            </span>
          </div>

          <div className="w-full bg-[#141724] h-2.5 rounded-full overflow-hidden p-[1px] border border-white/10">
            <div
              className={`h-full rounded-full transition-all ${
                isExpiringSoon
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-cyan-400 via-[#E5A93C] to-[#27D980]'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400">
            <span>{usagePercent}% Duration Used</span>
            <span>{totalDurationDays} Total Days</span>
          </div>
        </div>

        {/* Action Buttons Matrix: Renew, Upgrade, Freeze */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleRenew}
            className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#E5A93C] via-[#F4B740] to-orange-500 text-black font-black text-xs shadow-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Renew Plan</span>
          </button>

          <button
            onClick={() => setShowFreezeModal(true)}
            className="py-2.5 px-3 rounded-2xl bg-[#0B0E17] hover:bg-white/10 text-cyan-300 border border-cyan-500/30 font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <PauseCircle className="w-3.5 h-3.5" />
            <span>Freeze Pass</span>
          </button>
        </div>

        {/* Included Amenities List */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-black text-[#E5A93C] uppercase tracking-wider">Included Privilege Amenities</span>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {currentPlan.includedAddons?.map((addon, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-slate-200 bg-[#0B0E17] p-2 rounded-xl border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#27D980] shrink-0" />
                <span className="truncate text-[11px]">{addon}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Outstanding Dues Notice (If balance exists) */}
      {(activeMember?.balanceDue || 0) > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-red-950/40 via-[#1A1017] to-[#120B10] border border-red-500/40 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider">OUTSTANDING INVOICE</span>
            <div className="text-sm font-black text-white">₹{activeMember?.balanceDue?.toLocaleString('en-IN')} Due</div>
          </div>
          <button
            onClick={() => setShowPayDuesModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-lg shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
          >
            Pay Now
          </button>
        </div>
      )}

      {/* Expiry Notification Alert Banner */}
      {isExpiringSoon && (
        <div className="p-3.5 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-100 space-y-1 shadow-xl animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-extrabold text-white text-xs">Membership Expiring Soon</h4>
              <p className="text-[11px] text-amber-200 font-medium">
                Pass ends on <strong>{endDateStr}</strong> ({daysRemaining} days left). Renew now to maintain uninterrupted access.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Renew Success Alert */}
      {renewSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-500/30 border border-emerald-400 text-emerald-100 text-xs font-black text-center shadow-2xl">
          🎉 MEMBERSHIP EXTENDED SUCCESSFULLY! 12 months added to your Privilege Pass.
        </div>
      )}

      {/* Freeze Success Alert */}
      {freezeSuccess && (
        <div className="p-3 rounded-2xl bg-cyan-500/30 border border-cyan-400 text-cyan-100 text-xs font-black text-center shadow-2xl">
          ❄️ MEMBERSHIP PAUSED. Your expiration date has been extended by freeze duration.
        </div>
      )}

      {/* Payment History Ledger */}
      <div className="rounded-[28px] p-5 border border-white/10 bg-[#0F1322] space-y-3 shadow-xl">
        <h4 className="text-xs font-black text-white flex items-center justify-between border-b border-white/5 pb-2">
          <span className="flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-cyan-400" />
            Payment History Ledger
          </span>
          <span className="text-[10px] text-slate-400 font-normal">All Transactions</span>
        </h4>

        <div className="space-y-2">
          {/* Active Member's Receipt Record */}
          <div className="p-3 rounded-2xl bg-[#070A10] border border-white/5 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <strong className="text-white text-xs">{activeMember?.planName || currentPlan.name}</strong>
              <div className="text-[10px] text-slate-400">{startDateStr} • Paid via UPI</div>
            </div>
            <div className="text-right">
              <div className="text-emerald-400 font-black text-xs">₹{currentPlan.totalPrice.toLocaleString('en-IN')}</div>
              <span className="text-[9px] text-[#27D980] font-bold">SUCCESS</span>
            </div>
          </div>

          {memberFreezes.map((f) => (
            <div key={f.id} className="p-3 rounded-2xl bg-[#070A10] border border-white/5 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <strong className="text-cyan-300 text-xs">Membership Freeze ({f.daysCount} Days)</strong>
                <div className="text-[10px] text-slate-400">{f.startDate} to {f.endDate}</div>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 font-bold">
                {f.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Freeze Membership Modal */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#101422] border border-cyan-500/40 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="font-black text-white text-xs flex items-center gap-1.5">
                <PauseCircle className="w-4 h-4 text-cyan-400" />
                Freeze / Pause Membership
              </h4>
              <button onClick={() => setShowFreezeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFreezeSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Freeze Start Date</label>
                <input
                  type="date"
                  required
                  value={freezeStartDate}
                  onChange={(e) => setFreezeStartDate(e.target.value)}
                  className="w-full bg-[#070A10] border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Freeze End Date</label>
                <input
                  type="date"
                  required
                  value={freezeEndDate}
                  onChange={(e) => setFreezeEndDate(e.target.value)}
                  className="w-full bg-[#070A10] border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Reason for Hold</label>
                <input
                  type="text"
                  required
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  placeholder="e.g. Travel, Injury recovery, Relocation"
                  className="w-full bg-[#070A10] border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-200">
                💡 Your plan expiry date will be automatically extended by the number of paused days.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black text-xs shadow-lg cursor-pointer"
              >
                Confirm Membership Freeze
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pay Dues Modal */}
      {showPayDuesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#101422] border border-rose-500/40 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="font-black text-white text-xs flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-rose-400" />
                Settle Outstanding Dues
              </h4>
              <button onClick={() => setShowPayDuesModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center p-4 rounded-2xl bg-[#070A10] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Amount Due</span>
              <div className="text-2xl font-black text-rose-400">
                ₹{activeMember?.balanceDue?.toLocaleString('en-IN') || '0'}
              </div>
            </div>

            {paySuccess ? (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold text-center">
                ✓ Payment Received! Receipt generated.
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handlePayDues}
                  className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-black font-black text-xs shadow-lg cursor-pointer"
                >
                  Pay via Instant UPI / QR
                </button>
                <button
                  onClick={handlePayDues}
                  className="w-full py-2.5 rounded-xl bg-[#070A10] hover:bg-white/10 text-white font-bold text-xs border border-white/10 cursor-pointer"
                >
                  Pay via Debit / Credit Card
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

