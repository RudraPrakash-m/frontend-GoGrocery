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

      toast.success(t('addedToCartSuccess'));
      setActiveTab('menu');
      setHardwareBarcodeInput('');
    } else {
      toast.error(t('productNotFound'));
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

    toast.success(t('addedToCartSuccess'));
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = 0;
  const total = Math.max(0, subtotal - discount);
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

  const handleCompleteSale = () => {
    if (cart.length === 0) return;

    const now = new Date();
    const invoiceNo = `INV-${Math.floor(10000 + Math.random() * 90000)}`;

    const invoiceObj = {
      id: Date.now(),
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
    toast.success(t('saleCompletedSuccess'));
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
              <span>{t('saleCompletedSuccess')}</span>
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
              <span>{t('cancel')}</span>
            </button>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              {t('payment')}
            </h1>
          </div>

          {/* Total Amount Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xs text-center space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('total')}
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
                {t('cash')}
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
                {t('upi')}
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
                {t('card')}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCompleteSale}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-lg md:text-xl rounded-2xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            {t('completeSale')}
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
              type="button"
              onClick={() => setActiveTab('cartDrawer')}
              className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-6 h-6 stroke-[2.2]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* TWO PRIMARY BIG POS ACTION CARDS */}
          <POSActionCards
            onScanClick={() => setActiveTab('scan')}
            onSearchClick={() => setShowSearch((prev) => !prev)}
            isSearchOpen={showSearch}
          />

          {/* TOGGLEABLE IN-PAGE SEARCH & PRODUCT CATALOG LIST */}
          {showSearch && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-4 md:p-5 shadow-xs space-y-4 animate-fadeIn">
              {/* Search Bar Input */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 stroke-[2.2]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-11 pr-4 py-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Product Catalog Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addToCartFromSearch(product)}
                    className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-extrabold text-slate-900 text-sm truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        ₹{product.sellingPrice} · <span className="text-slate-400 font-normal">{t('stock')}: {product.stock}</span>
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* HARDWARE SCANNER PORTAL */}
          {activeTab === 'scan' &&
            createPortal(
              <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 my-auto relative animate-fadeIn text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('menu')}
                    className="absolute top-4 right-4 w-9 h-9 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200">
                    <Scan className="w-8 h-8 stroke-[2.2]" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {t('scanBarcode')}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      Point USB/Bluetooth scanner gun or enter barcode manually
                    </p>
                  </div>

                  {/* Hardware Scanner Form */}
                  <form onSubmit={handleHardwareScanSubmit} className="space-y-3">
                    <input
                      ref={scannerInputRef}
                      type="text"
                      value={hardwareBarcodeInput}
                      onChange={(e) => setHardwareBarcodeInput(e.target.value)}
                      placeholder="e.g. 8901234567890"
                      className="w-full p-4 bg-slate-50 border-2 border-emerald-500 rounded-2xl text-center text-lg font-black font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
                    />

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
                    >
                      {t('addProduct')}
                    </button>
                  </form>

                  {/* Demo Simulation Barcode Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setHardwareBarcodeInput('8901234567890');
                      handleScanProduct('8901234567890');
                    }}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Simulate Demo Scan (Maggi 70g)
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
                      <span>{t('cart')} <span className="text-slate-400 font-medium">({totalItems})</span></span>
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
                        {t('empty')}
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
                      <span>{t('subtotal')}</span>
                      <span className="font-extrabold text-slate-900">₹{subtotal}</span>
                    </div>

                    <div className="flex justify-between text-sm font-semibold text-slate-500">
                      <span>{t('discount')}</span>
                      <span className="font-extrabold text-slate-900">₹{discount}</span>
                    </div>

                    <div className="flex justify-between items-center text-lg font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                      <span>{t('total')}</span>
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
