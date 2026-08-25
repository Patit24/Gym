import React, { useState } from "react";
import { useGym } from "../../context/GymContext";
import { Expense } from "../../types/gym";
import { exportToCSV, exportToExcel, exportToPrintPDF } from "../../utils/exportUtils";
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
  FileText,
  Printer,
  Download,
  Users,
  Award,
  Clock,
  Send,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Percent
} from "lucide-react";

export const FinanceReports: React.FC = () => {
  const {
    branches,
    selectedBranchId,
    transactions,
    expenses,
    expenseTypes,
    members,
    employees,
    plans,
    addExpense,
    updateExpense,
    deleteExpense,
    addExpenseType,
    deleteExpenseType,
    recordMemberPayment,
    currentRole
  } = useGym();

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0] || { id: "all", name: "All Branches" };

  // Tab State
  const [activeFinanceTab, setActiveFinanceTab] = useState<
    "overview" | "sales" | "renewals" | "dues" | "trainers" | "branches" | "expenses" | "types"
  >("overview");

  // Strict Financial Access Gate for Trainers & Non-Admin Staff
  if (currentRole === "Trainer" || currentRole === "Dietitian" || currentRole === "Employee") {
    return (
      <div className="p-8 glass-card rounded-3xl border border-red-500/20 text-center space-y-4 max-w-md mx-auto my-12 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-white">Financial Dashboard Restricted</h3>
        <p className="text-xs text-gym-subtext leading-relaxed">
          Financial statements, cash collection books, P&L reports, and operational expense logs are strictly restricted to Gym Owners, Super Admins, and Accountants.
        </p>
      </div>
    );
  }

  // Expense Modals & Form State
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseName, setExpenseName] = useState("");
  const [expenseCategory, setExpenseCategory] = useState(expenseTypes[0]?.name || "Salary");
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<Expense["paymentMethod"]>("Bank Transfer");
  const [expenseDescription, setExpenseDescription] = useState("");

  // Payment Recording Modal
  const [payingMember, setPayingMember] = useState<{ id: string; name: string; dues: number } | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<any>("UPI");
  const [paySuccess, setPaySuccess] = useState("");

  // Expense Types Modal
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDesc, setNewTypeDesc] = useState("");
  const [typeError, setTypeError] = useState("");

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");

  // Branch Scope Filtered Data
  const branchTransactions = selectedBranchId === "all"
    ? transactions
    : transactions.filter((t) => t.branchId === selectedBranchId);
  const totalRevenue = branchTransactions.reduce((acc, t) => acc + t.amount, 0);
  
  const branchExpenses = selectedBranchId === "all"
    ? expenses
    : expenses.filter((e) => e.branchId === selectedBranchId);
  const totalExpenses = branchExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const isProfitable = netProfit >= 0;
  const profitMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0";
  const gstCollected = Math.round(totalRevenue * 0.18);

  const branchMembers = selectedBranchId === "all"
    ? members
    : members.filter((m) => m.branchId === selectedBranchId);

  // Expired & Due calculations
  const expiredMembers = branchMembers.filter((m) => m.status === "Expired");
  const expiringSoonMembers = branchMembers.filter((m) => m.status === "Expiring Soon");
  const membersWithDues = branchMembers.filter((m) => (m.pendingDues || 0) > 0);
  const totalOutstandingDues = membersWithDues.reduce((sum, m) => sum + (m.pendingDues || 0), 0);

  // Category breakdown calculation
  const categoryBreakdown: { [key: string]: number } = {};
  branchExpenses.forEach(exp => {
    categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
  });

  // Filtered Expenses
  const filteredExpenses = branchExpenses.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategoryFilter === "ALL" || e.category === selectedCategoryFilter;
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
        branchId: selectedBranchId === "all" ? "branch-1" : selectedBranchId,
        status: "Paid",
        createdBy: currentRole
      });
    }

    setExpenseName("");
    setExpenseAmount(0);
    setExpenseDescription("");
    setShowAddExpenseModal(false);
  };

  const handleEditClick = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setExpenseName(exp.name);
    setExpenseCategory(exp.category);
    setExpenseAmount(exp.amount);
    setExpenseDate(exp.date);
    setExpensePaymentMethod(exp.paymentMethod);
    setExpenseDescription(exp.description || "");
    setShowAddExpenseModal(true);
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    try {
      await addExpenseType(newTypeName.trim(), newTypeDesc.trim());
      setNewTypeName("");
      setNewTypeDesc("");
      setShowAddTypeModal(false);
      setTypeError("");
    } catch (err: any) {
      setTypeError(err?.message || "Failed to create type");
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingMember || payAmount <= 0) return;
    try {
      await recordMemberPayment(payingMember.id, payAmount, payMethod, "Cleared outstanding dues from Finance Hub");
      setPaySuccess("Payment of ₹" + payAmount.toLocaleString() + " recorded successfully for " + payingMember.name + "!");
      setTimeout(() => {
        setPayingMember(null);
        setPaySuccess("");
      }, 2000);
    } catch (err: any) {
      alert(err.message || "Payment recording failed");
    }
  };

  // WhatsApp Nudges
  const sendDueReminderWhatsApp = (m: typeof members[0]) => {
    const rawNum = (m.mobile || "").replace(/\D/g, "");
    const phone = rawNum.length === 10 ? "91" + rawNum : rawNum;
    const msg = "Hello " + m.name + ",\n\nThis is a friendly reminder from Smart Gym (" + currentBranch.name + "). You have a pending membership dues balance of *₹" + (m.pendingDues || 0).toLocaleString() + "*.\n\nPlease clear this via UPI or at the reception desk to ensure uninterrupted biometric access.\n\nThank you,\nSmart Gym Accounts Team";
    window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msg), "_blank");
  };

  const sendRenewalReminderWhatsApp = (m: typeof members[0]) => {
    const rawNum = (m.mobile || "").replace(/\D/g, "");
    const phone = rawNum.length === 10 ? "91" + rawNum : rawNum;
    const msg = "Hello " + m.name + ",\n\nYour Smart Gym membership (*" + (m.planName || "Fitness Pass") + "*) has expired / is due for renewal.\n\nRenew today to retain your locker, personal training split, and enjoy continuous access across our branches!\n\nClick here to view renewal packages: https://gym-two-livid.vercel.app/\n\nBest regards,\nSmart Gym Team";
    window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msg), "_blank");
  };

  // ==========================================
  // EXPORT HANDLERS
  // ==========================================
  const handleExportPnL = (format: "pdf" | "csv" | "excel") => {
    const headers = ["Category / Item", "Type", "Amount (₹)", "Date / Notes"];
    const rows: (string | number)[][] = [
      ["Total Revenue / Collections", "Income", totalRevenue, "Gross Collections"],
      ["Total Operational Expenses", "Expense", totalExpenses, "Total Outflow"],
      ["Net Profit / (Loss)", isProfitable ? "Profit" : "Loss", netProfit, profitMarginPercent + "% Margin"],
      ["Estimated GST Output (18%)", "Tax", gstCollected, "Statutory Provision"],
      ...Object.entries(categoryBreakdown).map(([cat, amt]) => [
        "Expense: " + cat,
        "Expense Breakdown",
        amt,
        ((amt / (totalExpenses || 1)) * 100).toFixed(1) + "% of total expenses"
      ])
    ];

    const filePrefix = "SmartGym_PnL_" + currentBranch.name + "_" + new Date().toISOString().split("T")[0];

    if (format === "csv") {
      exportToCSV(filePrefix, headers, rows);
    } else if (format === "excel") {
      exportToExcel(filePrefix, headers, rows);
    } else {
      exportToPrintPDF({
        title: "Profit & Loss Statement (P&L)",
        subtitle: "Executive Financial Audit & Cash Flow Report",
        branchName: currentBranch.name,
        generatedBy: currentRole,
        summaryStats: [
          { label: "Total Revenue", value: "₹" + totalRevenue.toLocaleString() },
          { label: "Total Expenses", value: "₹" + totalExpenses.toLocaleString() },
          { label: "Net Profit", value: "₹" + netProfit.toLocaleString() },
          { label: "Profit Margin", value: profitMarginPercent + "%" },
          { label: "GST Collected", value: "₹" + gstCollected.toLocaleString() }
        ],
        headers,
        rows
      });
    }
  };

  const handleExportSales = (format: "pdf" | "csv" | "excel") => {
    const headers = ["Receipt #", "Member Name", "Category", "Plan / Notes", "Date", "Payment Mode", "Amount (₹)"];
    const rows = branchTransactions.map((t) => [
      t.receiptNo,
      t.memberName,
      t.category,
      t.planName || t.notes || "General Pass",
      t.date,
      t.paymentMethod,
      t.amount
    ]);

    const filePrefix = "SmartGym_Sales_" + currentBranch.name + "_" + new Date().toISOString().split("T")[0];

    if (format === "csv") {
      exportToCSV(filePrefix, headers, rows);
    } else if (format === "excel") {
      exportToExcel(filePrefix, headers, rows);
    } else {
      exportToPrintPDF({
        title: "Membership Sales & Revenue Ledger",
        subtitle: "Detailed Transaction Receipts Log",
        branchName: currentBranch.name,
        generatedBy: currentRole,
        summaryStats: [
          { label: "Total Receipts", value: branchTransactions.length },
          { label: "Gross Sales", value: "₹" + totalRevenue.toLocaleString() },
          { label: "Average Ticket", value: "₹" + (branchTransactions.length ? Math.round(totalRevenue / branchTransactions.length).toLocaleString() : 0) }
        ],
        headers,
        rows
      });
    }
  };

  const handleExportDues = (format: "pdf" | "csv" | "excel") => {
    const headers = ["Member #", "Name", "Mobile", "Plan Name", "Join Date", "Pending Dues (₹)"];
    const rows = membersWithDues.map((m) => [
      m.membershipNo || m.id,
      m.name,
      m.mobile || "—",
      m.planName || "Standard Pass",
      m.startDate || "—",
      m.pendingDues || 0
    ]);

    const filePrefix = "SmartGym_OutstandingDues_" + currentBranch.name;

    if (format === "csv") {
      exportToCSV(filePrefix, headers, rows);
    } else if (format === "excel") {
      exportToExcel(filePrefix, headers, rows);
    } else {
      exportToPrintPDF({
        title: "Outstanding Payments & Pending Dues Roster",
        subtitle: "Members with Overdue Balances",
        branchName: currentBranch.name,
        generatedBy: currentRole,
        summaryStats: [
          { label: "Members with Dues", value: membersWithDues.length },
          { label: "Total Overdue Balance", value: "₹" + totalOutstandingDues.toLocaleString() }
        ],
        headers,
        rows
      });
    }
  };

  const handleExportTrainers = (format: "pdf" | "csv" | "excel") => {
    const trainers = employees.filter((e) => e.role === "Trainer" || e.role === "Dietitian");
    const headers = ["Trainer Name", "Role / Spec", "Base Salary (₹)", "PT Commission Rate", "Sessions Completed", "Est. PT Revenue (₹)"];
    const rows = trainers.map((t) => {
      const assignedCount = members.filter((m) => m.assignedTrainerId === t.id).length;
      const estPtRev = (t.ptSessionsCompleted || 0) * 800;
      return [
        t.name,
        t.role + " (" + assignedCount + " clients)",
        t.baseSalary || 0,
        ((t.ptCommissionRate || 0.15) * 100) + "%",
        t.ptSessionsCompleted || 0,
        estPtRev
      ];
    });

    const filePrefix = "SmartGym_TrainerPerformance_" + new Date().toISOString().split("T")[0];

    if (format === "csv") {
      exportToCSV(filePrefix, headers, rows);
    } else if (format === "excel") {
      exportToExcel(filePrefix, headers, rows);
    } else {
      exportToPrintPDF({
        title: "Trainer & Staff Performance Audit",
        subtitle: "Personal Training Sessions & Revenue Yield",
        branchName: currentBranch.name,
        generatedBy: currentRole,
        summaryStats: [
          { label: "Total Trainers", value: trainers.length },
          { label: "Total PT Sessions", value: trainers.reduce((s, t) => s + (t.ptSessionsCompleted || 0), 0) }
        ],
        headers,
        rows
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-xs">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#14171F] via-[#1A1F2C] to-[#14171F] border border-gym-border shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30">
              Enterprise Financial Hub
            </span>
            <span className="text-slate-400 font-bold">• {currentBranch.name}</span>
          </div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#4F7CFF]" />
            <span>Reports, P&L & Multi-Branch Finance Studio</span>
          </h2>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExportPnL("pdf")}
            className="px-3.5 py-2 rounded-xl bg-[#27D980] hover:bg-[#20BE6F] active:scale-95 text-black font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={() => handleExportPnL("excel")}
            className="px-3.5 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => handleExportPnL("csv")}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold flex items-center gap-1.5 border border-white/15 cursor-pointer transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-gym-border/40 scrollbar-none">
        {[
          { id: "overview", label: "Executive P&L", icon: DollarSign },
          { id: "sales", label: "Membership Sales", icon: TrendingUp },
          { id: "renewals", label: "Renewals & Expired", icon: RefreshCw },
          { id: "dues", label: "Outstanding Dues", icon: AlertTriangle },
          { id: "trainers", label: "Trainer Performance", icon: Award },
          { id: "branches", label: "Branch Comparison", icon: Building },
          { id: "expenses", label: "Expense Ledger", icon: CreditCard },
          { id: "types", label: "Expense Categories", icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFinanceTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFinanceTab(tab.id as any)}
              className={"px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap " + (
                isActive
                  ? "bg-[#4F7CFF] text-white shadow-md shadow-[#4F7CFF]/20"
                  : "bg-[#101422] text-slate-400 hover:text-white border border-white/5"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE P&L OVERVIEW */}
      {activeFinanceTab === "overview" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#101422] border border-white/10 space-y-1 shadow-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Revenue</span>
              <div className="text-xl font-black text-[#27D980]">₹{totalRevenue.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                <ArrowUpRight className="w-3 h-3" /> Gross Collections
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#101422] border border-white/10 space-y-1 shadow-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Expenses</span>
              <div className="text-xl font-black text-rose-400">₹{totalExpenses.toLocaleString()}</div>
              <span className="text-[10px] text-rose-400 flex items-center gap-1 font-bold">
                <ArrowDownRight className="w-3 h-3" /> Operational Outflow
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#101422] border border-white/10 space-y-1 shadow-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400">Net Profit / (Loss)</span>
              <div className={"text-xl font-black " + (isProfitable ? "text-[#27D980]" : "text-rose-400")}>
                ₹{netProfit.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 font-bold">
                {profitMarginPercent}% Net Margin
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#101422] border border-white/10 space-y-1 shadow-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400">GST Output (18%)</span>
              <div className="text-xl font-black text-amber-400">₹{gstCollected.toLocaleString()}</div>
              <span className="text-[10px] text-amber-400 font-bold">Statutory Liability</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-[#101422] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#4F7CFF]" />
                <span>Operational Expense Distribution</span>
              </h3>
              <span className="text-[10px] text-slate-400">{Object.keys(categoryBreakdown).length} Categories Active</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(categoryBreakdown).map(([cat, amt]) => {
                const percent = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
                return (
                  <div key={cat} className="p-3 rounded-2xl bg-[#0B0E17] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-300">{cat}</span>
                      <span className="text-slate-400 font-bold">{percent}%</span>
                    </div>
                    <div className="text-sm font-black text-white">₹{amt.toLocaleString()}</div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#4F7CFF] rounded-full" style={{ width: percent + "%" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEMBERSHIP SALES & TRANSACTIONS */}
      {activeFinanceTab === "sales" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#27D980]" />
              <span>Membership Sales & Transactions ({branchTransactions.length})</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportSales("pdf")}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1"
              >
                <Printer className="w-3 h-3" /> Print PDF
              </button>
              <button
                onClick={() => handleExportSales("csv")}
                className="px-3 py-1.5 rounded-xl bg-[#27D980] text-black font-black flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Download CSV
              </button>
            </div>
          </div>

          <div className="bg-[#101422] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0E17] text-slate-400 uppercase font-black text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Receipt #</th>
                    <th className="p-3.5">Member Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Plan / Description</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Payment Mode</th>
                    <th className="p-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {branchTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                        No transactions recorded for this branch yet.
                      </td>
                    </tr>
                  ) : (
                    branchTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-[#4F7CFF]">{t.receiptNo}</td>
                        <td className="p-3.5 font-black text-white">{t.memberName}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#27D980]/15 text-[#27D980] border border-[#27D980]/30">
                            {t.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-300">{t.planName || t.notes || "Membership Fee"}</td>
                        <td className="p-3.5 text-slate-400">{t.date}</td>
                        <td className="p-3.5 font-bold text-slate-300">{t.paymentMethod}</td>
                        <td className="p-3.5 font-black text-[#27D980] text-right text-sm">₹{t.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RENEWALS & EXPIRED MEMBERS */}
      {activeFinanceTab === "renewals" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#101422] border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Expired Accounts</span>
              <div className="text-2xl font-black text-rose-400">{expiredMembers.length}</div>
              <span className="text-[10px] text-slate-400">Action required</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#101422] border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Expiring in 7 Days</span>
              <div className="text-2xl font-black text-amber-400">{expiringSoonMembers.length}</div>
              <span className="text-[10px] text-slate-400">High renewal priority</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#101422] border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Active Memberships</span>
              <div className="text-2xl font-black text-[#27D980]">{branchMembers.filter(m => m.status === "Active").length}</div>
              <span className="text-[10px] text-slate-400">Good standing</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Expired & Pending Renewal Roster</span>
            </h3>
            <button
              onClick={() => handleExportDues("csv")}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Export Roster
            </button>
          </div>

          <div className="bg-[#101422] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0E17] text-slate-400 uppercase font-black text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Member</th>
                    <th className="p-3.5">Mobile</th>
                    <th className="p-3.5">Current Plan</th>
                    <th className="p-3.5">Expiry Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expiredMembers.concat(expiringSoonMembers).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                        ✓ All members in this branch have active memberships!
                      </td>
                    </tr>
                  ) : (
                    expiredMembers.concat(expiringSoonMembers).map((m) => (
                      <tr key={m.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-black text-white">{m.name}</td>
                        <td className="p-3.5 text-slate-300">{m.mobile || "—"}</td>
                        <td className="p-3.5 text-slate-300">{m.planName || "Standard Pass"}</td>
                        <td className="p-3.5 text-rose-400 font-bold">{m.expiryDate || m.endDate || "Expired"}</td>
                        <td className="p-3.5">
                          <span className={"px-2 py-0.5 rounded-full text-[10px] font-bold " + (
                            m.status === "Expired"
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          )}>
                            {m.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => sendRenewalReminderWhatsApp(m)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/30 inline-flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                          >
                            <Send className="w-3 h-3" />
                            <span>WhatsApp Alert</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OUTSTANDING PAYMENTS & DUES */}
      {activeFinanceTab === "dues" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-900/30 via-red-900/20 to-[#101422] border border-rose-500/30 shadow-xl flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-[10px] uppercase font-black text-rose-400 tracking-wider">Total Uncollected Overdue</span>
              <div className="text-2xl font-black text-white mt-0.5">₹{totalOutstandingDues.toLocaleString()}</div>
              <p className="text-[10px] text-slate-400">{membersWithDues.length} members with overdue balances</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportDues("pdf")}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Print PDF
              </button>
              <button
                onClick={() => handleExportDues("excel")}
                className="px-3 py-2 rounded-xl bg-[#27D980] text-black font-black flex items-center gap-1 shadow-md"
              >
                <Download className="w-3.5 h-3.5" /> Export Excel
              </button>
            </div>
          </div>

          <div className="bg-[#101422] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0E17] text-slate-400 uppercase font-black text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Member Name</th>
                    <th className="p-3.5">Mobile</th>
                    <th className="p-3.5">Plan</th>
                    <th className="p-3.5">Joining Date</th>
                    <th className="p-3.5 text-right">Pending Due</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {membersWithDues.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                        ✓ Zero pending dues! All members in this branch are fully paid.
                      </td>
                    </tr>
                  ) : (
                    membersWithDues.map((m) => (
                      <tr key={m.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-black text-white">{m.name}</td>
                        <td className="p-3.5 text-slate-300">{m.mobile || "—"}</td>
                        <td className="p-3.5 text-slate-300">{m.planName || "Standard"}</td>
                        <td className="p-3.5 text-slate-400">{m.startDate || "—"}</td>
                        <td className="p-3.5 font-black text-rose-400 text-right text-sm">
                          ₹{(m.pendingDues || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setPayingMember({ id: m.id, name: m.name, dues: m.pendingDues || 0 });
                              setPayAmount(m.pendingDues || 0);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#27D980] hover:bg-[#20BE6F] text-black font-black active:scale-95 transition-all"
                          >
                            Collect ₹
                          </button>
                          <button
                            onClick={() => sendDueReminderWhatsApp(m)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/30 active:scale-95 transition-all"
                          >
                            WhatsApp
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TRAINER PERFORMANCE */}
      {activeFinanceTab === "trainers" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Trainer Performance, PT Revenue & Client Load</span>
            </h3>
            <button
              onClick={() => handleExportTrainers("csv")}
              className="px-3 py-1.5 rounded-xl bg-[#4F7CFF] text-white font-bold flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Export Trainer Report
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {employees
              .filter((e) => e.role === "Trainer" || e.role === "Dietitian")
              .map((t) => {
                const assignedCount = members.filter((m) => m.assignedTrainerId === t.id).length;
                const estPtRevenue = (t.ptSessionsCompleted || 0) * 800;
                return (
                  <div key={t.id} className="p-4 rounded-3xl bg-[#101422] border border-white/10 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-white">{t.name}</h4>
                        <span className="text-[10px] text-purple-400 font-bold">{t.specialization || t.role}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {assignedCount} Clients
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-2xl bg-[#0B0E17] border border-white/5 space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">PT Sessions</span>
                        <strong className="text-white font-black block">{t.ptSessionsCompleted || 0}</strong>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-[#0B0E17] border border-white/5 space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Est. Yield</span>
                        <strong className="text-[#27D980] font-black block">₹{estPtRevenue.toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                      <span>Base Salary: ₹{(t.baseSalary || 0).toLocaleString()}</span>
                      <span className="text-purple-300 font-bold">Comm: {((t.ptCommissionRate || 0.15) * 100)}%</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 6: BRANCH-BY-BRANCH COMPARISON MATRIX */}
      {activeFinanceTab === "branches" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-[#4F7CFF]" />
              <span>Multi-Branch Performance Benchmark Matrix</span>
            </h3>
            <button
              onClick={() => handleExportPnL("pdf")}
              className="px-3 py-1.5 rounded-xl bg-[#27D980] text-black font-black flex items-center gap-1"
            >
              <Printer className="w-3 h-3" /> Print Multi-Branch Audit
            </button>
          </div>

          <div className="bg-[#101422] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0E17] text-slate-400 uppercase font-black text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Branch Name</th>
                    <th className="p-3.5">City / Location</th>
                    <th className="p-3.5 text-center">Active Members</th>
                    <th className="p-3.5 text-right">Gross Revenue</th>
                    <th className="p-3.5 text-right">Expenses</th>
                    <th className="p-3.5 text-right">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {branches.map((b) => {
                    const bTxns = transactions.filter((t) => t.branchId === b.id);
                    const bRev = bTxns.reduce((s, t) => s + t.amount, 0);
                    const bExps = expenses.filter((e) => e.branchId === b.id);
                    const bExp = bExps.reduce((s, e) => s + e.amount, 0);
                    const bProfit = bRev - bExp;
                    const bMembers = members.filter((m) => m.branchId === b.id && m.status === "Active").length;

                    return (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-black text-white">{b.name}</td>
                        <td className="p-3.5 text-slate-300">{b.city || "Bangalore"}</td>
                        <td className="p-3.5 text-center font-bold text-[#4F7CFF]">{bMembers}</td>
                        <td className="p-3.5 text-right font-black text-[#27D980]">₹{bRev.toLocaleString()}</td>
                        <td className="p-3.5 text-right font-black text-rose-400">₹{bExp.toLocaleString()}</td>
                        <td className={"p-3.5 text-right font-black text-sm " + (bProfit >= 0 ? "text-[#27D980]" : "text-rose-400")}>
                          ₹{bProfit.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: EXPENSES LEDGER */}
      {activeFinanceTab === "expenses" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search expense by title or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#101422] border border-white/10 focus:border-[#4F7CFF] rounded-xl pl-9 pr-3 py-2 text-white outline-none"
                />
              </div>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-[#101422] border border-white/10 rounded-xl px-3 py-2 text-white outline-none font-bold"
              >
                <option value="ALL">All Categories</option>
                {expenseTypes.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingExpenseId(null);
                setExpenseName("");
                setExpenseAmount(0);
                setExpenseDescription("");
                setShowAddExpenseModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 text-white font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record New Expense</span>
            </button>
          </div>

          <div className="bg-[#101422] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0E17] text-slate-400 uppercase font-black text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Expense Item</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Payment Mode</th>
                    <th className="p-3.5">Description / Vendor</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                        No operational expenses recorded matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-black text-white">{exp.name}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30">
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400">{exp.date}</td>
                        <td className="p-3.5 font-bold text-slate-300">{exp.paymentMethod}</td>
                        <td className="p-3.5 text-slate-300 max-w-xs truncate">{exp.description || "—"}</td>
                        <td className="p-3.5 font-black text-rose-400 text-right text-sm">₹{exp.amount.toLocaleString()}</td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleEditClick(exp)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: EXPENSE CATEGORIES */}
      {activeFinanceTab === "types" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#27D980]" />
                <span>Custom Expense Categories ({expenseTypes.length})</span>
              </h3>
              <p className="text-[10px] text-slate-400">Define custom budget heads for precise cost allocation</p>
            </div>
            <button
              onClick={() => setShowAddTypeModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#27D980] hover:bg-[#20BE6F] active:scale-95 text-black font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {expenseTypes.map((t) => (
              <div key={t.id} className="p-3.5 rounded-2xl bg-[#101422] border border-white/10 space-y-2 flex flex-col justify-between shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-xs">{t.name}</span>
                    {t.isDefault && (
                      <span className="text-[9px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-white/5">System</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2">{t.description || "Custom budget category"}</p>
                </div>
                {!t.isDefault && (
                  <button
                    onClick={() => deleteExpenseType(t.id)}
                    className="text-[10px] font-bold text-red-400 hover:underline pt-2 border-t border-white/5 text-left"
                  >
                    Delete Category
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT EXPENSE */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101422] border border-white/15 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white">
                {editingExpenseId ? "Edit Expense Record" : "Record New Expense"}
              </h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Generator Diesel & Service"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#4F7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {expenseTypes.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expenseAmount || ""}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-rose-400 font-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Date</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Payment Mode</label>
                  <select
                    value={expensePaymentMethod}
                    onChange={(e) => setExpensePaymentMethod(e.target.value as any)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Description / Vendor Details</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Paid to Apex Power Generators (Invoice #849)"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#4F7CFF] hover:bg-[#3D69EB] active:scale-95 text-white font-black text-xs shadow-xl cursor-pointer transition-all"
              >
                {editingExpenseId ? "Update Expense" : "Save & Record Expense"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD DUES PAYMENT */}
      {payingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101422] border border-white/15 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-black text-white">Collect Outstanding Dues</h3>
                <span className="text-[10px] text-[#27D980] font-bold">{payingMember.name}</span>
              </div>
              <button
                onClick={() => setPayingMember(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {paySuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 font-bold text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-[#27D980] mx-auto" />
                <p>{paySuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
                <div className="p-3 bg-[#0B0E17] rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Outstanding Due</span>
                  <div className="text-xl font-black text-rose-400 mt-0.5">₹{payingMember.dues.toLocaleString()}</div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Collected Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={payingMember.dues}
                    value={payAmount || ""}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-white/15 focus:border-[#27D980] rounded-xl px-3 py-2 text-[#27D980] font-black text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none font-bold"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / QR)</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Card">Credit / Debit Card (POS)</option>
                    <option value="Bank Transfer">Bank IMPS / NEFT</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#27D980] hover:bg-[#20BE6F] active:scale-95 text-black font-black text-xs shadow-xl cursor-pointer transition-all"
                >
                  Confirm & Issue Receipt 🚀
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD EXPENSE TYPE */}
      {showAddTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101422] border border-white/15 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white">Add Expense Category</h3>
              <button
                onClick={() => setShowAddTypeModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {typeError && (
              <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-[11px]">
                {typeError}
              </div>
            )}

            <form onSubmit={handleCreateType} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Legal & Compliance"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#27D980]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of expenses in this category"
                  value={newTypeDesc}
                  onChange={(e) => setNewTypeDesc(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-white/15 rounded-xl px-3 py-2 text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#27D980] hover:bg-[#20BE6F] active:scale-95 text-black font-black text-xs shadow-xl cursor-pointer transition-all"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
