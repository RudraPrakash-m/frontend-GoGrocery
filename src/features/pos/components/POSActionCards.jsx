import React from 'react';
import { useTranslation } from 'react-i18next';
import { Scan, Search } from 'lucide-react';

const POSActionCards = ({ onOpenScan, onToggleSearch, isSearchOpen }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Action 1: Scan Barcode Card (Solid Emerald Green) */}
      <button
        type="button"
        onClick={onOpenScan}
        className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-3xl p-6 md:p-8 shadow-md shadow-emerald-600/25 flex flex-col justify-between space-y-4 transition-all cursor-pointer group text-left"
      >
        <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-xs group-hover:scale-105 transition-transform border border-white/30">
          <Scan className="w-7 h-7 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="font-extrabold text-white text-xl tracking-tight">
            {t('scanBarcode')}
          </h3>
          <p className="text-xs text-emerald-100 font-medium mt-1">
            {t('pointCamera')} / USB Scanner
          </p>
        </div>
      </button>

      {/* Action 2: Search Product Catalog Card (Solid Blue Toggle) */}
      <button
        type="button"
        onClick={onToggleSearch}
        className={`w-full border-2 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col justify-between space-y-4 transition-all cursor-pointer group text-left ${
          isSearchOpen
            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20'
            : 'bg-white border-slate-200/90 hover:border-blue-500 text-slate-900'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
            isSearchOpen ? 'bg-white/20 text-white border border-white/30' : 'bg-blue-50 text-blue-600 border border-blue-100'
          }`}
        >
          <Search className="w-7 h-7 stroke-[2.5]" />
        </div>
        <div>
          <h3 className={`font-extrabold text-xl tracking-tight ${isSearchOpen ? 'text-white' : 'text-slate-900'}`}>
            {t('searchProduct')}
          </h3>
          <p className={`text-xs font-medium mt-1 ${isSearchOpen ? 'text-blue-100' : 'text-slate-500'}`}>
            Search by product name or code
          </p>
        </div>
      </button>
    </div>
  );
};

export default POSActionCards;
