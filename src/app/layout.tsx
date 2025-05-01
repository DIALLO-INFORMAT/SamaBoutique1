
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
          // Tailwind classes for LTR/RTL can be added here if needed,
          // but setting dir attribute on <html> is usually sufficient
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
    // Now we can safely use hooks that depend on LocaleProvider
    const settings = useSettings();
    // const { isLoading: localeLoading } = useLocale(); // Get locale loading state if needed

    useEffect(() => {
        // Update CSS variable for primary color
        if (settings.primaryColor) {
          document.documentElement.style.setProperty('--primary', settings.primaryColor.match(/\d+/g)?.join(', ') + '%');
        }

        // Dynamically add favicon link tag
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
        // Set document title based on settings and potentially locale
        // You might integrate useTranslation here later
        document.title = settings.storeName || 'SamaBoutique';
    }, [settings.storeName]);

    // Show loading if settings OR locale are loading
    if (settings.isLoading /*|| localeLoading*/) {
        return (
             <div className="fixed inset-0 bg-background z-[9999] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (settings.enableMaintenance) {
        // Render maintenance mode page
        return (
             <div className="flex flex-col min-h-screen justify-center items-center text-center p-4 bg-background">
                 <h1 className="text-3xl font-bold text-primary mb-4">Site en Maintenance</h1>
                 <p className="text-muted-foreground">Nous serons bientôt de retour. Merci de votre patience.</p>
                 {settings.supportEmail && <p className="mt-4 text-sm">Contact: {settings.supportEmail}</p>}
             </div>
        );
    }

    // Render the actual layout once everything is loaded
    return (
        <>
            <Header />
            <main className="flex-grow px-4 py-8">{children}</main>
            <WelcomePopup />
            <Footer />
        </>
    );
}

// Metadata is removed as it cannot be exported from a client component
