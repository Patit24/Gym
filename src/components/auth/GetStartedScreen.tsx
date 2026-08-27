import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Dumbbell,
  Zap,
  ShieldCheck,
  Watch,
  Brain,
  ArrowRight,
  Sparkles,
  QrCode,
  Users,
  Lock,
  ChevronRight
} from 'lucide-react';

interface GetStartedScreenProps {
  onGetStarted?: () => void;
}

export const GetStartedScreen: React.FC<GetStartedScreenProps> = ({ onGetStarted }) => {
  const navigate = useNavigate();

  const handleStart = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
    } catch {}

    if (onGetStarted) {
      onGetStarted();
    } else {
      navigate('/login');
    }
  };

  const featurePills = [
    {
      icon: QrCode,
      title: 'Smart Turnstile Pass',
      desc: 'Dynamic dynamic QR & smart access',
      color: '#00D4FF',
      bg: 'rgba(0, 212, 255, 0.12)'
    },
    {
      icon: Watch,
      title: 'Wearable HR Sync',
      desc: ' Watch & Garmin telemetry lock',
      color: '#EC4899',
      bg: 'rgba(236, 72, 153, 0.12)'
    },
    {
      icon: Brain,
      title: 'AI Coach Studio',
      desc: 'Personalized routines & hypertrophy',
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.12)'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#00D4FF]/30">
      
      {/* Ambient Glowing Background Radial Spheres */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-20 w-[420px] h-[420px] bg-[#00D4FF]/18 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-24 w-[380px] h-[380px] bg-[#EC4899]/15 rounded-full blur-[130px]" />
        <div className="absolute -bottom-24 left-1/4 w-[460px] h-[460px] bg-[#10B981]/15 rounded-full blur-[140px]" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-md mx-auto w-full px-6 pt-12 pb-8 flex-1 flex flex-col justify-between">
        
        {/* Top Header & Brand Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00D4FF] via-cyan-500 to-[#10B981] p-[1.5px] shadow-[0_0_25px_rgba(0,212,255,0.4)]">
              <div className="w-full h-full bg-[#0A0D14] rounded-[14px] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-[#00D4FF]" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                SMART GYM<span className="text-[#00D4FF]">™</span>
              </h1>
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Enterprise Fitness OS</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-extrabold text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
            <span>v2.6 Cloud</span>
          </div>
        </motion.div>

        {/* Center Hero Visual & Title */}
        <div className="my-auto py-8 space-y-7 text-center sm:text-left">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span>Next-Gen Smart Fitness Platform</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white leading-[1.15] tracking-tight">
              Elevate Your <br />
              <span className="bg-gradient-to-r from-[#00D4FF] via-[#EC4899] to-[#10B981] bg-clip-text text-transparent">
                Fitness Experience
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              All-in-one smart portal for workouts, biometric door pass, dietary planning, and club telemetry.
            </p>
          </motion.div>

          {/* Feature Highlight Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="space-y-2.5"
          >
            {featurePills.map((pill, idx) => {
              const Icon = pill.icon;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl glass-card-premium border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border"
                      style={{
                        backgroundColor: pill.bg,
                        borderColor: `${pill.color}40`,
                        color: pill.color
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs font-black text-white">{pill.title}</h3>
                      <p className="text-[10.5px] text-slate-400">{pill.desc}</p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              );
            })}
          </motion.div>

        </div>

        {/* Bottom Actions Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="space-y-3.5 pt-2"
        >
          {/* Primary Get Started Button */}
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-[22px] bg-gradient-to-r from-[#00D4FF] via-cyan-500 to-[#10B981] hover:from-cyan-400 hover:to-emerald-400 text-black font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_12px_35px_rgba(0,212,255,0.4)] active:scale-[0.98] transition-all cursor-pointer group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary Sign In Link */}
          <div className="text-center">
            <button
              onClick={handleStart}
              className="text-xs text-slate-400 hover:text-white transition-colors font-medium inline-flex items-center gap-1 cursor-pointer py-1"
            >
              <span>Already have an account?</span>
              <span className="text-[#00D4FF] font-black underline underline-offset-4">Sign In</span>
            </button>
          </div>

          {/* Footer Security Badges */}
          <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-bold border-t border-white/5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              Encrypted Auth
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#00D4FF]" />
              Real-Time Sync
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#EC4899]" />
              Multi-Role Access
            </span>
          </div>

        </motion.div>

      </div>
    </div>
  );
};
