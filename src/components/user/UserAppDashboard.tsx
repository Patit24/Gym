import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { MobileAppSimulator } from '../mobile/MobileAppSimulator';
import { PrivilegePassCard } from '../shared/PrivilegePassCard';
import { WorkoutLogger } from '../mobile/WorkoutLogger';
import { DietTracker } from '../mobile/DietTracker';
import { DynamicQRCard } from '../mobile/DynamicQRCard';
import { ProgressStudio } from '../mobile/ProgressStudio';
import { AIChatCoach } from '../mobile/AIChatCoach';
import { SubscriptionCard } from '../mobile/SubscriptionCard';
import { 
  Smartphone, 
  Layers, 
  CreditCard, 
  Dumbbell, 
  Utensils, 
  QrCode, 
  TrendingUp, 
  Brain, 
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export const UserAppDashboard: React.FC = () => {
  const { activeMember, plans, transactions } = useGym();
  const [viewMode, setViewMode] = useState<'mobile' | 'web'>('mobile');
  const [activeUserTab, setActiveUserTab] = useState<'pass' | 'workout' | 'diet' | 'qr' | 'progress' | 'ai' | 'invoices'>('pass');

  const memberTransactions = transactions.filter((t) => t.memberId === activeMember?.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner: Member Welcome & View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#101422] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <img
            src={activeMember?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeMember?.name || 'Member')}`}
            alt={activeMember?.name || 'Member'}
            className="w-12 h-12 rounded-2xl object-cover border border-[#27D980]/50"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">Welcome back, {activeMember?.name || 'Alex'}!</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30 text-[9px] font-black uppercase">
                {activeMember?.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Plan: <strong className="text-slate-200">{activeMember?.planName || 'VIP All-Access Pass'}</strong> • Expiry: <strong className="text-[#27D980]">{activeMember?.expiryDate || activeMember?.endDate}</strong>
            </p>
          </div>
        </div>

        {/* Mode Selector Toggle: Mobile Phone Frame vs Responsive Widescreen */}
        <div className="flex items-center bg-[#07090E] p-1 rounded-2xl border border-white/10 text-xs font-bold self-end sm:self-auto">
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'mobile'
                ? 'bg-[#27D980] text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App UI</span>
          </button>
          <button
            onClick={() => setViewMode('web')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'web'
                ? 'bg-[#4F7CFF] text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Widescreen Dashboard</span>
          </button>
        </div>
      </div>

      {/* ── 1. NATIVE MOBILE APP SIMULATOR VIEW ── */}
      {viewMode === 'mobile' && (
        <div className="flex justify-center py-2">
          <MobileAppSimulator />
        </div>
      )}

      {/* ── 2. WIDESCREEN WEB USER DASHBOARD ── */}
      {viewMode === 'web' && (
        <div className="space-y-6">
          
          {/* User Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none">
            {[
              { id: 'pass', label: 'Membership Pass', icon: CreditCard },
              { id: 'qr', label: 'Gate QR Pass', icon: QrCode },
              { id: 'workout', label: 'Workout Split', icon: Dumbbell },
              { id: 'diet', label: 'Macro Nutrition', icon: Utensils },
              { id: 'progress', label: 'Body Metrics', icon: TrendingUp },
              { id: 'invoices', label: 'Payments & Receipts', icon: DollarSign },
              { id: 'ai', label: 'AI Fitness Coach', icon: Brain },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeUserTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveUserTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#27D980] to-emerald-400 text-black shadow-lg shadow-[#27D980]/20'
                      : 'bg-[#101422] text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab View */}
          <div className="space-y-6">
            
            {/* Pass Tab */}
            {activeUserTab === 'pass' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <PrivilegePassCard
                    member={activeMember}
                    priorityText={activeMember?.planName?.includes('VIP') ? 'PRIORITY' : 'VIP PASS'}
                    showFlipButton={true}
                  />
                </div>
                <div className="max-w-2xl mx-auto">
                  <SubscriptionCard />
                </div>
              </div>
            )}

            {/* Gate QR Pass */}
            {activeUserTab === 'qr' && (
              <div className="max-w-md mx-auto">
                <DynamicQRCard />
              </div>
            )}

            {/* Workout Split */}
            {activeUserTab === 'workout' && (
              <div className="max-w-3xl mx-auto">
                <WorkoutLogger />
              </div>
            )}

            {/* Macro Nutrition */}
            {activeUserTab === 'diet' && (
              <div className="max-w-3xl mx-auto">
                <DietTracker />
              </div>
            )}

            {/* Body Metrics */}
            {activeUserTab === 'progress' && (
              <div className="max-w-3xl mx-auto">
                <ProgressStudio />
              </div>
            )}

            {/* Payment Invoices */}
            {activeUserTab === 'invoices' && (
              <div className="max-w-4xl mx-auto p-6 rounded-3xl bg-[#101422] border border-white/10 space-y-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#27D980]" />
                  <span>Your Payment History & Receipts</span>
                </h3>

                {memberTransactions.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#080B12] text-center text-xs text-slate-400">
                    No payment transactions on file.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {memberTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-4 rounded-2xl bg-[#080B12] border border-white/10 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-white text-sm">{tx.category}</div>
                          <div className="text-slate-400 text-[11px]">
                            Receipt: <strong className="font-mono text-cyan-300">{tx.receiptNo}</strong> • Date: {tx.date}
                          </div>
                          <div className="text-[10px] text-slate-500">Method: {tx.paymentMethod}</div>
                        </div>

                        <div className="text-right">
                          <strong className="text-base font-black text-[#27D980]">
                            ₹{tx.amount.toLocaleString('en-IN')}
                          </strong>
                          <span className="text-[10px] text-emerald-400 block font-bold">● Paid / Verified</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI Fitness Coach */}
            {activeUserTab === 'ai' && (
              <div className="max-w-2xl mx-auto">
                <AIChatCoach />
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
