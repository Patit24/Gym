import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Flame, Users, Sparkles, User, MapPin } from 'lucide-react';

export const WebsiteSchedulePage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const scheduleData: Record<string, Array<{ time: string; title: string; category: string; trainer: string; intensity: string; spots: string }>> = {
    Monday: [
      { time: '06:30 AM - 07:30 AM', title: 'Early Morning HIIT & Core Blast', category: 'Cardio & HIIT', trainer: 'Rohan Verma', intensity: 'High', spots: '4 spots open' },
      { time: '08:00 AM - 09:00 AM', title: 'Power Vinyasa Yoga Flow', category: 'Mind & Flexibility', trainer: 'Ananya Sen', intensity: 'Medium', spots: '6 spots open' },
      { time: '05:30 PM - 06:30 PM', title: 'Olympic Deadlift & Squat Clinic', category: 'Strength', trainer: 'Vikram Rajput', intensity: 'Very High', spots: '2 spots open' },
      { time: '07:00 PM - 08:00 PM', title: 'Zumba High-Energy Dance Burn', category: 'Dance Fitness', trainer: 'Kavita Roy', intensity: 'Medium-High', spots: '8 spots open' },
    ],
    Tuesday: [
      { time: '07:00 AM - 08:00 AM', title: 'Kettlebell & Metabolic Conditioning', category: 'Strength & Conditioning', trainer: 'Rohan Verma', intensity: 'High', spots: '5 spots open' },
      { time: '09:00 AM - 10:00 AM', title: 'Pilates Core & Spine Alignment', category: 'Mobility', trainer: 'Ananya Sen', intensity: 'Low-Medium', spots: '7 spots open' },
      { time: '06:00 PM - 07:00 PM', title: 'Boxing Conditioning & Heavy Bag Drills', category: 'Combat Fitness', trainer: 'Vikram Rajput', intensity: 'High', spots: '3 spots open' },
    ],
    Wednesday: [
      { time: '06:30 AM - 07:30 AM', title: 'Full Body Functional Circuit', category: 'HIIT', trainer: 'Rohan Verma', intensity: 'High', spots: '6 spots open' },
      { time: '06:00 PM - 07:00 PM', title: 'Chest & Back Hypertrophy Split', category: 'Bodybuilding', trainer: 'Vikram Rajput', intensity: 'High', spots: '4 spots open' },
    ],
    Thursday: [
      { time: '07:00 AM - 08:00 AM', title: 'Athletic Agility & Speed Drills', category: 'Conditioning', trainer: 'Rohan Verma', intensity: 'High', spots: '5 spots open' },
      { time: '05:30 PM - 06:30 PM', title: 'Yin Yoga & Deep Fascia Release', category: 'Recovery', trainer: 'Ananya Sen', intensity: 'Low', spots: '10 spots open' },
    ],
    Friday: [
      { time: '06:30 AM - 07:30 AM', title: 'Tabata Cardio Torch', category: 'Cardio', trainer: 'Kavita Roy', intensity: 'High', spots: '3 spots open' },
      { time: '06:30 PM - 07:30 PM', title: 'Friday Night Heavy Iron Club', category: 'Powerlifting', trainer: 'Vikram Rajput', intensity: 'Maximum', spots: 'Full (Waitlist)' },
    ],
    Saturday: [
      { time: '08:00 AM - 09:30 AM', title: 'Weekend Masterclass: Kettlebells & Mobility', category: 'Workshop', trainer: 'Rohan Verma', intensity: 'High', spots: '4 spots open' },
      { time: '10:00 AM - 11:00 AM', title: 'Community Cardio Zumba Party', category: 'Dance', trainer: 'Kavita Roy', intensity: 'Medium', spots: '12 spots open' },
    ],
    Sunday: [
      { time: '09:00 AM - 10:30 AM', title: 'Sunday Reset: Breathwork, Yoga & Sauna Tour', category: 'Wellness', trainer: 'Ananya Sen', intensity: 'Low', spots: '8 spots open' },
    ],
  };

  const daySchedule = scheduleData[selectedDay] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-[#27D980] uppercase tracking-wider">Group Fitness Timetable</span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Weekly Class Schedule</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          All group classes are led by certified master trainers. Members and website trial pass holders can reserve spots directly.
        </p>

        {/* Day Selector */}
        <div className="flex items-center justify-center gap-2 pt-4 flex-wrap">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDay === d
                  ? 'bg-[#27D980] text-black font-black shadow-lg shadow-[#27D980]/20 scale-105'
                  : 'bg-[#141824] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Class List */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {daySchedule.map((cls, idx) => (
          <div
            key={idx}
            className="p-5 sm:p-6 rounded-3xl bg-[#101422] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#27D980]/40 transition-all group"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30 text-[10px] font-black uppercase">
                  {cls.category}
                </span>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  {cls.intensity} Intensity
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#27D980] transition-colors">
                {cls.title}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-slate-300 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  {cls.time}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  Trainer: <strong className="text-white">{cls.trainer}</strong>
                </span>
                <span className="text-[11px] text-emerald-400 font-mono font-bold">
                  {cls.spots}
                </span>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-[#27D980] hover:text-black text-white font-black text-xs transition-all text-center shrink-0"
            >
              Book Class Slot
            </Link>
          </div>
        ))}
      </div>

    </div>
  );
};
