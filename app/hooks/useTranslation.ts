import { useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';

type TranslationKey = keyof typeof translations.zh;
type NestedTranslationKey = `${TranslationKey}.${string}`;

interface TranslationParams {
  [key: string]: string | number;
}

export function useTranslation() {
  const { language } = useLanguage();

  const t = useCallback((key: TranslationKey | NestedTranslationKey, params?: TranslationParams): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key "${key}" not found for language "${language}"`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(`{${paramKey}}`, String(paramValue));
      });
    }

    return value;
  }, [language]);

  return { t };
} 