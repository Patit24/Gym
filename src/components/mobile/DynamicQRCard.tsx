import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { QrCode, ShieldCheck, AlertTriangle, RefreshCw, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export const DynamicQRCard: React.FC = () => {
  const { activeMember, generateNewToken, selectedBranchId, branches } = useGym();
  const [qrTimeRemaining, setQrTimeRemaining] = useState(30);
  const [dynamicQrToken, setDynamicQrToken] = useState('');

  useEffect(() => {
    if (!activeMember || activeMember.id === 'MEM-NONE') return;
    
    // Initial calculation
    setDynamicQrToken(generateNewToken(activeMember.id));
    
    // Setup local interval
    const interval = setInterval(() => {
      setQrTimeRemaining((prev) => {
        if (prev <= 1) {
          setDynamicQrToken(generateNewToken(activeMember.id));
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeMember, generateNewToken]);

  const currentBranch = (branches || []).find((b) => b?.id === selectedBranchId) || branches?.[0] || {
    id: 'branch-1',
    name: 'Smart Gym Club',
    code: 'SG-01',
    city: 'Main Facility',
    activeMembers: 0,
    currentCheckIns: 0,
    monthlyRevenue: 0
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 text-xs">
      
      {/* Title Banner */}
      <div className="p-3.5 rounded-3xl bg-gradient-to-r from-[#0B2420] via-[#071714] to-[#040E0C] border border-emerald-500/40 flex items-center justify-between shadow-xl">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Gate Access Pass
          </span>
          <h3 className="text-sm font-extrabold text-white">Dynamic Security QR Pass</h3>
          <p className="text-[10px] text-gym-subtext">{currentBranch.name} • Gate Terminal</p>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-[#0E332D] border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-extrabold shadow-md">
          <Lock className="w-5 h-5" />
        </div>
      </div>

      {/* Main Dynamic QR Display Frame */}
      <div className="relative glass-card rounded-[32px] p-6 border border-cyan-500/30 flex flex-col items-center justify-center space-y-4 shadow-2xl bg-gradient-to-b from-[#0F1420] via-[#0B0F19] to-[#070A10]">
        
        {/* Animated Laser Scan Line Overlay */}
        <div className="relative p-5 rounded-3xl bg-black border-2 border-cyan-400/60 shadow-2xl shadow-cyan-500/20 overflow-hidden group">
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-[bounce_2s_infinite]" />
          
          <div className="w-48 h-48 bg-[#040810] rounded-2xl p-2 flex flex-col items-center justify-center relative">
            <QrCode className="w-40 h-40 text-cyan-400" />
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-emerald-500/10 pointer-events-none rounded-2xl" />
          </div>
        </div>

        {/* 30s TOTP Ring Timer */}
        <div className="flex items-center gap-3 bg-[#070A10] px-4 py-2 rounded-2xl border border-white/10 text-xs">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <span className="w-6 h-6 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
            <span className="absolute text-[10px] font-black text-emerald-400">{qrTimeRemaining}</span>
          </div>
          <div>
            <div className="font-extrabold text-white text-[11px]">30-Second Refresh Cycle</div>
            <div className="text-[9px] text-gym-subtext">Auto-rotates to prevent screenshot leaks</div>
          </div>
        </div>

        {/* Encrypted Hash Preview */}
        <div className="w-full bg-[#04070F] p-2.5 rounded-2xl border border-white/10 text-center font-mono text-[9px] text-cyan-300 break-all select-all">
          {dynamicQrToken}
        </div>
      </div>

      {/* Security Warning Badge */}
      <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Screenshots are blocked for security. Present live QR screen to gate scanner.</span>
      </div>

    </div>
  );
};
