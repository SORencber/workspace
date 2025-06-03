import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationDE from './locales/de/translation.json';
import translationTR from './locales/tr/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  de: {
    translation: translationDE
  },
  tr: {
    translation: translationTR
  }
};

// Get the saved language from localStorage or use browser detection
const savedLanguage = localStorage.getItem('language');

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: savedLanguage || undefined, // Use saved language if available
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage']
    },
    react: {
      useSuspense: false // Prevent issues with Suspense
    }
  });

// Set the document language attribute
document.documentElement.lang = i18n.language;
document.documentElement.dir = ['ar', 'he'].includes(i18n.language) ? 'rtl' : 'ltr';

export default i18n;