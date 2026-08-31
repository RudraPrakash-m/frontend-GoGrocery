import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageToggle = ({ variant = 'default', className = '' }) => {
  const { i18n } = useTranslation();

  const currentLang = i18n.language || 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'or' : 'en';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('gogrocery_lang', nextLang);
  };

  const isOdia = currentLang === 'or';

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide transition-all shadow-sm hover:shadow active:scale-95 ${
        variant === 'outline'
          ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
      } ${className}`}
      title="Switch Language (English / Odia)"
    >
      <Globe className="w-3.5 h-3.5 text-emerald-600" />
      <span>{isOdia ? '文 OR' : '文 EN'}</span>
    </button>
  );
};

export default LanguageToggle;
