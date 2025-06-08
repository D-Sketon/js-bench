'use client';

import { useEffect } from 'react';
import { useTranslation } from '../i18n';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { currentLanguage } = useTranslation();

  const updateHtmlLang = (language: string) => {
    const htmlElement = document.documentElement;
    const langCode = language === 'zh' ? 'zh-CN' : 'en';
    htmlElement.lang = langCode;
  };

  useEffect(() => {
    updateHtmlLang(currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    const handleLanguageChange = () => {
      const savedLanguage = localStorage.getItem("mitata-language") || 'en';
      updateHtmlLang(savedLanguage);
    };

    window.addEventListener('language-change', handleLanguageChange);
    return () => {
      window.removeEventListener('language-change', handleLanguageChange);
    };
  }, []);

  return <>{children}</>;
} 