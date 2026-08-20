import React from 'react';
import { Link } from 'react-router-dom';
import { useGym } from '../../context/GymContext';
import { 
  Dumbbell, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Users, 
  Flame, 
  HeartPulse, 
  Award,
  Calendar
} from 'lucide-react';

export const WebsiteHomePage: React.FC = () => {
  const { plans } = useGym();

  return (
    <div className="space-y-16 py-8">
      
      {/* ── HERO SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#27D980]/15 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-6 max-w-3xl mx-auto py-12 lg:py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#27D980]/10 border border-[#27D980]/30 text-[#27D980] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Smart Fitness Experience</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Elevate Your Body, Mind & Strength with <span className="bg-gradient-to-r from-[#27D980] via-[#4F7CFF] to-cyan-400 bg-clip-text text-transparent">Smart Gym</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Experience state-of-the-art biomechanical gym equipment, real-time AI workout coaching, luxury recovery suites, and instant dynamic turnstile entry.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/plans"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#27D980] via-emerald-400 to-[#27D980] text-black font-black text-sm shadow-xl shadow-[#27D980]/25 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Membership Packages</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#141824] hover:bg-[#1C2234] border border-white/15 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Claim 3-Day Free Trial</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-white/10">
            <div className="p-4 rounded-2xl bg-[#101420]/60 border border-white/10">
              <strong className="text-2xl font-black text-white block">24/7</strong>
              <span className="text-xs text-slate-400">Biometric Gate Access</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#101420]/60 border border-white/10">
              <strong className="text-2xl font-black text-[#27D980] block">50+</strong>
              <span className="text-xs text-slate-400">Weekly Group Classes</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#101420]/60 border border-white/10">
              <strong className="text-2xl font-black text-[#4F7CFF] block">100%</strong>
              <span className="text-xs text-slate-400">Certified Elite Trainers</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#101420]/60 border border-white/10">
              <strong className="text-2xl font-black text-purple-400 block">4.9 ★</strong>
              <span className="text-xs text-slate-400">Member Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED HIGHLIGHTS ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Why Train at Smart Gym?</h2>
          <p className="text-xs sm:text-sm text-slate-400">Built from the ground up for high-performance fitness enthusiasts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#101422] border border-white/10 space-y-4 hover:border-[#27D980]/50 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-[#27D980]/15 border border-[#27D980]/30 text-[#27D980] flex items-center justify-center">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white group-hover:text-[#27D980] transition-colors">
              Heavy Iron & Olympic Racks
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipped with Eleiko calibrated plates, hammer strength machines, and custom powerlifting platforms for serious strength development.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#101422] border border-white/10 space-y-4 hover:border-[#4F7CFF]/50 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-[#4F7CFF]/15 border border-[#4F7CFF]/30 text-[#4F7CFF] flex items-center justify-center">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white group-hover:text-[#4F7CFF] transition-colors">
              AI Coach & Nutrition Sync
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Personalized macro nutrition targets, daily calorie tracking, and customized workout splits tailored to your specific body recomposition goals.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#101422] border border-white/10 space-y-4 hover:border-purple-500/50 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white group-hover:text-purple-400 transition-colors">
              Steam, Sauna & Recovery
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unwind post-workout in our eucalyptus steam suites and infrared saunas to accelerate muscle recovery and mental clarity.
            </p>
          </div>
        </div>
      </section>

      {/* ── MEMBERSHIP TIERS PREVIEW ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#27D980] uppercase tracking-wider">Transparent Pricing</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Popular Membership Plans</h2>
          </div>
          <Link
            to="/plans"
            className="text-xs font-bold text-[#27D980] hover:underline flex items-center gap-1"
          >
            <span>View All Packages & Benefits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.slice(0, 3).map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden transition-all ${
                plan.isPopular
                  ? 'bg-gradient-to-b from-[#182035] to-[#0E1322] border-2 border-[#4F7CFF] shadow-2xl shadow-[#4F7CFF]/15'
                  : 'bg-[#101422] border border-white/10'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#4F7CFF] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                </div>

                <div className="py-2 border-y border-white/10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-white">₹{plan.totalPrice.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-400">/ {plan.duration}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Includes 18% GST & Full Facility Access</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">What's Included:</span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {plan.includedAddons.map((addon, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#27D980] shrink-0" />
                        <span>{addon}</span>
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
                      ? 'bg-gradient-to-r from-[#4F7CFF] to-cyan-400 text-white shadow-lg shadow-[#4F7CFF]/25 font-black hover:scale-[1.02]'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  Join with {plan.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CALL TO ACTION BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="rounded-3xl p-8 lg:p-12 bg-gradient-to-r from-[#0C1A17] via-[#0E261F] to-[#0A141A] border-2 border-[#27D980]/40 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-[#27D980] uppercase tracking-wider">Free Guest Experience</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Start Your Fitness Journey Today</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Create a free customer account online to unlock a 3-Day All-Access Pass to test our facility, group fitness classes, and sauna suites.
            </p>
          </div>

          <Link
            to="/login"
            className="px-8 py-4 rounded-2xl bg-[#27D980] hover:bg-[#20b86a] text-black font-black text-sm shadow-xl shadow-[#27D980]/30 transition-all hover:scale-105 shrink-0"
          >
            Create Free Account & Claim Pass
          </Link>
        </div>
      </section>

    </div>
  );
};
