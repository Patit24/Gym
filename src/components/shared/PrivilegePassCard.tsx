import React, { useState } from 'react';
import { Member } from '../../types/gym';
import { RefreshCw, Wifi, Activity } from 'lucide-react';

interface PrivilegePassCardProps {
  member: Member;
  priorityText?: string;
  showFlipButton?: boolean;
  className?: string;
}

export const PrivilegePassCard: React.FC<PrivilegePassCardProps> = ({
  member,
  showFlipButton = true,
  className = '',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Format dates
  const memberSinceFormatted = member?.startDate
    ? `${new Date(member.startDate).getMonth() + 1}/${String(new Date(member.startDate).getFullYear()).slice(-2)}`
    : '1/26';

  const expiryFormatted = member?.expiryDate || member?.endDate
    ? `${new Date(member.expiryDate || member.endDate).getMonth() + 1}/${String(new Date(member.expiryDate || member.endDate).getFullYear()).slice(-2)}`
    : '1/27';

  const memberName = (member?.name || 'ALEX MORGAN').toUpperCase();
  const membershipPin = member?.membershipNo ? member.membershipNo.replace(/\D/g, '').slice(-4) || '0210' : '0210';
  const fullMembershipId = member?.membershipNo || 'SG-90210';

  return (
    <div className={`flex flex-col items-center space-y-2 select-none w-full ${className}`}>
      
      {/* 3D Card Container with Compact Decreased Height */}
      <div
        className="w-full max-w-[340px] sm:max-w-[420px] md:max-w-[450px] h-[185px] sm:h-[210px] [perspective:1200px] cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
        title="Click to flip card"
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          
          {/* ════════════════════════════════════════════════════════════════
              FRONT OF SLEEK BLACK & WHITE LUXURY MEMBERSHIP CARD
          ════════════════════════════════════════════════════════════════ */}
          <div className="absolute inset-0 w-full h-full rounded-[22px] bg-[#07090D] border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.85)] [backface-visibility:hidden] overflow-hidden flex flex-col justify-between p-4 sm:p-5">
            
            {/* Deep Obsidian Black Surface */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#12151E] via-[#08090D] to-[#030406] pointer-events-none" />

            {/* Subtle Glass Sheen Reflection */}
            <div className="absolute -top-20 -left-16 w-[450px] h-[220px] bg-gradient-to-b from-white/[0.07] via-white/[0.015] to-transparent rotate-[25deg] pointer-events-none rounded-[80px] blur-[1px]" />

            {/* Wave Ribbon Curves (Crisp Platinum & Black Monochrome Aesthetics) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 450 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full preserve-3d">
                <defs>
                  {/* Subtle Monochrome Stardust Pattern */}
                  <pattern id="silverGlitterPattern" width="24" height="24" patternUnits="userSpaceOnUse">
                    <rect width="24" height="24" fill="#1C212B" />
                    <circle cx="2" cy="3" r="1.1" fill="#FFFFFF" opacity="0.6" />
                    <circle cx="8" cy="9" r="0.9" fill="#E2E8F0" opacity="0.5" />
                    <circle cx="16" cy="5" r="1.3" fill="#CBD5E1" opacity="0.7" />
                    <circle cx="21" cy="11" r="0.9" fill="#FFFFFF" opacity="0.8" />
                    <circle cx="6" cy="17" r="1.2" fill="#94A3B8" opacity="0.5" />
                    <circle cx="14" cy="20" r="0.8" fill="#F8FAFC" opacity="0.7" />
                    <circle cx="19" cy="16" r="1.2" fill="#FFFFFF" opacity="0.6" />
                  </pattern>

                  {/* Platinum White Gradients */}
                  <linearGradient id="silverStreamMain" x1="0" y1="180" x2="450" y2="80" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#475569" stopOpacity="0" />
                    <stop offset="30%" stopColor="#94A3B8" />
                    <stop offset="60%" stopColor="#FFFFFF" />
                    <stop offset="85%" stopColor="#CBD5E1" />
                    <stop offset="100%" stopColor="#64748B" stopOpacity="0.4" />
                  </linearGradient>

                  <linearGradient id="silverStreamSecondary" x1="450" y1="210" x2="200" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#94A3B8" />
                    <stop offset="100%" stopColor="#334155" stopOpacity="0.2" />
                  </linearGradient>

                  <filter id="cardShadow" x="-10%" y="-10%" width="130%" height="130%">
                    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.9" />
                  </filter>
                </defs>

                {/* Sweeping Silver Ribbon Bands */}
                <path
                  d="M 120 210 C 210 155, 270 120, 450 125 L 450 155 C 285 145, 225 180, 150 210 Z"
                  fill="url(#silverGlitterPattern)"
                  filter="url(#cardShadow)"
                />

                <path
                  d="M 120 210 C 210 155, 270 120, 450 125"
                  stroke="url(#silverStreamMain)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                <path
                  d="M 0 150 C 110 155, 190 120, 290 85 C 350 60, 400 80, 450 100"
                  stroke="url(#silverStreamMain)"
                  strokeWidth="2.5"
                  fill="none"
                  filter="url(#cardShadow)"
                />

                <path
                  d="M 10 158 C 120 162, 200 128, 300 93 C 360 68, 410 88, 450 108"
                  stroke="url(#silverStreamSecondary)"
                  strokeWidth="1.5"
                  fill="none"
                />

                <path
                  d="M 230 210 C 300 170, 360 135, 450 155 L 450 172 C 370 152, 310 185, 250 210 Z"
                  fill="url(#silverStreamMain)"
                  opacity="0.8"
                />
              </svg>
            </div>

            {/* Top Row: Platinum EMV Chip (Left) & Black-and-White "Membership Card" (Right) */}
            <div className="relative z-10 flex items-start justify-between">
              
              {/* Platinum / Silver EMV Smart Chip */}
              <div className="flex items-center gap-2">
                <div className="relative w-10 sm:w-11 h-8 sm:h-9 rounded-lg bg-gradient-to-br from-[#F8FAFC] via-[#CBD5E1] to-[#64748B] p-[1.2px] shadow-[0_2px_8px_rgba(0,0,0,0.8)] border border-white/60 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-tr from-[#94A3B8] via-[#E2E8F0] to-[#64748B] rounded-[7px] relative flex flex-col justify-between p-0.5">
                    <div className="flex justify-between w-full h-[30%] border-b border-black/40 pb-0.5">
                      <span className="w-2.5 h-full border-r border-black/40" />
                      <span className="w-2.5 h-full border-l border-black/40" />
                    </div>
                    <div className="w-4 h-2 rounded-sm border border-black/40 mx-auto bg-white/40" />
                    <div className="flex justify-between w-full h-[30%] border-t border-black/40 pt-0.5">
                      <span className="w-2.5 h-full border-r border-black/40" />
                      <span className="w-2.5 h-full border-l border-black/40" />
                    </div>
                  </div>
                </div>

                <span className="text-[9px] font-mono text-white/90 font-bold tracking-widest">
                  {membershipPin}
                </span>
              </div>

              {/* Top Right: Crisp Pure White Typography */}
              <div className="text-right">
                <span
                  className="text-base sm:text-lg font-serif italic text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] block font-semibold"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Membership Card
                </span>
                <span className="block text-[7.5px] sm:text-[8.5px] tracking-[0.2em] text-slate-200 uppercase font-mono font-bold mt-0.5">
                  {member?.planName || 'ANNUAL VIP ALL-ACCESS FRANCHISE'}
                </span>
              </div>

            </div>

            {/* Center-Left: Embossed Member Name (Crisp Pure White) */}
            <div className="relative z-10 space-y-0.5 my-auto pt-1">
              <div
                className="font-mono text-sm sm:text-base font-extrabold tracking-[0.2em] text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                style={{ textShadow: '1px 1px 3px #000, 0 0 8px rgba(255,255,255,0.2)' }}
              >
                {memberName}
              </div>
              <div className="font-mono text-[9px] sm:text-[10px] font-bold text-slate-300 tracking-wider">
                ID: {fullMembershipId}
              </div>
            </div>

            {/* Bottom-Left: Dates (Crisp Black & White) & Contactless NFC */}
            <div className="relative z-10 flex items-end justify-between pt-1">
              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-[7.5px] sm:text-[8px] font-bold tracking-[0.15em] text-slate-300 uppercase font-mono block">
                    MEMBER SINCE
                  </span>
                  <span
                    className="font-mono text-xs sm:text-sm font-black tracking-widest text-white drop-shadow"
                    style={{ textShadow: '1px 1px 2px #000' }}
                  >
                    {memberSinceFormatted}
                  </span>
                </div>

                <div className="border-l border-white/25 pl-3">
                  <span className="text-[7.5px] sm:text-[8px] font-bold tracking-[0.15em] text-slate-300 uppercase font-mono block">
                    VALID THRU
                  </span>
                  <span
                    className="font-mono text-xs sm:text-sm font-black tracking-widest text-white drop-shadow"
                    style={{ textShadow: '1px 1px 2px #000' }}
                  >
                    {expiryFormatted}
                  </span>
                </div>
              </div>

              {/* NFC Contactless Wave Indicator (Pure White) */}
              <div className="flex items-center opacity-90 text-white">
                <Wifi className="w-4 h-4 rotate-90 text-white drop-shadow" />
              </div>
            </div>

          </div>

          {/* ════════════════════════════════════════════════════════════════
              BACK OF COMPACT MONOCHROME MEMBERSHIP PASS CARD
          ════════════════════════════════════════════════════════════════ */}
          <div className="absolute inset-0 w-full h-full rounded-[22px] bg-[#07090D] border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.85)] [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden flex flex-col justify-between p-4 sm:p-5">
            
            {/* Deep Obsidian Black Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#12151E] via-[#08090D] to-[#030406] pointer-events-none" />

            {/* Black / Silver Magnetic Stripe */}
            <div className="absolute top-7 sm:top-8 inset-x-0 h-8 sm:h-9 bg-gradient-to-r from-[#1E293B] via-[#0F172A] via-[#334155] to-[#1E293B] shadow-[0_2px_8px_rgba(0,0,0,0.8)] border-y border-white/10" />

            {/* Top Serial Number Header */}
            <div className="relative z-10 flex justify-between text-[8px] sm:text-[9px] text-slate-300 font-mono">
              <span className="tracking-widest uppercase">SMART GYM PASS</span>
              <span className="font-bold text-white">{fullMembershipId}</span>
            </div>

            {/* Center: Membership Terms & Official Club Badge */}
            <div className="relative z-10 grid grid-cols-3 gap-3 items-center pt-6 sm:pt-7">
              
              <div className="col-span-2 text-[7.5px] sm:text-[8.5px] text-slate-200 leading-snug space-y-0.5">
                <p className="text-white font-medium">
                  Authorized 24/7 RFID turnstile & dynamic QR gate entry across all clubs.
                </p>
                <p className="text-slate-400">
                  Non-transferable. Present for locker & trainer reservations.
                </p>
              </div>

              {/* Club Logo */}
              <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-black text-white tracking-wider">SMART GYM</span>
                  <div className="w-4 h-4 rounded-md bg-white text-black flex items-center justify-center shadow-md">
                    <Activity className="w-2.5 h-2.5 text-black" />
                  </div>
                </div>
                <span className="text-[6.5px] text-slate-300 font-mono tracking-widest mt-0.5 font-bold uppercase">
                  VERIFIED PASS
                </span>
              </div>

            </div>

            {/* Footer: Crisp Barcode & Club Contact Info */}
            <div className="relative z-10 flex items-end justify-between pt-1 border-t border-white/10">
              
              {/* Clean Vertical Barcode Block */}
              <div className="bg-white px-2 py-0.5 rounded-md flex flex-col items-center shadow-md">
                <div className="flex items-center gap-[1.5px] h-4 sm:h-5">
                  {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 2, 1, 3, 1, 2].map((w, i) => (
                    <span key={i} style={{ width: `${w}px` }} className="h-full bg-black block" />
                  ))}
                </div>
                <span className="text-[7px] font-mono font-bold text-black tracking-widest mt-0.5">
                  {fullMembershipId}
                </span>
              </div>

              {/* Club Info */}
              <div className="text-right text-[7.5px] sm:text-[8px] text-slate-200 space-y-0.5">
                <div className="font-bold text-white uppercase tracking-wider">Smart Gym Franchise</div>
                <div className="text-slate-300 font-mono font-semibold">+91 98765 43210</div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Interactive Flip Trigger Button */}
      {showFlipButton && (
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#11141D] hover:bg-[#181D2A] border border-white/10 text-slate-300 hover:text-white text-[11px] font-bold transition-all shadow-md active:scale-95 cursor-pointer mt-0.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-white animate-spin-slow" />
          <span>{isFlipped ? 'Show Front' : 'Tap to Flip Card'}</span>
        </button>
      )}

    </div>
  );
};
