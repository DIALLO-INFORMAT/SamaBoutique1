'use client';

import type {Metadata} from 'next';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';
import {Header} from '@/components/Header';
import {Footer} from '@/components/Footer'; // Import Footer
import {cn} from '@/lib/utils';
import {CartProvider} from '@/context/CartContext'; // Import CartProvider
import {AuthProvider} from '@/context/AuthContext'; // Import AuthProvider
import {WelcomePopup} from '@/components/WelcomePopup'; // Import WelcomePopup
import React, { useEffect, useState } from 'react';
import { useSettings } from '@/hooks/useSettings'; // Import useSettings

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="fr">
      <head>
        {/* Favicon link will be dynamically added in ClientLayout if configured */}
      </head>
      <body
        className={cn('antialiased flex flex-col min-h-screen')}
      >
        <AuthProvider>
          {' '}
          {/* Wrap with AuthProvider */}
          <CartProvider>
            {' '}
            {/* Wrap with CartProvider */}
            {/* ClientLayout now manages Header and Footer to access settings */}
            <ClientLayout>
                {children}
            </ClientLayout>
            <Toaster />
          </CartProvider>{' '}
          {/* Close CartProvider */}
        </AuthProvider>{' '}
        {/* Close AuthProvider */}
      </body>
    </html>
  );
}

function ClientLayout({ children }: { children: React.ReactNode }) {
    // Call useSettings hook directly in the component body
    const settings = useSettings();

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
             // Optionally set sizes or type if needed based on the URL or settings
             faviconLink.setAttribute('sizes', 'any'); // Example
        } else if (faviconLink) {
             // Remove favicon if URL is cleared
             head.removeChild(faviconLink);
        }

    }, [settings.primaryColor, settings.faviconUrl]); // Rerun effect if these settings change

    // Set document title
    useEffect(() => {
        document.title = settings.storeName || 'SamaBoutique';
    }, [settings.storeName]);

    if (settings.isLoading) {
        // Optionally show a loading state for the whole layout
        return (
            <div className="flex flex-col min-h-screen">
                 {/* Basic header/footer structure might be needed even during loading */}
                 <header className="bg-secondary shadow-md sticky top-0 z-50 h-16"></header>
                 <main className="flex-grow flex justify-center items-center">Loading settings...</main>
                 <footer className="bg-secondary text-secondary-foreground mt-16 border-t border-border h-40"></footer>
             </div>
        );
    }

    if (settings.enableMaintenance) {
       // Render maintenance mode page (simple example)
        return (
             <div className="flex flex-col min-h-screen justify-center items-center text-center p-4 bg-background">
                 <h1 className="text-3xl font-bold text-primary mb-4">Site en Maintenance</h1>
                 <p className="text-muted-foreground">Nous serons bientôt de retour. Merci de votre patience.</p>
                 {/* You could add the support email here */}
                  {settings.supportEmail && <p className="mt-4 text-sm">Contact: {settings.supportEmail}</p>}
             </div>
        );
    }

    return (
        <>
            {/* Pass settings to Header */}
            <Header />
            <main className="flex-grow px-4 py-8">{children}</main>
            <WelcomePopup /> {/* Add WelcomePopup here */}
            {/* Pass settings to Footer */}
            <Footer />
        </>
    );
}

// Removed metadata export as it cannot be used with 'use client'
// export const metadata: Metadata = {
//   title: 'SamaBoutique', // This will be overridden by ClientLayout effect
//   description: 'Gérez votre boutique et présentez vos produits et services.',
// };

