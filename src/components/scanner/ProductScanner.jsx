import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Scan,
  Camera,
  Keyboard,
  CheckCircle,
  AlertTriangle,
  X,
  Plus,
  RefreshCw,
  ShoppingBag,
  Usb,
  Loader2,
} from 'lucide-react';
import CameraScanner from './CameraScanner';
import ManualScanner from './ManualScanner';
import { hasMediaDevicesSupport, isMobileOrTablet } from './scannerUtils';
import { productService } from '../../features/products/services/productService';

const ProductScanner = ({ onScan, onProductFound, onProductNotFound, onClose, barcodeMap }) => {
  const { t, i18n } = useTranslation();
  const isOdia = i18n?.language === 'or';
  const navigate = useNavigate();

  const [mode, setMode] = useState('camera'); // 'camera' | 'manual'
  const [scanResult, setScanResult] = useState(null);
  const [foundProduct, setFoundProduct] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Quantity Prompt state after scan
  const [promptProduct, setPromptProduct] = useState(null);
  const [promptQty, setPromptQty] = useState('');
  const qtyInputRef = React.useRef(null);

  const mediaSupported = hasMediaDevicesSupport();
  const isMobile = isMobileOrTablet();

  // If no media support, fallback to manual input default
  useEffect(() => {
    if (!mediaSupported) {
      setMode('manual');
    }
  }, [mediaSupported]);

  // Auto-focus quantity input when prompt opens
  useEffect(() => {
    if (promptProduct && qtyInputRef.current) {
      setTimeout(() => qtyInputRef.current?.focus(), 80);
    }
  }, [promptProduct]);

  // Confirm Add Quantity Handler (Default = 1 if empty)
  const handleConfirmAddQty = () => {
    if (!promptProduct) return;
    const finalQty = Math.max(1, parseInt(promptQty, 10) || 1);
    if (onProductFound) {
      onProductFound(promptProduct, finalQty);
    }
    setPromptProduct(null);
    setPromptQty('');
  };

  // Handle Scan Event from Camera or Manual input
  const handleScanEvent = async (result) => {
    // If prompt is already open, lock scanner and ignore scan
    if (promptProduct) return;
    if (onScan) onScan(result);

    const barcodeValue = String(result?.value || '').trim();

    // 1. Instant O(1) In-Memory RAM Map Lookup (0ms latency, zero API calls)
    if (barcodeMap && barcodeMap.has(barcodeValue)) {
      const product = barcodeMap.get(barcodeValue);
      setPromptProduct(product);
      setPromptQty('');
      return;
    }

    setScanResult(result);

    // 2. Fallback DB Lookup if item is not found in preloaded map
    setIsSearching(true);
    try {
      const product = await productService.getProductByBarcode(barcodeValue);
      setIsSearching(false);
      if (product) {
        setPromptProduct(product);
        setPromptQty('');
        setScanResult(null);
      } else {
        setFoundProduct(null);
        if (onProductNotFound) onProductNotFound(result);
      }
    } catch (_err) {
      setIsSearching(false);
      setFoundProduct(null);
      if (onProductNotFound) onProductNotFound(result);
    }
  };

  const handleScanAgain = () => {
    setScanResult(null);
    setFoundProduct(null);
    setPromptProduct(null);
    setPromptQty('');
  };

  return (
    <div
      role="region"
      aria-label={t('scanProduct') || 'Product Scanner'}
      className="bg-white rounded-3xl p-5 md:p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 relative my-auto animate-fadeIn"
    >
      {/* Header & Close Button */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <Scan className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base md:text-lg">
              {t('scanProduct')}
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              {isMobile ? 'Mobile Rear Camera Active' : 'Desktop / Webcam & USB Scanner Support'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-9 h-9 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mode Selector Tabs (Camera vs Manual / USB) */}
      {!scanResult && (
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('camera')}
            disabled={!mediaSupported}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'camera'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 disabled:opacity-50'
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>Camera Scan</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'manual'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-4 h-4 text-emerald-600" />
            <span>Manual / USB</span>
          </button>
        </div>
      )}

      {/* SCANNING BODY OR QUANTITY PROMPT */}
      {promptProduct ? (
        <div className="p-5 rounded-3xl bg-emerald-50/90 border-2 border-emerald-300 space-y-4 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
            <span className="text-xs font-extrabold uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {isOdia ? 'ଉତ୍ପାଦ ସ୍କାନ୍ ହେଲା' : 'Scanned Product'}
            </span>
            <span className="text-xs font-black text-emerald-900 bg-emerald-200/70 px-2.5 py-1 rounded-lg">
              {promptProduct.category || 'Grocery'}
            </span>
          </div>

          <div>
            <h4 className="text-xl font-black text-slate-900">{promptProduct.name}</h4>
            <p className="text-xs text-slate-600 font-bold mt-1">
              ₹{promptProduct.sellingPrice} · {t('stock') || 'Stock'}:{' '}
              <strong className="text-emerald-800">{promptProduct.stock ?? '∞'} {promptProduct.unit || 'Pcs'}</strong>
            </p>
          </div>

          {/* Quantity Input Box */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-extrabold text-slate-700">
              {isOdia ? 'ପରିମାଣ (Default 1):' : 'Quantity (Default 1 if left empty):'}
            </label>
            <input
              ref={qtyInputRef}
              type="number"
              min="1"
              max={promptProduct.stock || 9999}
              placeholder="1"
              value={promptQty}
              onChange={(e) => setPromptQty(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleConfirmAddQty();
                }
              }}
              className="w-full py-3 px-4 bg-white border-2 border-emerald-400 rounded-2xl text-center text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-inner"
            />
          </div>

          {/* Action Buttons: Cancel vs Add */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setPromptProduct(null);
                setPromptQty('');
              }}
              className="flex-1 py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-2xl transition-colors cursor-pointer"
            >
              {isOdia ? 'ବାତିଲ୍' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleConfirmAddQty}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isOdia ? 'ଯୋଡନ୍ତୁ (Add)' : 'Add to Sale'}</span>
            </button>
          </div>
        </div>
      ) : !scanResult ? (
        <div className="space-y-4">
          {mode === 'camera' && mediaSupported ? (
            <CameraScanner
              active={mode === 'camera' && !promptProduct}
              onScanSuccess={handleScanEvent}
            />
          ) : (
            <ManualScanner onScanSuccess={handleScanEvent} />
          )}
        </div>
      ) : (
        /* SCAN RESULT & PRODUCT LOOKUP CARD */
        <div className="space-y-4 animate-fadeIn">
          {/* Result Code Pill */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs shadow-md">
            <div className="flex items-center gap-2">
              <Usb className="w-4 h-4 text-emerald-400" />
              <span className="font-extrabold text-slate-300">Format: {scanResult.format}</span>
            </div>
            <span className="font-black font-mono text-emerald-400 text-sm tracking-wider">
              {scanResult.value}
            </span>
          </div>

          {/* SEARCHING / LOOKUP STATE */}
          {isSearching ? (
            <div className="p-8 rounded-3xl bg-blue-50/90 border-2 border-blue-200/90 space-y-3.5 text-center shadow-xs animate-fadeIn">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto border border-blue-200">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900">
                  {isOdia ? 'ଦୋକାନ ତଥ୍ୟ ଯାଞ୍ଚ ହେଉଛି...' : 'Checking Store Database...'}
                </h4>
                <p className="text-xs text-slate-600 font-semibold">
                  {isOdia
                    ? 'ଦୟାକରି ଅପେକ୍ଷା କରନ୍ତୁ, ବାରକୋଡ୍ ଯାଞ୍ଚ କରାଯାଉଛି...'
                    : 'Looking up scanned barcode in catalog...'}
                </p>
              </div>
            </div>
          ) : foundProduct ? (
            /* PRODUCT FOUND STATE */
            <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                <span className="text-xs font-extrabold uppercase text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  {isOdia ? 'ଉତ୍ପାଦ ମିଳିଲା' : 'Product Found'}
                </span>
                <span className="text-xs font-black text-emerald-900 bg-emerald-200/70 px-2.5 py-1 rounded-lg">
                  {foundProduct.category}
                </span>
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900">{foundProduct.name}</h4>
                <p className="text-xs text-slate-600 font-bold mt-0.5">
                  {t('stock')}: <strong>{foundProduct.stock} {foundProduct.unit}</strong> | Cost: ₹{foundProduct.purchasePrice}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-2xl font-black text-emerald-700">₹{foundProduct.sellingPrice}</span>

                <button
                  type="button"
                  onClick={() => {
                    if (onProductFound) onProductFound(foundProduct, scanResult);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOdia ? 'ଉତ୍ପାଦ ବାଛନ୍ତୁ' : 'Select Product'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* PRODUCT NOT FOUND STATE */
            <div className="p-5 rounded-3xl bg-amber-50 border-2 border-amber-200 space-y-3 text-center shadow-xs">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <h4 className="text-lg font-black text-amber-950">{t('productNotFound')}</h4>
                <p className="text-xs text-amber-800 font-semibold mt-1">
                  {isOdia ? (
                    <>ବାରକୋଡ୍ <strong className="font-mono text-slate-900">{scanResult.value}</strong> କାଟାଲଗ୍ ରେ ଉପଲବ୍ଧ ନାହିଁ।</>
                  ) : (
                    <>Barcode <strong className="font-mono text-slate-900">{scanResult.value}</strong> is not listed in catalog.</>
                  )}
                </p>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                    navigate('/inventory/add', { state: { barcode: scanResult.value } });
                  }}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('addNewProduct')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleScanAgain}
                  className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-slate-600" />
                  <span>{t('scanAgain')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          {foundProduct && (
            <button
              type="button"
              onClick={handleScanAgain}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-slate-600" />
              <span>{t('scanAgain')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductScanner;
