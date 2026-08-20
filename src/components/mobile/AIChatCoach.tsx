import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Bot, Send, User, Sparkles } from 'lucide-react';

export const AIChatCoach: React.FC = () => {
  const { activeMember } = useGym();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${activeMember?.name || 'Athlete'}! 👋 I am your 24/7 AI Smart Gym Coach. How can I assist with your workout form, macro diet, or recovery today?`,
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputMsg('');

    setTimeout(() => {
      let aiReply = "For optimal hypertrophy, ensure 2-3 minutes rest between heavy compound sets and maintain 2.0g protein per kg of body weight daily!";
      if (userText.toLowerCase().includes('diet') || userText.toLowerCase().includes('food') || userText.toLowerCase().includes('eat')) {
        aiReply = `Based on your goal (${activeMember?.goal || 'Muscle Building'}), target 2,850 kcal daily split into 4 protein-rich meals with 4.0L water intake!`;
      } else if (userText.toLowerCase().includes('pain') || userText.toLowerCase().includes('sore')) {
        aiReply = "Make sure to hydrate, get 8 hours of quality sleep, and prioritize light active recovery stretching or foam rolling!";
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-[520px] animate-in fade-in duration-300 text-xs">
      
      {/* AI Assistant Header */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0D2136] via-[#081524] to-[#040C14] border border-cyan-500/30 flex items-center gap-2.5 shadow-md shrink-0">
        <div className="w-8 h-8 rounded-xl bg-[#122E4C] border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-extrabold text-white text-xs flex items-center gap-1">
            24/7 AI Gym Assistant
            <Sparkles className="w-3 h-3 text-cyan-400" />
          </h3>
          <p className="text-[9px] text-cyan-300">Powered by Smart Gym AI Engine</p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 px-1 scrollbar-none">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
              m.sender === 'user' ? 'bg-cyan-500 text-gym-dark font-extrabold' : 'bg-[#122E4C] text-cyan-400 border border-cyan-500/40'
            }`}>
              {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div className={`p-3 rounded-2xl max-w-[80%] text-[11px] leading-relaxed shadow-sm ${
              m.sender === 'user'
                ? 'bg-cyan-500 text-gym-dark font-semibold rounded-tr-none'
                : 'bg-[#0F1420] text-slate-200 border border-white/10 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="pt-2 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Ask AI Coach a question..."
          className="flex-1 bg-[#0F1420] border border-white/10 rounded-2xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
        />
        <button
          type="submit"
          className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-gym-dark font-extrabold shadow-md hover:scale-105 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
