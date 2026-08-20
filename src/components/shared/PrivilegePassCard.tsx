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
    : '10/21';

  const expiryFormatted = member?.expiryDate || member?.endDate
    ? `${new Date(member.expiryDate || member.endDate).getMonth() + 1}/${String(new Date(member.expiryDate || member.endDate).getFullYear()).slice(-2)}`
    : '12/28';

  const memberName = (member?.name || 'CARD HOLDER').toUpperCase();
  const membershipPin = member?.membershipNo ? member.membershipNo.replace(/\D/g, '').slice(-4) || '1234' : '1234';
  const fullMembershipId = member?.membershipNo || 'SG-90210';

  return (
    <div className={`flex flex-col items-center space-y-3 select-none w-full ${className}`}>
      
      {/* 3D Card Container with Increased Luxury Width */}
      <div
        className="w-full max-w-[360px] sm:max-w-[480px] md:max-w-[510px] h-[230px] sm:h-[285px] md:h-[295px] [perspective:1200px] cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
        title="Click to flip card"
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          
          {/* ════════════════════════════════════════════════════════════════
              FRONT OF LUXURY GOLD-RIBBON MEMBERSHIP CARD
          ════════════════════════════════════════════════════════════════ */}
          <div className="absolute inset-0 w-full h-full rounded-[28px] bg-[#0A0C10] border border-[#3A3F4D]/50 shadow-[0_20px_45px_rgba(0,0,0,0.9)] [backface-visibility:hidden] overflow-hidden flex flex-col justify-between p-5 sm:p-7">
            
            {/* Deep Obsidian Gloss Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#13161F] via-[#090A0E] to-[#040507] pointer-events-none" />

            {/* Diagonal Glass Reflection Sheen */}
            <div className="absolute -top-24 -left-20 w-[500px] h-[300px] bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-transparent rotate-[28deg] pointer-events-none rounded-[100px] blur-[1px]" />

            {/* Luxury Golden Wave Curves & Sparkling Glitter Ribbon (SVG Layer) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 510 295" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full preserve-3d">
                <defs>
                  {/* Dense Sparkling Gold Glitter Pattern */}
                  <pattern id="goldGlitterPatternFull" width="28" height="28" patternUnits="userSpaceOnUse">
                    <rect width="28" height="28" fill="#C59B27" />
                    <circle cx="2" cy="3" r="1.4" fill="#FFEAA7" opacity="0.95" />
                    <circle cx="8" cy="9" r="1.1" fill="#FFF9D2" opacity="0.95" />
                    <circle cx="16" cy="5" r="1.6" fill="#E1B12C" opacity="0.8" />
                    <circle cx="22" cy="11" r="1.2" fill="#FFFDF0" opacity="1" />
                    <circle cx="6" cy="18" r="1.5" fill="#FBC531" opacity="0.85" />
                    <circle cx="13" cy="22" r="1" fill="#FFF8DC" opacity="0.9" />
                    <circle cx="20" cy="19" r="1.7" fill="#FFEAA7" opacity="0.95" />
                    <circle cx="25" cy="24" r="1.3" fill="#996515" opacity="0.6" />
                    <circle cx="10" cy="13" r="0.7" fill="#FFFFFF" opacity="0.95" />
                    <circle cx="17" cy="15" r="0.8" fill="#FFFFFF" opacity="1" />
                    <circle cx="4" cy="25" r="1.3" fill="#D4AF37" opacity="0.8" />
                    <circle cx="24" cy="3" r="0.9" fill="#FFF9E6" opacity="0.9" />
                  </pattern>

                  {/* Golden Ribbon Linear Gradients */}
                  <linearGradient id="goldStreamMain" x1="0" y1="260" x2="510" y2="120" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#A67C1E" stopOpacity="0" />
                    <stop offset="25%" stopColor="#D4AF37" />
                    <stop offset="50%" stopColor="#FFF2B2" />
                    <stop offset="75%" stopColor="#E5B83B" />
                    <stop offset="100%" stopColor="#996515" />
                  </linearGradient>

                  <linearGradient id="goldStreamSecondary" x1="510" y1="295" x2="260" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFE89E" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#8C6214" stopOpacity="0.2" />
                  </linearGradient>

                  {/* Soft Drop Shadow for Wave Depth */}
                  <filter id="waveShadowFull" x="-10%" y="-10%" width="130%" height="130%">
                    <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.85" />
                  </filter>
                </defs>

                {/* Background Shadow Ribbon */}
                <path
                  d="M 160 295 C 280 220, 340 135, 510 145 L 510 175 C 350 165, 290 240, 180 295 Z"
                  fill="#000000"
                  opacity="0.6"
                  filter="url(#waveShadowFull)"
                />

                {/* Primary Dense Gold Glitter Wave */}
                <path
                  d="M 130 295 C 235 225, 310 178, 510 182 L 510 220 C 325 210, 255 258, 170 295 Z"
                  fill="url(#goldGlitterPatternFull)"
                  filter="url(#waveShadowFull)"
                />

                {/* Overlay High-Glow Top Contour */}
                <path
                  d="M 130 295 C 235 225, 310 178, 510 182"
                  stroke="url(#goldStreamMain)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Upper Thin Golden Wave Strand */}
                <path
                  d="M 0 215 C 130 220, 220 172, 330 120 C 400 85, 450 110, 510 140"
                  stroke="url(#goldStreamMain)"
                  strokeWidth="3.5"
                  fill="none"
                  filter="url(#waveShadowFull)"
                />

                {/* Fine Delicate Golden Accent Strand */}
                <path
                  d="M 15 224 C 140 228, 235 182, 345 132 C 415 97, 465 120, 510 148"
                  stroke="url(#goldStreamSecondary)"
                  strokeWidth="2"
                  fill="none"
                />

                {/* Secondary Lower Sweeping Gold Ribbon */}
                <path
                  d="M 260 295 C 340 245, 405 195, 510 225 L 510 245 C 415 218, 350 265, 285 295 Z"
                  fill="url(#goldStreamMain)"
                  opacity="0.9"
                />
              </svg>
            </div>

            {/* Top Row: EMV Gold Chip (Left) & Elegant Gold "Membership Card" Title (Right) */}
            <div className="relative z-10 flex items-start justify-between">
              
              {/* Ultra-Realistic Gold EMV Smart Chip */}
              <div className="flex flex-col items-center">
                <div className="relative w-13 sm:w-14 h-10 sm:h-11 rounded-xl bg-gradient-to-br from-[#FFE89E] via-[#D4AF37] to-[#8C6214] p-[1.5px] shadow-[0_3px_10px_rgba(0,0,0,0.7)] border border-[#FFDF79]/50 overflow-hidden">
                  {/* Internal brushed metallic texture */}
                  <div className="w-full h-full bg-gradient-to-tr from-[#C59B27] via-[#F4D068] to-[#996515] rounded-[9px] relative flex flex-col justify-between p-1">
                    {/* Micro contact lines */}
                    <div className="flex justify-between w-full h-[30%] border-b border-[#6E4708]/60 pb-0.5">
                      <span className="w-3 h-full border-r border-[#6E4708]/60" />
                      <span className="w-3 h-full border-l border-[#6E4708]/60" />
                    </div>
                    {/* Central contact circle */}
                    <div className="w-5 h-3 rounded-sm border border-[#6E4708]/60 mx-auto bg-[#E5B83B]/60" />
                    <div className="flex justify-between w-full h-[30%] border-t border-[#6E4708]/60 pt-0.5">
                      <span className="w-3 h-full border-r border-[#6E4708]/60" />
                      <span className="w-3 h-full border-l border-[#6E4708]/60" />
                    </div>
                  </div>
                </div>

                {/* 4-Digit Chip Pin Underneath */}
                <span className="text-[10px] font-mono text-slate-400 font-bold tracking-widest mt-1">
                  {membershipPin}
                </span>
              </div>

              {/* Top Right: Elegant Gold Serif Title (Membership Card) */}
              <div className="text-right">
                <span
                  className="text-lg sm:text-2xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#FFF2B2] via-[#E5B83B] to-[#C59B27] tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] block"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Membership Card
                </span>
                <span className="block text-[8px] sm:text-[9px] tracking-[0.25em] text-[#D4AF37] uppercase font-mono font-bold mt-0.5">
                  {member?.planName || 'SMART GYM PREMIER PASS'}
                </span>
              </div>

            </div>

            {/* Center-Left: Embossed Member Name */}
            <div className="relative z-10 space-y-1 my-auto pt-2">
              <div
                className="font-mono text-base sm:text-xl font-extrabold tracking-[0.2em] text-[#E0E6ED] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center gap-2"
                style={{ textShadow: '1px 1px 2px #000, 0 0 8px rgba(255,255,255,0.1)' }}
              >
                {memberName}
              </div>
              <div className="font-mono text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider">
                ID: {fullMembershipId}
              </div>
            </div>

            {/* Bottom-Left: "MEMBER SINCE" & Dates */}
            <div className="relative z-10 flex items-end justify-between pt-2">
              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.15em] text-[#C59B27] uppercase font-mono block">
                    MEMBER SINCE
                  </span>
                  <span
                    className="font-mono text-xs sm:text-base font-black tracking-widest text-[#E0E6ED] drop-shadow"
                    style={{ textShadow: '1px 1px 2px #000' }}
                  >
                    {memberSinceFormatted}
                  </span>
                </div>

                <div className="border-l border-white/20 pl-3">
                  <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.15em] text-[#C59B27] uppercase font-mono block">
                    VALID THRU
                  </span>
                  <span
                    className="font-mono text-xs sm:text-base font-black tracking-widest text-[#E5B83B] drop-shadow"
                    style={{ textShadow: '1px 1px 2px #000' }}
                  >
                    {expiryFormatted}
                  </span>
                </div>
              </div>

              {/* NFC Contactless Wave Indicator */}
              <div className="flex items-center gap-1.5 opacity-80 text-slate-300">
                <Wifi className="w-4 sm:w-5 h-4 sm:h-5 rotate-90 text-[#D4AF37]" />
              </div>
            </div>

          </div>

          {/* ════════════════════════════════════════════════════════════════
              BACK OF MEMBERSHIP PASS CARD (MATCHING USER REFERENCE DESIGN)
          ════════════════════════════════════════════════════════════════ */}
          <div className="absolute inset-0 w-full h-full rounded-[28px] bg-[#0A0C10] border border-[#3A3F4D]/50 shadow-[0_20px_45px_rgba(0,0,0,0.9)] [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden flex flex-col justify-between p-5 sm:p-7">
            
            {/* Deep Obsidian Background with Soft Textured Sheen */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#13161F] via-[#090A0E] to-[#040507] pointer-events-none" />

            {/* Solid Gold / Amber Magnetic Stripe Banner */}
            <div className="absolute top-10 sm:top-12 inset-x-0 h-10 sm:h-12 bg-gradient-to-r from-[#AA771C] via-[#F4B740] via-[#FFE89E] to-[#AA771C] shadow-[0_2px_10px_rgba(0,0,0,0.6)]" />

            {/* Top Serial Number Header */}
            <div className="relative z-10 flex justify-between text-[9px] text-slate-400 font-mono">
              <span className="tracking-widest">SMART GYM ENTERPRISE PASS</span>
              <span className="font-bold text-[#E5B83B]">{fullMembershipId}</span>
            </div>

            {/* Center: Membership Terms & Official Club Badge */}
            <div className="relative z-10 grid grid-cols-3 gap-4 items-center pt-8 sm:pt-10">
              
              {/* Membership Rules Text (NO CVV) */}
              <div className="col-span-2 text-[8px] sm:text-[9px] text-slate-300 leading-relaxed space-y-1">
                <p>
                  This Membership Pass authorizes 24/7 RFID turnstile and TOTP dynamic QR gate access across all franchise locations.
                </p>
                <p className="text-slate-400">
                  Pass is non-transferable. Present at front desk for guest passes, locker access, and personal training reservations.
                </p>
              </div>

              {/* Club Logo / Official Stamp on Right */}
              <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white tracking-wider">SMART GYM</span>
                  <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-[#E5A93C] to-orange-500 flex items-center justify-center shadow-md">
                    <Activity className="w-3 h-3 text-black" />
                  </div>
                </div>
                <span className="text-[7px] text-[#E5A93C] font-mono tracking-widest mt-0.5 font-bold uppercase">
                  VERIFIED MEMBER PASS
                </span>
              </div>

            </div>

            {/* Footer: Crisp Barcode & Club Contact Info */}
            <div className="relative z-10 flex items-end justify-between pt-2 border-t border-white/10">
              
              {/* Clean Vertical Barcode Block */}
              <div className="bg-white px-2 py-1 rounded-lg flex flex-col items-center shadow-md">
                <div className="flex items-center gap-[2px] h-6 sm:h-7">
                  {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 2, 1, 3, 1, 2].map((w, i) => (
                    <span key={i} style={{ width: `${w}px` }} className="h-full bg-black block" />
                  ))}
                </div>
                <span className="text-[8px] font-mono font-bold text-black tracking-widest mt-0.5">
                  {fullMembershipId}
                </span>
              </div>

              {/* Club Info & Hotline */}
              <div className="text-right text-[8px] sm:text-[9px] text-slate-300 space-y-0.5">
                <div className="font-bold text-white uppercase tracking-wider">Smart Gym Premier Franchise</div>
                <div className="text-[#E5A93C] font-mono font-semibold">+91 98765 43210</div>
                <div className="text-[7px] sm:text-[8px] text-slate-400 font-mono tracking-wider">WWW.SMARTGYM.COM</div>
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
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#14171F] hover:bg-[#1E2330] border border-gym-border text-slate-300 hover:text-white text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer mt-1"
        >
          <RefreshCw className="w-4 h-4 text-[#E5A93C] animate-spin-slow" />
          <span>{isFlipped ? 'Show Front of Card' : 'Tap to Flip (View Magnetic Stripe & Barcode)'}</span>
        </button>
      )}

    </div>
  );
};
