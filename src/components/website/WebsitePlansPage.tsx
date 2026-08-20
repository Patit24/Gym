import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGym } from '../../context/GymContext';
import { CheckCircle2, Dumbbell, Sparkles, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export const WebsitePlansPage: React.FC = () => {
  const { plans } = useGym();
  const [selectedDuration, setSelectedDuration] = useState<string>('all');

  const filteredPlans = plans.filter((p) => {
    if (selectedDuration === 'all') return true;
    return p.duration?.toLowerCase() === selectedDuration.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-[#27D980] uppercase tracking-wider">Membership Options</span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Choose Your Ideal Training Plan</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Transparent pricing with zero hidden maintenance fees. All memberships include full access to smart RFID turnstile gates, lockers, and workout app tracking.
        </p>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 pt-4 flex-wrap">
          {['all', 'monthly', 'quarterly', 'half-yearly', 'yearly'].map((dur) => (
            <button
              key={dur}
              onClick={() => setSelectedDuration(dur)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                selectedDuration === dur
                  ? 'bg-[#27D980] text-black font-black shadow-lg shadow-[#27D980]/20'
                  : 'bg-[#141824] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {dur === 'all' ? 'All Plans' : dur}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
              plan.isPopular
                ? 'bg-gradient-to-b from-[#182238] to-[#0E1424] border-2 border-[#4F7CFF] shadow-2xl shadow-[#4F7CFF]/20'
                : 'bg-[#101422] border border-white/10'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#4F7CFF] text-white text-[9px] font-black uppercase tracking-wider shadow-md">
                Featured
              </div>
            )}

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#27D980] uppercase tracking-wider block">
                  {plan.durationMonths} MONTHS DURATION
                </span>
                <h3 className="text-lg font-black text-white mt-1">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{plan.description}</p>
              </div>

              <div className="py-3 border-y border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-white">₹{plan.totalPrice.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-400">/ total</span>
                </div>
                <div className="text-[10px] text-slate-400 space-y-0.5 mt-1">
                  <div>Base: ₹{plan.basePrice.toLocaleString('en-IN')} + ₹{plan.joiningFee} Joining Fee</div>
                  <div className="text-[#27D980] font-semibold">Includes 18% GST (₹{(plan.totalPrice - plan.basePrice - plan.joiningFee).toLocaleString('en-IN')})</div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Features:</span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {plan.includedAddons.map((addon, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#27D980] shrink-0" />
                      <span className="text-[11px]">{addon}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/login"
                className={`w-full py-3 rounded-xl font-bold text-xs text-center block transition-all ${
                  plan.isPopular
                    ? 'bg-gradient-to-r from-[#4F7CFF] to-cyan-400 text-white shadow-lg shadow-[#4F7CFF]/25 font-black'
                    : 'bg-white/10 hover:bg-[#27D980] hover:text-black text-white'
                }`}
              >
                Select & Join
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
