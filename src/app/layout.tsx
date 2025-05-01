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
import { useSettings } from '@/hooks/useSettings';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="fr">
      <head>
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
            <Header />
            {/* Adjusted main padding - container/max-w will be handled within specific page layouts if needed */}
            <ClientLayout>{children}</ClientLayout>
            <WelcomePopup /> {/* Add WelcomePopup here */}
            <Footer /> {/* Add Footer */}
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
    const [settings, setSettings] = useState({
        storeName: 'SamaBoutique',
        supportEmail: 'support@samaboutique.com',
        enableMaintenance: false,
        storeDescription: 'Votre partenaire de confiance pour des produits et services de qualité.',
        primaryColor: 'hsl(154, 50%, 50%)',
        logoUrl: '',
        faviconUrl: '',
    });
    const [faviconMetadata, setFaviconMetadata] = useState<Metadata['link']>([]);

    useEffect(() => {
        const { faviconUrl, storeName, supportEmail, enableMaintenance, storeDescription, primaryColor, logoUrl } = useSettings();

        setSettings({ storeName, supportEmail, enableMaintenance, storeDescription, primaryColor, logoUrl, faviconUrl });

        // Conditionally add favicon metadata
        if (faviconUrl) {
            setFaviconMetadata([
                {
                    rel: 'icon',
                    url: faviconUrl,
                    sizes: 'any',
                },
            ]);
        } else {
            setFaviconMetadata([]);
        }
    }, []);
    return (
        <main className="flex-grow px-4 py-8">{children}</main>
    );
}
