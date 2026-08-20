import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { auth } from '../../firebase';
import { useGym } from '../../context/GymContext';
import { 
  Activity, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  User, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  KeyRound,
  ShieldCheck,
  Smartphone,
  Layers,
  Dumbbell
} from 'lucide-react';

export const AppLogin: React.FC = () => {
  const navigate = useNavigate();
  const { firebaseUser, appUserAccount, isAuthLoading, addMember, plans } = useGym();
  
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('Muscle Building');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-route based on authenticated role
  useEffect(() => {
    if (!isAuthLoading && firebaseUser && appUserAccount) {
      if (appUserAccount.isActive === false) {
        setError('Your account is currently deactivated or suspended. Please contact gym management.');
        signOut(auth);
        return;
      }

      // Store auth context in localStorage
      localStorage.setItem('gym_auth_context', 'app');

      // STRICT 3-ROLE ROUTING:
      if (appUserAccount.role === 'Member') {
        navigate('/app/user/dashboard', { replace: true });
      } else if (appUserAccount.role === 'Trainer' || appUserAccount.role === 'Dietitian') {
        navigate('/app/trainer/dashboard', { replace: true });
      } else {
        navigate('/app/admin/dashboard', { replace: true });
      }
    }
  }, [firebaseUser, appUserAccount, isAuthLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      localStorage.setItem('gym_auth_context', 'app');
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or user not found.');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      localStorage.setItem('gym_auth_context', 'app');
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Register new member record in database
      const defaultPlan = plans[0] || { id: 'plan-1', name: 'Annual VIP All-Access Franchise', durationMonths: 12 };
      const startDate = new Date().toISOString().split('T')[0];
      const endDateObj = new Date();
      endDateObj.setMonth(endDateObj.getMonth() + (defaultPlan.durationMonths || 12));
      const endDate = endDateObj.toISOString().split('T')[0];

      await addMember({
        name: fullName.trim() || 'New Member',
        email: email.trim(),
        mobile: mobile.trim() || '+91 98765 00000',
        dob: '1998-01-01',
        gender: 'Other',
        heightCm: 175,
        weightKg: 70,
        startWeightKg: 70,
        bmi: 22.8,
        chestCm: 0,
        waistCm: 0,
        armsCm: 0,
        thighsCm: 0,
        bloodGroup: 'O+',
        emergencyContactName: '',
        emergencyMobile: '',
        address: 'Smart Gym City',
        medicalHistory: 'None',
        goal: fitnessGoal as any,
        referralSource: 'App Self Registration',
        branchId: 'branch-1',
        planId: defaultPlan.id,
        planName: defaultPlan.name,
        startDate,
        endDate,
        expiryDate: endDate,
        faceEnrolled: false,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName || user.uid)}`,
        pendingDues: 0,
      });

      setSuccessMsg('Member account registered successfully! Redirecting to User App...');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email may already be in use.');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMsg(`Password reset link sent to ${email.trim()}. Please check your inbox.`);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Unable to send reset email. Verify email address.');
      setIsLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setSuccessMsg('');
  };

  if (isAuthLoading || (firebaseUser && !appUserAccount)) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex flex-col items-center justify-center gap-3">
        <Activity className="w-9 h-9 text-[#27D980] animate-spin" />
        <p className="text-xs font-semibold text-gym-subtext">Verifying App session & security role...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#27D980]/15 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#4F7CFF]/15 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />

      <div className="relative z-10 max-w-md w-full bg-[#14171F]/90 backdrop-blur-2xl border border-gym-border/80 rounded-[32px] p-6 lg:p-8 shadow-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4F7CFF] to-[#27D980] p-[2px] shadow-xl shadow-[#27D980]/30">
            <div className="w-full h-full bg-[#0B0D12] rounded-[14px] flex items-center justify-center">
              <Activity className="w-7 h-7 text-[#27D980]" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              SMART <span className="text-[#27D980]">GYM</span>
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#4F7CFF]/20 text-[#4F7CFF] border border-[#4F7CFF]/30">
                APP LOGIN (USER & ADMIN)
              </span>
            </div>
            <p className="text-xs text-gym-subtext mt-1">Role-Based Authentication Engine</p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#0B0D12] p-1 rounded-2xl border border-gym-border text-xs font-bold">
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setError(''); setSuccessMsg(''); }}
            className={`py-2 rounded-xl transition-all ${authMode === 'signin' ? 'bg-[#27D980] text-gym-dark shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setError(''); setSuccessMsg(''); }}
            className={`py-2 rounded-xl transition-all ${authMode === 'signup' ? 'bg-[#4F7CFF] text-white shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('forgot'); setError(''); setSuccessMsg(''); }}
            className={`py-2 rounded-xl transition-all ${authMode === 'forgot' ? 'bg-purple-600 text-white shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
          >
            Reset
          </button>
        </div>

        {/* Alert Notifications */}
        {error && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-red-200">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#27D980] shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-emerald-200">{successMsg}</p>
          </div>
        )}

        {/* ── 1. SIGN IN FORM ── */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Email / Username</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="admin@smartgym.com or member@smartgym.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121622] border-2 border-white/15 focus:border-[#27D980] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Password</label>
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  className="text-[10px] text-cyan-400 hover:underline font-bold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#121622] border-2 border-white/15 focus:border-[#27D980] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#27D980] via-[#4F7CFF] to-[#27D980] bg-[length:200%_auto] hover:bg-[position:right_center] text-gym-dark font-black text-xs shadow-xl shadow-[#27D980]/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating & Verifying Role...' : 'Log In to App'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Accounts Helper */}
            <div className="pt-3 border-t border-gym-border/60 space-y-2">
              <div className="text-[10px] font-extrabold text-gym-subtext uppercase tracking-wider text-center">
                Instant Demo Credentials (1-Tap Test)
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillQuickDemo('admin@smartgym.com', 'SG@Admin2026')}
                  className="p-2 rounded-xl bg-[#1B202C] hover:bg-[#252C3D] border border-gym-border text-left transition-all group"
                >
                  <div className="flex items-center gap-1 text-[11px] font-black text-cyan-400 group-hover:text-cyan-300">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Owner</span>
                  </div>
                  <div className="text-[9px] text-gym-subtext truncate">admin@</div>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickDemo('trainer@smartgym.com', 'Trainer@2026')}
                  className="p-2 rounded-xl bg-[#1B202C] hover:bg-[#252C3D] border border-gym-border text-left transition-all group"
                >
                  <div className="flex items-center gap-1 text-[11px] font-black text-purple-400 group-hover:text-purple-300">
                    <Dumbbell className="w-3 h-3" />
                    <span>Trainer</span>
                  </div>
                  <div className="text-[9px] text-gym-subtext truncate">trainer@</div>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickDemo('member@smartgym.com', 'Member@2026')}
                  className="p-2 rounded-xl bg-[#1B202C] hover:bg-[#252C3D] border border-gym-border text-left transition-all group"
                >
                  <div className="flex items-center gap-1 text-[11px] font-black text-[#27D980] group-hover:text-emerald-300">
                    <Smartphone className="w-3 h-3" />
                    <span>Member</span>
                  </div>
                  <div className="text-[9px] text-gym-subtext truncate">member@</div>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ── 2. SIGN UP FORM ── */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#121622] border-2 border-white/15 focus:border-[#4F7CFF] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="alex@smartgym.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121622] border-2 border-white/15 focus:border-[#4F7CFF] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-[#121622] border-2 border-white/15 focus:border-[#4F7CFF] rounded-2xl pl-8 pr-3 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Fitness Goal</label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className="w-full bg-[#121622] border-2 border-white/15 focus:border-[#4F7CFF] rounded-2xl px-3 py-2.5 text-white text-xs font-semibold outline-none"
                >
                  <option value="Muscle Building">Muscle Building</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Body Recomposition">Body Recomp</option>
                  <option value="Endurance & Cardio">Cardio & VO2</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Password (Min. 6 chars)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#121622] border-2 border-white/15 focus:border-[#4F7CFF] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] text-white font-black text-xs shadow-xl shadow-[#4F7CFF]/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Member Account...' : 'Register & Launch Member App'}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ── 3. RESET PASSWORD FORM ── */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Account Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121622] border-2 border-white/15 focus:border-purple-500 rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-xl shadow-purple-600/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Sending Reset Email...' : 'Send Password Reset Link'}</span>
              <KeyRound className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Bottom Switch to Website */}
        <div className="pt-2 border-t border-gym-border/60 text-center">
          <Link
            to="/"
            className="text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            ← Return to Public Website
          </Link>
        </div>

      </div>
    </div>
  );
};
