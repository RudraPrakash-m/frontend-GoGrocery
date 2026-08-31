import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { History, BarChart2, Settings, HelpCircle, ChevronRight } from 'lucide-react';
import LanguageToggle from '../../../components/common/LanguageToggle';

const MorePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const menuItems = [
    {
      key: 'sales',
      label: t('sales'),
      path: '/sales',
      icon: History,
    },
    {
      key: 'reports',
      label: t('reports'),
      path: '/reports',
      icon: BarChart2,
    },
    {
      key: 'settings',
      label: t('settings'),
      path: '/settings',
      icon: Settings,
    },
    {
      key: 'help',
      label: t('help'),
      path: '/help',
      icon: HelpCircle,
    },
  ];

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('more')}
        </h1>

        <LanguageToggle variant="outline" />
      </div>

      {/* Grouped Card Container */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-3 shadow-xs divide-y divide-slate-100">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.path)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="font-extrabold text-slate-900 text-base">
                  {item.label}
                </span>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MorePage;
