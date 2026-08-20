import React, { useEffect } from 'react';
import { Transaction } from '../../types/gym';
import { X, Printer, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

interface InvoiceModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ transaction, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (transaction) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transaction, onClose]);

  if (!transaction) return null;

  const gstAmount = Math.round(transaction.amount * 0.18);
  const baseAmount = transaction.amount - gstAmount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
    >
      <div className="bg-[#14171F] border border-gym-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gym-border pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#27D980]" />
            <h3 id="invoice-modal-title" className="font-extrabold text-white text-base">PULSEFIT POS INVOICE</h3>
          </div>
          <button 
            onClick={onClose} 
            aria-label="Close invoice"
            className="p-1.5 rounded-lg bg-[#1E2330] hover:bg-slate-700 text-slate-300 transition-colors focus-visible:ring-2 focus-visible:ring-[#27D980]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invoice Body */}
        <div className="bg-[#0B0D12] rounded-2xl p-5 border border-gym-border/60 text-xs space-y-4 font-mono">
          <div className="flex justify-between border-b border-gym-border/40 pb-3">
            <div>
              <p className="font-bold text-white">Receipt #: {transaction.receiptNo}</p>
              <p className="text-gym-subtext">Date: {transaction.date}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#27D980] bg-[#27D980]/15 px-2 py-0.5 rounded border border-[#27D980]/30">
                PAID ({transaction.paymentMethod})
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-gym-subtext">Customer Name:</p>
            <p className="font-bold text-white text-sm">{transaction.memberName}</p>
            <p className="text-[10px] text-gym-subtext">ID: {transaction.memberId}</p>
          </div>

          <div className="border-t border-b border-gym-border/40 py-3 space-y-2">
            <div className="flex justify-between">
              <span>Category / Item:</span>
              <strong className="text-white">{transaction.category}</strong>
            </div>
            <div className="flex justify-between text-gym-subtext">
              <span>Base Price:</span>
              <span>₹{baseAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gym-subtext">
              <span>GST @ 18%:</span>
              <span>₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex justify-between text-sm font-extrabold text-white pt-1">
            <span>TOTAL PAID:</span>
            <span className="text-[#27D980]">₹{transaction.amount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handlePrint}
            aria-label="Print tax invoice"
            className="flex-1 py-2.5 rounded-xl bg-[#1E2330] hover:bg-[#272E40] text-xs font-semibold text-white flex items-center justify-center gap-2 border border-gym-border transition-colors focus-visible:ring-2 focus-visible:ring-[#4F7CFF]"
          >
            <Printer className="w-4 h-4 text-[#4F7CFF]" />
            <span>Print Tax Invoice</span>
          </button>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="px-6 py-2.5 rounded-xl bg-[#27D980] hover:bg-emerald-400 text-gym-dark font-extrabold text-xs shadow-lg shadow-[#27D980]/20 transition-all focus-visible:ring-2 focus-visible:ring-[#27D980]"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
