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

export const DEFAULT_SETTINGS: Settings = {
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

// Global listeners Set to notify components of changes
const listeners = new Set<(settings: Settings) => void>();
let currentSettings: Settings | null = null; // Store current settings globally
let isInitialized = false;

// Function to update global settings and notify listeners
const updateGlobalSettings = (newSettings: Settings) => {
  currentSettings = newSettings;
  listeners.forEach(listener => listener(newSettings));
};

// --- Hook Definition ---
export const useSettings = (): Settings & { isLoading: boolean } => {
  // State for the component, initialized to null or default initially
  const [settings, setSettings] = useState<Settings | null>(currentSettings);
  // Loading is true until settings are loaded from localStorage
  const [isLoading, setIsLoading] = useState(!isInitialized);

  useEffect(() => {
      // --- Initialization Logic (runs once per app load) ---
      if (!isInitialized && typeof window !== 'undefined') {
          let initialSettings = DEFAULT_SETTINGS;
          const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
          if (storedSettings) {
              try {
                  // Merge stored settings with defaults to ensure all keys exist
                  initialSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
              } catch (error) {
                  console.error('Failed to parse settings from localStorage on init:', error);
                  localStorage.removeItem(SETTINGS_STORAGE_KEY); // Clear corrupted data
                  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS)); // Save defaults back
              }
          } else {
               // If no settings stored, store the defaults
               localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
          }
          updateGlobalSettings(initialSettings); // Set the global state
          isInitialized = true; // Mark as initialized
          setIsLoading(false); // Stop loading state
          setSettings(initialSettings); // Update local state for the hook instance


          // --- Storage Event Listener ---
          const handleStorageChange = (event: StorageEvent) => {
              if (event.key === SETTINGS_STORAGE_KEY) {
                   let updatedSettings = DEFAULT_SETTINGS;
                   if (event.newValue) {
                       try {
                           updatedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(event.newValue) };
                       } catch (error) {
                           console.error('Failed to parse settings from storage event:', error);
                           // Optionally reset to defaults if parsing fails
                           // localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
                       }
                   }
                   updateGlobalSettings(updatedSettings); // Update global state
              }
          };
          window.addEventListener('storage', handleStorageChange);
           // Cleanup storage listener on unmount
           return () => window.removeEventListener('storage', handleStorageChange);
      }
      // --- End of Initialization Logic ---


      // --- Listener Subscription ---
      const listener = (updatedSettings: Settings) => {
          setSettings(updatedSettings); // Update local state when global state changes
          if (isLoading) setIsLoading(false); // Ensure loading is false after first update
      };
      listeners.add(listener);

      // If already initialized, set the current settings immediately
      if (isInitialized && settings === null) {
           setSettings(currentSettings);
           setIsLoading(false);
      }

      // Cleanup listener on component unmount
      return () => {
          listeners.delete(listener);
      };
  }, [isLoading]); // Depend on isLoading to set initial state after initialization

  // Return default settings while loading or if settings are null
  return {
    ...(settings || DEFAULT_SETTINGS),
    isLoading,
  };
};

// --- Function to Save Settings ---
export const saveSettings = (newSettings: Partial<Settings>) => {
     if (typeof window !== 'undefined' && currentSettings) {
         // Merge with current global settings
         const updatedSettings = { ...currentSettings, ...newSettings };
         localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
         // Update the global state and notify listeners
         updateGlobalSettings(updatedSettings);
     } else if (typeof window !== 'undefined') {
          // Handle case where currentSettings might be null initially
           const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
           let baseSettings = DEFAULT_SETTINGS;
           if (storedSettings) {
               try { baseSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) }; } catch {}
           }
           const updatedSettings = { ...baseSettings, ...newSettings };
           localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
           updateGlobalSettings(updatedSettings); // Initialize global state if not already set
     }
};
