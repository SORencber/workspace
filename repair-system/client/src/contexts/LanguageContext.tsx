import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  languages: { code: string; name: string }[];
};

const defaultLanguage = localStorage.getItem('language') || 'en';

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'tr', name: 'Türkçe' }
];

export const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  languages
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(defaultLanguage);

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setLanguageState(lang);
    document.documentElement.lang = lang; // Set the lang attribute on the html element
    document.documentElement.dir = ['ar', 'he'].includes(lang) ? 'rtl' : 'ltr'; // Handle RTL languages if needed
  };

  useEffect(() => {
    // Initialize with saved language
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
  }, []);

  const value = {
    language,
    setLanguage,
    languages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);