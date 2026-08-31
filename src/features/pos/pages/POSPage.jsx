import React, { useState } from 'react';
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
import ProductScanner from '../../../components/scanner/ProductScanner';

const POSPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings || {});

  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'scan', 'cartDrawer'
  const [showSearch, setShowSearch] = useState(false); // Toggles in-page search & catalog list
  const [search, setSearch] = useState('');

  const [cart, setCart] = useState([
    { id: 1, name: 'Maggi 70g', price: 14, qty: 1, barcode: '8901234567890' },
  ]);

  const [step, setStep] = useState('cart'); // 'cart', 'payment', 'completed'
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [completedInvoice, setCompletedInvoice] = useState(null);

  const handleProductFoundFromScanner = (product) => {
    if (!product) return;
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].qty += 1;
        return updated;
      }
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          price: product.sellingPrice,
          qty: 1,
          barcode: product.barcode,
        },
      ];
    });

    toast.success(`${product.name} ${t('addedToCartSuccess')}`);
  };

  // Cart operations
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

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const addToCartFromSearch = (product) => {
    handleProductFoundFromScanner(product);
  };

  // Calculation helpers
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = 0;
  const grandTotal = subtotal - discount;
  const cartItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Submit Completed Sale
  const handleCompleteSale = () => {
    if (cart.length === 0) return;

    const newInvoice = {
      id: Date.now(),
      invoiceNo: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      subtotal,
      discount,
      total: grandTotal,
      paymentMode,
      storeName: settings.storeName || 'GoGrocery',
      address: settings.address || 'Plot 21, Market Road, Bhubaneswar',
      phone: settings.phone || '7846807407',
      gstin: settings.gstin || '21ABCDE1234F1Z5',
      itemsCount: cartItemsCount,
      items: cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price })),
    };

    dispatch(addSale(newInvoice));
    setCompletedInvoice(newInvoice);
    setStep('completed');
    toast.success(t('saleCompletedSuccess'));
  };

  const resetSale = () => {
    setCart([]);
    setStep('cart');
    setCompletedInvoice(null);
    setPaymentMode('UPI');
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
          <div className="bg-emerald-600 rounded-3xl p-6 text-white space-y-2 shadow-lg shadow-emerald-600/20">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
              {t('total')} {t('payment')}
            </span>
            <p className="text-4xl font-black font-mono tracking-tight">₹{grandTotal}</p>
            <p className="text-xs font-semibold text-emerald-100">
              {cartItemsCount} {t('items')} · {settings.storeName || 'GoGrocery'}
            </p>
          </div>

          {/* Select Payment Method */}
          <div className="space-y-3">
            <label className="block text-xs font-extrabold uppercase text-slate-500 tracking-wider">
              Select Payment Mode
            </label>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMode('UPI')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 font-extrabold text-xs transition-all cursor-pointer ${
                  paymentMode === 'UPI'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Smartphone className="w-6 h-6 text-blue-600" />
                <span>{t('upi')}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('CASH')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 font-extrabold text-xs transition-all cursor-pointer ${
                  paymentMode === 'CASH'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Banknote className="w-6 h-6 text-emerald-600" />
                <span>{t('cash')}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('CARD')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 font-extrabold text-xs transition-all cursor-pointer ${
                  paymentMode === 'CARD'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-6 h-6 text-purple-600" />
                <span>{t('card')}</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCompleteSale}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{t('completeSale')}</span>
          </button>
        </div>
      )}

      {/* DEFAULT CART & POS SCANNER STEP */}
      {step === 'cart' && (
        <>
          {/* Action Cards (In-Page Search Toggle & Hardware Scanner Launcher) */}
          <POSActionCards
            onOpenScan={() => setActiveTab('scan')}
            onToggleSearch={() => setShowSearch(!showSearch)}
            isSearchOpen={showSearch}
          />

          {/* IN-PAGE CATALOG & BARCODE SEARCH DRAWER */}
          {showSearch && (
            <div className="bg-white border-2 border-blue-500/80 rounded-3xl p-5 shadow-lg space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span>{t('searchProduct')}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {t('close')}
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

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

          {/* REUSABLE PRODUCT SCANNER PORTAL */}
          {activeTab === 'scan' &&
            createPortal(
              <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
                <ProductScanner
                  onProductFound={(prod) => {
                    handleProductFoundFromScanner(prod);
                  }}
                  onClose={() => setActiveTab('menu')}
                />
              </div>,
              document.body
            )}

          {/* POS SHOPPING CART ITEM LIST */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">{t('cart')}</h3>
              </div>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {cartItemsCount} {t('items')}
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <ShoppingCart className="w-10 h-10 mx-auto stroke-1" />
                <p className="font-bold text-xs">{t('empty')}</p>
                <p className="text-[11px] text-slate-400">Scan barcode or search product to add items</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-slate-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">
                        ₹{item.price} x {item.qty} = <span className="text-emerald-700 font-black">₹{item.price * item.qty}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, -1)}
                          className="p-1.5 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-black text-slate-900 font-mono">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, 1)}
                          className="p-1.5 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Floating Mobile Cart Summary Button */}
          {cart.length > 0 && (
            <FloatingCartButton
              itemCount={cartItemsCount}
              grandTotal={grandTotal}
              onProceed={() => setStep('payment')}
            />
          )}
        </>
      )}
    </div>
  );
};

export default POSPage;
