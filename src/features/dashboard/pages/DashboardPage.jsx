import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { dashboardService } from '../services/dashboardService';
import StatCard from '../components/StatCard';
import QuickActions from '../components/QuickActions';
import LowStockList from '../components/LowStockList';
import LanguageToggle from '../../../components/common/LanguageToggle';
import { useProducts } from '../../products/hooks/useProductsQuery';
import { Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth?.user || {});
  const settings = useSelector((state) => state.settings || {});
  const storeName = authUser?.storeName || settings?.storeName || 'GoGrocery';

  const { data: rawProducts = [], isLoading } = useProducts();
  const products = Array.isArray(rawProducts) ? rawProducts : [];

  const stats = dashboardService.getStats();
  const totalProductsCount = products.length > 0 ? products.length : stats.totalProducts;
  const lowStockCount = products.length > 0
    ? products.filter((p) => p.stock <= (p.minStock || 5) && p.stock > 0).length
    : stats.lowStockCount;

  const lowStockItems = products.length > 0
    ? products.filter((p) => p.stock <= (p.minStock || 5))
    : dashboardService.getLowStockItems();

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      {/* Top Header with Greeting & Language Toggle */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs md:text-sm text-slate-500 font-semibold tracking-wide flex items-center gap-1.5">
            <span>{t('goodMorning')}</span>
          </p>
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {storeName}
          </h1>
        </div>

        {/* Mobile / Header Language Toggle */}
        <div className="md:hidden">
          <LanguageToggle variant="outline" />
        </div>
      </div>

      {/* Top 4 Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          label={t('todaysSales')}
          value={`₹${stats.todaysSales.toLocaleString()}`}
          textColor="text-emerald-600"
        />
        <StatCard
          label={t('todaysOrders')}
          value={stats.todaysOrders}
          textColor="text-slate-900"
        />
        <StatCard
          label={t('products')}
          value={isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : totalProductsCount}
          textColor="text-slate-900"
        />
        <StatCard
          label={t('lowStock')}
          value={isLoading ? <Loader2 className="w-5 h-5 animate-spin text-amber-500" /> : lowStockCount}
          textColor="text-amber-500"
        />
      </div>

      {/* Quick Actions Component */}
      <QuickActions />

      {/* Low Stock List Component */}
      <LowStockList items={lowStockItems} isLoading={isLoading} />
    </div>
  );
};

export default DashboardPage;
