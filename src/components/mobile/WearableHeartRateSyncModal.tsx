import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Watch,
  Smartphone,
  Zap,
  Radio,
  CheckCircle2,
  Activity,
  Sparkles,
  Wifi,
  Flame
} from 'lucide-react';

interface WearableHeartRateSyncModalProps {
  isOpen: boolean;
  workoutTitle: string;
  onSyncComplete: () => void;
  onCancel?: () => void;
}

export const WearableHeartRateSyncModal: React.FC<WearableHeartRateSyncModalProps> = ({
  isOpen,
  workoutTitle,
  onSyncComplete,
  onCancel
}) => {
  const [syncStep, setSyncStep] = useState<1 | 2 | 3>(1);
  const [liveBpm, setLiveBpm] = useState<number>(72);
  const [selectedDevice, setSelectedDevice] = useState<'apple' | 'garmin'>('apple');

  useEffect(() => {
    if (!isOpen) {
      setSyncStep(1);
      setLiveBpm(72);
      return;
    }

    // Step 1: BLE Companion Wake-up Handshake
    const t1 = setTimeout(() => {
      setSyncStep(2);
      // Progressive BPM calibration
      let bpmCount = 72;
      const bpmInterval = setInterval(() => {
        bpmCount += Math.floor(Math.random() * 5) + 3;
        if (bpmCount >= 134) {
          setLiveBpm(134);
          clearInterval(bpmInterval);
        } else {
          setLiveBpm(bpmCount);
        }
      }, 80);
    }, 900);

    // Step 2 -> Step 3: Haptic Telemetry Lock
    const t2 = setTimeout(() => {
      setSyncStep(3);

      // Trigger crisp dual-device haptic buzz
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([40, 60, 120]);
        }
      } catch {}

      // Optional subtle high-tech acoustic feedback via Web Audio API
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
          osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6 note
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
      } catch {}
    }, 2200);

    // Step 3 Completion -> Transition to Live Workout
    const t3 = setTimeout(() => {
      onSyncComplete();
    }, 2900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen, onSyncComplete]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl select-none">
        
        {/* Ambient Glowing Background Beams */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#00D4FF]/20 via-[#EC4899]/20 to-[#10B981]/20 rounded-full blur-[110px] animate-pulse" />
        </div>

        {/* Central Futuristic Telemetry Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm rounded-[32px] bg-[#0A0D14]/95 border border-white/15 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.25)] flex flex-col items-center text-center space-y-5 overflow-hidden"
        >
          
          {/* Top Status Badge & Device Switcher */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-bold text-slate-300">
              <Radio className="w-3 h-3 text-[#00D4FF] animate-pulse" />
              <span>BLE Companion Wake-up</span>
            </div>

            <div className="flex items-center bg-black/50 p-0.5 rounded-xl border border-white/10 text-[9px] font-black">
              <button
                onClick={() => setSelectedDevice('apple')}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  selectedDevice === 'apple'
                    ? 'bg-[#00D4FF] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                 Watch
              </button>
              <button
                onClick={() => setSelectedDevice('garmin')}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  selectedDevice === 'garmin'
                    ? 'bg-[#00D4FF] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Garmin
              </button>
            </div>
          </div>

          {/* Dual Device Graphic: Phone <---> Watch Waveform Bridge */}
          <div className="relative w-full py-4 flex items-center justify-center">
            
            {/* Phone Icon Surface */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-22 rounded-2xl bg-gradient-to-b from-[#161B26] to-[#0A0D14] border-2 border-white/20 p-1 shadow-xl flex flex-col justify-between items-center">
                <div className="w-4 h-1 rounded-full bg-white/30 mt-0.5" />
                <Smartphone className="w-6 h-6 text-[#00D4FF]" />
                <span className="text-[8px] font-mono text-cyan-400 font-bold">PHONE</span>
              </div>
            </div>

            {/* Glowing Inter-Device Telemetry Wave Link */}
            <div className="relative flex-1 flex flex-col items-center mx-2">
              <div className="w-full h-[2px] bg-gradient-to-r from-[#00D4FF] via-[#EC4899] to-[#10B981] relative overflow-hidden">
                <div className="absolute inset-0 w-1/2 bg-white blur-[1px] animate-[slide_1.2s_infinite]" />
              </div>

              {/* Heart Pulse Node */}
              <div className="relative -my-3 w-8 h-8 rounded-full bg-[#0A0D14] border border-white/20 flex items-center justify-center shadow-lg">
                <Heart
                  className={`w-4 h-4 text-[#EC4899] transition-transform ${
                    syncStep >= 2 ? 'scale-125 animate-ping' : ''
                  }`}
                  fill="#EC4899"
                />
              </div>

              <span className="text-[8px] font-mono text-slate-400 mt-2 font-bold tracking-widest">
                {syncStep === 1 ? 'WAKING UP' : syncStep === 2 ? 'CALIBRATING' : 'LOCKED 0.2ms'}
              </span>
            </div>

            {/* Smart Watch Icon Surface */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-16 rounded-[20px] bg-gradient-to-b from-[#1C2333] to-[#0D111A] border-2 border-[#00D4FF]/60 p-1.5 shadow-[0_0_20px_rgba(0,212,255,0.35)] flex flex-col justify-between items-center">
                <div className="flex items-center gap-1 w-full justify-between">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                  <span className="text-[8px] font-mono text-white font-black">{liveBpm}</span>
                </div>
                <Watch className="w-6 h-6 text-[#00D4FF]" />
                <span className="text-[7.5px] font-mono text-slate-300 font-bold uppercase">
                  {selectedDevice === 'apple' ? ' ULTRA' : 'GARMIN'}
                </span>
              </div>
            </div>

          </div>

          {/* Live Dynamic ECG / Pulse Heart Rate Visualizer */}
          <div className="w-full rounded-2xl bg-black/50 border border-white/10 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#EC4899]/20 text-[#EC4899] flex items-center justify-center border border-[#EC4899]/30">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <span className="text-xs font-black text-white">Biometric Pulse Warm-up</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-lg font-black text-[#00D4FF] font-mono tracking-tight">{liveBpm}</span>
                <span className="text-[10px] font-bold text-slate-400">BPM</span>
              </div>
            </div>

            {/* Simulated Live ECG Waveform */}
            <div className="h-9 w-full bg-[#05070C] rounded-xl border border-white/5 relative overflow-hidden flex items-center px-2">
              <svg className="w-full h-7 stroke-[#00D4FF]" fill="none" viewBox="0 0 300 40">
                <path
                  d="M 0 20 L 40 20 L 50 10 L 60 30 L 70 5 L 80 35 L 90 20 L 150 20 L 160 12 L 170 28 L 180 8 L 190 32 L 200 20 L 260 20 L 270 10 L 280 30 L 300 20"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-[pulse_1s_infinite]"
                />
              </svg>
              <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#05070C] to-transparent pointer-events-none" />
            </div>

            {/* Heart Zone Indicator Pill */}
            <div className="flex items-center justify-between text-[10px] pt-1">
              <span className="text-slate-400 font-medium">Warmup Telemetry:</span>
              <span className="font-bold text-[#10B981] flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#10B981]" />
                {liveBpm < 100 ? 'Zone 1: Active Rest' : liveBpm < 130 ? 'Zone 2: Warm-up' : 'Zone 3: Cardio Target'}
              </span>
            </div>
          </div>

          {/* Progress Status Message */}
          <div className="space-y-1 w-full">
            <h3 className="text-sm font-black text-white tracking-tight">
              {syncStep === 1 && 'Waking up Wearable Companion...'}
              {syncStep === 2 && 'Preloading Biometric Canvas & Sensors...'}
              {syncStep === 3 && '⚡ Locked! Haptic Buzz Sent to Wrist'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {syncStep < 3
                ? `Syncing telemetry with ${selectedDevice === 'apple' ? 'Apple Watch Ultra' : 'Garmin Epix'}...`
                : `Companion canvas active. Starting ${workoutTitle}...`}
            </p>
          </div>

          {/* Cancel Button */}
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-[11px] font-bold text-slate-400 hover:text-white pt-1 transition-colors"
            >
              Skip Wearable Preload
            </button>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
