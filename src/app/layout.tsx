'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { cn } from '@/lib/utils';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { LocaleProvider } from '@/context/LocaleContext'; // Import LocaleProvider
import { WelcomePopup } from '@/components/WelcomePopup';
import React, { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Settings hook is now moved inside a component that will be wrapped by LocaleProvider
  return (
    // HTML lang and dir will be set by LocaleProvider's useEffect
    <html>
      <head>
        {/* Favicon link will be dynamically added in ClientLayoutContent if configured */}
      </head>
      <body
        className={cn(
          'antialiased flex flex-col min-h-screen'
        )}
      >
        {/* Wrap everything with LocaleProvider */}
        <LocaleProvider>
          <AuthProvider>
            <CartProvider>
              <ClientLayoutContent>
                {children}
              </ClientLayoutContent>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

// Renamed ClientLayout to ClientLayoutContent to avoid confusion
// This component now sits inside all providers, including LocaleProvider
function ClientLayoutContent({ children }: { children: React.ReactNode }) {
    const settings = useSettings();
    const { t } = useTranslation(); // Get translation function
    const isMobile = useIsMobile(); // Check if mobile

    useEffect(() => {
        if (settings.primaryColor) {
          document.documentElement.style.setProperty('--primary', settings.primaryColor.match(/\d+/g)?.join(', ') + '%');
        }

        const head = document.head;
        let faviconLink = head.querySelector('link[rel="icon"]');

        if (settings.faviconUrl) {
             if (!faviconLink) {
                 faviconLink = document.createElement('link');
                 faviconLink.setAttribute('rel', 'icon');
                 head.appendChild(faviconLink);
             }
             faviconLink.setAttribute('href', settings.faviconUrl);
             faviconLink.setAttribute('sizes', 'any');
        } else if (faviconLink) {
             head.removeChild(faviconLink);
        }

    }, [settings.primaryColor, settings.faviconUrl]);

    useEffect(() => {
        document.title = settings.storeName || 'SamaBoutique';
    }, [settings.storeName]);

    if (settings.isLoading) {
        return (
             <div className="fixed inset-0 bg-background z-[9999] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                {/* Add loading text */}
                <p className="mt-4 text-muted-foreground">{t('loading_in_progress')}</p>
            </div>
        );
    }

    if (settings.enableMaintenance) {
        return (
             <div className="flex flex-col min-h-screen justify-center items-center text-center p-4 bg-background">
                 <h1 className="text-3xl font-bold text-primary mb-4">{t('maintenance_mode_title')}</h1>
                 <p className="text-muted-foreground">{t('maintenance_mode_description')}</p>
                 {settings.supportEmail && <p className="mt-4 text-sm">{t('maintenance_mode_contact', { email: settings.supportEmail })}</p>}
             </div>
        );
    }

    // Render the actual layout
    // Header is now positioned conditionally via CSS in its own component
    return (
        <>
            <Header />
            {/* Add padding-bottom to main content on mobile to prevent overlap with bottom header */}
            <main className={cn("flex-grow px-4 py-8", isMobile ? "pb-24" : "")}>
                {children}
            </main>
            <WelcomePopup />
            <Footer />
        </>
    );
}