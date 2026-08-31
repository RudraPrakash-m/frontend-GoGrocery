import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Award, AlertTriangle } from 'lucide-react';

const ReportsPage = () => {
  const { t, i18n } = useTranslation();
  const isOdia = i18n.language === 'or';

  const topSellingList = [
    { name: 'Maggi 70g', sold: isOdia ? '142 ପ୍ୟାକେଟ୍' : '142 packs', rev: '₹1,988' },
    { name: 'Amul Milk 1L', sold: isOdia ? '98 ଲିଟର' : '98 Litres', rev: '₹6,664' },
    { name: 'Britannia Bread', sold: isOdia ? '64 ପ୍ୟାକେଟ୍' : '64 packs', rev: '₹2,560' },
    { name: 'Tata Salt 1kg', sold: isOdia ? '45 ପ୍ୟାକେଟ୍' : '45 packs', rev: '₹1,260' },
  ];

  const restockList = [
    { name: 'Amul Milk 1L', left: isOdia ? '3 ଲିଟର ବଳକା' : '3 Litre left', recommend: isOdia ? '30 ଲିଟର ଅର୍ଡର କରନ୍ତୁ' : 'Order 30 Litres' },
    { name: 'Britannia Bread', left: isOdia ? '5 ପ୍ୟାକେଟ୍ ବଳକା' : '5 Pack left', recommend: isOdia ? '20 ପ୍ୟାକେଟ୍ ଅର୍ଡର କରନ୍ତୁ' : 'Order 20 Packs' },
    { name: 'Sugar 1Kg', left: isOdia ? '4 କିଗ୍ରା ବଳକା' : '4 Kg left', recommend: isOdia ? '50 କିଗ୍ରା ଅର୍ଡର କରନ୍ତୁ' : 'Order 50 Kg' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('reports')}
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          {t('reportsSubtitle')}
        </p>
      </div>

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {t('todaySales')}
          </span>
          <p className="text-3xl font-black text-emerald-600">₹8,450</p>
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 pt-1">
            <TrendingUp className="w-4 h-4" /> +14% {t('vsYesterday')}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {t('thisWeekSales')}
          </span>
          <p className="text-3xl font-black text-slate-900">₹42,800</p>
          <span className="text-xs font-bold text-slate-500 pt-1 block">
            562 {t('totalOrders')}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {t('thisMonthSales')}
          </span>
          <p className="text-3xl font-black text-slate-900">₹1,84,500</p>
          <span className="text-xs font-bold text-slate-500 pt-1 block">
            2,410 {t('totalOrders')}
          </span>
        </div>
      </div>

      {/* Top Selling Products & Restocking Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-emerald-600 font-extrabold text-base">
            <Award className="w-5 h-5" />
            <span>{t('topSellingProducts')}</span>
          </div>

          <div className="space-y-3">
            {topSellingList.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-extrabold text-slate-900">{p.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-semibold">{p.sold}</span>
                  <span className="font-black text-emerald-700">{p.rev}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Restock */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-amber-600 font-extrabold text-base">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>{t('urgentRestock')}</span>
          </div>

          <div className="space-y-3">
            {restockList.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <p className="font-extrabold text-slate-900">{p.name}</p>
                  <p className="text-amber-700 font-bold text-[11px]">{p.left}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-xl border border-emerald-200">
                  {p.recommend}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
