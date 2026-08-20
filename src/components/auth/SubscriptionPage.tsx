import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, CreditCard, CheckCircle2, LogOut, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SubscriptionPage: React.FC = () => {
  const { plans, activeMember, renewSubscription, signOutApp, appUserAccount, subscriptionStatus } = useGym();
  const navigate = useNavigate();
  const [activatingPlanId, setActivatingPlanId] = useState<string | null>(null);

  // Auto-redirect to dashboard if subscription is already active
  React.useEffect(() => {
    if (subscriptionStatus === 'active') {
      navigate('/dashboard', { replace: true });
    }
  }, [subscriptionStatus, navigate]);

  const handleRenew = async (planId: string) => {
    setActivatingPlanId(planId);
    try {
      const targetId = (activeMember && activeMember.id !== 'MEM-NONE') 
        ? activeMember.id 
        : (appUserAccount?.linkedId || 'MEM-2026-001');

      await renewSubscription(targetId, planId);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }

      // Navigate immediately to the dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Subscription activation failed:', err);
    } finally {
      setActivatingPlanId(null);
    }
  };

  const handleLogout = async () => {
    await signOutApp();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-slate-100 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

      <div className="relative z-10 max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-2 shadow-lg shadow-red-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Access Required</h1>
          <p className="text-lg text-slate-400 max-w-lg mx-auto">
            Your gym subscription is inactive or has expired. Please select a plan below to activate your member dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-[#14171F] border border-gym-border rounded-[32px] p-6 flex flex-col hover:border-[#27D980]/50 transition-all hover:scale-[1.02] shadow-xl">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-3xl font-black text-[#27D980] mb-6">
                ₹{plan.totalPrice.toLocaleString('en-IN')} <span className="text-sm font-medium text-slate-500">/{plan.durationMonths}mo</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {plan.includedAddons.map((addon, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#27D980] shrink-0 mt-0.5" />
                    <span>{addon}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleRenew(plan.id)}
                disabled={activatingPlanId !== null}
                className="w-full py-4 rounded-2xl bg-white hover:bg-slate-100 text-black font-black text-xs shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
              >
                {activatingPlanId === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Activating Access...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay & Activate</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-semibold py-2 px-4 rounded-xl border border-transparent hover:border-gym-border"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out and return to login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
