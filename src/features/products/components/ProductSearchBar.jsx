import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

const ProductSearchBar = ({ search, setSearch, filter, setFilter, counts }) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 md:items-center justify-between">
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full font-semibold shrink-0">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
          }`}
        >
          All ({counts.all})
        </button>
        <button
          onClick={() => setFilter('lowStock')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'lowStock' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
          }`}
        >
          {t('lowStock')} ({counts.lowStock})
        </button>
        <button
          onClick={() => setFilter('outOfStock')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'outOfStock' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
          }`}
        >
          Out of Stock ({counts.outOfStock})
        </button>
      </div>
    </div>
  );
};

export default ProductSearchBar;
