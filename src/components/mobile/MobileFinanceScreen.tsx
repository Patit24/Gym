import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGym } from '../../context/GymContext';
import { Transaction, Expense, BranchId } from '../../types/gym';
import { exportToCSV, exportToPrintPDF } from '../../utils/exportUtils';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  Plus,
  Building2,
  Calendar,
  CreditCard,
  Zap,
  Dumbbell,
  Wrench,
  Sparkles,
  Package,
  Tag,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  X,
  FileText,
  Wallet,
  Receipt,
  Download,
  Filter,
  Check,
  Eye,
  Trash2,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

type DatePeriod = 'today' | 'week' | 'month' | 'all';
type ChartTimeframe = '7D' | '30D' | '3M' | '1Y';
type TxFilter = 'all' | 'income' | 'expense';

interface UnifiedTransactionItem {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  title: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  receiptNo?: string;
  notes?: string;
  rawRecord: Transaction | Expense;
}

const EXPENSE_CATEGORIES = [
  { id: 'Rent', label: 'Rent', icon: Building2, color: '#38BDF8' },
  { id: 'Electricity', label: 'Electricity', icon: Zap, color: '#FBBF24' },
  { id: 'Salary', label: 'Staff Salary', icon: UserCheck, color: '#A855F7' },
  { id: 'Equipment', label: 'Equipment', icon: Dumbbell, color: '#EC4899' },
  { id: 'Maintenance', label: 'Maintenance', icon: Wrench, color: '#F97316' },
  { id: 'Marketing', label: 'Marketing', icon: Sparkles, color: '#06B6D4' },
  { id: 'Supplies', label: 'Supplies', icon: Package, color: '#10B981' },
  { id: 'Other', label: 'Other', icon: Tag, color: '#94A3B8' },
];

const INCOME_CATEGORIES = [
  'Membership Dues',
  'Personal Training',
  'Supplement Sale',
  'Day Pass',
  'Locker Rent',
  'Other Income',
];

const PAYMENT_METHODS = ['UPI', 'Cash', 'Card', 'Bank Transfer', 'NetBanking', 'Cheque'] as const;

export const MobileFinanceScreen: React.FC = () => {
  const {
    branches,
    selectedBranchId,
    setSelectedBranchId,
    transactions,
    expenses,
    addExpense,
    deleteExpense,
    recordMemberPayment,
    members,
  } = useGym();

  // Filter States
  const [datePeriod, setDatePeriod] = useState<DatePeriod>('month');
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>('30D');
  const [txFilter, setTxFilter] = useState<TxFilter>('all');
  const [selectedChartPoint, setSelectedChartPoint] = useState<number | null>(null);

  // Modals & Bottom Sheets
  const [isBranchSheetOpen, setIsBranchSheetOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [selectedTxItem, setSelectedTxItem] = useState<UnifiedTransactionItem | null>(null);
  const [isSeeAllTxOpen, setIsSeeAllTxOpen] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);

  // Custom Date Range for Report Card
  const [reportStartDate, setReportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // 1st day of current month
    return d.toISOString().split('T')[0];
  });
  const [reportEndDate, setReportEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Lock body scroll when any modal or bottom sheet is open
  useEffect(() => {
    const isAnyModalOpen =
      isBranchSheetOpen ||
      isAddExpenseOpen ||
      isAddIncomeOpen ||
      !!selectedTxItem ||
      isSeeAllTxOpen ||
      isReportCardOpen;

    if (isAnyModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [
    isBranchSheetOpen,
    isAddExpenseOpen,
    isAddIncomeOpen,
    selectedTxItem,
    isSeeAllTxOpen,
    isReportCardOpen,
  ]);

  // Form States - Expense
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Electricity');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expMethod, setExpMethod] = useState<typeof PAYMENT_METHODS[number]>('UPI');
  const [expNotes, setExpNotes] = useState('');
  const [isSavingExp, setIsSavingExp] = useState(false);
  const [expError, setExpError] = useState<string | null>(null);

  // Form States - Income
  const [incTitle, setIncTitle] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incCategory, setIncCategory] = useState('Membership Dues');
  const [incMemberId, setIncMemberId] = useState('');
  const [incDate, setIncDate] = useState(new Date().toISOString().split('T')[0]);
  const [incMethod, setIncMethod] = useState<typeof PAYMENT_METHODS[number]>('UPI');
  const [incNotes, setIncNotes] = useState('');
  const [isSavingInc, setIsSavingInc] = useState(false);
  const [incError, setIncError] = useState<string | null>(null);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper Currency Formatter
  const formatINR = (val: number): string => {
    if (isNaN(val)) return '₹0';
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  // Current Branch
  const currentBranch = useMemo(() => {
    return (
      (branches || []).find((b) => b?.id === selectedBranchId) ||
      branches?.[0] || {
        id: 'branch-1',
        name: 'Smart Gym Ashoknagar',
        code: 'SMARTGYM001',
        city: 'Ashoknagar',
        activeMembers: 0,
        currentCheckIns: 0,
        monthlyRevenue: 0,
      }
    );
  }, [branches, selectedBranchId]);

  // Branch Isolated Collections & Expenses with robust fallback
  const branchTransactions = useMemo(() => {
    return (transactions || []).filter((t) => {
      if (!t) return false;
      if (!selectedBranchId || selectedBranchId === 'all') return true;
      return t.branchId === selectedBranchId || !t.branchId;
    });
  }, [transactions, selectedBranchId]);

  const branchExpenses = useMemo(() => {
    return (expenses || []).filter((e) => {
      if (!e) return false;
      if (!selectedBranchId || selectedBranchId === 'all') return true;
      return e.branchId === selectedBranchId || !e.branchId;
    });
  }, [expenses, selectedBranchId]);

  // Filtered by selected Date Period
  const { periodTransactions, periodExpenses } = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonthPrefix = todayStr.slice(0, 7); // YYYY-MM

    // 7 Days ago
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    // 30 Days ago (Rolling 30 days window)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const filterFn = (itemDate?: string) => {
      if (!itemDate) return false;
      if (datePeriod === 'all') return true;
      if (datePeriod === 'today') return itemDate === todayStr;
      if (datePeriod === 'week') return itemDate >= weekAgoStr && itemDate <= todayStr;
      if (datePeriod === 'month') {
        return itemDate.startsWith(currentMonthPrefix) || (itemDate >= thirtyDaysAgoStr && itemDate <= todayStr);
      }
      return true;
    };

    const pTx = branchTransactions.filter((t) => filterFn(t.date));
    const pExp = branchExpenses.filter((e) => filterFn(e.date));

    return { periodTransactions: pTx, periodExpenses: pExp };
  }, [branchTransactions, branchExpenses, datePeriod]);

  // Financial Totals
  const totalCollections = useMemo(() => {
    return periodTransactions.reduce((acc, t) => acc + (t?.amount || 0), 0);
  }, [periodTransactions]);

  const totalExpenseAmount = useMemo(() => {
    return periodExpenses.reduce((acc, e) => acc + (e?.amount || 0), 0);
  }, [periodExpenses]);

  const netCashflow = totalCollections - totalExpenseAmount;
  const isNetPositive = netCashflow >= 0;

  // Unified Chronological Activity Feed
  const unifiedTransactions = useMemo<UnifiedTransactionItem[]>(() => {
    const incomes: UnifiedTransactionItem[] = branchTransactions.map((t) => ({
      id: t.id,
      type: 'INCOME',
      title: t.planName ? `${t.planName} • ${t.memberName || 'Member'}` : t.category || 'Member Payment',
      category: t.category || 'Income',
      amount: t.amount || 0,
      date: t.date || '',
      paymentMethod: t.paymentMethod || 'UPI',
      receiptNo: t.receiptNo,
      notes: t.notes,
      rawRecord: t,
    }));

    const outgoings: UnifiedTransactionItem[] = branchExpenses.map((e) => ({
      id: e.id,
      type: 'EXPENSE',
      title: e.name || 'Expense',
      category: e.category || 'Operational',
      amount: e.amount || 0,
      date: e.date || '',
      paymentMethod: e.paymentMethod || 'Cash',
      receiptNo: (e as any).receiptUrl,
      notes: e.description,
      rawRecord: e,
    }));

    const combined = [...incomes, ...outgoings].sort((a, b) => {
      return (b.date || '').localeCompare(a.date || '');
    });

    if (txFilter === 'income') return combined.filter((item) => item.type === 'INCOME');
    if (txFilter === 'expense') return combined.filter((item) => item.type === 'EXPENSE');
    return combined;
  }, [branchTransactions, branchExpenses, txFilter]);

  // Expense Category Breakdown with dynamic category detection
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    periodExpenses.forEach((exp) => {
      const cat = exp.category || 'Other';
      map[cat] = (map[cat] || 0) + (exp.amount || 0);
    });

    const total = totalExpenseAmount > 0 ? totalExpenseAmount : 1;

    const recordedCats = Object.keys(map);
    const allCatKeys = Array.from(new Set([...recordedCats, ...EXPENSE_CATEGORIES.map(c => c.id)]));

    return allCatKeys.map((catKey) => {
      const preset = EXPENSE_CATEGORIES.find(
        (c) => c.id.toLowerCase() === catKey.toLowerCase() || c.label.toLowerCase() === catKey.toLowerCase()
      );
      const amount = map[catKey] || (preset ? (map[preset.id] || map[preset.label] || 0) : 0);
      const percent = Math.round((amount / total) * 100);
      return {
        id: catKey,
        label: preset?.label || catKey,
        icon: preset?.icon || getCategoryIcon(catKey, false),
        color: preset?.color || '#F43F5E',
        amount,
        percent,
      };
    }).filter((c) => c.amount > 0);
  }, [periodExpenses, totalExpenseAmount]);

  // Cashflow Interactive Chart Data Points with Interval Bucketing
  const chartData = useMemo(() => {
    const pointsCount = chartTimeframe === '7D' ? 7 : chartTimeframe === '30D' ? 6 : chartTimeframe === '3M' ? 6 : 12;
    const now = new Date();
    const data: { label: string; income: number; expense: number; net: number; dateStr: string }[] = [];

    const intervalDays = chartTimeframe === '7D' ? 1 : chartTimeframe === '30D' ? 5 : chartTimeframe === '3M' ? 15 : 30;

    for (let i = pointsCount - 1; i >= 0; i--) {
      const startD = new Date(now);
      const endD = new Date(now);

      if (chartTimeframe === '1Y') {
        startD.setMonth(now.getMonth() - i, 1);
        endD.setMonth(now.getMonth() - i + 1, 0);
      } else {
        startD.setDate(now.getDate() - (i * intervalDays + (intervalDays - 1)));
        endD.setDate(now.getDate() - i * intervalDays);
      }

      const startIso = startD.toISOString().split('T')[0];
      const endIso = endD.toISOString().split('T')[0];
      const monthShort = endD.toLocaleString('default', { month: 'short' });
      const day = endD.getDate();
      const label = chartTimeframe === '1Y' ? monthShort : `${day} ${monthShort}`;

      // Sum matching records falling into this date interval
      const matchInc = branchTransactions
        .filter((t) => t.date && t.date >= startIso && t.date <= endIso)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const matchExp = branchExpenses
        .filter((e) => e.date && e.date >= startIso && e.date <= endIso)
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      data.push({
        label,
        income: matchInc,
        expense: matchExp,
        net: matchInc - matchExp,
        dateStr: endIso,
      });
    }

    return data;
  }, [branchTransactions, branchExpenses, chartTimeframe]);

  // Max value for SVG scaling
  const maxChartVal = useMemo(() => {
    const highest = Math.max(...chartData.map((d) => Math.max(d.income, d.expense)), 1000);
    return highest * 1.15;
  }, [chartData]);

  // Handle Save Expense Form
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpError(null);

    const amountNum = parseFloat(expAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setExpError('Amount must be greater than ₹0.');
      return;
    }
    if (!expTitle.trim()) {
      setExpError('Expense title is required.');
      return;
    }

    setIsSavingExp(true);
    try {
      await addExpense({
        name: expTitle.trim(),
        category: expCategory,
        amount: amountNum,
        date: expDate,
        paymentMethod: expMethod,
        description: expNotes.trim() || undefined,
        branchId: selectedBranchId as BranchId,
        status: 'Paid',
      });

      showToast(`Expense of ${formatINR(amountNum)} recorded successfully!`, 'success');
      setExpTitle('');
      setExpAmount('');
      setExpNotes('');
      setIsAddExpenseOpen(false);
    } catch (err: any) {
      setExpError(err.message || 'Failed to save expense. Please try again.');
    } finally {
      setIsSavingExp(false);
    }
  };

  // Handle Save Income Form
  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    setIncError(null);

    const amountNum = parseFloat(incAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setIncError('Amount must be greater than ₹0.');
      return;
    }
    if (!incTitle.trim()) {
      setIncError('Income title / description is required.');
      return;
    }

    setIsSavingInc(true);
    try {
      const targetMem = members.find((m) => m.id === incMemberId) || members[0];
      await recordMemberPayment(
        targetMem?.id || 'DIRECT-REVENUE',
        amountNum,
        incMethod,
        `${incCategory} - ${incTitle.trim()} ${incNotes ? `(${incNotes.trim()})` : ''}`
      );

      showToast(`Income of ${formatINR(amountNum)} recorded successfully!`, 'success');
      setIncTitle('');
      setIncAmount('');
      setIncNotes('');
      setIsAddIncomeOpen(false);
    } catch (err: any) {
      setIncError(err.message || 'Failed to save income. Please try again.');
    } finally {
      setIsSavingInc(false);
    }
  };

  // Handle Delete Expense
  const handleDeleteExpenseItem = async (expId: string) => {
    if (confirm('Are you sure you want to permanently delete this expense record?')) {
      try {
        await deleteExpense(expId);
        showToast('Expense record removed.', 'success');
        setSelectedTxItem(null);
      } catch (e: any) {
        showToast(e.message || 'Failed to delete expense.', 'error');
      }
    }
  };

  // Category Icon Resolver
  const getCategoryIcon = (categoryName: string, isIncome: boolean) => {
    if (isIncome) return CreditCard;
    const found = EXPENSE_CATEGORIES.find(
      (c) => c.id.toLowerCase() === categoryName.toLowerCase() || c.label.toLowerCase() === categoryName.toLowerCase()
    );
    return found ? found.icon : Tag;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 text-xs pb-6">
      
      {/* ── 0. GLOBAL TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-4 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── 1. COMPACT INTEGRATED BRANCH SELECTOR CARD ── */}
      <button
        onClick={() => setIsBranchSheetOpen(true)}
        className="w-full p-3 rounded-[22px] glass-card-premium shadow-xl flex items-center justify-between gap-3 text-left hover:border-[#00D4FF]/40 active:scale-[0.99] transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-[#00D4FF]/15 text-[#00D4FF] flex items-center justify-center border border-[#00D4FF]/30 shadow-md group-hover:scale-105 transition-transform shrink-0">
            <Building2 className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest block">
              Accounting Branch
            </span>
            <h3 className="text-xs font-black text-white truncate group-hover:text-cyan-300 transition-colors">
              {currentBranch.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-[10px] font-bold text-slate-300">
            {currentBranch.code}
          </span>
          <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </button>

      {/* ── 2. FINANCIAL OVERVIEW HERO DASHBOARD ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            Financial Overview
          </h2>

          {/* Date Period Filter Pills */}
          <div className="flex items-center gap-1 bg-[#080C14] p-1 rounded-xl border border-white/[0.08]">
            {(['today', 'week', 'month', 'all'] as DatePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setDatePeriod(period)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer ${
                  datePeriod === period
                    ? 'bg-gradient-to-r from-[#00D4FF] to-cyan-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {period === 'today' ? 'Today' : period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Primary NET CASHFLOW Card */}
        <div className="glass-card-premium p-5 rounded-[24px] shadow-2xl relative overflow-hidden space-y-3">
          <div
            className={`absolute -right-10 -top-10 w-44 h-44 rounded-full blur-[60px] pointer-events-none ${
              isNetPositive ? 'bg-[#10B981]/15' : 'bg-[#F87171]/15'
            }`}
          />

          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Net Operating Cashflow
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    isNetPositive ? 'text-[#10B981]' : 'text-[#F87171]'
                  }`}
                >
                  {formatINR(netCashflow)}
                </span>
              </div>
            </div>

            {/* Dynamic Status Pill */}
            <div
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                isNetPositive
                  ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                  : 'bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30'
              }`}
            >
              {isNetPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{isNetPositive ? 'Surplus' : 'Deficit'}</span>
            </div>
          </div>

          {/* Subtitle Formula Calculation */}
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10.5px] text-slate-400">
            <span className="truncate">
              <strong className="text-emerald-300 font-bold">{formatINR(totalCollections)}</strong> Collections −{' '}
              <strong className="text-rose-300 font-bold">{formatINR(totalExpenseAmount)}</strong> Expenses
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              {datePeriod.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Collections & Expenses 2-Card Row */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Collections Card */}
          <div className="p-3.5 rounded-[20px] glass-card-premium shadow-lg space-y-1.5 border-l-2 border-l-[#10B981]">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Collections</span>
              <div className="w-6 h-6 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-400">{formatINR(totalCollections)}</div>
            <div className="text-[9px] font-bold text-emerald-400/90 flex items-center gap-1">
              <span>+12.4% vs last period</span>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="p-3.5 rounded-[20px] glass-card-premium shadow-lg space-y-1.5 border-l-2 border-l-[#F87171]">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Expenses</span>
              <div className="w-6 h-6 rounded-lg bg-[#F87171]/15 text-[#F87171] flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-rose-400">{formatINR(totalExpenseAmount)}</div>
            <div className="text-[9px] font-bold text-rose-400/90 flex items-center gap-1">
              <span>+4.2% vs last period</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. INTERACTIVE CASHFLOW CHART ── */}
      <div className="p-4 rounded-[22px] glass-card-premium shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white uppercase tracking-wider">Cashflow Trend</span>
            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Inflow
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F87171]" /> Outflow
              </span>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            {(['7D', '30D', '3M', '1Y'] as ChartTimeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setChartTimeframe(tf)}
                className={`px-2 py-0.5 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                  chartTimeframe === tf ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Data Tooltip */}
        {selectedChartPoint !== null && chartData[selectedChartPoint] && (
          <div className="p-2.5 rounded-xl bg-black/80 border border-cyan-500/30 flex items-center justify-between text-[10px] animate-in fade-in">
            <span className="font-bold text-slate-300">{chartData[selectedChartPoint].label}</span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold">In: {formatINR(chartData[selectedChartPoint].income)}</span>
              <span className="text-rose-400 font-bold">Out: {formatINR(chartData[selectedChartPoint].expense)}</span>
              <span className="text-cyan-300 font-black">Net: {formatINR(chartData[selectedChartPoint].net)}</span>
            </div>
          </div>
        )}

        {/* Compact SVG Bar & Trend Visualization */}
        <div className="h-28 w-full flex items-end justify-between gap-1.5 pt-4 pb-1 relative">
          {/* Subtle Gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-white/10 w-full" />
            <div className="border-b border-white/10 w-full" />
            <div className="border-b border-white/10 w-full" />
          </div>

          {chartData.map((d, idx) => {
            const incHeight = Math.max(8, Math.round((d.income / maxChartVal) * 80));
            const expHeight = Math.max(6, Math.round((d.expense / maxChartVal) * 80));
            const isSelected = selectedChartPoint === idx;

            return (
              <div
                key={idx}
                onClick={() => setSelectedChartPoint(isSelected ? null : idx)}
                className="flex-1 flex flex-col items-center justify-end h-full gap-1 cursor-pointer group relative z-10"
              >
                <div className="w-full flex items-end justify-center gap-0.5 h-20">
                  {/* Collections Bar */}
                  <div
                    style={{ height: `${incHeight}px` }}
                    className={`w-1.5 sm:w-2 rounded-t-sm transition-all ${
                      isSelected
                        ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]'
                        : 'bg-[#10B981]/70 group-hover:bg-[#10B981]'
                    }`}
                  />
                  {/* Expenses Bar */}
                  <div
                    style={{ height: `${expHeight}px` }}
                    className={`w-1.5 sm:w-2 rounded-t-sm transition-all ${
                      isSelected
                        ? 'bg-[#F87171] shadow-[0_0_8px_#F87171]'
                        : 'bg-[#F87171]/70 group-hover:bg-[#F87171]'
                    }`}
                  />
                </div>
                <span className="text-[8px] font-bold text-slate-400 group-hover:text-white truncate max-w-[32px]">
                  {d.label.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. QUICK ACTION BUTTONS ── */}
      <div className="space-y-1.5">
        <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block px-1">
          Quick Actions
        </span>
        <div className="grid grid-cols-4 gap-2">
          {/* + Add Expense (Primary Coral) */}
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="p-3 rounded-[18px] bg-gradient-to-br from-rose-500/20 via-rose-600/15 to-transparent border border-rose-500/40 hover:border-rose-500/70 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-lg group"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[9.5px] font-black text-white tracking-tight">Add Expense</span>
          </button>

          {/* + Add Income (Emerald) */}
          <button
            onClick={() => setIsAddIncomeOpen(true)}
            className="p-3 rounded-[18px] bg-gradient-to-br from-emerald-500/20 via-emerald-600/15 to-transparent border border-emerald-500/40 hover:border-emerald-500/70 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-lg group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[9.5px] font-black text-white tracking-tight">Add Income</span>
          </button>

          {/* View Transactions */}
          <button
            onClick={() => setIsSeeAllTxOpen(true)}
            className="p-3 rounded-[18px] glass-card-premium hover:border-cyan-400/40 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-lg group"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-[9.5px] font-bold text-slate-200 tracking-tight">Statements</span>
          </button>

          {/* Reports / Export */}
          <button
            onClick={() => setIsReportCardOpen(true)}
            className="p-3 rounded-[18px] glass-card-premium hover:border-purple-400/40 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-lg group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[9.5px] font-bold text-slate-200 tracking-tight">Reports</span>
          </button>
        </div>
      </div>

      {/* ── 5. RECENT TRANSACTIONS FEED ── */}
      <div className="p-4 rounded-[22px] glass-card-premium shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Recent Transactions</h3>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
              {unifiedTransactions.length}
            </span>
          </div>

          <button
            onClick={() => setIsSeeAllTxOpen(true)}
            className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            See All →
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
          {(['all', 'income', 'expense'] as TxFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setTxFilter(tab)}
              className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                txFilter === tab
                  ? tab === 'income'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : tab === 'expense'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-white/15 text-white border border-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'income' ? 'Collections' : 'Expenses'}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="space-y-2 pt-1">
          {unifiedTransactions.slice(0, 5).map((item) => {
            const isIncome = item.type === 'INCOME';
            const IconComponent = getCategoryIcon(item.category, isIncome);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedTxItem(item)}
                className="p-3 rounded-2xl bg-[#0B0F19] hover:bg-[#0E1422] border border-white/[0.08] flex items-center justify-between gap-3 active:scale-[0.99] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm shrink-0 ${
                      isIncome
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-white truncate group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {item.category} • {item.date} • {item.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-black block ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isIncome ? `+ ${formatINR(item.amount)}` : `− ${formatINR(item.amount)}`}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">{item.paymentMethod}</span>
                </div>
              </div>
            );
          })}

          {unifiedTransactions.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-white/10 rounded-2xl">
              No transactions recorded for this filter.
            </div>
          )}
        </div>
      </div>

      {/* ── 6. EXPENSE CATEGORIES BREAKDOWN ── */}
      <div className="p-4 rounded-[22px] glass-card-premium shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Expense Breakdown</h3>
          <span className="text-[10px] font-bold text-rose-300">
            Total: {formatINR(totalExpenseAmount)}
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {categoryBreakdown.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                    {cat.label}
                  </span>
                  <span className="text-white font-extrabold">
                    {formatINR(cat.amount)}{' '}
                    <span className="text-[9px] text-slate-400 font-normal">({cat.percent}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}

          {categoryBreakdown.length === 0 && (
            <div className="text-center py-4 text-slate-400 text-[11px]">
              No expense categories recorded for this timeframe.
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM SHEET 1: RECORD NEW EXPENSE
      ═══════════════════════════════════════════════════════════ */}
      {isAddExpenseOpen && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setIsAddExpenseOpen(false)}
          className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0E121E] border-t border-white/15 rounded-t-[32px] p-5 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto shrink-0 cursor-pointer mb-3" onClick={() => setIsAddExpenseOpen(false)} />

            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Record New Expense</h3>
                  <p className="text-[10px] text-slate-400">{currentBranch.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {expError && (
              <div className="p-2.5 my-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] flex items-center gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{expError}</span>
              </div>
            )}

            {/* Scrollable Form Body */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-2 pr-1 space-y-3 pb-8">
              <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
                {/* Expense Title */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Expense Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Monthly Electricity Bill, Dumbbell Maintenance"
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    required
                    className="w-full bg-[#080C14] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                  />
                </div>

                {/* Amount & Date */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 2500"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      required
                      min="1"
                      className="w-full bg-[#080C14] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-bold placeholder-slate-500 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      required
                      className="w-full bg-[#080C14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                {/* Category Chips */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setExpCategory(cat.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          expCategory === cat.id
                            ? 'bg-rose-500/25 border border-rose-500/60 text-white shadow-md'
                            : 'bg-[#080C14] border border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <cat.icon className="w-3 h-3" style={{ color: cat.color }} />
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setExpMethod(m)}
                        className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                          expMethod === m
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                            : 'bg-[#080C14] border-white/10 text-slate-400'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Notes / Vendor Info (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Paid to technician, invoice #9482..."
                    value={expNotes}
                    onChange={(e) => setExpNotes(e.target.value)}
                    className="w-full bg-[#080C14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSavingExp}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-rose-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 mt-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingExp ? 'Saving Expense...' : 'Save & Record Expense'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM SHEET 2: RECORD NEW INCOME
      ═══════════════════════════════════════════════════════════ */}
      {isAddIncomeOpen && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setIsAddIncomeOpen(false)}
          className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0E121E] border-t border-white/15 rounded-t-[32px] p-5 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto shrink-0 cursor-pointer mb-3" onClick={() => setIsAddIncomeOpen(false)} />

            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Record Income / Collection</h3>
                  <p className="text-[10px] text-slate-400">{currentBranch.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddIncomeOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {incError && (
              <div className="p-2.5 my-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] flex items-center gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{incError}</span>
              </div>
            )}

            {/* Scrollable Form Body */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-2 pr-1 space-y-3 pb-8">
              <form onSubmit={handleSaveIncome} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Income Title / Plan Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VIP Quarterly Membership, PT 10-Sessions"
                    value={incTitle}
                    onChange={(e) => setIncTitle(e.target.value)}
                    required
                    className="w-full bg-[#080C14] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={incAmount}
                      onChange={(e) => setIncAmount(e.target.value)}
                      required
                      min="1"
                      className="w-full bg-[#080C14] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={incDate}
                      onChange={(e) => setIncDate(e.target.value)}
                      required
                      className="w-full bg-[#080C14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                {/* Category Chips */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {INCOME_CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setIncCategory(cat)}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                          incCategory === cat
                            ? 'bg-emerald-500/25 border border-emerald-500/60 text-white shadow-md'
                            : 'bg-[#080C14] border border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setIncMethod(m)}
                        className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                          incMethod === m
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                            : 'bg-[#080C14] border-white/10 text-slate-400'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSavingInc}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 mt-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingInc ? 'Recording Income...' : 'Record Collection'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM SHEET 3: BRANCH SWITCHER
      ═══════════════════════════════════════════════════════════ */}
      {isBranchSheetOpen && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setIsBranchSheetOpen(false)}
          className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0E121E] border-t border-white/15 rounded-t-[32px] p-5 shadow-2xl flex flex-col max-h-[75vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto shrink-0 mb-3 cursor-pointer" onClick={() => setIsBranchSheetOpen(false)} />

            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-sm font-black text-white">Select Accounting Branch</h3>
                <p className="text-[10px] text-slate-400">Switch franchise cashflow view</p>
              </div>
              <button
                onClick={() => setIsBranchSheetOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-2 space-y-2 pb-6">
              {(branches || []).map((b) => {
                const isSelected = selectedBranchId === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBranchId(b.id);
                      setIsBranchSheetOpen(false);
                      showToast(`Switched accounting view to ${b.name}`);
                    }}
                    className={`w-full p-3 rounded-2xl text-left border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/50 shadow-lg text-white'
                        : 'bg-[#080C14] border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                      >
                        <Building2 className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black truncate">{b.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          Code: {b.code} • {b.city}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-cyan-400 text-black flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL 4: TRANSACTION INSPECTION DETAILS
      ═══════════════════════════════════════════════════════════ */}
      {selectedTxItem && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setSelectedTxItem(null)}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#0E121E] border border-white/15 rounded-[28px] p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  selectedTxItem.type === 'INCOME'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}
              >
                {selectedTxItem.type === 'INCOME' ? 'Collection / Inflow' : 'Expense / Outflow'}
              </span>
              <button
                onClick={() => setSelectedTxItem(null)}
                className="w-7 h-7 rounded-full bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <h3 className="text-base font-black text-white">{selectedTxItem.title}</h3>
              <div
                className={`text-2xl font-black ${
                  selectedTxItem.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {selectedTxItem.type === 'INCOME' ? `+ ${formatINR(selectedTxItem.amount)}` : `− ${formatINR(selectedTxItem.amount)}`}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#080C14] border border-white/10 space-y-2 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Category</span>
                <span className="text-white font-bold">{selectedTxItem.category}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Date</span>
                <span className="text-white font-bold">{selectedTxItem.date}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Mode</span>
                <span className="text-white font-bold">{selectedTxItem.paymentMethod}</span>
              </div>
              {selectedTxItem.notes && (
                <div className="pt-2 border-t border-white/10 text-slate-400">
                  <span className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Notes:</span>
                  <p className="text-white text-xs">{selectedTxItem.notes}</p>
                </div>
              )}
            </div>

            {selectedTxItem.type === 'EXPENSE' && (
              <button
                onClick={() => handleDeleteExpenseItem(selectedTxItem.id)}
                className="w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Expense Entry</span>
              </button>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM SHEET 5: FULL TRANSACTIONS STATEMENT (SEE ALL)
      ═══════════════════════════════════════════════════════════ */}
      {isSeeAllTxOpen && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setIsSeeAllTxOpen(false)}
          className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0E121E] border-t border-white/15 rounded-t-[32px] p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto shrink-0 mb-3 cursor-pointer" onClick={() => setIsSeeAllTxOpen(false)} />

            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-sm font-black text-white">Full Transaction Statement</h3>
                <p className="text-[10px] text-slate-400">{currentBranch.name} • {unifiedTransactions.length} records</p>
              </div>
              <button
                onClick={() => setIsSeeAllTxOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-2 space-y-2 pb-6">
              {unifiedTransactions.map((item) => {
                const isIncome = item.type === 'INCOME';
                const IconComponent = getCategoryIcon(item.category, isIncome);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedTxItem(item);
                      setIsSeeAllTxOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-[#080C14] hover:bg-[#0B0F19] border border-white/10 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${
                          isIncome
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          {item.category} • {item.date} • {item.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-xs font-black block ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isIncome ? `+ ${formatINR(item.amount)}` : `− ${formatINR(item.amount)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL 6: CUSTOM DATE FINANCIAL REPORT CARD & DOWNLOAD
      ═══════════════════════════════════════════════════════════ */}
      {isReportCardOpen && typeof document !== 'undefined' && (() => {
        // Compute report data for the selected custom date range
        const filteredTx = branchTransactions.filter((t) => {
          if (!t?.date) return false;
          return t.date >= reportStartDate && t.date <= reportEndDate;
        });

        const filteredExp = branchExpenses.filter((e) => {
          if (!e?.date) return false;
          return e.date >= reportStartDate && e.date <= reportEndDate;
        });

        const reportTotalRevenue = filteredTx.reduce((sum, t) => sum + (t?.amount || 0), 0);
        const reportTotalExpense = filteredExp.reduce((sum, e) => sum + (e?.amount || 0), 0);
        const reportNetCash = reportTotalRevenue - reportTotalExpense;

        const newAdmissionsInPeriod = (members || []).filter((m) => {
          if (selectedBranchId && selectedBranchId !== 'all' && m.branchId !== selectedBranchId) return false;
          return m.startDate && m.startDate >= reportStartDate && m.startDate <= reportEndDate;
        }).length;

        // Build itemized ledger
        const reportLedger = [
          ...filteredTx.map((t) => ({
            id: t.id,
            type: 'INCOME',
            date: t.date || '',
            desc: t.planName ? `${t.planName} (${t.memberName || 'Member'})` : t.category || 'Collection',
            category: t.category || 'Membership',
            paymentMethod: t.paymentMethod || 'UPI',
            amount: t.amount || 0,
          })),
          ...filteredExp.map((e) => ({
            id: e.id,
            type: 'EXPENSE',
            date: e.date || '',
            desc: e.name || 'Operational Expense',
            category: e.category || 'Expense',
            paymentMethod: e.paymentMethod || 'Cash',
            amount: e.amount || 0,
          })),
        ].sort((a, b) => b.date.localeCompare(a.date));

        // Export Print / PDF Handler
        const handleDownloadPDF = () => {
          exportToPrintPDF({
            title: 'SMART GYM FINANCIAL REPORT CARD',
            subtitle: `Executive Performance Statement (${reportStartDate} to ${reportEndDate})`,
            branchName: currentBranch.name,
            generatedBy: 'Smart Gym System Admin',
            dateRange: `${reportStartDate} to ${reportEndDate}`,
            summaryStats: [
              { label: 'Total Collections', value: `₹${reportTotalRevenue.toLocaleString('en-IN')}`, color: '#10b981' },
              { label: 'Total Expenses', value: `₹${reportTotalExpense.toLocaleString('en-IN')}`, color: '#ef4444' },
              { label: 'Net Cash Flow', value: `₹${reportNetCash.toLocaleString('en-IN')}`, color: reportNetCash >= 0 ? '#10b981' : '#ef4444' },
              { label: 'New Admissions', value: newAdmissionsInPeriod, color: '#38bdf8' },
            ],
            headers: ['Date', 'Type', 'Description / Title', 'Category', 'Mode', 'Amount (INR)'],
            rows: reportLedger.map((row) => [
              row.date,
              row.type,
              row.desc,
              row.category,
              row.paymentMethod,
              row.type === 'INCOME' ? `+ ₹${row.amount.toLocaleString('en-IN')}` : `- ₹${row.amount.toLocaleString('en-IN')}`,
            ]),
            notes: 'Generated automatically from Smart Gym Enterprise Ledger. Legally valid verified statement.',
          });
          showToast('Print / PDF Report generated successfully!');
        };

        // Export CSV Handler
        const handleDownloadCSV = () => {
          exportToCSV(
            `SmartGym_Financial_Report_${reportStartDate}_to_${reportEndDate}.csv`,
            ['Date', 'Transaction Type', 'Description / Plan', 'Category', 'Payment Mode', 'Amount (₹)'],
            reportLedger.map((row) => [
              row.date,
              row.type,
              row.desc,
              row.category,
              row.paymentMethod,
              row.type === 'INCOME' ? row.amount : -row.amount,
            ])
          );
          showToast('CSV Report downloaded to your device!');
        };

        // Quick Preset Ranges
        const setPreset = (preset: 'today' | 'week' | 'month' | '30d' | 'year') => {
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          setReportEndDate(todayStr);

          if (preset === 'today') {
            setReportStartDate(todayStr);
          } else if (preset === 'week') {
            const w = new Date();
            w.setDate(today.getDate() - 7);
            setReportStartDate(w.toISOString().split('T')[0]);
          } else if (preset === 'month') {
            const m = new Date();
            m.setDate(1);
            setReportStartDate(m.toISOString().split('T')[0]);
          } else if (preset === '30d') {
            const d = new Date();
            d.setDate(today.getDate() - 30);
            setReportStartDate(d.toISOString().split('T')[0]);
          } else if (preset === 'year') {
            const y = new Date();
            y.setMonth(0, 1);
            setReportStartDate(y.toISOString().split('T')[0]);
          }
        };

        return createPortal(
          <div
            onClick={() => setIsReportCardOpen(false)}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#0E121E] border border-white/15 rounded-[32px] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0B0F19]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      Financial Report Card
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                        Custom Range
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400">{currentBranch.name} • Audit & P&L Statement</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsReportCardOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4">
                {/* Date Controls & Fast Presets */}
                <div className="p-4 rounded-2xl bg-[#080C14] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      Select Date Range
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreset('today')}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreset('week')}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer"
                      >
                        7D
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreset('month')}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer"
                      >
                        Month
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreset('30d')}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer"
                      >
                        30D
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreset('year')}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer"
                      >
                        Year
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase mb-1">From Date</span>
                      <input
                        type="date"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        className="w-full bg-[#0E121E] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase mb-1">To Date</span>
                      <input
                        type="date"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        className="w-full bg-[#0E121E] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>
                </div>

                {/* 4 Financial KPI Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                    <span className="text-[9.5px] font-black uppercase text-emerald-400 block tracking-tight">Total Inflow</span>
                    <div className="text-base font-black text-white mt-1">₹{reportTotalRevenue.toLocaleString('en-IN')}</div>
                    <span className="text-[9px] text-slate-400">{filteredTx.length} payments</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25">
                    <span className="text-[9.5px] font-black uppercase text-rose-400 block tracking-tight">Total Outflow</span>
                    <div className="text-base font-black text-white mt-1">₹{reportTotalExpense.toLocaleString('en-IN')}</div>
                    <span className="text-[9px] text-slate-400">{filteredExp.length} expenses</span>
                  </div>

                  <div className={`p-3 rounded-2xl ${reportNetCash >= 0 ? 'bg-cyan-500/10 border-cyan-500/25' : 'bg-amber-500/10 border-amber-500/25'} border`}>
                    <span className={`text-[9.5px] font-black uppercase ${reportNetCash >= 0 ? 'text-cyan-400' : 'text-amber-400'} block tracking-tight`}>Net Cash Flow</span>
                    <div className={`text-base font-black ${reportNetCash >= 0 ? 'text-cyan-300' : 'text-amber-300'} mt-1`}>
                      ₹{reportNetCash.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[9px] text-slate-400">{reportNetCash >= 0 ? 'Net Surplus' : 'Net Deficit'}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25">
                    <span className="text-[9.5px] font-black uppercase text-purple-400 block tracking-tight">New Admissions</span>
                    <div className="text-base font-black text-white mt-1">{newAdmissionsInPeriod}</div>
                    <span className="text-[9px] text-slate-400">Enrolled Members</span>
                  </div>
                </div>

                {/* Itemized Transactions Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      Itemized Ledger ({reportLedger.length} Records)
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {reportStartDate} → {reportEndDate}
                    </span>
                  </div>

                  <div className="max-h-[220px] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#080C14] divide-y divide-white/5">
                    {reportLedger.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs">
                        No transactions found in this date window.
                      </div>
                    ) : (
                      reportLedger.map((row) => {
                        const isIncome = row.type === 'INCOME';
                        return (
                          <div key={row.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-white/[0.02]">
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded ${isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                  {isIncome ? 'IN' : 'OUT'}
                                </span>
                                <span className="text-white font-bold truncate">{row.desc}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {row.date} • {row.category} • {row.paymentMethod}
                              </div>
                            </div>
                            <span className={`font-black shrink-0 ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isIncome ? `+₹${row.amount.toLocaleString('en-IN')}` : `-₹${row.amount.toLocaleString('en-IN')}`}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions: Download PDF / CSV */}
              <div className="p-4 border-t border-white/10 bg-[#0B0F19] grid grid-cols-2 gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 text-white font-black text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print PDF</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
};
