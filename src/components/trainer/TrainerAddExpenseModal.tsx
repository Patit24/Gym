import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Expense } from '../../types/gym';
import {
  Receipt,
  X,
  CheckCircle2,
  DollarSign,
  Calendar,
  CreditCard,
  Tag,
  Upload,
  Camera,
  FileText,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface TrainerAddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainerName?: string;
}

export const TrainerAddExpenseModal: React.FC<TrainerAddExpenseModalProps> = ({
  isOpen,
  onClose,
  trainerName = 'Gym Trainer'
}) => {
  const { addExpense, selectedBranchId } = useGym();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Maintenance');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('Cash');
  const [expenseDate, setExpenseDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recordedExpense, setRecordedExpense] = useState<Expense | null>(null);

  if (!isOpen) return null;

  const quickCategories = [
    { label: '🏋️ Equipment Repair', cat: 'Maintenance', preset: 'Equipment Cable / Pulley Fix' },
    { label: '🧹 Cleaning & Hygiene', cat: 'Cleaning', preset: 'Sanitizers & Disinfectant Restock' },
    { label: '🩹 First Aid & Safety', cat: 'Maintenance', preset: 'First Aid Kit & Bandages' },
    { label: '💧 Water & Drinks', cat: 'Utilities', preset: 'Water Dispenser Can Refill' },
    { label: '🧴 Gym Chalk & Straps', cat: 'Equipment', preset: 'Lifting Chalk & Belts Replenishment' },
    { label: '🚕 Travel / Transport', cat: 'Transportation', preset: 'Trainer Travel for Competition' },
    { label: '📦 Misc Consumables', cat: 'Other', preset: 'Stationery & Daily Misc' }
  ];

  const quickAmounts = [200, 500, 1000, 2000, 3500, 5000];

  const handleApplyPreset = (preset: { label: string; cat: string; preset: string }) => {
    setTitle(preset.preset);
    setCategory(preset.cat);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Receipt photo must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptUrl(reader.result as string);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter an expense title or purpose.');
      return;
    }

    const numAmount = Math.max(0, Math.round(Number(amount) || 0));
    if (numAmount <= 0) {
      setErrorMsg('Please enter a valid expense amount greater than ₹0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await addExpense({
        name: title.trim(),
        category,
        amount: numAmount,
        date: expenseDate || new Date().toISOString().split('T')[0],
        paymentMethod,
        description: description.trim() || `Recorded by Coach ${trainerName}`,
        receiptUrl: receiptUrl || undefined,
        createdBy: trainerName,
        branchId: selectedBranchId || 'branch-1',
        status: 'Paid'
      });

      setRecordedExpense(created);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to record expense voucher.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setTitle('');
    setCategory('Maintenance');
    setAmount('');
    setPaymentMethod('Cash');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setReceiptUrl('');
    setRecordedExpense(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div 
      onClick={handleResetAndClose}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#101422] border border-white/10 rounded-3xl max-w-lg w-full my-auto max-h-[90vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden"
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#101422] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-sm sm:text-base">Record Gym Expense</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                  Voucher
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Logged under Coach: <strong className="text-white">{trainerName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 min-h-0 space-y-4">
          
          {/* Success Receipt State */}
          {recordedExpense ? (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-white">Expense Voucher Recorded!</h4>
                <p className="text-xs text-slate-300">
                  The expense entry has been registered and synced with the gym ledger.
                </p>
              </div>

              {/* Receipt Voucher Slip */}
              <div className="bg-[#0B0E17] rounded-2xl p-4 border border-white/10 space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400 font-sans">Voucher ID:</span>
                  <span className="text-amber-400 font-bold">{recordedExpense.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Title / Purpose:</span>
                  <span className="text-white font-bold text-right">{recordedExpense.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Category:</span>
                  <span className="text-cyan-400">{recordedExpense.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Payment Method:</span>
                  <span className="text-purple-400 font-bold">{recordedExpense.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Date:</span>
                  <span className="text-slate-300">{recordedExpense.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Logged By:</span>
                  <span className="text-slate-300">{recordedExpense.createdBy || trainerName}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-black">
                  <span className="text-slate-300 font-sans">Amount Paid:</span>
                  <span className="text-emerald-400 font-bold">₹{recordedExpense.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRecordedExpense(null);
                    setTitle('');
                    setAmount('');
                    setDescription('');
                    setReceiptUrl('');
                  }}
                  className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all"
                >
                  + Record Another Expense
                </button>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="flex-1 py-3 rounded-2xl bg-[#4F7CFF] hover:bg-blue-600 text-white font-extrabold text-xs shadow-lg shadow-[#4F7CFF]/20 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Quick Expense Presets */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                  Quick Purpose Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickCategories.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(item)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        title === item.preset
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-[#0B0E17] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title / Description */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Expense Title / Purpose *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cable Machine Wire Replacement / Chalk Powder"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full p-3 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Amount & Quick Chips */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Amount Spent (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full pl-8 pr-4 py-3 bg-[#0B0E17] rounded-xl border border-white/10 text-sm font-extrabold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickAmounts.map((qVal) => (
                    <button
                      key={qVal}
                      type="button"
                      onClick={() => setAmount(qVal)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        amount === qVal
                          ? 'bg-emerald-500 text-black border-emerald-400 font-black'
                          : 'bg-[#0B0E17] border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      ₹{qVal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category & Payment Mode in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Maintenance">Maintenance & Repair</option>
                    <option value="Equipment">Gym Equipment & Gear</option>
                    <option value="Cleaning">Cleaning & Sanitation</option>
                    <option value="Utilities">Utilities & Water</option>
                    <option value="Office Supplies">Supplies & Stationery</option>
                    <option value="Transportation">Travel & Transport</option>
                    <option value="Marketing">Events & Promotion</option>
                    <option value="Other">Other Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Paid Via (Payment Mode)
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Cash">💵 Cash</option>
                    <option value="UPI">📱 UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Card">💳 Debit / Credit Card</option>
                    <option value="Bank Transfer">🏦 Bank Transfer</option>
                  </select>
                </div>
              </div>

              {/* Date & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    Bill No / Vendor / Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bill #8812 / Hardware Store"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 bg-[#0B0E17] rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Optional Bill / Receipt Photo Upload */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Attach Bill / Receipt Photo (Optional)
                </label>
                {receiptUrl ? (
                  <div className="relative p-2 bg-[#0B0E17] rounded-2xl border border-white/10 flex items-center gap-3">
                    <img
                      src={receiptUrl}
                      alt="Receipt preview"
                      className="w-14 h-14 object-cover rounded-xl border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Receipt Attached
                      </span>
                      <p className="text-[10px] text-slate-400 truncate">Image ready for verification</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReceiptUrl('')}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-dashed border-white/20 bg-[#0B0E17] hover:bg-white/5 cursor-pointer transition-all">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold">Take Photo or Upload Receipt</span>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-0.5">JPG, PNG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Voucher...</span>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" />
                      <span>Submit Expense Voucher</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
