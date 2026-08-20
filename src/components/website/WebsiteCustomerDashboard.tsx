import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGym } from '../../context/GymContext';
import { 
  User, 
  Calendar, 
  Sparkles, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  ArrowRight,
  Phone,
  Mail,
  Zap,
  Dumbbell
} from 'lucide-react';

export const WebsiteCustomerDashboard: React.FC = () => {
  const { websiteCustomer, claimWebsiteTrialPass } = useGym();
  const [claimSuccess, setClaimSuccess] = useState(false);

  if (!websiteCustomer) return null;

  const handleClaimTrial = async () => {
    await claimWebsiteTrialPass(websiteCustomer.id, '3-Day VIP All-Access Trial Pass');
    setClaimSuccess(true);
    setTimeout(() => setClaimSuccess(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      
      {/* Customer Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#101726] via-[#0E1522] to-[#0A0E18] border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#27D980] to-[#4F7CFF] p-[2px] shadow-lg shadow-[#27D980]/20 shrink-0">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              <User className="w-8 h-8 text-[#27D980]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">{websiteCustomer.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#27D980]/20 text-[#27D980] border border-[#27D980]/40 text-[10px] font-black uppercase">
                Website Customer
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
              <span>Email: <strong className="text-slate-200">{websiteCustomer.email}</strong></span>
              <span>•</span>
              <span>Phone: <strong className="text-slate-200">{websiteCustomer.phone}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            to="/plans"
            className="w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#27D980] to-emerald-400 text-black font-black text-xs shadow-lg shadow-[#27D980]/20 hover:scale-105 transition-all text-center"
          >
            Upgrade to Full Membership
          </Link>
          <Link
            to="/schedule"
            className="w-full md:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all text-center"
          >
            Book A Class
          </Link>
        </div>
      </div>

      {claimSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-black flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#27D980]" />
          <span>🎉 3-Day VIP Trial Pass activated! Your digital pass token is ready below.</span>
        </div>
      )}

      {/* Main Grid: Passes & Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Active Passes & Booked Classes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Passes Section */}
          <div className="p-6 rounded-3xl bg-[#101422] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#27D980]" />
                <h3 className="text-sm font-black text-white">Active Passes & Gate Entry Tokens</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {websiteCustomer.purchasedPasses?.length || 0} Pass(es)
              </span>
            </div>

            {(!websiteCustomer.purchasedPasses || websiteCustomer.purchasedPasses.length === 0) ? (
              <div className="p-6 rounded-2xl bg-[#080B12] text-center space-y-3">
                <p className="text-xs text-slate-400">You do not have an active guest trial pass yet.</p>
                <button
                  onClick={handleClaimTrial}
                  className="px-4 py-2 rounded-xl bg-[#27D980] text-black font-black text-xs shadow-md"
                >
                  ⚡ Claim Free 3-Day VIP Pass Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {websiteCustomer.purchasedPasses.map((pass) => (
                  <div
                    key={pass.id}
                    className="p-4 rounded-2xl bg-[#080B12] border border-[#27D980]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{pass.passName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#27D980] text-[9px] font-black uppercase">
                          {pass.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Valid Thru: <strong className="text-[#27D980]">{pass.expiryDate}</strong>
                      </p>
                      <div className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded-md inline-block border border-cyan-500/20">
                        Token: {pass.qrToken}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-white/5 p-2 rounded-xl border border-white/10 shrink-0">
                      <QrCode className="w-5 h-5 text-[#27D980]" />
                      <span>Ready for Gate Scan</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booked Classes Section */}
          <div className="p-6 rounded-3xl bg-[#101422] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#4F7CFF]" />
                <h3 className="text-sm font-black text-white">Your Booked Group Classes</h3>
              </div>
              <Link to="/schedule" className="text-xs text-[#4F7CFF] hover:underline font-bold">
                + Book Another Class
              </Link>
            </div>

            {(!websiteCustomer.bookedClasses || websiteCustomer.bookedClasses.length === 0) ? (
              <div className="p-6 rounded-2xl bg-[#080B12] text-center space-y-3">
                <p className="text-xs text-slate-400">You haven't reserved any group fitness classes yet.</p>
                <Link
                  to="/schedule"
                  className="inline-flex px-4 py-2 rounded-xl bg-[#4F7CFF] text-white font-bold text-xs"
                >
                  Browse Weekly Class Schedule
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {websiteCustomer.bookedClasses.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 rounded-2xl bg-[#080B12] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{booking.className}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#4F7CFF]/20 text-[#4F7CFF] text-[9px] font-black uppercase">
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          {booking.dateTime}
                        </span>
                        <span>Instructor: <strong className="text-white">{booking.instructor}</strong></span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#27D980]" />
                      <span>{booking.branchName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Col: Club Information & Helpdesk */}
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#182035] to-[#0E1322] border-2 border-[#4F7CFF] space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-black text-white">Full Gym Membership</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unlock 24/7 unlimited access across all franchise locations, dedicated personal training splits, daily macro diet coaching, and luxury steam & sauna recovery.
            </p>
            <Link
              to="/plans"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4F7CFF] to-cyan-400 text-white font-black text-xs text-center block shadow-lg shadow-[#4F7CFF]/25 hover:scale-[1.02] transition-all"
            >
              Browse Full Packages
            </Link>
          </div>

          <div className="p-6 rounded-3xl bg-[#101422] border border-white/10 space-y-4">
            <h3 className="text-sm font-black text-white">Concierge Support</h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#27D980]" />
                <span>Club Hotline: <strong className="text-white">+91 98765 43210</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#4F7CFF]" />
                <span>Email: <strong className="text-white">support@smartgym.com</strong></span>
              </div>
              <div className="p-3 rounded-xl bg-[#080B12] border border-white/10 text-[10px] text-slate-400">
                Gate turnstiles operate 24 hours. Concierge staff available 05:00 AM – 11:00 PM daily.
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
