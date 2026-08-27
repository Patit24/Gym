import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import {
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  LogIn,
  LogOut,
  ShieldAlert,
  CreditCard,
  Building2,
  Calendar,
  UserCheck,
  Zap,
} from 'lucide-react';

export const DynamicQRCard: React.FC = () => {
  const {
    activeMember,
    selectedBranchId,
    branches,
    attendance,
    manualCheckIn,
    manualCheckOut,
    subscriptionStatus,
  } = useGym();

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [chosenBranchId, setChosenBranchId] = useState(selectedBranchId || 'branch-1');
  const [activeDuration, setActiveDuration] = useState<string>('');

  const todayDateStr = new Date().toISOString().split('T')[0];

  // Find active check-in record for this member today
  const activeAttendance =
    attendance.find(
      (a) =>
        (a.memberId === activeMember?.id ||
          a.memberName?.toLowerCase() === activeMember?.name?.toLowerCase()) &&
        a.date === todayDateStr &&
        a.status === 'Active In Gym'
    ) ||
    attendance.find(
      (a) =>
        (a.memberId === activeMember?.id ||
          a.memberName?.toLowerCase() === activeMember?.name?.toLowerCase()) &&
        a.status === 'Active In Gym'
    );

  const isCheckedIn = !!activeAttendance;
  const isExpired =
    subscriptionStatus === 'expired' ||
    activeMember?.status === 'Expired' ||
    (activeMember?.expiryDate && new Date(activeMember.expiryDate) < new Date());

  // Update session active timer
  useEffect(() => {
    if (!isCheckedIn || !activeAttendance?.entryTime) {
      setActiveDuration('');
      return;
    }

    const calculateDuration = () => {
      try {
        const now = new Date();
        const [timePart, meridiem] = (activeAttendance.entryTime || '').split(' ');
        if (!timePart) return;

        let [hours, minutes] = timePart.split(':').map(Number);
        if (meridiem) {
          if (meridiem.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }

        const entryDate = new Date();
        entryDate.setHours(hours, minutes, 0, 0);

        const diffMinutes = Math.max(0, Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60)));
        const h = Math.floor(diffMinutes / 60);
        const m = diffMinutes % 60;
        setActiveDuration(h > 0 ? `${h}h ${m}m` : `${m} mins`);
      } catch {
        setActiveDuration('Active');
      }
    };

    calculateDuration();
    const interval = setInterval(calculateDuration, 30000);
    return () => clearInterval(interval);
  }, [isCheckedIn, activeAttendance]);

  const currentBranch =
    (branches || []).find((b) => b?.id === chosenBranchId) ||
    branches?.[0] || {
      id: 'branch-1',
      name: 'Smart Gym Club',
      code: 'SG-01',
      city: 'Main Facility',
      activeMembers: 0,
      currentCheckIns: 0,
      monthlyRevenue: 0,
    };

  const handleCheckIn = async () => {
    if (isExpired) {
      setFeedback({
        success: false,
        message: 'Your membership is expired. Please renew your plan to check in.',
      });
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await manualCheckIn(activeMember?.id, chosenBranchId);
      setFeedback(res);
    } catch (err: any) {
      setFeedback({
        success: false,
        message: err.message || 'Check-in failed. Please try again or ask reception.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await manualCheckOut(activeMember?.id);
      setFeedback(res);
    } catch (err: any) {
      setFeedback({
        success: false,
        message: err.message || 'Check-out failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 text-xs">
      {/* ── 1. TURNSTILE SMART QR ACCESS - COMING SOON BANNER ── */}
      <div className="relative overflow-hidden p-4 rounded-3xl bg-gradient-to-br from-[#121624] via-[#0E121E] to-[#0A0D15] border border-amber-500/30 shadow-2xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Coming Soon
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">• Turnstile Access</span>
          </div>

          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-white">Smart QR Turnstile Gates</h3>
          <p className="text-[10.5px] text-slate-400 leading-relaxed mt-0.5">
            Automated RFID & QR gate scanner turnstiles are currently in rollout. Until activated, please use the <strong className="text-cyan-300">Manual Check-In & Check-Out</strong> system below.
          </p>
        </div>
      </div>

      {/* ── 2. LIVE MANUAL CHECK-IN & CHECK-OUT CONTROL STATION ── */}
      <div className="relative glass-card rounded-[32px] p-5 border border-cyan-500/30 flex flex-col space-y-4 shadow-2xl bg-gradient-to-b from-[#0F1420] via-[#0B0F19] to-[#070A10]">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center border shadow-md ${
                isCheckedIn
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              }`}
            >
              {isCheckedIn ? <UserCheck className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Daily Gym Check-In Station</h4>
              <p className="text-[10px] text-slate-400">Self-service attendance logger</p>
            </div>
          </div>

          {/* Status Pill */}
          <div
            className={`px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-1.5 shadow-sm ${
              isCheckedIn
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800/80 text-slate-300 border-white/10'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isCheckedIn ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            <span>{isCheckedIn ? 'ACTIVE IN GYM' : 'NOT CHECKED IN'}</span>
          </div>
        </div>

        {/* Feedback Alert Message */}
        {feedback && (
          <div
            className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 animate-in fade-in ${
              feedback.success
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}
          >
            {feedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-medium text-[11px]">{feedback.message}</span>
          </div>
        )}

        {/* Active Session Info Card */}
        {isCheckedIn ? (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20">
                <span className="text-[9.5px] text-slate-400 font-medium block">Entry Time</span>
                <span className="text-emerald-300 font-extrabold text-xs flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {activeAttendance?.entryTime || 'Logged'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20">
                <span className="text-[9.5px] text-slate-400 font-medium block">Active Workout</span>
                <span className="text-white font-extrabold text-xs flex items-center gap-1 mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  {activeDuration || 'Active'}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Facility: {currentBranch.name}</span>
            </div>

            {/* Check-Out Action Button */}
            <button
              onClick={handleCheckOut}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoading ? 'Recording Check-Out...' : 'Complete Workout & Check Out'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Branch Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-cyan-400" />
                Select Gym Branch / Facility
              </label>
              <select
                value={chosenBranchId}
                onChange={(e) => setChosenBranchId(e.target.value)}
                className="w-full bg-[#080C14] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {(branches || []).map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Check-In Action Button */}
            <button
              onClick={handleCheckIn}
              disabled={Boolean(isLoading || isExpired)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#00D4FF] via-cyan-400 to-[#00F5A0] text-black font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 text-black" />
              <span>{isLoading ? 'Logging Attendance...' : '1-Tap Gym Check-In'}</span>
            </button>

            {isExpired && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>Subscription ended. Please renew to enable gym check-in.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 3. OFFICIAL DIGITAL MEMBERSHIP ID PASS ── */}
      <div className="p-4 rounded-3xl glass-card border border-white/[0.08] space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-cyan-400" />
            Digital Membership Pass
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            {activeMember?.membershipNo || 'SG-MEMBER'}
          </span>
        </div>

        <div className="flex items-center gap-3 pt-1">
          {activeMember?.photoUrl ? (
            <img
              src={activeMember.photoUrl}
              alt={activeMember.name}
              className="w-12 h-12 rounded-2xl object-cover border border-cyan-400/40 shadow-md"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-extrabold text-sm shadow-md">
              {(activeMember?.name || 'M').charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-extrabold text-white truncate">
              {activeMember?.name || 'Member'}
            </h4>
            <p className="text-[10.5px] text-cyan-300 font-semibold truncate">
              Plan: {activeMember?.planName || 'Standard Club Plan'}
            </p>
            <p className="text-[9.5px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              Valid Till: {activeMember?.expiryDate || activeMember?.endDate || 'Active'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
