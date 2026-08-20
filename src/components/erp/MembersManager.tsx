import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Member } from '../../types/gym';
import { PrivilegePassCard } from '../shared/PrivilegePassCard';
import {
  Search,
  UserPlus,
  Filter,
  QrCode,
  Calendar,
  Phone,
  Mail,
  Activity,
  Award,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  CreditCard,
  FileText,
  User,
  Dumbbell,
  Utensils,
  Bell,
  Printer,
  ChevronDown
} from 'lucide-react';

interface MembersManagerProps {
  onOpenNewMemberModal: () => void;
}

export const MembersManager: React.FC<MembersManagerProps> = ({ onOpenNewMemberModal }) => {
  const {
    members,
    selectedBranchId,
    setActiveMemberId,
    activeMember,
    transactions,
    recordMemberPayment,
    sendBulkNotification,
    plans,
    workout,
    diet,
    attendance
  } = useGym();

  // Navigation State: 'list' = complete members directory; 'profile' = selected member's detailed view
  const [viewMode, setViewMode] = useState<'list' | 'profile'>('list');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'PAID' | 'UNPAID'>('ALL');

  // Modals inside manager
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer'>('UPI');
  const [paymentNotes, setPaymentNotes] = useState('');

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifTarget, setNotifTarget] = useState<'all' | 'unpaid' | 'expiring' | 'expired' | 'single'>('all');
  const [notifTitle, setNotifTitle] = useState('Important Gym Update');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSentSuccess, setNotifSentSuccess] = useState(false);

  // Profile Tab state
  const [profileTab, setProfileTab] = useState<'overview' | 'payments' | 'membership' | 'workout' | 'diet' | 'attendance'>('overview');

  const branchMembers = members.filter((m) => m.branchId === selectedBranchId);

  // Filter logic
  const filteredMembers = branchMembers.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(term) ||
      m.id.toLowerCase().includes(term) ||
      m.membershipNo.toLowerCase().includes(term) ||
      m.mobile.includes(term) ||
      (m.email && m.email.toLowerCase().includes(term)) ||
      (m.planName && m.planName.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'ACTIVE') return m.status === 'Active';
    if (filterCategory === 'EXPIRING') return m.status === 'Expiring Soon';
    if (filterCategory === 'EXPIRED') return m.status === 'Expired';
    if (filterCategory === 'PAID') return (m.pendingDues || 0) === 0;
    if (filterCategory === 'UNPAID') return (m.pendingDues || 0) > 0;

    return true;
  });

  // Calculate high-level financial stats
  const totalMembers = branchMembers.length;
  const activeMembers = branchMembers.filter(m => m.status === 'Active').length;
  const expiringMembers = branchMembers.filter(m => m.status === 'Expiring Soon').length;
  const expiredMembers = branchMembers.filter(m => m.status === 'Expired').length;
  const paidMembers = branchMembers.filter(m => (m.pendingDues || 0) === 0).length;
  const unpaidMembers = branchMembers.filter(m => (m.pendingDues || 0) > 0).length;
  const totalPendingDues = branchMembers.reduce((acc, m) => acc + (m.pendingDues || 0), 0);

  // Explicit click handler to view a specific member's profile
  const handleOpenMemberProfile = (member: Member) => {
    setSelectedMember(member);
    setActiveMemberId(member.id);
    setViewMode('profile');
    setProfileTab('overview');
  };

  // Back to list handler
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedMember(null);
  };

  // Payment Recording
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || paymentAmount <= 0) return;
    try {
      await recordMemberPayment(selectedMember.id, paymentAmount, paymentMethod, paymentNotes);
      // Refresh local selected member
      const updated = members.find(m => m.id === selectedMember.id);
      if (updated) setSelectedMember(updated);
      setShowPaymentModal(false);
      setPaymentAmount(0);
      setPaymentNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  // Notification Broadcast
  const handleSendNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;
    await sendBulkNotification(notifTarget, notifTitle, notifMessage, selectedMember?.id);
    setNotifSentSuccess(true);
    setTimeout(() => {
      setNotifSentSuccess(false);
      setShowNotificationModal(false);
      setNotifMessage('');
    }, 1500);
  };

  // Member's Transactions
  const memberTransactions = selectedMember
    ? transactions.filter(t => t.memberId === selectedMember.id)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ════════════════════════════════════════════════════════════════════════
          VIEW 1: COMPLETE MEMBERS MANAGEMENT & DIRECTORY LIST
      ════════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          
          {/* Header & Main Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-[#4F7CFF]" />
                Members Directory & Management
              </h2>
              <p className="text-xs text-gym-subtext">
                Manage all registered members, membership validity, payment dues, and digital cards
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => {
                  setNotifTarget('all');
                  setShowNotificationModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E2330] hover:bg-[#252C3D] border border-gym-border text-slate-200 text-xs font-semibold transition-all"
              >
                <Bell className="w-4 h-4 text-purple-400" />
                <span>Send Notice</span>
              </button>

              <button
                onClick={onOpenNewMemberModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F7CFF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-xs shadow-lg shadow-[#4F7CFF]/20 transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add Member</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="glass-card p-3.5 rounded-2xl border border-gym-border">
              <span className="text-[10px] text-gym-subtext uppercase font-bold">Total Members</span>
              <div className="text-xl font-black text-white mt-1">{totalMembers}</div>
            </div>
            <div className="glass-card p-3.5 rounded-2xl border border-gym-border">
              <span className="text-[10px] text-emerald-400 uppercase font-bold">Active</span>
              <div className="text-xl font-black text-[#27D980] mt-1">{activeMembers}</div>
            </div>
            <div className="glass-card p-3.5 rounded-2xl border border-gym-border">
              <span className="text-[10px] text-amber-400 uppercase font-bold">Expiring Soon</span>
              <div className="text-xl font-black text-amber-300 mt-1">{expiringMembers}</div>
            </div>
            <div className="glass-card p-3.5 rounded-2xl border border-gym-border">
              <span className="text-[10px] text-rose-400 uppercase font-bold">Expired</span>
              <div className="text-xl font-black text-rose-400 mt-1">{expiredMembers}</div>
            </div>
            <div className="glass-card p-3.5 rounded-2xl border border-gym-border">
              <span className="text-[10px] text-cyan-400 uppercase font-bold">Paid Upfront</span>
              <div className="text-xl font-black text-cyan-300 mt-1">{paidMembers}</div>
            </div>
            <div className="glass-card p-3.5 rounded-2xl border border-gym-border">
              <span className="text-[10px] text-rose-400 uppercase font-bold">Pending Dues</span>
              <div className="text-sm font-black text-rose-300 mt-1">₹{totalPendingDues.toLocaleString('en-IN')}</div>
              <span className="text-[9px] text-gym-subtext">{unpaidMembers} unpaid</span>
            </div>
          </div>

          {/* Search and Category Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#14171F] p-2.5 rounded-2xl border border-gym-border">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gym-subtext absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by member name, ID (MEM-XXXX), phone, email, plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0B0D12] border border-gym-border focus:border-[#4F7CFF] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gym-subtext outline-none transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
              {[
                { id: 'ALL', label: `All (${branchMembers.length})` },
                { id: 'ACTIVE', label: `Active (${activeMembers})` },
                { id: 'EXPIRING', label: `Expiring (${expiringMembers})` },
                { id: 'EXPIRED', label: `Expired (${expiredMembers})` },
                { id: 'UNPAID', label: `Unpaid Dues (${unpaidMembers})` },
                { id: 'PAID', label: `Fully Paid (${paidMembers})` }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterCategory(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    filterCategory === f.id
                      ? 'bg-[#4F7CFF] text-white shadow-md'
                      : 'bg-[#1E2330] text-slate-300 hover:text-white border border-gym-border'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

          </div>

          {/* Member Cards Grid */}
          {filteredMembers.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center space-y-3">
              <User className="w-12 h-12 text-gym-subtext mx-auto opacity-50" />
              <h3 className="text-base font-bold text-white">No Members Found</h3>
              <p className="text-xs text-gym-subtext max-w-sm mx-auto">
                No member matched your filter criteria. Try adjusting the search query or adding a new member.
              </p>
              <button
                onClick={onOpenNewMemberModal}
                className="px-4 py-2 rounded-xl bg-[#4F7CFF] text-white text-xs font-bold shadow-lg"
              >
                + Register First Member
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMembers.map((m) => {
                const isExpiring = m.status === 'Expiring Soon';
                const isExpired = m.status === 'Expired';
                const hasDues = (m.pendingDues || 0) > 0;

                return (
                  <div
                    key={m.id}
                    className="glass-card rounded-3xl p-5 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-[#4F7CFF]/50 group flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.id}`}
                            alt={m.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-white/20 shadow-md shrink-0"
                          />
                          <div>
                            <h3 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                              {m.name}
                            </h3>
                            <span className="text-[10px] font-mono font-bold text-gym-subtext">
                              {m.membershipNo} • {m.id}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isExpired
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : isExpiring
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-[#27D980] border border-[#27D980]/30'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>

                      {/* Details Strip */}
                      <div className="mt-4 pt-3 border-t border-gym-border/60 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-[11px] text-gym-subtext">Plan:</span>
                          <span className="font-bold text-white truncate max-w-[180px]">{m.planName}</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-[11px] text-gym-subtext">Valid Until:</span>
                          <span className={`font-semibold ${isExpiring ? 'text-amber-300 font-bold' : isExpired ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
                            {m.expiryDate || m.endDate}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-gym-subtext">Payment:</span>
                          {hasDues ? (
                            <span className="font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                              ₹{m.pendingDues.toLocaleString('en-IN')} Due
                            </span>
                          ) : (
                            <span className="font-bold text-[#27D980] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#27D980]" /> Paid
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-cyan-400" /> {m.mobile}
                          </span>
                          <span className="text-[10px] text-gym-subtext">{m.gender} • {m.goal}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button: View Profile */}
                    <div className="mt-4 pt-3 border-t border-gym-border/60">
                      <button
                        onClick={() => handleOpenMemberProfile(m)}
                        className="w-full py-2.5 rounded-xl bg-[#1E2330] hover:bg-[#4F7CFF] text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <CreditCard className="w-4 h-4 text-cyan-400 group-hover:text-white" />
                        <span>View Profile & Digital Card</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          VIEW 2: DEDICATED MEMBER PROFILE & DIGITAL MEMBERSHIP CARD
      ════════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'profile' && selectedMember && (
        <div className="space-y-6">

          {/* Breadcrumb Navigation & Back Button */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-gym-border">
            <div className="flex items-center gap-2 text-xs font-bold text-gym-subtext">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14171F] hover:bg-[#1E2330] text-slate-200 border border-gym-border transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                <span>Back to Members List</span>
              </button>
              <span>/</span>
              <span className="text-white font-extrabold">{selectedMember.name}</span>
              <span className="text-gym-subtext font-mono">({selectedMember.membershipNo})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPaymentAmount(selectedMember.pendingDues || 0);
                  setShowPaymentModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#27D980] hover:bg-[#20b86a] text-gym-dark font-black text-xs shadow-md transition-all active:scale-95"
              >
                <DollarSign className="w-4 h-4" />
                <span>Record Payment</span>
              </button>
              <button
                onClick={() => {
                  setNotifTarget('single');
                  setShowNotificationModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1E2330] hover:bg-[#252C3D] border border-gym-border text-slate-200 font-bold text-xs transition-all"
              >
                <Send className="w-3.5 h-3.5 text-purple-400" />
                <span>Send Alert</span>
              </button>
            </div>
          </div>

          {/* ── LUXURY PRIVILEGE MEMBERSHIP CARD (MATCHING USER REFERENCE DESIGN) ── */}
          <div className="flex justify-center my-2">
            <PrivilegePassCard
              member={selectedMember}
              priorityText={selectedMember.planName?.includes('VIP') ? 'PRIORITY' : 'VIP PASS'}
              showFlipButton={true}
            />
          </div>

          {/* Profile Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gym-border pb-1 overflow-x-auto text-xs font-extrabold">
            {[
              { id: 'overview', icon: User, label: 'Overview' },
              { id: 'payments', icon: DollarSign, label: 'Payments & Dues' },
              { id: 'membership', icon: CreditCard, label: 'Membership Plan' },
              { id: 'workout', icon: Dumbbell, label: 'Workout Split' },
              { id: 'diet', icon: Utensils, label: 'Diet Nutrition' },
              { id: 'attendance', icon: Calendar, label: 'Attendance Log' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setProfileTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  profileTab === id
                    ? 'bg-[#4F7CFF] text-white shadow-lg shadow-[#4F7CFF]/20 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-[#1E2330]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* ── TAB 1: OVERVIEW ── */}
          {profileTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Personal Details Panel */}
              <div className="glass-card rounded-3xl p-6 space-y-4 border border-gym-border">
                <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-gym-border">
                  <User className="w-4 h-4 text-cyan-400" />
                  Personal Information & Contacts
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-gym-subtext uppercase font-bold block">Mobile Number</span>
                    <span className="font-semibold text-white">{selectedMember.mobile}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gym-subtext uppercase font-bold block">Email</span>
                    <span className="font-semibold text-white">{selectedMember.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gym-subtext uppercase font-bold block">Date of Birth</span>
                    <span className="font-semibold text-white">{selectedMember.dob || '1998-01-01'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gym-subtext uppercase font-bold block">Gender</span>
                    <span className="font-semibold text-white">{selectedMember.gender}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-gym-subtext uppercase font-bold block">Address</span>
                    <span className="font-semibold text-white">{selectedMember.address || 'Smart Gym City'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gym-subtext uppercase font-bold block">Emergency Contact</span>
                    <span className="font-semibold text-white">{selectedMember.emergencyContactName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gym-subtext uppercase font-bold block">Emergency Phone</span>
                    <span className="font-semibold text-white">{selectedMember.emergencyMobile || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Physical Metrics & Health Goals Panel */}
              <div className="glass-card rounded-3xl p-6 space-y-4 border border-gym-border">
                <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-gym-border">
                  <Activity className="w-4 h-4 text-[#27D980]" />
                  Fitness Goal & Body Stats
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-gym-subtext uppercase font-bold block">Primary Goal</span>
                    <span className="font-black text-[#27D980]">{selectedMember.goal}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gym-subtext uppercase font-bold block">Calculated BMI</span>
                    <span className="font-bold text-white">{selectedMember.bmi || 22.5}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gym-subtext uppercase font-bold block">Height</span>
                    <span className="font-semibold text-white">{selectedMember.heightCm} cm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gym-subtext uppercase font-bold block">Weight</span>
                    <span className="font-semibold text-white">{selectedMember.weightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gym-subtext uppercase font-bold block">Blood Group</span>
                    <span className="font-semibold text-white">{selectedMember.bloodGroup || 'O+'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gym-subtext uppercase font-bold block">Assigned Locker</span>
                    <span className="font-semibold text-cyan-300">{selectedMember.lockerNumber || 'Not assigned'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-gym-subtext uppercase font-bold block">Medical History</span>
                    <span className="font-semibold text-slate-300">{selectedMember.medicalHistory || 'None reported'}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ── TAB 2: PAYMENTS & INVOICES ── */}
          {profileTab === 'payments' && (
            <div className="space-y-6">
              
              {/* Payment Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-2xl border border-gym-border">
                  <span className="text-[10px] text-gym-subtext uppercase font-bold">Total Plan Amount</span>
                  <div className="text-xl font-black text-white mt-1">₹{(selectedMember.totalPlanAmount || 35400).toLocaleString('en-IN')}</div>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-gym-border">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Amount Paid</span>
                  <div className="text-xl font-black text-[#27D980] mt-1">₹{(selectedMember.paidAmount || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-gym-border">
                  <span className="text-[10px] text-rose-400 uppercase font-bold">Pending Dues</span>
                  <div className="text-xl font-black text-rose-400 mt-1">₹{(selectedMember.pendingDues || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-gym-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-cyan-400 uppercase font-bold">Payment Status</span>
                    <div className="text-sm font-black text-white mt-1">{selectedMember.paymentStatus || (selectedMember.pendingDues > 0 ? 'Pending' : 'Paid')}</div>
                  </div>
                  <button
                    onClick={() => {
                      setPaymentAmount(selectedMember.pendingDues || 0);
                      setShowPaymentModal(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#27D980] text-gym-dark font-black text-xs shadow-md"
                  >
                    Collect
                  </button>
                </div>
              </div>

              {/* Transactions History */}
              <div className="glass-panel rounded-3xl p-6 space-y-4 border border-gym-border">
                <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-gym-border">
                  <FileText className="w-4 h-4 text-[#4F7CFF]" />
                  Verified Payment Receipts & Billing History
                </h3>

                {memberTransactions.length === 0 ? (
                  <p className="text-xs text-gym-subtext">No transactions logged for this member yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gym-border text-gym-subtext uppercase text-[10px]">
                          <th className="py-2.5 px-3">Receipt No</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Payment Method</th>
                          <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gym-border/40">
                        {memberTransactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-[#1E2330]/40 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-cyan-300">{txn.receiptNo}</td>
                            <td className="py-3 px-3 text-slate-300">{txn.date}</td>
                            <td className="py-3 px-3 text-slate-200 font-semibold">{txn.category}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-md bg-[#1E2330] border border-gym-border text-[11px] font-bold text-slate-300">
                                {txn.paymentMethod}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-black text-[#27D980]">
                              ₹{txn.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ── TAB 3: MEMBERSHIP PLAN ── */}
          {profileTab === 'membership' && (
            <div className="glass-card rounded-3xl p-6 space-y-4 border border-gym-border max-w-xl">
              <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-gym-border">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                Active Subscription Package
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-gym-border/40">
                  <span className="text-slate-300">Package Name:</span>
                  <strong className="text-white font-bold">{selectedMember.planName}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-gym-border/40">
                  <span className="text-slate-300">Start Date:</span>
                  <span className="text-white font-semibold">{selectedMember.startDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gym-border/40">
                  <span className="text-slate-300">Expiry Date:</span>
                  <span className="text-cyan-300 font-bold">{selectedMember.expiryDate || selectedMember.endDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gym-border/40">
                  <span className="text-slate-300">Total Price:</span>
                  <span className="text-[#27D980] font-black">₹{(selectedMember.totalPlanAmount || 35400).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: WORKOUT SPLIT ── */}
          {profileTab === 'workout' && (
            <div className="glass-card rounded-3xl p-6 space-y-4 border border-gym-border">
              <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-gym-border">
                <Dumbbell className="w-4 h-4 text-purple-400" />
                Assigned Workout Splits (Week {workout.weeklyPlans[0]?.weekNumber || 1})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {(workout.weeklyPlans[0]?.splits || []).map((s, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#121622] border border-gym-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-cyan-300 uppercase text-[11px]">{s.day}</span>
                      <span className="text-[10px] text-gym-subtext">{s.exercises.length} exercises</span>
                    </div>
                    <h4 className="font-bold text-white text-xs">{s.title}</h4>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {s.exercises.map(ex => (
                        <li key={ex.id} className="flex justify-between">
                          <span>{ex.name}</span>
                          <span className="text-gym-subtext">{ex.targetSets} x {ex.targetReps} @ {ex.weightKg}kg</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 5: DIET NUTRITION ── */}
          {profileTab === 'diet' && (
            <div className="glass-card rounded-3xl p-6 space-y-4 border border-gym-border">
              <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-gym-border">
                <Utensils className="w-4 h-4 text-[#27D980]" />
                Assigned Daily Macro Nutrition Plan
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-[#121622] border border-gym-border">
                  <span className="text-[10px] text-gym-subtext uppercase font-bold">Calories</span>
                  <div className="text-lg font-black text-white mt-1">2,450 kcal</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#121622] border border-gym-border">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold">Protein</span>
                  <div className="text-lg font-black text-cyan-300 mt-1">165g</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#121622] border border-gym-border">
                  <span className="text-[10px] text-amber-400 uppercase font-bold">Carbs</span>
                  <div className="text-lg font-black text-amber-300 mt-1">280g</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#121622] border border-gym-border">
                  <span className="text-[10px] text-purple-400 uppercase font-bold">Fats</span>
                  <div className="text-lg font-black text-purple-300 mt-1">65g</div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 6: ATTENDANCE LOG ── */}
          {profileTab === 'attendance' && (
            <div className="glass-card rounded-3xl p-6 space-y-4 border border-gym-border">
              <h3 className="text-sm font-black text-white flex items-center gap-2 pb-2 border-b border-gym-border">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Live Gate Pass Check-in Records
              </h3>
              <div className="space-y-2 text-xs">
                {attendance.filter(a => a.memberId === selectedMember.id).length === 0 ? (
                  <p className="text-xs text-gym-subtext">No entry scans logged yet.</p>
                ) : (
                  attendance
                    .filter(a => a.memberId === selectedMember.id)
                    .map(att => (
                      <div key={att.id} className="p-3 rounded-xl bg-[#121622] border border-gym-border flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">{att.date} • {att.entryTime}</div>
                          <div className="text-[10px] text-gym-subtext">{att.deviceInfo} via {att.verificationMethod}</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-[#27D980] border border-[#27D980]/30">
                          {att.status}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL 1: RECORD MEMBER PAYMENT
      ════════════════════════════════════════════════════════════════════════ */}
      {showPaymentModal && selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#14171F] border border-gym-border rounded-[32px] p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">Record Member Payment</h3>
                <p className="text-xs text-gym-subtext">{selectedMember.name} • {selectedMember.membershipNo}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-[#0B0D12] border border-gym-border flex items-center justify-between">
                <span className="text-gym-subtext font-semibold">Total Outstanding Due:</span>
                <strong className="text-rose-400 font-black text-sm">₹{(selectedMember.pendingDues || 0).toLocaleString('en-IN')}</strong>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Amount to Collect (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 5000"
                  className="w-full bg-[#121622] border border-gym-border focus:border-[#27D980] rounded-xl px-3 py-2.5 text-white font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-[#121622] border border-gym-border rounded-xl px-3 py-2.5 text-white font-semibold outline-none"
                >
                  <option value="UPI">UPI (GPay / PhonePe / QR)</option>
                  <option value="Cash">Cash at Counter</option>
                  <option value="Card">Credit / Debit Card POS</option>
                  <option value="Bank Transfer">Direct Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Notes / Transaction Reference</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. UPI Ref #89218291"
                  className="w-full bg-[#121622] border border-gym-border rounded-xl px-3 py-2.5 text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E2330] text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#27D980] text-gym-dark font-black shadow-lg"
                >
                  Verify & Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL 2: SEND NOTIFICATION BROADCAST
      ════════════════════════════════════════════════════════════════════════ */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#14171F] border border-gym-border rounded-[32px] p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-400" />
                  Send Member In-App Alert
                </h3>
                <p className="text-xs text-gym-subtext">Deliver instant push & in-app alerts</p>
              </div>
              <button onClick={() => setShowNotificationModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {notifSentSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-[#27D980] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Notification delivered successfully!
              </div>
            )}

            <form onSubmit={handleSendNotificationSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Target Audience</label>
                <select
                  value={notifTarget}
                  onChange={(e) => setNotifTarget(e.target.value as any)}
                  className="w-full bg-[#121622] border border-gym-border rounded-xl px-3 py-2.5 text-white font-semibold outline-none"
                >
                  <option value="all">All Enrolled Members ({members.length})</option>
                  <option value="unpaid">Members with Unpaid Dues ({unpaidMembers})</option>
                  <option value="expiring">Memberships Expiring Soon ({expiringMembers})</option>
                  <option value="expired">Expired Members ({expiredMembers})</option>
                  {selectedMember && <option value="single">Single Member: {selectedMember.name}</option>}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Renewal Reminder"
                  className="w-full bg-[#121622] border border-gym-border rounded-xl px-3 py-2.5 text-white font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Message Content *</label>
                <textarea
                  required
                  rows={3}
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="e.g. Your membership is due for renewal. Please visit front desk to renew your pass."
                  className="w-full bg-[#121622] border border-gym-border rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E2330] text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4F7CFF] text-white font-black shadow-lg flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
