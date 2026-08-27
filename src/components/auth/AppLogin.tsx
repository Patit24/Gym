import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updatePassword,
  signOut
} from 'firebase/auth';
import { auth } from '../../firebase';
import { useGym } from '../../context/GymContext';
import { INITIAL_APP_USERS } from '../../data/initialData';
import { AppUser } from '../../types/gym';
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
  Dumbbell,
  Eye,
  EyeOff
} from 'lucide-react';

export const AppLogin: React.FC = () => {
  const navigate = useNavigate();
  const { 
    firebaseUser, 
    appUserAccount, 
    appUsers, 
    members,
    employees,
    isAuthLoading, 
    addMember, 
    plans, 
    completeFirstLoginPasswordChange,
    setLocalSessionUser
  } = useGym();
  
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot' | 'first-login-change-password'>('signin');
  const [identifier, setIdentifier] = useState(''); // Email or Username (e.g. MEM00125)
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('Muscle Building');
  
  // First-login password change fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [pendingUserId, setPendingUserId] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Auto-redirect already authenticated users
  useEffect(() => {
    if (!isAuthLoading && firebaseUser && appUserAccount) {
      if (appUserAccount.isActive === false) {
        setError('Your account is currently deactivated or suspended. Please contact gym management.');
        signOut(auth);
        return;
      }

      if (appUserAccount.mustChangePassword) {
        setPendingUserId(appUserAccount.id);
        setAuthMode('first-login-change-password');
        return;
      }

      // Store auth context in localStorage
      localStorage.setItem('gym_auth_context', 'app');

      // STRICT 3-ROLE ROUTING:
      if (appUserAccount.role === 'Trainer' || appUserAccount.role === 'Dietitian') {
        navigate('/app/trainer/dashboard', { replace: true });
      } else if (appUserAccount.role === 'Member') {
        navigate('/app/user/dashboard', { replace: true });
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

    const cleanInput = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanInput || !cleanPass) {
      setError('Please enter your Username / Email and Password.');
      setIsLoading(false);
      return;
    }

    // 1. Check if user is Master Admin
    const isMasterAdminInput =
      cleanInput.toUpperCase() === 'MASTERADMIN' ||
      cleanInput.toLowerCase() === 'masteradmin@smartgym.com' ||
      cleanInput.toLowerCase() === 'masteradmin@smartgym.internal' ||
      cleanInput.toLowerCase() === 'admin' ||
      cleanInput.toUpperCase() === 'ADMIN01' ||
      cleanInput.toLowerCase() === 'admin@smartgym.com';

    // 2. Look up user by username (e.g. MEM00125, TRN00001), email, or linked ID
    let matchedUser = (appUsers || []).find(
      (u) =>
        u.username.toLowerCase() === cleanInput.toLowerCase() ||
        (u.email && u.email.toLowerCase() === cleanInput.toLowerCase()) ||
        u.id.toLowerCase() === cleanInput.toLowerCase() ||
        (u.linkedId && u.linkedId.toLowerCase() === cleanInput.toLowerCase())
    ) || INITIAL_APP_USERS.find(
      (u) =>
        u.username.toLowerCase() === cleanInput.toLowerCase() ||
        (u.email && u.email.toLowerCase() === cleanInput.toLowerCase()) ||
        u.id.toLowerCase() === cleanInput.toLowerCase()
    );

    const matchedEmployee = (employees || []).find(
      (emp) =>
        ((emp as any).username && (emp as any).username.toLowerCase() === cleanInput.toLowerCase()) ||
        (emp.id && emp.id.toLowerCase() === cleanInput.toLowerCase()) ||
        (emp.email && emp.email.toLowerCase() === cleanInput.toLowerCase()) ||
        (emp.phone && emp.phone.replace(/\D/g, '') === cleanInput.replace(/\D/g, '')) ||
        (emp.name && emp.name.toLowerCase() === cleanInput.toLowerCase())
    );

    const matchedMember = (members || []).find(
      (m) =>
        (m.username && m.username.toLowerCase() === cleanInput.toLowerCase()) ||
        (m.membershipNo && m.membershipNo.toLowerCase() === cleanInput.toLowerCase()) ||
        (m.email && m.email.toLowerCase() === cleanInput.toLowerCase()) ||
        (m.mobile && m.mobile.replace(/\D/g, '') === cleanInput.replace(/\D/g, ''))
    );

    // Determine the Firebase Auth compatible email
    let authEmail = '';
    if (isMasterAdminInput) {
      authEmail = 'masteradmin@smartgym.com';
    } else if (cleanInput.includes('@')) {
      authEmail = cleanInput.toLowerCase();
    } else if (matchedUser?.email && matchedUser.email.includes('@')) {
      authEmail = matchedUser.email.toLowerCase();
    } else if (matchedEmployee?.email && matchedEmployee.email.includes('@')) {
      authEmail = matchedEmployee.email.toLowerCase();
    } else if (matchedMember?.email && matchedMember.email.includes('@')) {
      authEmail = matchedMember.email.toLowerCase();
    } else {
      const uname = (matchedUser?.username || (matchedEmployee as any)?.username || matchedMember?.username || cleanInput).toLowerCase().replace(/[^a-z0-9]/g, '');
      authEmail = `${uname}@smartgym.com`;
    }

    if (!matchedUser && matchedEmployee) {
      const isTrainer = matchedEmployee.role === 'Trainer' || matchedEmployee.role === 'Dietitian';
      matchedUser = {
        id: matchedEmployee.id,
        username: (matchedEmployee as any).username || cleanInput,
        email: matchedEmployee.email || authEmail,
        password: (matchedEmployee as any).tempPassword,
        tempPassword: (matchedEmployee as any).tempPassword,
        role: matchedEmployee.role as any,
        linkedId: matchedEmployee.id,
        linkedName: matchedEmployee.name,
        branchId: matchedEmployee.branchId || 'branch-1',
        createdAt: matchedEmployee.joiningDate || new Date().toISOString(),
        createdByAdminId: 'system',
        isActive: (matchedEmployee as any).status !== 'Inactive',
        mustChangePassword: false,
        permissions: {
          canViewDashboard: true,
          canEditWorkouts: isTrainer,
          canEditDiets: isTrainer,
          canViewMembers: true,
          canManageFinance: matchedEmployee.role === 'Manager' || matchedEmployee.role === 'Accountant',
          canAccessAdmin: matchedEmployee.role === 'Manager' || matchedEmployee.role === 'Super Admin' || matchedEmployee.role === 'Owner',
        }
      };
    }

    // Account suspension check
    if (matchedUser && matchedUser.isActive === false) {
      setError('This account has been deactivated or suspended by gym management.');
      setIsLoading(false);
      return;
    }
    if (matchedMember && (matchedMember.status === 'Cancelled' || matchedMember.status === 'Suspended')) {
      setError('This membership is currently suspended. Please contact the front desk.');
      setIsLoading(false);
      return;
    }

    // MASTER ADMIN DIRECT AUTHENTICATION PATH
    if (isMasterAdminInput) {
      const isInitialPass = cleanPass === 'ChangeMe@2026#Admin';
      
      const masterAccount: AppUser = {
        id: 'USR-MASTERADMIN',
        username: 'MASTERADMIN',
        email: 'masteradmin@smartgym.com',
        role: 'Super Admin',
        linkedId: 'EMP-MASTERADMIN',
        linkedName: 'Master Administrator',
        branchId: 'all',
        createdAt: new Date().toISOString(),
        createdByAdminId: 'system',
        isActive: true,
        mustChangePassword: isInitialPass,
        isProtected: true,
        permissions: {
          canViewDashboard: true,
          canEditWorkouts: true,
          canEditDiets: true,
          canViewMembers: true,
          canManageFinance: true,
          canAccessAdmin: true,
        }
      };

      try {
        localStorage.setItem('gym_auth_context', 'app');
        await signInWithEmailAndPassword(auth, authEmail, cleanPass);
      } catch (fbErr: any) {
        try {
          await createUserWithEmailAndPassword(auth, authEmail, cleanPass);
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            try {
              await signInWithEmailAndPassword(auth, authEmail, cleanPass);
            } catch {}
          }
        }
      }

      setLocalSessionUser(masterAccount);

      if (isInitialPass) {
        setPendingUserId('USR-MASTERADMIN');
        setAuthMode('first-login-change-password');
        setIsLoading(false);
        return;
      }

      navigate('/app/admin/dashboard', { replace: true });
      setIsLoading(false);
      return;
    }

    try {
      localStorage.setItem('gym_auth_context', 'app');
      await signInWithEmailAndPassword(auth, authEmail, cleanPass);
      if (matchedUser) {
        setLocalSessionUser(matchedUser);
      } else if (matchedMember) {
        const mAcc: AppUser = {
          id: matchedMember.userId || matchedMember.id,
          username: matchedMember.username || cleanInput,
          email: matchedMember.email || authEmail,
          role: 'Member',
          linkedId: matchedMember.id,
          linkedName: matchedMember.name,
          branchId: matchedMember.branchId || 'branch-1',
          createdAt: matchedMember.startDate || new Date().toISOString(),
          createdByAdminId: 'system',
          isActive: true,
          mustChangePassword: matchedMember.mustChangePassword ?? false,
          permissions: {
            canViewDashboard: true,
            canEditWorkouts: false,
            canEditDiets: false,
            canViewMembers: false,
            canManageFinance: false,
            canAccessAdmin: false,
          }
        };
        setLocalSessionUser(mAcc);
      } else if (matchedEmployee) {
        const empAcc: AppUser = {
          id: matchedEmployee.id,
          username: (matchedEmployee as any).username || cleanInput,
          email: matchedEmployee.email || authEmail,
          role: matchedEmployee.role,
          linkedId: matchedEmployee.id,
          linkedName: matchedEmployee.name,
          branchId: matchedEmployee.branchId || 'branch-1',
          createdAt: matchedEmployee.joiningDate || new Date().toISOString(),
          createdByAdminId: 'system',
          isActive: true,
          mustChangePassword: false,
          permissions: {
            canViewDashboard: true,
            canEditWorkouts: matchedEmployee.role === 'Trainer',
            canEditDiets: matchedEmployee.role === 'Dietitian',
            canViewMembers: true,
            canManageFinance: matchedEmployee.role === 'Manager',
            canAccessAdmin: matchedEmployee.role === 'Manager',
          }
        };
        setLocalSessionUser(empAcc);
      }
    } catch (fbErr: any) {
      const isMatchingLocalPassword =
        (matchedUser && (matchedUser.password === cleanPass || matchedUser.tempPassword === cleanPass)) ||
        (matchedEmployee && ((matchedEmployee as any).tempPassword === cleanPass)) ||
        (matchedMember && (matchedMember.tempPassword === cleanPass));

      if (isMatchingLocalPassword) {
        try {
          await createUserWithEmailAndPassword(auth, authEmail, cleanPass);
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            try {
              await signInWithEmailAndPassword(auth, authEmail, cleanPass);
            } catch {}
          }
        }
        if (matchedUser) {
          setLocalSessionUser(matchedUser);
        } else if (matchedEmployee) {
          const empAcc: AppUser = {
            id: matchedEmployee.id,
            username: (matchedEmployee as any).username || cleanInput,
            email: matchedEmployee.email || authEmail,
            role: matchedEmployee.role,
            linkedId: matchedEmployee.id,
            linkedName: matchedEmployee.name,
            branchId: matchedEmployee.branchId || 'branch-1',
            createdAt: matchedEmployee.joiningDate || new Date().toISOString(),
            createdByAdminId: 'system',
            isActive: true,
            mustChangePassword: false,
            permissions: {
              canViewDashboard: true,
              canEditWorkouts: matchedEmployee.role === 'Trainer',
              canEditDiets: matchedEmployee.role === 'Dietitian',
              canViewMembers: true,
              canManageFinance: matchedEmployee.role === 'Manager',
              canAccessAdmin: matchedEmployee.role === 'Manager',
            }
          };
          setLocalSessionUser(empAcc);
        } else if (matchedMember) {
          const mAcc: AppUser = {
            id: matchedMember.userId || matchedMember.id,
            username: matchedMember.username || cleanInput,
            email: matchedMember.email || authEmail,
            role: 'Member',
            linkedId: matchedMember.id,
            linkedName: matchedMember.name,
            branchId: matchedMember.branchId || 'branch-1',
            createdAt: matchedMember.startDate || new Date().toISOString(),
            createdByAdminId: 'system',
            isActive: true,
            mustChangePassword: matchedMember.mustChangePassword ?? false,
            permissions: {
              canViewDashboard: true,
              canEditWorkouts: false,
              canEditDiets: false,
              canViewMembers: false,
              canManageFinance: false,
              canAccessAdmin: false,
            }
          };
          setLocalSessionUser(mAcc);
        }
      } else {
        if (fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/invalid-credential') {
          setError('Incorrect password. Please verify your temporary or personal password.');
        } else if (fbErr.code === 'auth/user-not-found') {
          setError('User not found. Please check your Username (e.g. MASTERADMIN, trainer username, or member ID) or Email.');
        } else if (fbErr.code === 'auth/too-many-requests') {
          setError('Access temporarily disabled due to many failed attempts. Please try again later.');
        } else {
          setError('Login failed. Please check your Username / Email and Password.');
        }
        setIsLoading(false);
        return;
      }
    }

    // Check first login password change requirement
    const targetUserId = matchedUser?.id || matchedMember?.userId || matchedMember?.id || '';
    const mustChange = matchedUser?.mustChangePassword || matchedMember?.mustChangePassword;

    if (mustChange) {
      setPendingUserId(targetUserId);
      setAuthMode('first-login-change-password');
      setIsLoading(false);
      return;
    }

    // Route immediately based on user role
    const finalRole = matchedUser ? matchedUser.role : (matchedEmployee ? matchedEmployee.role : (matchedMember ? 'Member' : 'Member'));
    if (finalRole === 'Trainer' || finalRole === 'Dietitian') {
      navigate('/app/trainer/dashboard', { replace: true });
    } else if (finalRole === 'Member') {
      navigate('/app/user/dashboard', { replace: true });
    } else {
      navigate('/app/admin/dashboard', { replace: true });
    }
    setIsLoading(false);
  };

  const handleCompletePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanNewPass = newPassword.trim();
    const cleanConfirmPass = confirmPassword.trim();

    if (cleanNewPass.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (cleanNewPass !== cleanConfirmPass) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Update password in Firebase Auth Auth Service if user is active
      if (auth.currentUser) {
        try {
          await updatePassword(auth.currentUser, cleanNewPass);
        } catch (authPwdErr) {
          console.warn('Firebase Auth password update note:', authPwdErr);
        }
      }

      // 2. Update password in Firestore database
      const targetId = pendingUserId || appUserAccount?.id || auth.currentUser?.uid || 'USR-MASTERADMIN';
      await completeFirstLoginPasswordChange(targetId, cleanNewPass);

      setSuccessMsg('✓ Password updated successfully! Accessing your portal...');
      const role = appUserAccount?.role || (pendingUserId.includes('MASTER') ? 'Super Admin' : 'Member');
      setTimeout(() => {
        if (role === 'Member') {
          navigate('/app/user/dashboard', { replace: true });
        } else if (role === 'Trainer' || role === 'Dietitian') {
          navigate('/app/trainer/dashboard', { replace: true });
        } else {
          navigate('/app/admin/dashboard', { replace: true });
        }
      }, 800);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Please try again.');
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
      const userCredential = await createUserWithEmailAndPassword(auth, identifier.trim(), password);
      const user = userCredential.user;

      // Register new member record in database
      const defaultPlan = plans[0] || { id: 'plan-1', name: 'Annual VIP All-Access Franchise', durationMonths: 12 };
      const startDate = new Date().toISOString().split('T')[0];
      const endDateObj = new Date();
      endDateObj.setMonth(endDateObj.getMonth() + (defaultPlan.durationMonths || 12));
      const endDate = endDateObj.toISOString().split('T')[0];

      await addMember({
        name: fullName.trim() || 'New Member',
        email: identifier.trim(),
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
      await sendPasswordResetEmail(auth, identifier.trim());
      setSuccessMsg(`Password reset link sent to ${identifier.trim()}. Please check your inbox.`);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Unable to send reset email. Verify email address.');
      setIsLoading(false);
    }
  };

  if (isAuthLoading || (firebaseUser && !appUserAccount && authMode !== 'first-login-change-password')) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center gap-3">
        <Activity className="w-9 h-9 text-[#27D980] animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Verifying session & credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#27D980]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#4F7CFF]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Glass Authentication Card */}
      <div className="w-full max-w-md bg-[#0F1322]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4F7CFF] to-[#27D980] p-[2px] mx-auto shadow-lg shadow-[#27D980]/20">
            <div className="w-full h-full bg-[#07090E] rounded-[14px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#27D980]" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
            SMART <span className="text-[#27D980]">GYM</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            {authMode === 'first-login-change-password'
              ? 'Security Setup — Set Your Personal Password'
              : 'Member, Trainer & Owner Portal'}
          </p>
        </div>

        {/* Mode Selector Tabs (Hidden on First Login Password Change) */}
        {authMode !== 'first-login-change-password' && (
          <div className="grid grid-cols-3 gap-1 bg-[#07090E] p-1 rounded-2xl border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setError(''); setSuccessMsg(''); }}
              className={`py-2 rounded-xl transition-all ${authMode === 'signin' ? 'bg-[#27D980] text-black shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
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
        )}

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

        {/* ═══════════════════════════════════════════════════════════
            MODE 1: FIRST LOGIN PASSWORD SETUP (FORCE PASSWORD CHANGE)
        ═══════════════════════════════════════════════════════════ */}
        {authMode === 'first-login-change-password' && (
          <form onSubmit={handleCompletePasswordChange} className="space-y-4 animate-in fade-in">
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs space-y-1">
              <div className="font-black flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>First Login Security Requirement</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                You logged in with a temporary password sent via WhatsApp. For your security, please create your new permanent personal password.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">
                New Password (Min 6 Characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Create new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#07090E] border border-white/15 focus:border-[#27D980] rounded-2xl pl-10 pr-10 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#07090E] border border-white/15 focus:border-[#27D980] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#27D980] to-[#4F7CFF] text-black font-black text-xs shadow-xl shadow-[#27D980]/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Saving New Password...' : 'Save Password & Enter App'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════════
            MODE 2: SIGN IN FORM (AUTO-MAPPING USERNAME & FIREBASE AUTH)
        ═══════════════════════════════════════════════════════════ */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">
                Username (e.g. MEM00125) or Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. MEM00125 or rahul@gmail.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#07090E] border border-white/15 focus:border-[#27D980] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none transition-colors"
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
                  placeholder="Temporary or personal password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#07090E] border border-white/15 focus:border-[#27D980] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#27D980] via-[#4F7CFF] to-[#27D980] bg-[length:200%_auto] hover:bg-[position:right_center] text-black font-black text-xs shadow-xl shadow-[#27D980]/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Log In to Smart Gym'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════════
            MODE 3: SIGN UP FORM
        ═══════════════════════════════════════════════════════════ */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Rahul Roy"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#07090E] border border-white/15 focus:border-[#4F7CFF] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#07090E] border border-white/15 focus:border-[#4F7CFF] rounded-2xl px-3 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">WhatsApp Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-[#07090E] border border-white/15 focus:border-[#4F7CFF] rounded-2xl px-3 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Primary Fitness Goal</label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                className="w-full bg-[#07090E] border border-white/15 focus:border-[#4F7CFF] rounded-2xl px-3.5 py-2.5 text-white text-xs font-semibold outline-none"
              >
                <option value="Muscle Building">Muscle Building</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Body Recomposition">Body Recomposition</option>
                <option value="Endurance & Cardio">Endurance & Cardio</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">Password (Min 6 chars)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#07090E] border border-white/15 focus:border-[#4F7CFF] rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-[#27D980] text-white font-black text-xs shadow-xl shadow-[#4F7CFF]/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Member Pass...' : 'Create Member Account'}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════════
            MODE 4: FORGOT PASSWORD FORM
        ═══════════════════════════════════════════════════════════ */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-wide">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#07090E] border border-white/15 focus:border-purple-500 rounded-2xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold placeholder-slate-600 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-xl shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Sending Reset Instructions...' : 'Send Password Reset Link'}</span>
              <KeyRound className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
