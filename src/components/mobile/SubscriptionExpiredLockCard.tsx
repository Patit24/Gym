import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import {
  Lock,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  Phone,
  MessageSquare,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubscriptionExpiredLockCardProps {
  featureName?: string;
  onRenewSuccess?: () => void;
}

export const SubscriptionExpiredLockCard: React.FC<SubscriptionExpiredLockCardProps> = ({
  featureName = 'Daily Workout & Diet Chart',
  onRenewSuccess
}) => {
  const { activeMember, plans, renewSubscription, branches, selectedBranchId } = useGym();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    activeMember?.planId || plans[0]?.id || 'plan-1'
  );
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewSuccess, setRenewSuccess] = useState(false);

  const currentBranch = (branches || []).find(b => b.id === (activeMember?.branchId || selectedBranchId)) || branches?.[0];
  const expiryDate = activeMember?.expiryDate || activeMember?.endDate || 'Recently Expired';
  const memberName = activeMember?.name || 'Member';
  const branchPhone = currentBranch?.phone || '+91 98765 43210';
  const whatsappUrl = `https://wa.me/${branchPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hello Smart Gym team, my membership (${activeMember?.membershipNo || activeMember?.id}) expired on ${expiryDate}. I want to renew my subscription for ${featureName}.`
  )}`;

  const handleRenew = async () => {
    if (!activeMember) return;
    setIsRenewing(true);
    try {
      await renewSubscription(activeMember.id, selectedPlanId);
      setRenewSuccess(true);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}

      setTimeout(() => {
        setRenewSuccess(false);
        if (onRenewSuccess) onRenewSuccess();
      }, 2000);
    } catch (err) {
      console.error('Renewal failed:', err);
    } finally {
      setIsRenewing(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-[28px] glass-card-premium border border-red-500/30 bg-gradient-to-b from-[#160D12] via-[#0E0A12] to-[#0A0D14] shadow-[0_20px_50px_rgba(239,68,68,0.15)] space-y-5 text-center relative overflow-hidden">
      
      {/* Ambient Red Glow Beams */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Locked Icon Pill */}
      <div className="relative z-10 flex flex-col items-center space-y-3">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-500/30 to-amber-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Lock className="w-7 h-7 animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-[#0A0D14] animate-ping" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] font-black uppercase tracking-wider mb-1.5">
            <ShieldAlert className="w-3 h-3 text-red-400" />
            <span>Subscription Ended</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
            Your Subscription Has Ended
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
            Access to <strong className="text-white font-black">{featureName}</strong> is locked. Renew your membership below to unlock daily exercise logs and nutrition macros.
          </p>
        </div>
      </div>

      {/* Expiry Details Pill */}
      <div className="relative z-10 p-3 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between text-left text-xs">
        <div>
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Expired Plan</span>
          <h4 className="text-xs font-black text-white">{activeMember?.planName || 'Gym Membership'}</h4>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-extrabold text-red-400 uppercase tracking-wider">Ended On</span>
          <span className="block text-xs font-bold text-red-300">{expiryDate}</span>
        </div>
      </div>

      {/* Available Plans Selector */}
      <div className="relative z-10 space-y-2 text-left">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider px-1">
          Select Renewal Plan
        </span>
        <div className="grid grid-cols-1 gap-2">
          {plans.slice(0, 3).map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#00D4FF]/10 border-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,0.2)]'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? 'border-[#00D4FF] bg-[#00D4FF]' : 'border-white/20'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[3]" />}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">{plan.name}</h5>
                    <span className="text-[10px] text-slate-400 font-bold">{plan.durationMonths} Months Full Access</span>
                  </div>
                </div>

                <span className="text-xs font-black text-[#10B981] font-mono">
                  ₹{plan.totalPrice?.toLocaleString('en-IN') || plan.basePrice?.toLocaleString('en-IN')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Renewal Primary Action */}
      <div className="relative z-10 space-y-2.5 pt-1">
        {renewSuccess ? (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>Subscription Renewed! Unlocking features...</span>
          </div>
        ) : (
          <button
            onClick={handleRenew}
            disabled={isRenewing}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#10B981] via-emerald-500 to-[#00D4FF] hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isRenewing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Renewing Subscription...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Renew Subscription Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}

        {/* Contact Reception Option */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Renew via WhatsApp</span>
          </a>
          <span className="text-slate-600">•</span>
          <a
            href={`tel:${branchPhone}`}
            className="text-[11px] font-bold text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>Call Reception</span>
          </a>
        </div>
      </div>

    </div>
  );
};
