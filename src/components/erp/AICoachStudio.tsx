import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Sparkles, Brain, CheckCircle2, RefreshCw, Zap, Activity } from 'lucide-react';

export const AICoachStudio: React.FC = () => {
  const { activeMember, workout, diet } = useGym();
  const [aiGenerating, setAiGenerating] = useState(false);
  const [prompt, setPrompt] = useState('Generate hyper-trophy 4-day split for muscle building with shoulder rehab precautions.');
  const [generatedPlanText, setGeneratedPlanText] = useState<string | null>(null);

  const handleGenerateAI = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      setGeneratedPlanText(`🤖 2026 AI NEURAL FITNESS PLAN GENERATED FOR ${(activeMember?.name || 'MEMBER').toUpperCase()}

Target Goal: ${activeMember?.goal || 'Muscle Building'} | BMI: ${activeMember?.bmi || 22.5} | Weight: ${activeMember?.weightKg || 75}kg

WORKOUT SPLIT RECOMMENDATION:
• Mon: Incline Barbell Press (4x10 @ 75kg) + Cable Flyes (3x15 @ 20kg)
• Tue: Heavy Pull-Ups (4x8 @ +15kg) + Barbell Rows (4x10 @ 80kg)
• Wed: Barbell Squats (5x8 @ 110kg) + Standing Calf Raises (4x15)
• Thu: Overhead Press (4x10 @ 50kg) + Lateral Cable Raises (4x12)

NUTRITION MACRO RECOMMENDATION:
• Target Daily Calories: 2,850 kcal
• Protein Target: 185g (2.3g/kg body weight)
• Carbs Target: 310g (Complex Jasmine Rice & Oats)
• Fat Target: 75g (Avocado, Eggs & Almond Butter)
• Hydration Goal: 4.0 Liters / day

AI INJURY RISK ASSESSMENT:
Low Risk (94% Joint Stability Score). Recommends 10-min rotator cuff warmup prior to chest press sessions.`);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#27D980]" />
            2026 AI Workout & Macro Generator Studio
          </h2>
          <p className="text-xs text-gym-subtext">Neural network fitness model for individualized training splits & diet science</p>
        </div>

        <span className="text-xs font-bold text-[#4F7CFF] bg-[#4F7CFF]/15 px-3 py-1 rounded-full border border-[#4F7CFF]/30 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> AI Engine v4.8 Active
        </span>
      </div>

      {/* Main Studio Console */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 space-y-6">
        
        {/* Active Member Selection Banner */}
        <div className="p-4 rounded-2xl bg-[#14171F] border border-gym-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={activeMember?.photoUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=member'} alt={activeMember?.name || 'Member'} className="w-12 h-12 rounded-xl object-cover border border-[#4F7CFF]" />
            <div>
              <h4 className="text-sm font-bold text-white">{activeMember?.name || 'Member'}</h4>
              <p className="text-xs text-gym-subtext">Goal: <strong className="text-[#27D980]">{activeMember?.goal || 'Muscle Building'}</strong> • Weight: <strong>{activeMember?.weightKg || 70} kg</strong> • BMI: <strong>{activeMember?.bmi || 22.5}</strong></p>
            </div>
          </div>
          <span className="text-xs font-semibold text-gym-subtext">Assigned Trainer: Marcus Vance</span>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gym-subtext">Custom AI Prompt Instructions</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-[#0B0D12] border border-gym-border focus:border-[#4F7CFF] rounded-2xl px-4 py-3 text-xs text-white focus:outline-none"
            />
            <button
              onClick={handleGenerateAI}
              disabled={aiGenerating}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-[#27D980] text-gym-dark font-extrabold text-xs shadow-lg shadow-[#27D980]/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              {aiGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{aiGenerating ? 'Neural Processing...' : 'Generate Plan'}</span>
            </button>
          </div>
        </div>

        {/* AI Output Display */}
        {generatedPlanText && (
          <div className="p-6 rounded-2xl bg-[#0B0D12] border border-[#27D980]/40 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed relative animate-in fade-in">
            <div className="absolute top-4 right-4 flex gap-2">
              <span className="text-[10px] font-bold text-[#27D980] bg-[#27D980]/15 px-2.5 py-1 rounded border border-[#27D980]/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED BY AI
              </span>
            </div>
            {generatedPlanText}
          </div>
        )}

      </div>

    </div>
  );
};
