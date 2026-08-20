import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGym } from '../../context/GymContext';
import { 
  Activity, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const WebsiteLogin: React.FC = () => {
  const navigate = useNavigate();
  const { websiteCustomer, signInWebsiteCustomer, signUpWebsiteCustomer } = useGym();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated as website customer, redirect to website customer account
  useEffect(() => {
    if (websiteCustomer) {
      navigate('/account', { replace: true });
    }
  }, [websiteCustomer, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // If Admin/Staff or Member account is entered on website login, route them to App!
    if (cleanEmail.includes('admin') || cleanEmail.includes('owner') || cleanEmail === 'admin@smartgym.com') {
      localStorage.setItem('gym_auth_context', 'app');
      localStorage.removeItem('gym_website_customer_id');
      navigate('/app/admin/dashboard', { replace: true });
      return;
    }

    if (cleanEmail.includes('trainer') || cleanEmail === 'trainer@smartgym.com') {
      localStorage.setItem('gym_auth_context', 'app');
      localStorage.removeItem('gym_website_customer_id');
      navigate('/app/trainer/dashboard', { replace: true });
      return;
    }

    if (cleanEmail === 'member@smartgym.com') {
      localStorage.setItem('gym_auth_context', 'app');
      localStorage.removeItem('gym_website_customer_id');
      navigate('/app/user/dashboard', { replace: true });
      return;
    }

    try {
      await signInWebsiteCustomer(email.trim(), password);
      navigate('/website/account', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid customer email or password.');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    if (!name.trim() || !email.trim()) {
      setError('Please provide your name and email address.');
      setIsLoading(false);
      return;
    }

    try {
      await signUpWebsiteCustomer({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || '+91 98765 00000',
      });
      setSuccessMsg('Website customer account created! Redirecting to customer portal...');
      setTimeout(() => {
        navigate('/account', { replace: true });
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email may already be registered.');
      setIsLoading(false);
    }
  };

  const fillDemoCustomer = () => {
    setEmail('customer@smartgym.com');
    setPassword('Customer@2026');
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[#27D980]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-[#101422]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#27D980]/15 border border-[#27D980]/30 text-[#27D980] mb-1">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Website Customer Portal</h1>
          <p className="text-xs text-slate-400">
            {mode === 'signin' 
              ? 'Log in to manage your trial passes, booked group classes, and online inquiries.' 
              : 'Create a free website customer account to unlock 3-day trial passes and class slots.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-1 bg-[#090C14] p-1 rounded-2xl border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-[#27D980] text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-[#4F7CFF] text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New Customer Pass
          </button>
        </div>

        {/* Alert Notifications */}
        {error && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-[#27D980] shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── SIGN IN FORM ── */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Customer Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="customer@smartgym.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#080B12] border border-white/15 focus:border-[#27D980] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#080B12] border border-white/15 focus:border-[#27D980] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#27D980] to-emerald-400 text-black font-black text-xs shadow-xl shadow-[#27D980]/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating Customer...' : 'Log In to Website Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Fill */}
            <div className="pt-2 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={fillDemoCustomer}
                className="text-[11px] text-[#27D980] hover:underline font-bold"
              >
                ⚡ Autofill Demo Customer (customer@smartgym.com)
              </button>
            </div>
          </form>
        )}

        {/* ── SIGN UP FORM ── */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080B12] border border-white/15 focus:border-[#4F7CFF] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
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
                  placeholder="priya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#080B12] border border-white/15 focus:border-[#4F7CFF] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#080B12] border border-white/15 focus:border-[#4F7CFF] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#080B12] border border-white/15 focus:border-[#4F7CFF] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-cyan-400 text-white font-black text-xs shadow-xl shadow-[#4F7CFF]/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account & Claim Free Pass'}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-white/10 space-y-1">
          <p>This login is exclusively for Website Customers.</p>
          <p>
            Looking for Gym Member / Staff App?{' '}
            <Link to="/app/login" className="text-cyan-400 hover:underline font-bold">
              Open App Login →
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
