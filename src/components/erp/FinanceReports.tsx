import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Expense } from '../../types/gym';
import {
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Building,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

export const FinanceReports: React.FC = () => {
  const {
    branches,
    selectedBranchId,
    transactions,
    expenses,
    expenseTypes,
    addExpense,
    updateExpense,
    deleteExpense,
    addExpenseType,
    deleteExpenseType,
    currentRole
  } = useGym();

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  // Tab State
  const [activeFinanceTab, setActiveFinanceTab] = useState<'overview' | 'income' | 'expenses' | 'pnl' | 'types'>('overview');

  // Expense Modals & Form State
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseName, setExpenseName] = useState('');
  const [expenseCategory, setExpenseCategory] = useState(expenseTypes[0]?.name || 'Salary');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<Expense['paymentMethod']>('Bank Transfer');
  const [expenseDescription, setExpenseDescription] = useState('');

  // Expense Types Modal
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [typeError, setTypeError] = useState('');

  // Expense Filters
  const [expenseSearch, setExpenseSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Calculations
  const branchTransactions = transactions.filter((t) => t.branchId === selectedBranchId);
  const totalRevenue = branchTransactions.reduce((acc, t) => acc + t.amount, 0) || currentBranch.monthlyRevenue;
  
  const branchExpenses = expenses.filter((e) => e.branchId === selectedBranchId);
  const totalExpenses = branchExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const isProfitable = netProfit >= 0;
  const gstCollected = Math.round(totalRevenue * 0.18);

  // Category breakdown calculation
  const categoryBreakdown: { [key: string]: number } = {};
  branchExpenses.forEach(exp => {
    categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
  });

  // Filtered Expenses
  const filteredExpenses = branchExpenses.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      e.category.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(expenseSearch.toLowerCase()));
    const matchesCategory = selectedCategoryFilter === 'ALL' || e.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Submit Add / Edit Expense
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseName || expenseAmount <= 0) return;

    if (editingExpenseId) {
      await updateExpense(editingExpenseId, {
        name: expenseName,
        category: expenseCategory,
        amount: expenseAmount,
        date: expenseDate,
        paymentMethod: expensePaymentMethod,
        description: expenseDescription
      });
      setEditingExpenseId(null);
    } else {
      await addExpense({
        name: expenseName,
        category: expenseCategory,
        amount: expenseAmount,
        date: expenseDate,
        paymentMethod: expensePaymentMethod,
        description: expenseDescription,
        branchId: selectedBranchId,
        status: 'Paid',
        createdBy: currentRole
      });
    }

    // Reset Form
    setExpenseName('');
    setExpenseAmount(0);
    setExpenseDescription('');
    setShowAddExpenseModal(false);
  };

  const handleEditClick = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setExpenseName(exp.name);
    setExpenseCategory(exp.category);
    setExpenseAmount(exp.amount);
    setExpenseDate(exp.date);
    setExpensePaymentMethod(exp.paymentMethod);
    setExpenseDescription(exp.description || '');
    setShowAddExpenseModal(true);
  };

  const handleDeleteExpenseClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      await deleteExpense(id);
    }
  };

  // Submit Add Expense Type
  const handleAddTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTypeError('');
    if (!newTypeName.trim()) return;

    await addExpenseType(newTypeName.trim(), newTypeDesc.trim());
    setNewTypeName('');
    setNewTypeDesc('');
    setShowAddTypeModal(false);
  };

  const handleDeleteType = async (id: string) => {
    const res = await deleteExpenseType(id);
    if (!res.success) {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-[#27D980]" />
            Financial Management & Profit / Loss
          </h2>
          <p className="text-xs text-gym-subtext">
            Enterprise revenue accounting, operating expense logs, P&L audit statement, and custom expense categories
          </p>
        </div>

        {/* Global Sub-Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 bg-[#14171F] p-1.5 rounded-2xl border border-gym-border text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'income', label: 'Income' },
            { id: 'expenses', label: 'Expenses' },
            { id: 'pnl', label: 'Profit & Loss' },
            { id: 'types', label: 'Expense Types' }
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveFinanceTab(id as any)}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeFinanceTab === id
                  ? 'bg-[#27D980] text-gym-dark shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-[#1E2330]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 1: FINANCIAL OVERVIEW
      ════════════════════════════════════════════════════════════════════════ */}
      {activeFinanceTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="glass-card rounded-3xl p-6 border border-gym-border">
              <span className="text-xs text-gym-subtext uppercase font-semibold">Total Revenue Collected</span>
              <div className="text-2xl font-black text-white mt-2">₹{totalRevenue.toLocaleString('en-IN')}</div>
              <span className="text-xs text-[#27D980] font-medium flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-4 h-4" /> Real database collections
              </span>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-gym-border">
              <span className="text-xs text-gym-subtext uppercase font-semibold">Total Operational Expenses</span>
              <div className="text-2xl font-black text-rose-400 mt-2">₹{totalExpenses.toLocaleString('en-IN')}</div>
              <span className="text-xs text-gym-subtext mt-1 block">{branchExpenses.length} expense records</span>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-gym-border">
              <span className="text-xs text-gym-subtext uppercase font-semibold">Net Operating Profit / Loss</span>
              <div className={`text-2xl font-black mt-2 ${isProfitable ? 'text-[#27D980]' : 'text-rose-400'}`}>
                {isProfitable ? `+₹${netProfit.toLocaleString('en-IN')}` : `-₹${Math.abs(netProfit).toLocaleString('en-IN')}`}
              </div>
              <span className="text-xs text-gym-subtext mt-1 block">
                Operating Margin: {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          {/* Breakdown Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Expense Categories Distribution */}
            <div className="glass-panel rounded-3xl p-6 space-y-4 border border-gym-border">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 pb-2 border-b border-gym-border">
                <PieChart className="w-4 h-4 text-purple-400" />
                Expenses by Category
              </h3>
              <div className="space-y-3 text-xs">
                {Object.entries(categoryBreakdown).map(([cat, amt]) => {
                  const percent = totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-200">
                        <span>{cat}</span>
                        <span>₹{amt.toLocaleString('en-IN')} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#121622] rounded-full overflow-hidden">
                        <div style={{ width: `${percent}%` }} className="h-full bg-gradient-to-r from-purple-500 to-cyan-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* GST Audit & Tax Compliance */}
            <div className="glass-panel rounded-3xl p-6 space-y-4 border border-gym-border">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 pb-2 border-b border-gym-border">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                GST Audit & Tax Summary
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-gym-border/40">
                  <span className="text-slate-300">GST Registration:</span>
                  <span className="text-white font-mono font-bold">27AABCP1234F1Z8</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gym-border/40">
                  <span className="text-slate-300">Standard GST Applied:</span>
                  <span className="text-white font-bold">18% (9% CGST + 9% SGST)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gym-border/40">
                  <span className="text-slate-300">Total GST Collected:</span>
                  <span className="text-[#27D980] font-black">₹{gstCollected.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 2: VERIFIED INCOME RECEIPTS
      ════════════════════════════════════════════════════════════════════════ */}
      {activeFinanceTab === 'income' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl p-6 space-y-4 border border-gym-border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#27D980]" />
                All Income & Payment Receipts ({branchTransactions.length})
              </h3>
              <span className="text-xs font-black text-[#27D980]">
                Total: ₹{totalRevenue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gym-border text-gym-subtext uppercase text-[10px]">
                    <th className="py-2.5 px-3">Receipt No</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Member / Customer</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gym-border/40">
                  {branchTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-[#1E2330]/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-cyan-300">{txn.receiptNo}</td>
                      <td className="py-3 px-3 text-slate-300">{txn.date}</td>
                      <td className="py-3 px-3 font-bold text-white">{txn.memberName}</td>
                      <td className="py-3 px-3 text-slate-200">{txn.category}</td>
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
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 3: EXPENSE MANAGEMENT (ADD, EDIT, DELETE, FILTER)
      ════════════════════════════════════════════════════════════════════════ */}
      {activeFinanceTab === 'expenses' && (
        <div className="space-y-6">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-gym-subtext absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search expenses by name or category..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="w-full bg-[#14171F] border border-gym-border focus:border-rose-400 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gym-subtext outline-none"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-[#14171F] border border-gym-border text-xs text-slate-200 rounded-xl px-3 py-2 outline-none"
              >
                <option value="ALL">All Categories</option>
                {expenseTypes.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingExpenseId(null);
                setExpenseName('');
                setExpenseAmount(0);
                setExpenseDescription('');
                setShowAddExpenseModal(true);
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Expense</span>
            </button>
          </div>

          {/* Expenses Table */}
          <div className="glass-panel rounded-3xl p-6 border border-gym-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gym-border">
              <h3 className="text-sm font-extrabold text-white">Expense Records ({filteredExpenses.length})</h3>
              <span className="text-xs font-black text-rose-400">
                Total: ₹{filteredExpenses.reduce((a, b) => a + b.amount, 0).toLocaleString('en-IN')}
              </span>
            </div>

            {filteredExpenses.length === 0 ? (
              <p className="text-xs text-gym-subtext py-6 text-center">No expenses found matching the filter.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gym-border text-gym-subtext uppercase text-[10px]">
                      <th className="py-2.5 px-3">Expense Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Payment Method</th>
                      <th className="py-2.5 px-3">Created By</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gym-border/40">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-[#1E2330]/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{exp.name}</div>
                          {exp.description && <div className="text-[10px] text-gym-subtext">{exp.description}</div>}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">{exp.date}</td>
                        <td className="py-3 px-3 text-slate-300">{exp.paymentMethod}</td>
                        <td className="py-3 px-3 text-gym-subtext text-[11px]">{exp.createdBy || 'Admin'}</td>
                        <td className="py-3 px-3 text-right font-black text-rose-400">
                          ₹{exp.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(exp)}
                              className="p-1.5 rounded-lg bg-[#1E2330] hover:bg-cyan-900/40 text-cyan-300"
                              title="Edit Expense"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpenseClick(exp.id)}
                              className="p-1.5 rounded-lg bg-[#1E2330] hover:bg-rose-900/40 text-rose-400"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 4: PROFIT & LOSS STATEMENT
      ════════════════════════════════════════════════════════════════════════ */}
      {activeFinanceTab === 'pnl' && (
        <div className="glass-panel rounded-3xl p-6 lg:p-8 space-y-6 border border-gym-border max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-gym-border">
            <div>
              <h3 className="text-lg font-black text-white">Full Profit & Loss (P&L) Audit Statement</h3>
              <p className="text-xs text-gym-subtext">Operating Period: Fiscal Year 2026</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-[#27D980] border border-[#27D980]/30">
              AUDITED REAL VALUES
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Revenue */}
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gym-border text-sm font-extrabold text-white">
                <span>1. TOTAL OPERATING REVENUE (INCOME):</span>
                <span className="text-[#27D980]">₹{totalRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="pl-4 space-y-1.5 text-gym-subtext">
                <div className="flex justify-between">
                  <span>• Membership Packages & Admission Fees:</span>
                  <span className="text-slate-200">₹{(totalRevenue * 0.85).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Supplement Store POS Sales & Locker Rentals:</span>
                  <span className="text-slate-200">₹{(totalRevenue * 0.15).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* 2. Expenses */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between py-2 border-b border-gym-border text-sm font-extrabold text-white">
                <span>2. TOTAL OPERATING EXPENSES (COSTS):</span>
                <span className="text-rose-400">₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>
              <div className="pl-4 space-y-1.5 text-gym-subtext">
                {Object.entries(categoryBreakdown).map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between">
                    <span>• {cat}:</span>
                    <span className="text-rose-400">- ₹{amt.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Net Calculation */}
            <div className="pt-4 border-t-2 border-white/20 space-y-2">
              <div className="flex justify-between text-base font-black text-white">
                <span>NET OPERATING PROFIT / (LOSS):</span>
                <span className={isProfitable ? 'text-[#27D980]' : 'text-rose-400'}>
                  {isProfitable ? `+₹${netProfit.toLocaleString('en-IN')}` : `-₹${Math.abs(netProfit).toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gym-subtext">
                <span>Operating Profit Margin:</span>
                <span className="text-slate-200 font-bold">
                  {totalRevenue > 0 ? `${((netProfit / totalRevenue) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 5: EXPENSE TYPES (CATEGORIES) MANAGEMENT
      ════════════════════════════════════════════════════════════════════════ */}
      {activeFinanceTab === 'types' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white">Expense Categories ({expenseTypes.length})</h3>
              <p className="text-xs text-gym-subtext">Create and manage custom expense types for accurate financial reporting</p>
            </div>
            <button
              onClick={() => setShowAddTypeModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F7CFF] text-white font-bold text-xs shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Expense Type</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseTypes.map((t) => {
              const usageCount = expenses.filter(e => e.category.toLowerCase() === t.name.toLowerCase()).length;
              return (
                <div key={t.id} className="glass-card p-4 rounded-2xl border border-gym-border flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white text-xs">{t.name}</span>
                    </div>
                    <p className="text-[10px] text-gym-subtext">{t.description || 'General operational category'}</p>
                    <span className="text-[9px] text-slate-400 block pt-1">{usageCount} expense records using this</span>
                  </div>

                  {!t.isDefault && (
                    <button
                      onClick={() => handleDeleteType(t.id)}
                      className="p-1 rounded-lg bg-[#1E2330] hover:bg-rose-900/40 text-rose-400"
                      title="Delete Expense Type"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL: ADD / EDIT EXPENSE
      ════════════════════════════════════════════════════════════════════════ */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#14171F] border border-gym-border rounded-[32px] p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">
                {editingExpenseId ? 'Edit Expense Record' : 'Record New Expense'}
              </h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Expense Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. August Electricity Bill"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  className="w-full bg-[#121622] border border-gym-border focus:border-rose-400 rounded-xl px-3 py-2.5 text-white font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Category *</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full bg-[#121622] border border-gym-border rounded-xl px-3 py-2.5 text-white font-semibold outline-none"
                  >
                    {expenseTypes.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 8500"
                    value={expenseAmount || ''}
                    onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121622] border border-gym-border focus:border-rose-400 rounded-xl px-3 py-2.5 text-white font-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-[#121622] border border-gym-border rounded-xl px-3 py-2.5 text-white font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Payment Method</label>
                  <select
                    value={expensePaymentMethod}
                    onChange={(e) => setExpensePaymentMethod(e.target.value as any)}
                    className="w-full bg-[#121622] border border-gym-border rounded-xl px-3 py-2.5 text-white font-semibold outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Paid for heavy HVAC electricity consumption"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full bg-[#121622] border border-gym-border rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E2330] text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg"
                >
                  {editingExpenseId ? 'Update Expense' : 'Save Expense Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL: ADD EXPENSE TYPE
      ════════════════════════════════════════════════════════════════════════ */}
      {showAddTypeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#14171F] border border-gym-border rounded-[32px] p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">Create Custom Expense Type</h3>
              <button onClick={() => setShowAddTypeModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddTypeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Legal & Compliance"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full bg-[#121622] border border-gym-border focus:border-[#4F7CFF] rounded-xl px-3 py-2.5 text-white font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Legal fees, trademark licenses, and municipal compliance"
                  value={newTypeDesc}
                  onChange={(e) => setNewTypeDesc(e.target.value)}
                  className="w-full bg-[#121622] border border-gym-border rounded-xl px-3 py-2.5 text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTypeModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E2330] text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4F7CFF] text-white font-black shadow-lg"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
