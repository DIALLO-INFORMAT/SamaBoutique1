
// src/context/LocaleContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

export type Locale = 'fr' | 'en' | 'ar';
export const availableLocales: Locale[] = ['fr', 'en', 'ar'];
export const defaultLocale: Locale = 'fr';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
}

const LOCALE_STORAGE_KEY = 'sama_boutique_locale';

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const [locale, _setLocale] = useState<Locale>(defaultLocale);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load locale from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (storedLocale && availableLocales.includes(storedLocale)) {
        _setLocale(storedLocale);
        document.documentElement.lang = storedLocale;
        document.documentElement.dir = storedLocale === 'ar' ? 'rtl' : 'ltr';
      } else {
        // Set default if nothing stored or invalid
        document.documentElement.lang = defaultLocale;
        document.documentElement.dir = defaultLocale === 'ar' ? 'rtl' : 'ltr';
      }
      setIsInitialized(true); // Mark as initialized
    }
  }, []);

  // Function to update locale and save to localStorage
  const setLocale = useCallback((newLocale: Locale) => {
    if (availableLocales.includes(newLocale)) {
      _setLocale(newLocale);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
        document.documentElement.lang = newLocale;
        document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
        // Consider adding a loading state here if needed
      }
    }
  }, []);

  // Provide a loading state or default context until initialized
  if (!isInitialized) {
    // You might want to show a global loading spinner here instead of null
    // or return the default context value to prevent errors in consuming components.
    // Returning default context for now:
     const defaultContextValue = { locale: defaultLocale, setLocale: () => {} };
     return (
         <LocaleContext.Provider value={defaultContextValue}>
             {/* Minimal loader */}
             <div className="fixed inset-0 bg-background z-[9999] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
             </div>
             {/* Render children hidden or behind loader */}
             <div style={{ visibility: 'hidden' }}>{children}</div>
         </LocaleContext.Provider>
     );
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
