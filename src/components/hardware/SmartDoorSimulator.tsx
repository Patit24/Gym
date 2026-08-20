import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { Member } from '../../types/gym';
import { Lock, Unlock, QrCode, ShieldCheck, CheckCircle2, AlertTriangle, Activity, Volume2, Camera } from 'lucide-react';

export const SmartDoorSimulator: React.FC = () => {
  const { scanDoorQR, generateNewToken, activeMember, selectedBranchId, branches } = useGym();

  // On mount or when activeMember changes, get current token
  const defaultToken = activeMember ? generateNewToken(activeMember.id) : '';
  const [inputQr, setInputQr] = useState(defaultToken);
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (activeMember) {
      setInputQr(generateNewToken(activeMember.id));
    }
  }, [activeMember, generateNewToken]);

  const [doorStatus, setDoorStatus] = useState<'LOCKED' | 'UNLOCKED'>('LOCKED');
  const [accessResult, setAccessResult] = useState<{ success: boolean; message: string; member?: Member } | null>(null);

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const handleExecuteScan = () => {
    setIsScanning(true);
    setDoorStatus('LOCKED');
    setAccessResult(null);

    setTimeout(() => {
      setIsScanning(false);
      const currentToken = activeMember ? generateNewToken(activeMember.id) : '';
      const res = scanDoorQR(inputQr || currentToken, selectedBranchId, faceIdEnabled ? 'Face ID' : 'Dynamic QR');
      setAccessResult(res);

      if (res.success) {
        setDoorStatus('UNLOCKED');
        // Play synthetic door chime sound
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
          osc.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } catch (e) {}

        // Auto relock after 4 seconds
        setTimeout(() => {
          setDoorStatus('LOCKED');
        }, 4000);
      }
    }, 900);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 inline-flex items-center gap-2">
          <Activity className="w-4 h-4 animate-pulse" />
          IoT Smart Relays & Camera Terminal Simulator
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Physical Access Terminal - {currentBranch.name}
        </h2>
        <p className="text-xs text-gym-subtext">
          Simulates real-world hardware reading Dynamic 30s TOTP QR codes, matching Face ID biometric embeddings, and triggering electromagnetic door strikes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Terminal Control Box */}
        <div className="glass-panel rounded-3xl p-6 space-y-6 border border-gym-border">
          
          <div className="flex items-center justify-between pb-3 border-b border-gym-border">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#4F7CFF]" />
              Scanner Camera Feed
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
              HARDWARE ONLINE
            </span>
          </div>

          {/* Camera Frame Preview */}
          <div className="relative h-56 bg-slate-950 rounded-2xl border-2 border-dashed border-gym-border flex flex-col items-center justify-center space-y-3 overflow-hidden">
            <div className="animate-scan-line" />

            <div className="text-center space-y-1">
              <QrCode className={`w-16 h-16 mx-auto ${isScanning ? 'text-[#27D980] animate-bounce' : 'text-slate-600'}`} />
              <p className="text-xs text-gym-subtext">Align Member Phone QR in viewfinder frame</p>
            </div>

            {isScanning && (
              <div className="absolute inset-0 bg-[#27D980]/10 backdrop-blur-xs flex items-center justify-center">
                <span className="text-xs font-bold text-[#27D980] bg-black/80 px-3 py-1.5 rounded-full border border-[#27D980]">
                  Verifying Cryptographic Tokens...
                </span>
              </div>
            )}
          </div>

          {/* Scanner Input Controls */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gym-subtext mb-1">Dynamic QR Token / Membership ID</label>
              <input
                type="text"
                value={inputQr}
                onChange={(e) => setInputQr(e.target.value)}
                className="w-full bg-[#0B0D12] border border-gym-border focus:border-[#4F7CFF] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-[#0B0D12] p-3 rounded-xl border border-gym-border">
              <input
                type="checkbox"
                checked={faceIdEnabled}
                onChange={(e) => setFaceIdEnabled(e.target.checked)}
                className="accent-[#27D980] w-4 h-4"
              />
              <ShieldCheck className="w-4 h-4 text-[#27D980]" />
              <span>Require Secondary Biometric Face ID Match</span>
            </label>

            <button
              onClick={handleExecuteScan}
              disabled={isScanning}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-[#27D980] text-gym-dark font-extrabold text-xs shadow-lg shadow-[#27D980]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Simulate Scan & Unlock Door</span>
            </button>
          </div>

        </div>

        {/* Electromagnetic Maglock & Terminal Screen Output */}
        <div className="glass-panel rounded-3xl p-6 space-y-6 border border-gym-border flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gym-border">
              <h3 className="text-sm font-bold text-white">Maglock Strike Relay Status</h3>
              <span className="text-xs text-gym-subtext">Door #1 - Main Entrance</span>
            </div>

            {/* Maglock Status Visual */}
            <div className="mt-4 p-6 rounded-2xl text-center space-y-3 transition-all duration-300 border" style={{
              backgroundColor: doorStatus === 'UNLOCKED' ? 'rgba(39, 217, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              borderColor: doorStatus === 'UNLOCKED' ? '#27D980' : '#EF4444',
            }}>
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white" style={{
                backgroundColor: doorStatus === 'UNLOCKED' ? '#27D980' : '#EF4444',
              }}>
                {doorStatus === 'UNLOCKED' ? <Unlock className="w-8 h-8 text-gym-dark" /> : <Lock className="w-8 h-8" />}
              </div>

              <div>
                <h4 className="text-xl font-black tracking-wider" style={{
                  color: doorStatus === 'UNLOCKED' ? '#27D980' : '#EF4444',
                }}>
                  MAGLOCK {doorStatus}
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  {doorStatus === 'UNLOCKED' ? 'Relay Energized (Door Open 4s)' : 'Electromagnetic Relay Locked (1200 lbs Resistance)'}
                </p>
              </div>
            </div>
          </div>

          {/* Access Scan Verification Details */}
          {accessResult ? (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              accessResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <div className="font-bold text-sm flex items-center gap-2">
                {accessResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                {accessResult.message}
              </div>

              {accessResult.member && (
                <div className="flex items-center gap-3 pt-2 border-t border-gym-border/40 text-slate-200">
                  <img src={accessResult.member.photoUrl} alt={accessResult.member.name} className="w-10 h-10 rounded-full object-cover border border-[#4F7CFF]" />
                  <div>
                    <strong className="text-white">{accessResult.member.name}</strong>
                    <p className="text-[11px] text-gym-subtext">Plan: {accessResult.member.planName} • Exp: {accessResult.member.expiryDate}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gym-subtext text-xs border border-dashed border-gym-border/40 rounded-2xl">
              Scan dynamic QR token to trigger access door relay and record attendance.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
