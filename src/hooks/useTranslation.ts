// src/hooks/useTranslation.ts
'use client';

import { useState, useEffect } from 'react'; // Keep useState and useEffect if needed for async loading later
import type { TOptions } from 'i18next'; // Use i18next type for interpolation
import frTranslations from '@/locales/fr.json'; // Import French translations directly

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
  // Directly use the imported French translations
  const translations: TranslationData = frTranslations;
  const isLoading = false; // No async loading needed anymore
  const currentLocale = 'fr'; // Hardcode locale to French

  // The translation function `t`
   const t = (key: string, options?: TOptions<string>): string => {
       const value = getNestedValue(translations, key);
       if (value === undefined) {
           console.warn(`Translation key "${key}" not found for locale "${currentLocale}"`);
           return key; // Return the key itself as fallback
       }
       return interpolate(value, options);
   };

  return { t, isLoading, currentLocale };
};
