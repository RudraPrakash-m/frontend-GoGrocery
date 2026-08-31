import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ShoppingCart, PackagePlus, Package, MoreHorizontal } from 'lucide-react';

const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { key: 'home', path: '/', label: t('home'), icon: Home },
    { key: 'addStock', path: '/inventory/add', label: t('addStock'), icon: PackagePlus },
    { key: 'sell', path: '/pos', label: t('sell'), icon: ShoppingCart, isProminent: true },
    { key: 'products', path: '/products', label: t('products'), icon: Package },
    { key: 'more', path: '/more', label: t('more'), icon: MoreHorizontal },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-end justify-between max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isProminent) {
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className="-mt-7 mb-1 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/35 transition-transform active:scale-95 shrink-0"
              >
                <Icon className="w-6 h-6 stroke-[2.3]" />
                <span className="text-[11px] font-extrabold leading-none mt-0.5">{item.label}</span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
                isActive ? 'text-emerald-600 font-extrabold' : 'text-slate-500 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 stroke-[2.2] ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span className={`text-[11px] tracking-tight mt-1 ${isActive ? 'font-extrabold text-emerald-600' : 'font-semibold text-slate-500'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
