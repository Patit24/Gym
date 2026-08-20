import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useGym } from '../../context/GymContext';
import { Activity, Dumbbell, Calendar, Building2, User, LogOut, Sparkles, Phone, ShieldCheck, ArrowRight } from 'lucide-react';

export const WebsiteLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { websiteCustomer, signOutWebsite } = useGym();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Membership Plans', path: '/plans' },
    { label: 'Class Schedule', path: '/schedule' },
    { label: 'Facilities', path: '/facilities' },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between selection:bg-[#27D980] selection:text-black">
      
      {/* ── PUBLIC WEBSITE HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#07090E]/90 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 select-none group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#27D980] p-[2px] shadow-lg shadow-[#27D980]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#07090E] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#27D980]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  SMART <span className="text-[#27D980]">GYM</span>
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30 hidden sm:inline">
                  OFFICIAL CLUB
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Premier Fitness, AI Coaching & Wellness
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#101420]/80 p-1 rounded-2xl border border-white/10 text-xs font-semibold">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#27D980] to-emerald-400 text-black font-extrabold shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Customer Portal Login or Account */}
          <div className="flex items-center gap-3">
            {websiteCustomer ? (
              <div className="flex items-center gap-2 bg-[#121726] border border-[#27D980]/40 p-1.5 pl-3 rounded-2xl">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-extrabold text-white">{websiteCustomer.name}</div>
                  <div className="text-[9px] text-[#27D980] font-mono">Website Customer</div>
                </div>
                <Link
                  to="/account"
                  className="px-3 py-1.5 rounded-xl bg-[#27D980]/20 text-[#27D980] hover:bg-[#27D980] hover:text-black font-extrabold text-xs transition-all flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Portal</span>
                </Link>
                <button
                  onClick={() => signOutWebsite()}
                  className="p-1.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/30 transition-colors"
                  title="Sign Out of Website"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-[#121622] hover:bg-[#1A2030] text-slate-200 hover:text-white border border-white/15 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-[#27D980]" />
                  <span>Customer Login</span>
                </Link>
                <Link
                  to="/plans"
                  className="hidden sm:flex px-4 py-2 rounded-xl bg-gradient-to-r from-[#27D980] to-emerald-400 text-black font-black text-xs shadow-lg shadow-[#27D980]/20 hover:scale-105 transition-all items-center gap-1"
                >
                  <span>Join Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Link to App Portal for Gym Staff / App Members */}
            <Link
              to="/app/login"
              className="text-[11px] font-bold text-slate-400 hover:text-cyan-400 transition-colors pl-2 border-l border-white/10 flex items-center gap-1"
              title="Open Smart Gym App (Member / Admin)"
            >
              <span>App OS</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      </header>

      {/* ── WEBSITE BODY CONTENT ── */}
      <main className="flex-1 w-full" id="website-content">
        <Outlet />
      </main>

      {/* ── PUBLIC WEBSITE FOOTER ── */}
      <footer className="border-t border-white/10 bg-[#05060A] py-10 px-4 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#27D980] flex items-center justify-center text-black font-black">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-white tracking-tight">SMART GYM CLUB</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              The premier fitness and wellness facility featuring biometric IoT gate passes, high-intensity training, and certified nutritionists.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/" className="hover:text-[#27D980] transition-colors">Home & Overview</Link></li>
              <li><Link to="/plans" className="hover:text-[#27D980] transition-colors">Membership Packages</Link></li>
              <li><Link to="/schedule" className="hover:text-[#27D980] transition-colors">Group Classes Timetable</Link></li>
              <li><Link to="/facilities" className="hover:text-[#27D980] transition-colors">Gym Facilities & Amenities</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Customer Services</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/login" className="hover:text-[#27D980] transition-colors">Website Customer Login</Link></li>
              <li><Link to="/account" className="hover:text-[#27D980] transition-colors">My Trial Passes & Bookings</Link></li>
              <li><Link to="/app/login" className="hover:text-[#27D980] transition-colors">Smart Gym Mobile / Desktop App</Link></li>
              <li><span className="text-slate-500">24/7 Gate Terminal Access</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Club Concierge</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-[#27D980]" />
                <span className="font-mono">+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-[#4F7CFF]" />
                <span>Suite 400, Financial District Center</span>
              </div>
              <div className="pt-2">
                <span className="text-[10px] text-[#27D980] font-bold bg-[#27D980]/10 px-2 py-1 rounded-md border border-[#27D980]/30">
                  ● Club Open Today: 05:00 AM – 11:00 PM
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <span>© 2026 Smart Gym Premier Enterprise. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="text-[#27D980] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Website Experience
            </span>
            <Link to="/app/login" className="text-slate-400 hover:text-white transition-colors">
              App Login
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
};
