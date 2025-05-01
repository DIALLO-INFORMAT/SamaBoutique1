'use client';

import {useState, useEffect} from 'react';

// Define a type for your settings
interface Settings {
  storeName: string;
  supportEmail: string;
  enableMaintenance: boolean;
  storeDescription: string;
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  // Add other settings here
}

const DEFAULT_SETTINGS: Settings = {
  storeName: 'SamaBoutique',
  supportEmail: 'support@samaboutique.com',
  enableMaintenance: false,
  storeDescription: 'Votre partenaire de confiance pour des produits et services de qualité.',
  primaryColor: 'hsl(154, 50%, 50%)', // Example HSL value
  logoUrl: '',
  faviconUrl: '',
};

const SETTINGS_STORAGE_KEY = 'sama_boutique_settings';

export const useSettings = (): Settings & { isLoading: boolean } => {
  const [settings, setSettings] = useState<Settings>(() => {
    // Initialize state from localStorage synchronously if possible (client-side only)
    if (typeof window !== 'undefined') {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        try {
          // Merge stored settings with defaults to ensure all keys exist
          return { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
        } catch (error) {
          console.error('Failed to parse settings from localStorage on init:', error);
        }
      }
    }
    return DEFAULT_SETTINGS;
  });
  const [isLoading, setIsLoading] = useState(true); // Still track loading state

  useEffect(() => {
    // This effect now primarily handles the initial loading state and potential updates
    // if settings were not correctly loaded synchronously or need refreshing.
    const loadAndUpdateSettings = () => {
        if (typeof window !== 'undefined') {
            const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            let currentSettings = DEFAULT_SETTINGS;
            if (storedSettings) {
                try {
                    currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
                } catch (error) {
                     console.error('Failed to parse settings from localStorage in effect:', error);
                     localStorage.removeItem(SETTINGS_STORAGE_KEY); // Clear corrupted data
                }
            }
            // Update state only if different from initial sync load
             // Use JSON stringify for comparison to handle object reference differences
             if (JSON.stringify(settings) !== JSON.stringify(currentSettings)) {
                 setSettings(currentSettings);
             }
        }
        setIsLoading(false); // Mark loading as complete
    };

    loadAndUpdateSettings();

     // Optional: Listen for storage events to update settings across tabs
     const handleStorageChange = (event: StorageEvent) => {
         if (event.key === SETTINGS_STORAGE_KEY && event.newValue) {
             try {
                 const newSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(event.newValue) };
                 setSettings(newSettings);
             } catch (error) {
                  console.error('Failed to parse settings from storage event:', error);
             }
         } else if (event.key === SETTINGS_STORAGE_KEY && !event.newValue) {
             // Settings were cleared in another tab
             setSettings(DEFAULT_SETTINGS);
         }
     };

     window.addEventListener('storage', handleStorageChange);
     return () => window.removeEventListener('storage', handleStorageChange);

  }, []); // Run only once on mount

  return {
    ...settings,
    isLoading,
  };
};

// Function to save settings (can be called from the settings page)
export const saveSettings = (newSettings: Partial<Settings>) => {
     if (typeof window !== 'undefined') {
         const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
         const currentSettings = storedSettings ? JSON.parse(storedSettings) : {};
         const updatedSettings = { ...currentSettings, ...newSettings };
         localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
         // Dispatch a storage event so useSettings hook in other tabs/components can update
         window.dispatchEvent(new StorageEvent('storage', {
             key: SETTINGS_STORAGE_KEY,
             newValue: JSON.stringify(updatedSettings)
         }));
     }
};

