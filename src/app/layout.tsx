'use client';

import type {Metadata} from 'next';
// Removed GeistSans import as it's not installed
import './globals.css';
import {Toaster} from '@/components/ui/toaster';
import {Header} from '@/components/Header';
import {Footer} from '@/components/Footer'; // Import Footer
import {cn} from '@/lib/utils';
import {CartProvider} from '@/context/CartContext'; // Import CartProvider
import {AuthProvider} from '@/context/AuthContext'; // Import AuthProvider
import {WelcomePopup} from '@/components/WelcomePopup'; // Import WelcomePopup
import {useSettings} from '@/hooks/useSettings'; // Import useSettings
import React, { useEffect, useState } from 'react';

// export const metadata: Metadata = {
//   title: 'SamaBoutique',
//   description: 'Gérez votre boutique et présentez vos produits et services.',
//   // other common meta data
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    const {faviconUrl, storeName, supportEmail, enableMaintenance, storeDescription, primaryColor, logoUrl} = useSettings();

    setSettings({storeName, supportEmail, enableMaintenance, storeDescription, primaryColor, logoUrl, faviconUrl});

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
    <html lang="fr">
      <head>
        {faviconMetadata?.map((link, index) => (
          <link key={index} rel={link.rel} href={link.url} sizes={link.sizes} />
        ))}
      </head>
      <body
        // Removed GeistSans.className
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
            <main className="flex-grow px-4 py-8">{children}</main>
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

