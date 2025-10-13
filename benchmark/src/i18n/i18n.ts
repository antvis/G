import i18n from 'i18next';
import { initReactI18next } from 'preact-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言资源
import en from './locales/en/translation.json';
import zh from './locales/zh/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh }
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false // 不需要转义HTML
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
