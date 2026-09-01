import React from 'react';
import { Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LoginBanner = () => {
  const { t } = useTranslation();

  return (
    <div className="hidden md:flex md:w-1/2 min-h-screen bg-slate-900 flex-col justify-end p-6 md:p-14 overflow-hidden relative">
      {/* Background Image */}
      <img
        src="/kirana_bg.png"
        alt="Kirana Shop Shelves"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-85"
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-900/30" />

      {/* Banner Content */}
      <div className="relative z-10 space-y-3 max-w-lg">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold tracking-wider uppercase">
          <Store className="w-4 h-4" />
          <span>{t('appName') || 'GoGrocery'} POS</span>
        </div>

        <h1 className="text-2xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
          {t('posBannerTitle') || 'Simple, Fast POS for every shopkeeper'}
        </h1>

        <p className="text-slate-200 text-xs md:text-base leading-relaxed font-normal">
          {t('posBannerSubtitle') || 'Add stock, scan and sell — all from your phone. Built for Indian kirana shops.'}
        </p>
      </div>
    </div>
  );
};

export default LoginBanner;
