import React from 'react';
import { useTranslation } from 'react-i18next';
import { Scan, PackagePlus } from 'lucide-react';

const InventoryActionCards = ({ onSelectScan, onSelectCreate }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Scan Barcode Card */}
      <button
        type="button"
        onClick={onSelectScan}
        className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-3xl p-8 md:p-10 shadow-md shadow-emerald-600/25 flex flex-col items-center justify-center gap-3.5 transition-all cursor-pointer"
      >
        <Scan className="w-10 h-10 md:w-12 md:h-12 text-white stroke-[2.5]" />
        <span className="font-extrabold text-xl md:text-2xl tracking-wide">
          {t('scanBarcode')}
        </span>
      </button>

      {/* Create Barcode Card */}
      <button
        type="button"
        onClick={onSelectCreate}
        className="w-full bg-white hover:bg-slate-50 active:scale-[0.98] border-2 border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-xs flex flex-col items-center justify-center gap-3.5 transition-all cursor-pointer"
      >
        <PackagePlus className="w-10 h-10 md:w-12 md:h-12 text-blue-600 stroke-[2.2]" />
        <span className="font-extrabold text-xl md:text-2xl text-slate-900 tracking-wide text-center">
          {t('createBarcode')}
        </span>
      </button>
    </div>
  );
};

export default InventoryActionCards;
