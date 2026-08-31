import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  ShoppingCart,
  PackagePlus,
  Package,
  Receipt,
  BarChart2,
  Settings,
} from 'lucide-react';
import LanguageToggle from '../common/LanguageToggle';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { key: 'home', path: '/', label: t('home'), icon: Home },
    { key: 'sell', path: '/pos', label: t('sell'), icon: ShoppingCart, isSellButton: true },
    { key: 'addStock', path: '/inventory/add', label: t('addStock'), icon: PackagePlus },
    { key: 'products', path: '/products', label: t('products'), icon: Package },
    { key: 'sales', path: '/sales', label: t('sales'), icon: Receipt },
    { key: 'reports', path: '/reports', label: t('reports'), icon: BarChart2 },
    { key: 'settings', path: '/settings', label: t('settings'), icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      {/* Top Header Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="GoGrocery Logo" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
              {t('appName')}
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">GoGrocery POS</p>
          </div>
        </div>

        {/* Navigation Items List */}
        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (item.isSellButton) {
              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold transition-all text-sm shadow-sm ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Language Toggle */}
      <div className="p-6 border-t border-slate-100 flex items-center justify-between">
        <LanguageToggle variant="outline" />
      </div>
    </aside>
  );
};

export default Sidebar;
