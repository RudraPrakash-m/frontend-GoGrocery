import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, ArrowRight } from 'lucide-react';

const FloatingCartButton = ({ itemCount, grandTotal, totalItems, totalAmount, onProceed, onClick }) => {
  const { t } = useTranslation();
  const items = itemCount ?? totalItems ?? 0;
  const total = grandTotal ?? totalAmount ?? 0;
  const handleAction = onProceed || onClick;

  return (
    <button
      type="button"
      onClick={handleAction}
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-40 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold p-4 rounded-2xl shadow-xl shadow-emerald-600/35 flex items-center justify-between gap-3 text-base transition-all cursor-pointer border border-emerald-500/40"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs shrink-0">
          <ShoppingCart className="w-5 h-5 stroke-[2.5] text-white" />
        </div>
        <div className="text-left leading-tight min-w-0">
          <p className="text-[11px] font-extrabold text-emerald-100 uppercase tracking-wider">
            {t('cart')} ({items})
          </p>
          <p className="text-sm font-black text-white truncate">
            {t('proceedToPayment')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-lg font-black font-mono text-white">₹{total}</span>
        <div className="w-7 h-7 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-extrabold text-sm shadow-xs">
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </div>
      </div>
    </button>
  );
};

export default FloatingCartButton;
