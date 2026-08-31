import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Barcode, ArrowRight, Usb } from 'lucide-react';
import { normalizeScanResult } from './scannerUtils';

const ManualScanner = ({ onScanSuccess, autoFocus = true }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Buffer for USB Hardware Barcode Scanners (rapid keyboard emulation)
  const usbBufferRef = useRef('');
  const lastKeyTimeRef = useRef(Date.now());

  // Auto-focus input on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [autoFocus]);

  // Global USB Barcode Scanner listener (captures fast typing sequence ending with Enter)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // If user is focused inside another text field, skip global intercept
      const activeEl = document.activeElement;
      if (
        activeEl &&
        activeEl !== inputRef.current &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
      ) {
        return;
      }

      if (e.key === 'Enter') {
        if (usbBufferRef.current.length >= 3) {
          const scannedCode = usbBufferRef.current.trim();
          usbBufferRef.current = '';
          const normalized = normalizeScanResult(scannedCode, 'UNKNOWN', 'usb');
          onScanSuccess(normalized);
        }
        usbBufferRef.current = '';
      } else if (e.key.length === 1) {
        // USB hardware scanners send keys rapidly (<50ms apart)
        if (timeDiff > 100) {
          usbBufferRef.current = e.key;
        } else {
          usbBufferRef.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [onScanSuccess]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const normalized = normalizeScanResult(inputValue.trim(), 'UNKNOWN', 'manual');
    onScanSuccess(normalized);
    setInputValue('');
  };

  return (
    <div className="space-y-4 bg-white p-5 border border-slate-200 rounded-3xl shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
          <Keyboard className="w-4 h-4 text-emerald-600" />
          <span>{t('enterBarcodeManually')}</span>
        </div>

        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-200">
          <Usb className="w-3 h-3 text-emerald-600" />
          <span>{t('usbScannerActive')}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Barcode className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 8901234567890 or SHOP-8409"
            className="w-full pl-11 pr-4 py-3 bg-blue-50/70 border border-slate-200 rounded-2xl text-slate-900 font-extrabold text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-xs"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Submit Barcode / QR ID</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ManualScanner;
