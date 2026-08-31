import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, PackagePlus, Package, BarChart2 } from 'lucide-react';

const QuickActions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-wide">
        {t('quickActions')}
      </h2>

      <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-4 md:gap-6">
        {/* New Sale Card (Full width on mobile) */}
        <button
          onClick={() => navigate('/pos')}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-3xl p-6 md:p-8 shadow-md shadow-emerald-600/25 flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer group"
        >
          <ShoppingCart className="w-8 h-8 md:w-9 md:h-9 text-white stroke-[2.5] transition-transform group-hover:scale-110" />
          <span className="font-extrabold text-base md:text-lg tracking-wide">
            {t('newSale')}
          </span>
        </button>

        {/* 3 Secondary Cards Grid on mobile */}
        <div className="grid grid-cols-2 md:contents gap-3">
          <button
            onClick={() => navigate('/inventory/add')}
            className="bg-white hover:bg-slate-50 active:scale-[0.98] border border-slate-200/90 rounded-3xl p-5 md:p-8 shadow-xs flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer group"
          >
            <PackagePlus className="w-7 h-7 md:w-8 md:h-8 text-emerald-600 stroke-[2.2] transition-transform group-hover:scale-110" />
            <span className="font-extrabold text-xs md:text-base text-slate-900">
              {t('addStock')}
            </span>
          </button>

          <button
            onClick={() => navigate('/products')}
            className="bg-white hover:bg-slate-50 active:scale-[0.98] border border-slate-200/90 rounded-3xl p-5 md:p-8 shadow-xs flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group"
          >
            <Package className="w-7 h-7 md:w-8 md:h-8 text-blue-600 stroke-[2.2] transition-transform group-hover:scale-110" />
            <span className="font-extrabold text-xs md:text-base text-slate-900">
              {t('products')}
            </span>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="bg-white hover:bg-slate-50 active:scale-[0.98] border border-slate-200/90 rounded-3xl p-5 md:p-8 shadow-xs flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group col-span-2 sm:col-span-1"
          >
            <BarChart2 className="w-7 h-7 md:w-8 md:h-8 text-indigo-600 stroke-[2.2] transition-transform group-hover:scale-110" />
            <span className="font-extrabold text-xs md:text-base text-slate-900">
              {t('reports')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
