import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ArrowUpRight } from 'lucide-react';

const LowStockList = ({ items }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Card Header */}
      <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-600 font-extrabold text-sm md:text-base">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span>{t('lowStockProducts')}</span>
        </div>
        <span className="bg-amber-100/70 text-amber-800 font-black text-xs px-2.5 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      {/* Card List */}
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 md:px-6 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
          >
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base">
                {item.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{item.barcode}</p>
            </div>

            <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs md:text-sm">
              <ArrowUpRight className="w-4 h-4 text-amber-600 stroke-[2.5]" />
              <span>
                {item.stockLeft} {item.unit} {t('left')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockList;
