
'use client';

import {useState, useEffect, useCallback} from 'react';

// Define types for image objects
export interface CarouselImage {
    src: string;
    alt: string;
    hint: string;
}

export interface PartnerLogo {
    id: string; // Keep ID for stable keys
    src: string;
    alt: string;
    hint: string;
}

// Define a type for your settings
export interface Settings {
  storeName: string;
  supportEmail: string;
  enableMaintenance: boolean;
  storeDescription: string;
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  carouselImages: CarouselImage[]; // Add carousel images
  partnerLogos: PartnerLogo[];   // Add partner logos
}

const DEFAULT_SETTINGS: Settings = {
  storeName: 'SamaBoutique',
  supportEmail: 'support@samaboutique.com',
  enableMaintenance: false,
  storeDescription: 'Votre partenaire de confiance pour des produits et services de qualité.',
  primaryColor: 'hsl(154, 50%, 50%)',
  logoUrl: '',
  faviconUrl: '',
  carouselImages: [ // Default carousel images
    { src: "https://picsum.photos/seed/carousel1/1200/500", alt: "Promotion 1", hint: "sale discount offer" },
    { src: "https://picsum.photos/seed/carousel2/1200/500", alt: "New Arrivals", hint: "new collection fashion" },
    { src: "https://picsum.photos/seed/carousel3/1200/500", alt: "Featured Service", hint: "web design service" },
    { src: "https://picsum.photos/seed/carousel4/1200/500", alt: "Best Sellers", hint: "popular products clothing" },
    { src: "https://picsum.photos/seed/carousel5/1200/500", alt: "Special Event", hint: "event announcement community" },
  ],
  partnerLogos: [ // Default partner logos
    { id: 'logo1', src: "https://picsum.photos/seed/logo1/100/50", alt: "Partner Logo 1", hint: "partner technology" },
    { id: 'logo2', src: "https://picsum.photos/seed/logo2/100/50", alt: "Partner Logo 2", hint: "partner business" },
    { id: 'logo3', src: "https://picsum.photos/seed/logo3/100/50", alt: "Partner Logo 3", hint: "partner finance" },
    { id: 'logo4', src: "https://picsum.photos/seed/logo4/100/50", alt: "Partner Logo 4", hint: "partner innovation" },
    { id: 'logo5', src: "https://picsum.photos/seed/logo5/100/50", alt: "Partner Logo 5", hint: "partner solutions" },
    { id: 'logo6', src: "https://picsum.photos/seed/logo6/100/50", alt: "Partner Logo 6", hint: "partner network" },
  ],
};

const SETTINGS_STORAGE_KEY = 'sama_boutique_settings';

// Memoized settings state outside the hook to share across components
let memoizedSettings: Settings = DEFAULT_SETTINGS;
let hasInitialized = false;
const listeners = new Set<(settings: Settings) => void>();

// Function to update memoized settings and notify listeners
const updateMemoizedSettings = (newSettings: Settings) => {
  memoizedSettings = newSettings;
  listeners.forEach(listener => listener(newSettings));
};

// Load initial settings from localStorage (client-side only)
const loadInitialSettings = () => {
    if (typeof window !== 'undefined' && !hasInitialized) {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        try {
          memoizedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
        } catch (error) {
          console.error('Failed to parse settings from localStorage on init:', error);
          localStorage.removeItem(SETTINGS_STORAGE_KEY); // Clear corrupted data
          memoizedSettings = DEFAULT_SETTINGS;
        }
      } else {
         // If no settings stored, store the defaults
         localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
         memoizedSettings = DEFAULT_SETTINGS;
      }
      hasInitialized = true;

      // Listen for storage events after initialization
       window.addEventListener('storage', (event: StorageEvent) => {
           if (event.key === SETTINGS_STORAGE_KEY && event.newValue) {
               try {
                   const updatedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(event.newValue) };
                   updateMemoizedSettings(updatedSettings);
               } catch (error) {
                    console.error('Failed to parse settings from storage event:', error);
               }
           } else if (event.key === SETTINGS_STORAGE_KEY && !event.newValue) {
                // Settings were cleared in another tab
                updateMemoizedSettings(DEFAULT_SETTINGS);
           }
       });
    }
};

loadInitialSettings(); // Load immediately on client


export const useSettings = (): Settings & { isLoading: boolean } => {
  const [settings, setSettings] = useState<Settings>(memoizedSettings);
  // isLoading is true only during the very initial render before useEffect runs
  const [isLoading, setIsLoading] = useState(!hasInitialized);

  useEffect(() => {
    // Update state if initial load finished after component mount
    if (hasInitialized && isLoading) {
        setSettings(memoizedSettings);
        setIsLoading(false);
    }

    // Subscribe to changes
    const listener = (updatedSettings: Settings) => {
        setSettings(updatedSettings);
         // Ensure loading is false after first update
        if(isLoading) setIsLoading(false);
    };
    listeners.add(listener);

    // Cleanup subscription
    return () => {
        listeners.delete(listener);
    };
  }, [isLoading]); // Rerun if isLoading state changes

  return {
    ...settings,
    isLoading,
  };
};

// Function to save settings
export const saveSettings = (newSettings: Partial<Settings>) => {
     if (typeof window !== 'undefined') {
         // Merge with current memoized settings to ensure defaults are kept
         const updatedSettings = { ...memoizedSettings, ...newSettings };
         localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
         // Update the memoized state and notify listeners
         updateMemoizedSettings(updatedSettings);
     }
};
