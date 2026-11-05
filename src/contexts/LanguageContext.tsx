
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { en } from '../locales/en';
import { it } from '../locales/it';
import type { Locale } from 'date-fns';
import { enUS, it as itLocale } from 'date-fns/locale';

type Translations = typeof en;

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: Translations;
  /** date-fns locale matching the active language, for date formatting and calendars */
  dateLocale: Locale;
}

const translations: Record<string, Translations> = {
  en,
  it
};

const dateLocales: Record<string, Locale> = {
  en: enUS,
  it: itLocale
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState('en');
  const [t, setT] = useState<Translations>(translations.en);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
      setT(translations[savedLanguage]);
    }
  }, []);

  // Keep the document language in sync so screen readers and the browser pick the right language
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguage(lang);
      setT(translations[lang]);
      localStorage.setItem('language', lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, dateLocale: dateLocales[language] ?? enUS }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
