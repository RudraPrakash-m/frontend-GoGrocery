import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Search,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Camera,
  Trash2,
  Printer,
  ArrowLeft,
  X,
  Minus,
  Plus,
  Scan,
  Keyboard,
} from 'lucide-react';
import { INITIAL_PRODUCTS } from '../../../constants/mockProducts';
import { posService } from '../services/posService';
import { addSale } from '../../sales/store/salesSlice';
import POSActionCards from '../components/POSActionCards';
import FloatingCartButton from '../components/FloatingCartButton';
import ReceiptBill from '../../sales/components/ReceiptBill';

const POSPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings || {});

  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'scan', 'cartDrawer'
  const [showSearch, setShowSearch] = useState(false); // Toggles in-page search & catalog list
  const [search, setSearch] = useState('');
  const [hardwareBarcodeInput, setHardwareBarcodeInput] = useState('');
  const scannerInputRef = useRef(null);

  const [cart, setCart] = useState([
    { id: 1, name: 'Maggi 70g', price: 14, qty: 1, barcode: '8901234567890' },
  ]);

  const [step, setStep] = useState('cart'); // 'cart', 'payment', 'completed'
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [completedInvoice, setCompletedInvoice] = useState(null);

  // Auto-focus hardware barcode scanner input
  useEffect(() => {
    if (activeTab === 'scan' && scannerInputRef.current) {
      setTimeout(() => {
        scannerInputRef.current?.focus();
      }, 100);
    }
  }, [activeTab]);

  const handleScanProduct = (barcodeToScan) => {
    const product = INITIAL_PRODUCTS.find((p) => p.barcode === barcodeToScan);

    if (product) {
      setCart((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.id === product.id ? { ...item, qty: item.qty + 1 } : item
          );
        }
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.sellingPrice,
            qty: 1,
            barcode: product.barcode,
          },
        ];
      });

      toast.success(`Added ${product.name} to cart!`);
      setActiveTab('menu');
      setHardwareBarcodeInput('');
    } else {
      toast.error(`Product not found for code: ${barcodeToScan}`);
    }
  };

  const handleHardwareScanSubmit = (e) => {
    e.preventDefault();
    if (hardwareBarcodeInput.trim()) {
      handleScanProduct(hardwareBarcodeInput.trim());
    }
  };

  const addToCartFromSearch = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.sellingPrice,
          qty: 1,
          barcode: product.barcode,
        },
      ];
    });

    toast.success(`Added ${product.name} to cart!`);
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = 0;
  const total = subtotal - discount;

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    const invoiceNo = `INV-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();

    const invoiceObj = {
      id: `inv-${Date.now()}`,
      invoiceNo,
      date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      total,
      subtotal,
      discount,
      paymentMode,
      itemsCount: totalItems,
      storeName: settings.storeName || 'GoGrocery',
      address: settings.address || 'Plot 21, Market Road, Bhubaneswar',
      phone: settings.phone || '7846807407',
      gstin: settings.gstin || '21ABCDE1234F1Z5',
      items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    };

    // Save completed bill into Redux & LocalStorage sales history
    dispatch(addSale(invoiceObj));
    setCompletedInvoice(invoiceObj);
    setStep('completed');
    toast.success(`Sale Completed! Invoice ${invoiceNo} saved.`);
  };

  const resetSale = () => {
    setCart([]);
    setStep('cart');
    setActiveTab('menu');
    setShowSearch(false);
    setPaymentMode('UPI');
    setCompletedInvoice(null);
  };

  const filteredProducts = INITIAL_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto space-y-6 relative pb-20">
      {/* COMPLETED STEP - SHOWING PROPER PRINTABLE STORE RECEIPT */}
      {step === 'completed' && completedInvoice && (
        <div className="space-y-4">
          <div className="text-center pt-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-100 text-emerald-800 font-extrabold text-sm rounded-full">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Sale Completed & Bill Saved to Sales History!</span>
            </span>
          </div>

          <ReceiptBill
            invoice={completedInvoice}
            onNewSale={resetSale}
          />
        </div>
      )}

      {/* PAYMENT STEP */}
      {step === 'payment' && (
        <div className="space-y-6">
          <div>
            <button
              onClick={() => setStep('cart')}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-extrabold text-base transition-colors py-1 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Payment
            </h1>
          </div>

          {/* Total Amount Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xs text-center space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              TOTAL
            </p>
            <p className="text-4xl md:text-5xl font-black text-emerald-600 tracking-tight">
              ₹{total}
            </p>
          </div>

          {/* Payment Method Cards Grid */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMode('CASH')}
              className={`py-5 px-2 rounded-3xl border-2 flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer ${
                paymentMode === 'CASH'
                  ? 'bg-emerald-50/80 border-emerald-600 shadow-sm'
                  : 'bg-white border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Banknote className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-xs md:text-sm text-slate-900 tracking-wide">
                CASH
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('UPI')}
              className={`py-5 px-2 rounded-3xl border-2 flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer ${
                paymentMode === 'UPI'
                  ? 'bg-emerald-50/80 border-emerald-600 shadow-sm'
                  : 'bg-white border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Smartphone className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-xs md:text-sm text-emerald-950 tracking-wide">
                UPI
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('CARD')}
              className={`py-5 px-2 rounded-3xl border-2 flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer ${
                paymentMode === 'CARD'
                  ? 'bg-emerald-50/80 border-emerald-600 shadow-sm'
                  : 'bg-white border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <CreditCard className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-xs md:text-sm text-slate-900 tracking-wide">
                CARD
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCompleteSale}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-lg md:text-xl rounded-2xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            Complete Sale
          </button>
        </div>
      )}

      {/* MAIN CART / MENU STEP */}
      {step === 'cart' && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pt-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('newSale')}
            </h1>

            <button
              onClick={resetSale}
              className="text-sm font-semibold text-rose-300 hover:text-rose-500 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>

          {/* TWO LARGE ACTION CARDS */}
          <POSActionCards
            onOpenScan={() => setActiveTab('scan')}
            onToggleSearch={() => {
              const nextState = !showSearch;
              setShowSearch(nextState);
              if (nextState) {
                setTimeout(() => {
                  const el = document.getElementById('posSearchInput');
                  if (el) el.focus();
                }, 100);
              }
            }}
            isSearchOpen={showSearch}
          />

          {/* TOGGLED SEARCH SECTION */}
          {showSearch && (
            <div className="space-y-4 transition-all duration-300 animate-fadeIn">
              {/* IN-PAGE SEARCH INPUT BAR */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                <input
                  id="posSearchInput"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product name..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-emerald-500 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs placeholder:text-slate-300"
                />
              </div>

              {/* IN-PAGE PRODUCT CATALOG LIST */}
              <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 font-extrabold text-sm">
                    No products match your search
                  </p>
                ) : (
                  filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => addToCartFromSearch(p)}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{p.name}</h3>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          {p.barcode} · Stock: {p.stock} {p.unit}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-emerald-600 text-lg md:text-xl">
                          ₹{p.sellingPrice}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SCAN BARCODE FULL-SCREEN DARK MODAL PORTAL */}
          {activeTab === 'scan' &&
            createPortal(
              <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] w-screen h-screen min-h-screen bg-black text-white p-5 flex flex-col justify-between overflow-y-auto m-0 border-0">
                {/* Top Header */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2.5 text-white font-extrabold text-xl">
                    <Camera className="w-6 h-6 stroke-[2.3]" />
                    <span>Scan Barcode</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="w-11 h-11 bg-slate-800 hover:bg-slate-700 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Red Alert Banner */}
                <div className="bg-red-600 text-white font-extrabold rounded-2xl p-4 text-sm leading-snug my-2 shadow-md">
                  Camera access blocked. Use manual entry or simulate.
                </div>

                {/* Viewfinder Camera Box with Laser Scan Effect */}
                <div className="my-auto space-y-4">
                  <div className="border-2 border-slate-800 rounded-3xl relative overflow-hidden h-64 flex flex-col items-center justify-center bg-slate-950 shadow-2xl">
                    {/* Green Laser Scan Line */}
                    <div className="w-full h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] absolute top-3 left-0 animate-pulse" />

                    {/* Corner Brackets */}
                    <div className="absolute top-4 left-4 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                    <div className="absolute top-4 right-4 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                    <div className="absolute bottom-4 left-4 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                    <div className="absolute bottom-4 right-4 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                    <form onSubmit={handleHardwareScanSubmit} className="w-full max-w-xs px-4 space-y-2 z-10 text-center">
                      <input
                        ref={scannerInputRef}
                        type="text"
                        value={hardwareBarcodeInput}
                        onChange={(e) => setHardwareBarcodeInput(e.target.value)}
                        placeholder="Scan with machine gun..."
                        className="w-full p-3 bg-slate-900/90 border border-emerald-500/80 rounded-xl text-center font-mono font-bold text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </form>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-white font-extrabold text-sm text-center">
                    <Scan className="w-5 h-5 text-emerald-400" />
                    <span>Point your camera at the barcode</span>
                  </div>
                </div>

                {/* Bottom Simulation Controls */}
                <div className="flex items-center gap-3 pt-2 pb-4">
                  <button
                    type="button"
                    onClick={() => handleScanProduct('8901234567890')}
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-emerald-600/30 text-center transition-all cursor-pointer"
                  >
                    Simulate Scan
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('menu');
                      setShowSearch(true);
                      setTimeout(() => {
                        const el = document.getElementById('posSearchInput');
                        if (el) el.focus();
                      }, 100);
                    }}
                    className="w-16 h-14 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Keyboard className="w-6 h-6" />
                  </button>
                </div>
              </div>,
              document.body
            )}

          {/* FLOATING CART PILL BADGE */}
          <FloatingCartButton
            totalItems={totalItems}
            totalAmount={total}
            onClick={() => setActiveTab('cartDrawer')}
          />

          {/* CART DRAWER MODAL PORTAL */}
          {activeTab === 'cartDrawer' &&
            createPortal(
              <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99998] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 pb-24 sm:pb-6">
                <div className="bg-white rounded-3xl p-5 md:p-6 max-w-md w-full max-h-[80vh] flex flex-col justify-between border border-slate-200 shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                    <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-slate-900 stroke-[2.2]" />
                      <span>Cart <span className="text-slate-400 font-medium">({totalItems})</span></span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('menu')}
                      className="p-1 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Items List Body */}
                  <div className="flex-1 overflow-y-auto py-2 pr-1 max-h-[35vh]">
                    {cart.length === 0 ? (
                      <p className="text-center py-10 text-slate-400 font-extrabold text-base tracking-wide">
                        Nothing here yet
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {cart.map((item) => (
                          <div key={item.id} className="py-3 flex items-center justify-between">
                            <div>
                              <p className="font-extrabold text-slate-900 text-base">{item.name}</p>
                              <p className="text-slate-400 font-semibold text-xs mt-0.5">
                                ₹{item.price} × {item.qty}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 bg-slate-100/90 rounded-2xl p-1">
                                <button
                                  type="button"
                                  onClick={() => updateQty(item.id, -1)}
                                  className="w-8 h-8 rounded-xl bg-white text-slate-800 font-black text-sm shadow-xs flex items-center justify-center cursor-pointer"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-5 text-center font-extrabold text-base text-slate-900">
                                  {item.qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQty(item.id, 1)}
                                  className="w-8 h-8 rounded-xl bg-white text-slate-800 font-black text-sm shadow-xs flex items-center justify-center cursor-pointer"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-rose-500 hover:text-rose-700 p-1.5 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 stroke-[2.2]" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* STICKY FOOTER WITH PROCEED TO PAYMENT BUTTON */}
                  <div className="pt-3 border-t border-slate-100 space-y-2 bg-white shrink-0">
                    <div className="flex justify-between text-sm font-semibold text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-extrabold text-slate-900">₹{subtotal}</span>
                    </div>

                    <div className="flex justify-between text-sm font-semibold text-slate-500">
                      <span>Discount</span>
                      <span className="font-extrabold text-slate-900">₹{discount}</span>
                    </div>

                    <div className="flex justify-between items-center text-lg font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                      <span>Total</span>
                      <span className="text-emerald-600 text-3xl font-black tracking-tight">₹{total}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (cart.length === 0) return;
                        setActiveTab('menu');
                        setStep('payment');
                      }}
                      disabled={cart.length === 0}
                      className={`w-full py-4 font-extrabold text-base rounded-2xl transition-all shadow-xs mt-1 text-center ${
                        cart.length === 0
                          ? 'bg-emerald-300/80 text-white cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-md shadow-emerald-600/30 cursor-pointer'
                      }`}
                    >
                      {t('proceedToPayment')}
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
        </div>
      )}
    </div>
  );
};

export default POSPage;
