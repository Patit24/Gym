import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { PrivilegePassCard } from '../shared/PrivilegePassCard';
import { CreditCard, Calendar, Clock, AlertTriangle, CheckCircle2, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

export const SubscriptionCard: React.FC = () => {
  const { activeMember, plans, renewSubscription } = useGym();
  const [renewSuccess, setRenewSuccess] = useState(false);

  const currentPlan = plans.find((p) => p.id === activeMember?.planId) || plans[0];

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

  const handleRenew = () => {
    if (renewSubscription && activeMember) {
      renewSubscription(activeMember.id, currentPlan.id);
    }
    setRenewSuccess(true);
    setTimeout(() => setRenewSuccess(false), 4000);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 text-xs">
      
      {/* ── LUXURY PRIVILEGE MEMBERSHIP CARD (MATCHING USER REFERENCE DESIGN) ── */}
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
            isExpiringSoon
              ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse'
              : 'bg-emerald-500/20 text-[#27D980] border-[#27D980]/40'
          }`}>
            {isExpiringSoon ? 'Renewal Due Soon' : (activeMember?.status || 'Active Pass')}
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

        {/* Included Amenities List */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-black text-[#E5A93C] uppercase tracking-wider">Included Privilege Amenities</span>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {currentPlan.includedAddons.map((addon, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-slate-200 bg-[#0B0E17] p-2 rounded-xl border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#27D980] shrink-0" />
                <span className="truncate text-[11px]">{addon}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Automated Expiry Notification Alert Banner */}
      {isExpiringSoon && (
        <div className="p-3.5 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-100 space-y-1 shadow-xl animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-extrabold text-white text-xs">Membership Expiring Soon</h4>
              <p className="text-[11px] text-amber-200 font-medium">
                Pass ends on <strong>{endDateStr}</strong> ({daysRemaining} days left). Renew now to maintain uninterrupted gate pass access.
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

      {/* Renew Button */}
      <button
        onClick={handleRenew}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E5A93C] via-[#F4B740] to-orange-500 text-black font-black text-xs shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-white/20"
      >
        <Sparkles className="w-4 h-4 text-black" />
        <span>RENEW PRIVILEGE PASS (₹{currentPlan.totalPrice.toLocaleString('en-IN')})</span>
      </button>

    </div>
  );
};
