import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { SupplementProduct, Transaction } from '../../types/gym';
import { InvoiceModal } from '../shared/InvoiceModal';
import {
  ShoppingBag,
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  DollarSign,
  Tag,
  Loader2
} from 'lucide-react';

export const POSStore: React.FC = () => {
  const { supplements, buySupplements, activeMember, members } = useGym();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{ product: SupplementProduct; qty: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [lastTxn, setLastTxn] = useState<Transaction | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const categories = ['ALL', 'Protein', 'Creatine', 'Pre-Workout', 'BCAA', 'Accessories'];

  const filteredProducts = supplements.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: SupplementProduct) => {
    if (product.stockQty <= 0) return;
    setCheckoutError(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: Math.min(product.stockQty, item.qty + 1) }
            : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCheckoutError(null);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const product = supplements.find(p => p.id === productId) || item.product;
            const newQty = item.qty + delta;
            if (newQty <= 0) return null;
            if (newQty > product.stockQty) return item; // Cannot exceed stock
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter(Boolean) as { product: SupplementProduct; qty: number }[]
    );
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0 || isCheckingOut) return;
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const txn = await buySupplements(cart, paymentMethod);
      setLastTxn(txn);
      setCart([]);
    } catch (err: any) {
      setCheckoutError(err.message || 'Checkout failed. Please check inventory stock.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Barcode scanner lookup simulation
  const handleSimulateScan = () => {
    const available = supplements.filter(p => p.stockQty > 0);
    if (available.length === 0) return;
    const randomProduct = available[Math.floor(Math.random() * available.length)];
    if (randomProduct) {
      addToCart(randomProduct);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Invoice Modal Popup */}
      <InvoiceModal transaction={lastTxn} onClose={() => setLastTxn(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#27D980]" />
            Supplement Store & Retail POS Billing
          </h2>
          <p className="text-xs text-gym-subtext">Inventory management, barcode billing, and instant GST tax invoices</p>
        </div>

        <button
          onClick={handleSimulateScan}
          aria-label="Simulate Barcode Scan"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E2330] hover:bg-[#272E40] border border-gym-border text-xs font-semibold text-[#27D980] shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#27D980]"
        >
          <Barcode className="w-4 h-4" />
          <span>Simulate Barcode Scan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Products Grid (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Category & Search Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0" role="tablist" aria-label="Supplement Categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-[#4F7CFF] ${
                    selectedCategory === cat
                      ? 'bg-[#4F7CFF] text-white shadow-md font-bold'
                      : 'bg-[#14171F] text-gym-subtext hover:text-slate-200 border border-gym-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search supplements"
                className="w-full bg-[#14171F] border border-gym-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4F7CFF] transition-colors"
              />
            </div>
          </div>

          {/* Product Cards */}
          {filteredProducts.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center text-gym-subtext text-xs space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300">No supplements match your criteria</p>
              <p className="text-[11px]">Try switching categories or clearing search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="glass-card rounded-2xl p-3.5 flex gap-3 group transition-all"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="w-20 h-20 rounded-xl object-cover border border-gym-border/60 bg-[#0B0D12]"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gym-subtext uppercase tracking-wider">{p.brand}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.stockQty > 10 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                          {p.stockQty} in stock
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#4F7CFF] transition-colors mt-0.5 line-clamp-2">
                        {p.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gym-border/40 mt-2">
                      <span className="text-sm font-extrabold text-white">₹{p.price.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => addToCart(p)}
                        disabled={p.stockQty <= 0}
                        aria-label={`Add ${p.name} to cart`}
                        className="px-3 py-1 rounded-lg bg-[#4F7CFF] hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs transition-all flex items-center gap-1 shadow-md shadow-[#4F7CFF]/20 focus-visible:ring-2 focus-visible:ring-[#4F7CFF]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* POS Cart Counter (1 Col) */}
        <div className="glass-panel rounded-3xl p-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gym-border">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#4F7CFF]" />
                Cart Checkout ({cart.reduce((a, b) => a + b.qty, 0)})
              </h3>
              <span className="text-xs text-gym-subtext">Member: <strong className="text-slate-200">{activeMember?.name || 'Walk-in Customer'}</strong></span>
            </div>

            {/* Error Banner */}
            {checkoutError && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Cart Items */}
            <div className="space-y-3 my-4 max-h-72 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gym-subtext text-xs">
                  Cart is empty. Click items or scan barcodes to add products.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-2xl bg-[#14171F] border border-gym-border/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <h5 className="font-bold text-white line-clamp-1">{item.product.name}</h5>
                      <span className="text-gym-subtext text-[11px]">₹{item.product.price} x {item.qty} = ₹{item.product.price * item.qty}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.product.id, -1)}
                        aria-label={`Decrease quantity of ${item.product.name}`}
                        className="w-6 h-6 rounded-lg bg-[#1E2330] hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold focus-visible:ring-1 focus-visible:ring-slate-400"
                      >
                        -
                      </button>
                      <span className="font-bold text-white min-w-4 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.product.id, 1)}
                        disabled={item.qty >= item.product.stockQty}
                        aria-label={`Increase quantity of ${item.product.name}`}
                        className="w-6 h-6 rounded-lg bg-[#1E2330] hover:bg-slate-700 disabled:opacity-40 text-slate-300 flex items-center justify-center font-bold focus-visible:ring-1 focus-visible:ring-slate-400"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Checkout Panel */}
          {cart.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gym-border">
              <div className="space-y-1.5 text-xs text-gym-subtext">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-slate-200">₹{(totalCartAmount * 0.82).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span className="text-slate-200">₹{(totalCartAmount * 0.18).toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-gym-border/40">
                  <span>Total Due:</span>
                  <span className="text-[#27D980]">₹{totalCartAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-gym-subtext mb-1">Select Payment Method</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['UPI', 'Card', 'Cash', 'NetBanking'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#27D980] ${
                        paymentMethod === method
                          ? 'bg-[#27D980] text-gym-dark shadow-md'
                          : 'bg-[#14171F] text-gym-subtext border border-gym-border'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#4F7CFF] to-[#27D980] text-gym-dark font-black text-xs shadow-lg shadow-[#27D980]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Sale...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Billing & Print Invoice</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
