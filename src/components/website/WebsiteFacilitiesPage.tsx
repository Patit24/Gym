import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Flame, Sparkles, ShieldCheck, Lock, HeartPulse, CheckCircle2, ArrowRight } from 'lucide-react';

export const WebsiteFacilitiesPage: React.FC = () => {
  const facilities = [
    {
      title: 'Biomechanical Strength & Free Weights Zone',
      tag: 'Strength',
      description: 'Eleiko Olympic barbells, calibrated bumper plates, power racks, dumbbell racks up to 60kg, and custom isolated cable stations.',
      perks: ['Calibrated Competition Plates', '8 Power Racks & Deadlift Platforms', 'Dumbbells from 2.5kg to 60kg', 'Preacher Curls & Glute-Ham Benches']
    },
    {
      title: 'Cardio Theatre & VO2 Max Conditioning',
      tag: 'Cardio',
      description: 'Equipped with Matrix curved treadmills, Concept2 rowers, SkiErgs, assault air bikes, and stairmasters with interactive virtual routes.',
      perks: ['Curved Motorless Treadmills', 'Concept2 Rowers & SkiErgs', 'Assault Air Bikes & Echo Bikes', 'Heart Rate Zone Display Monitors']
    },
    {
      title: 'Eucalyptus Steam & Infrared Recovery Suites',
      tag: 'Wellness & Recovery',
      description: 'Thermal recovery suites designed to reduce inflammation, improve circulation, and speed up muscle tissue healing post-workout.',
      perks: ['Infrared Dry Saunas (85°C)', 'Eucalyptus Infused Steam Rooms', 'Cold Hydrotherapy Showers', 'Private Changing & Vanity Lounges']
    },
    {
      title: 'Digital Smart Lockers & Vanity Suites',
      tag: 'Security & Comfort',
      description: 'High-security keyless digital lockers synced to your biometric turnstile pass with Dyson hair dryers and rain showers.',
      perks: ['Keyless RFID Touch Lockers', 'Executive Rain Showers', 'Dyson Grooming Stations', 'Complimentary Towel Service']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-[#27D980] uppercase tracking-wider">Facility Tour</span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">World-Class Equipment & Amenities</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Engineered for peak performance, hygiene, and luxurious recovery. Every detail is curated for the modern athlete.
        </p>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {facilities.map((fac, idx) => (
          <div
            key={idx}
            className="p-8 rounded-3xl bg-[#101422] border border-white/10 space-y-6 flex flex-col justify-between hover:border-[#27D980]/40 transition-all group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30 text-xs font-black uppercase">
                  {fac.tag}
                </span>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>

              <h3 className="text-xl font-black text-white group-hover:text-[#27D980] transition-colors">
                {fac.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {fac.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Highlights:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {fac.perks.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#27D980] shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking CTA */}
      <div className="rounded-3xl p-8 bg-gradient-to-r from-[#182238] to-[#0E1424] border-2 border-[#4F7CFF] text-center space-y-4 shadow-2xl">
        <h2 className="text-2xl font-black text-white">Experience It in Person</h2>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          Book a free guided tour of our facilities with a personal fitness consultant.
        </p>
        <Link
          to="/login"
          className="inline-flex px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-cyan-400 text-white font-black text-xs shadow-lg shadow-[#4F7CFF]/25 hover:scale-105 transition-all"
        >
          Claim Free 3-Day VIP Trial Pass
        </Link>
      </div>

    </div>
  );
};
