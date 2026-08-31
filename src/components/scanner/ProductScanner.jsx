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
} from 'lucide-react';
import CameraScanner from './CameraScanner';
import ManualScanner from './ManualScanner';
import { hasMediaDevicesSupport, isMobileOrTablet } from './scannerUtils';
import { productService } from '../../features/products/services/productService';

const ProductScanner = ({ onScan, onProductFound, onProductNotFound, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [mode, setMode] = useState('camera'); // 'camera' | 'manual'
  const [scanResult, setScanResult] = useState(null);
  const [foundProduct, setFoundProduct] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const mediaSupported = hasMediaDevicesSupport();
  const isMobile = isMobileOrTablet();

  // If no media support, fallback to manual input default
  useEffect(() => {
    if (!mediaSupported) {
      setMode('manual');
    }
  }, [mediaSupported]);

  // Handle Scan Event from Camera or Manual input
  const handleScanEvent = (result) => {
    setScanResult(result);
    if (onScan) onScan(result);

    // Query Product Service / API
    setIsSearching(true);
    const product = productService.getProductByBarcode(result.value);

    setTimeout(() => {
      setIsSearching(false);
      if (product) {
        setFoundProduct(product);
        if (onProductFound) onProductFound(product, result);
      } else {
        setFoundProduct(null);
        if (onProductNotFound) onProductNotFound(result);
      }
    }, 200);
  };

  const handleScanAgain = () => {
    setScanResult(null);
    setFoundProduct(null);
  };

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 relative my-auto animate-fadeIn">
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
            onClick={onClose}
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

      {/* SCANNING BODY */}
      {!scanResult ? (
        <div className="space-y-4">
          {mode === 'camera' && mediaSupported ? (
            <CameraScanner
              active={mode === 'camera'}
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

          {/* PRODUCT FOUND STATE */}
          {foundProduct ? (
            <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                <span className="text-xs font-extrabold uppercase text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Product Found
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
                  <span>Select Product</span>
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
                  Barcode <strong className="font-mono text-slate-900">{scanResult.value}</strong> is not listed in catalog.
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
