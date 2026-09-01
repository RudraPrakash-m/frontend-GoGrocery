import React, { useState, useRef } from 'react';
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
  Trash2,
  ArrowLeft,
  Minus,
  Plus,
  Loader2,
} from 'lucide-react';
import { addSale } from '../../sales/store/salesSlice';
import {
  addToCart,
  updateCartQty,
  removeFromCart,
  setPaymentMode,
  setActiveStep,
  clearCart,
} from '../store/cartSlice';
import POSActionCards from '../components/POSActionCards';
import FloatingCartButton from '../components/FloatingCartButton';
import ReceiptBill from '../../sales/components/ReceiptBill';
import ProductScanner from '../../../components/scanner/ProductScanner';
import { useProducts } from '../../products/hooks/useProductsQuery';
import usePOSShortcuts from '../hooks/usePOSShortcuts';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import useDebounce from '../../../hooks/useDebounce';

const POSPage = () => {
  const { t, i18n } = useTranslation();
  const isOdia = i18n?.language === 'or';
  const dispatch = useDispatch();

  useDocumentTitle(isOdia ? 'ବିଲିଂ ପଏଣ୍ଟ ଅଫ୍ ସେଲ୍' : 'POS Billing');

  const authUser = useSelector((state) => state.auth?.user || {});
  const settings = useSelector((state) => state.settings || {});

  // Redux Active Cart State (persisted across tab navigation & page refresh)
  const cartState = useSelector((state) => state.cart || {});
  const cart = Array.isArray(cartState.items) ? cartState.items : [];
  const step = cartState.activeStep || 'cart';
  const paymentMode = cartState.paymentMode || 'UPI';

  const currentStoreName = authUser?.storeName || settings?.storeName || 'GoGrocery';
  const currentAddress =
    authUser?.address || settings?.address || 'Plot 21, Market Road, Bhubaneswar';
  const currentPhone = authUser?.phone || settings?.phone || '7846807407';
  const currentGstin = authUser?.gstin || settings?.gstin || '21ABCDE1234F1Z5';

  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'scan'
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [completedInvoice, setCompletedInvoice] = useState(null);

  const searchInputRef = useRef(null);
  const debouncedSearch = useDebounce(search, 250);

  // TanStack React Query for live product catalog
  const { data: rawCatalog = [], isLoading: isCatalogLoading } = useProducts();
  const catalog = Array.isArray(rawCatalog) ? rawCatalog : [];

  const filteredProducts = catalog.filter((product) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      product.name?.toLowerCase().includes(q) ||
      product.barcode?.includes(q) ||
      product.category?.toLowerCase().includes(q)
    );
  });

  const handleProductFoundFromScanner = (product) => {
    if (!product) return;
    dispatch(
      addToCart({
        id: product.id || product._id,
        name: product.name,
        sellingPrice: product.sellingPrice,
        price: product.sellingPrice,
        qty: 1,
        barcode: product.barcode,
        unit: product.unit || 'Pcs',
      })
    );

    if (isOdia) {
      toast.success(`"${product.name}" କାର୍ଟରେ ଯୋଡାଗଲା!`);
    } else {
      toast.success(`${product.name} ${t('addedToCartSuccess') || 'added to cart'}`);
    }
  };

  // Cart operations
  const handleUpdateQty = (id, currentQty, delta) => {
    dispatch(updateCartQty({ id, qty: currentQty + delta }));
  };

  const handleRemoveFromCart = (id) => {
    dispatch(removeFromCart(id));
  };

  const addToCartFromSearch = (product) => {
    handleProductFoundFromScanner(product);
  };

  // Calculation helpers
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = cartState.discount || 0;
  const grandTotal = Math.max(0, subtotal - discount);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Submit Completed Sale
  const handleCompleteSale = () => {
    if (cart.length === 0) return;

    const newInvoice = {
      id: Date.now(),
      invoiceNo: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      subtotal,
      discount,
      total: grandTotal,
      paymentMode,
      storeName: currentStoreName,
      address: currentAddress,
      phone: currentPhone,
      gstin: currentGstin,
      itemsCount: cartItemsCount,
      items: cart.map((c) => ({
        name: c.name,
        qty: c.qty,
        price: c.price,
        unit: c.unit || 'Pcs',
      })),
    };

    dispatch(addSale(newInvoice));
    dispatch(clearCart());
    setCompletedInvoice(newInvoice);
    dispatch(setActiveStep('completed'));

    if (isOdia) {
      toast.success('ବିକ୍ରୟ ସଫଳତାର ସହିତ ସମ୍ପୂର୍ଣ୍ଣ ହେଲା!');
    } else {
      toast.success(t('saleCompletedSuccess') || 'Sale completed successfully!');
    }
  };

  const resetSale = () => {
    dispatch(clearCart());
    dispatch(setActiveStep('cart'));
    dispatch(setPaymentMode('UPI'));
    setCompletedInvoice(null);
  };

  // POS Keyboard Shortcuts (F2: Search/Scan, F4: Payment, Enter: Complete, Esc: Close)
  usePOSShortcuts({
    onFocusSearch: () => {
      setShowSearch(true);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    },
    onTogglePayment: () => {
      if (cart.length > 0) {
        dispatch(setActiveStep(step === 'payment' ? 'cart' : 'payment'));
      }
    },
    onCompletePayment: handleCompleteSale,
    onCloseModal: () => {
      if (activeTab === 'scan') setActiveTab('menu');
      if (showSearch) setShowSearch(false);
      if (step === 'payment') dispatch(setActiveStep('cart'));
    },
    isPaymentStep: step === 'payment',
    isModalOpen: activeTab === 'scan' || showSearch || step === 'payment',
  });

  return (
    <div className="max-w-xl mx-auto space-y-6 relative pb-20">
      {/* COMPLETED STEP - SHOWING PROPER PRINTABLE STORE RECEIPT */}
      {step === 'completed' && completedInvoice && (
        <div className="space-y-4">
          <div className="text-center pt-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-100 text-emerald-800 font-extrabold text-sm rounded-full">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{t('saleCompletedSuccess') || 'Sale Completed'}</span>
            </span>
          </div>

          <ReceiptBill invoice={completedInvoice} onNewSale={resetSale} />
        </div>
      )}

      {/* PAYMENT STEP */}
      {step === 'payment' && (
        <div className="space-y-6">
          <div>
            <button
              onClick={() => dispatch(setActiveStep('cart'))}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-extrabold text-base transition-colors py-1 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('cancel') || 'Cancel'}</span>
            </button>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              {t('payment') || 'Payment'}
            </h1>
          </div>

          {/* Total Amount Card */}
          <div className="bg-emerald-600 rounded-3xl p-6 text-white space-y-2 shadow-lg shadow-emerald-600/20">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
              {t('total') || 'Total'} {t('payment') || 'Amount'}
            </span>
            <p className="text-4xl font-black font-mono tracking-tight">₹{grandTotal}</p>
            <p className="text-xs font-semibold text-emerald-100">
              {cartItemsCount} {t('items') || 'Items'} · {currentStoreName}
            </p>
          </div>

          {/* Select Payment Method */}
          <div className="space-y-3">
            <label className="block text-xs font-extrabold uppercase text-slate-500 tracking-wider">
              {isOdia ? 'ପେମେଣ୍ଟ ମାଧ୍ୟମ ବାଛନ୍ତୁ' : 'Select Payment Mode'}
            </label>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => dispatch(setPaymentMode('UPI'))}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 font-extrabold text-xs transition-all cursor-pointer ${
                  paymentMode === 'UPI'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Smartphone className="w-6 h-6 text-blue-600" />
                <span>{t('upi') || 'UPI'}</span>
              </button>

              <button
                type="button"
                onClick={() => dispatch(setPaymentMode('CASH'))}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 font-extrabold text-xs transition-all cursor-pointer ${
                  paymentMode === 'CASH'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Banknote className="w-6 h-6 text-emerald-600" />
                <span>{t('cash') || 'Cash'}</span>
              </button>

              <button
                type="button"
                onClick={() => dispatch(setPaymentMode('CARD'))}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 font-extrabold text-xs transition-all cursor-pointer ${
                  paymentMode === 'CARD'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-6 h-6 text-purple-600" />
                <span>{t('card') || 'Card'}</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCompleteSale}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{isOdia ? 'ବିକ୍ରୟ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ' : (t('completeSale') || 'Complete Sale')}</span>
          </button>
        </div>
      )}

      {/* DEFAULT CART & POS SCANNER STEP */}
      {step === 'cart' && (
        <>
          {/* Action Cards (In-Page Search Toggle & Hardware Scanner Launcher) */}
          <POSActionCards
            onOpenScan={() => setActiveTab('scan')}
            onToggleSearch={() => {
              setShowSearch(!showSearch);
              if (!showSearch) {
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }
            }}
            isSearchOpen={showSearch}
          />

          {/* IN-PAGE CATALOG & BARCODE SEARCH DRAWER */}
          {showSearch && (
            <div className="bg-white border-2 border-blue-500/80 rounded-3xl p-5 shadow-lg space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span>{t('searchProduct') || 'Search Product Catalog'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {t('close') || 'Close'}
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('searchPlaceholder') || 'Search by name, barcode, or category...'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {isCatalogLoading ? (
                  <div className="col-span-2 py-8 text-center text-xs font-bold text-slate-500 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                    <span>{isOdia ? 'ଉତ୍ପାଦ ତାଲିକା ଲୋଡ୍ ହେଉଛି...' : 'Loading product catalog...'}</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-2 py-6 text-center text-xs font-bold text-slate-400">
                    {t('noProductsFound') || 'No matching products found'}
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      key={product.id || product._id}
                      type="button"
                      onClick={() => addToCartFromSearch(product)}
                      className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer group"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-extrabold text-slate-900 text-sm truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          ₹{product.sellingPrice} ·{' '}
                          <span className="text-slate-400 font-normal">
                            {t('stock') || 'Stock'}: {product.stock} {product.unit || 'Pcs'}
                          </span>
                        </p>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </button>
                  ))
                )}
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
                <h3 className="font-black text-slate-900 text-base">{t('cart') || 'Cart'}</h3>
              </div>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {cartItemsCount} {t('items') || 'items'}
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <ShoppingCart className="w-10 h-10 mx-auto stroke-1" />
                <p className="font-bold text-xs">{t('empty') || 'Cart is Empty'}</p>
                <p className="text-[11px] text-slate-400">
                  {isOdia
                    ? 'ବାରକୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ କିମ୍ବା ଉତ୍ପାଦ ଖୋଜନ୍ତୁ'
                    : 'Scan barcode (F2) or search product to add items'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="pt-3 first:pt-0 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-slate-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">
                        ₹{item.price} x {item.qty} ={' '}
                        <span className="text-emerald-700 font-black">
                          ₹{item.price * item.qty}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, item.qty, -1)}
                          className="p-1.5 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-black text-slate-900 font-mono">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, item.qty, 1)}
                          className="p-1.5 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.id)}
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
              onProceed={() => dispatch(setActiveStep('payment'))}
            />
          )}
        </>
      )}
    </div>
  );
};

export default POSPage;
