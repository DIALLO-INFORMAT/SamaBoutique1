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
  primaryColor: 'hsl(154, 50%, 50%)',
  logoUrl: '',
  faviconUrl: '',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching settings from a database or API
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would fetch from an API endpoint
        // const response = await fetch('/api/settings');
        // const data = await response.json();
        // setSettings(data);

        // Simulate localStorage
        if (typeof window !== 'undefined') {
          // Check local storage for override, if not exist, use default
          const storedSettings = localStorage.getItem('sama_boutique_settings');
          if (storedSettings) {
            try {
              setSettings(JSON.parse(storedSettings));
            } catch (error) {
              console.error('Failed to parse settings from localStorage:', error);
              // Set to DEFAULT_SETTINGS or handle error as needed
              setSettings(DEFAULT_SETTINGS);
            }
          } else {
            setSettings(DEFAULT_SETTINGS);
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        // Optionally set to default settings or handle error
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  return {
    ...settings,
    isLoading,
  };
};

