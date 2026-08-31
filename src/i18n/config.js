import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';

const savedLang = localStorage.getItem('gogrocery_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translations.en },
      or: { translation: translations.or },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
