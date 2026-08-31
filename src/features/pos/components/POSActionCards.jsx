import React from 'react';
import { useTranslation } from 'react-i18next';
import { Scan, Search } from 'lucide-react';

const POSActionCards = ({ onOpenScan, onToggleSearch, isSearchOpen }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Scan Barcode Card (Solid Emerald Green) */}
      <button
        type="button"
        onClick={onOpenScan}
        className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-3xl p-7 md:p-9 shadow-md shadow-emerald-600/25 flex flex-row items-center justify-center gap-3.5 transition-all cursor-pointer group"
      >
        <Scan className="w-8 h-8 md:w-10 md:h-10 text-white stroke-[2.5]" />
        <span className="font-extrabold text-xl md:text-2xl tracking-wide">
          {t('scanBarcode')}
        </span>
      </button>

      {/* Search Product Card (Toggles search section on click) */}
      <button
        type="button"
        onClick={onToggleSearch}
        className={`w-full active:scale-[0.98] border-2 border-blue-500 rounded-3xl p-7 md:p-9 shadow-xs flex flex-row items-center justify-center gap-3.5 transition-all cursor-pointer group ${
          isSearchOpen ? 'bg-blue-100/90 text-blue-700 ring-2 ring-blue-400' : 'bg-blue-50/70 hover:bg-blue-100/80 text-blue-600'
        }`}
      >
        <Search className="w-8 h-8 md:w-10 md:h-10 text-blue-600 stroke-[2.5]" />
        <span className="font-extrabold text-xl md:text-2xl tracking-wide text-blue-600">
          {t('searchProduct')}
        </span>
      </button>
    </div>
  );
};

export default POSActionCards;
