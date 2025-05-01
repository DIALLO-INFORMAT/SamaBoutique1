
// src/hooks/useTranslation.ts
'use client';

import { useLocale, Locale, defaultLocale } from '@/context/LocaleContext';
import { useState, useEffect, useCallback } from 'react'; // Import useCallback from react
import type { TOptions } from 'i18next'; // Use i18next type for interpolation

type TranslationData = Record<string, string | object>; // Allow nested objects

// Simple interpolation function (replace {key} with value)
const interpolate = (str: string, values?: TOptions<string>): string => {
  if (!values) return str;
  let result = str;
  for (const key in values) {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
        const placeholder = `{${key}}`;
        const value = String(values[key]); // Ensure value is string
         // Use RegExp with 'g' flag to replace all occurrences
        result = result.replace(new RegExp(placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), value);
    }
  }
  return result;
};

// Function to get nested value from dictionary
const getNestedValue = (obj: TranslationData, key: string): string | undefined => {
    const keys = key.split('.');
    let current: any = obj;
    for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
            current = current[k];
        } else {
            return undefined; // Key path not found
        }
    }
    return typeof current === 'string' ? current : undefined; // Return only if the final value is a string
}


export const useTranslation = () => {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<TranslationData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const loadTranslations = async () => {
      try {
        const module = await import(`@/locales/${locale}.json`);
        setTranslations(module.default || module);
      } catch (error) {
        console.error(`Failed to load translations for locale: ${locale}`, error);
        // Fallback to default locale if current one fails
        try {
            const defaultModule = await import(`@/locales/${defaultLocale}.json`);
            setTranslations(defaultModule.default || defaultModule);
        } catch (fallbackError) {
             console.error(`Failed to load default locale translations: ${defaultLocale}`, fallbackError);
             setTranslations({}); // Set empty if default also fails
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [locale]); // Reload translations when locale changes

  // The translation function `t`
   const t = useCallback((key: string, options?: TOptions<string>): string => {
       const value = getNestedValue(translations, key);
       if (value === undefined) {
           console.warn(`Translation key "${key}" not found for locale "${locale}"`);
           return key; // Return the key itself as fallback
       }
       return interpolate(value, options);
   }, [translations, locale]); // Depend on translations and locale

  return { t, isLoading, currentLocale: locale };
};

// Remove the re-export as it's now imported directly
// export { useCallback } from 'react';

