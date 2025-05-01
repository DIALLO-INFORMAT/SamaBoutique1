'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { cn } from '@/lib/utils';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
// import { LocaleProvider } from '@/context/LocaleContext'; // Removed LocaleProvider import
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
  // Settings hook is now moved inside ClientLayoutContent
  return (
    // Set lang and dir directly
    <html lang="fr" dir="ltr">
      <head>
        {/* Favicon link will be dynamically added in ClientLayoutContent if configured */}
      </head>
      <body
        className={cn(
          'antialiased flex flex-col min-h-screen'
        )}
      >
        {/* Removed LocaleProvider */}
        <AuthProvider>
          <CartProvider>
            <ClientLayoutContent>
              {children}
            </ClientLayoutContent>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

// Renamed ClientLayout to ClientLayoutContent to avoid confusion
function ClientLayoutContent({ children }: { children: React.ReactNode }) {
    const settings = useSettings();
    const { t } = useTranslation(); // Get translation function
    const isMobile = useIsMobile(); // Check if mobile

    useEffect(() => {
        // Apply primary color from settings
        if (settings.primaryColor) {
          // Try parsing HSL string more robustly
           const hslMatch = settings.primaryColor.match(/hsl\(\s*(\d+)\s*,\s*(\d+%?)\s*,\s*(\d+%?)\s*\)/i);
           if (hslMatch) {
               const [, h, s, l] = hslMatch;
               // Reconstruct with spaces, remove potential % signs if needed by CSS var usage
               document.documentElement.style.setProperty('--primary', `${h} ${s.replace('%','')} ${l.replace('%','')}`);
               // Also set primary-foreground based on primary lightness
               const lightness = parseInt(l);
               const fgColor = lightness > 50 ? 'hsl(0 0% 10%)' : 'hsl(0 0% 98%)'; // Dark text for light bg, light text for dark bg
               document.documentElement.style.setProperty('--primary-foreground', fgColor);
           } else {
               console.warn("Invalid HSL format for primaryColor:", settings.primaryColor);
               // Apply default if format is wrong
               document.documentElement.style.setProperty('--primary', '154 50 50');
                document.documentElement.style.setProperty('--primary-foreground', '154 50% 98%');
           }
        } else {
             // Apply default if no color setting
            document.documentElement.style.setProperty('--primary', '154 50 50');
             document.documentElement.style.setProperty('--primary-foreground', '154 50% 98%');
        }

        // Manage favicon
        const head = document.head;
        let faviconLink = head.querySelector<HTMLLinkElement>('link[rel="icon"]');

        if (settings.faviconUrl) {
             if (!faviconLink) {
                 faviconLink = document.createElement('link');
                 faviconLink.setAttribute('rel', 'icon');
                 head.appendChild(faviconLink);
             }
             faviconLink.setAttribute('href', settings.faviconUrl);
             faviconLink.setAttribute('sizes', 'any'); // Allow any size for modern browsers
        } else if (faviconLink) {
             // Remove favicon if URL is cleared
             head.removeChild(faviconLink);
        }

    }, [settings.primaryColor, settings.faviconUrl]);


    // Update document title based on settings
    useEffect(() => {
        document.title = settings.storeName || 'SamaBoutique';
    }, [settings.storeName]);

    // Loading State
    if (settings.isLoading) {
        return (
             <div className="fixed inset-0 bg-background z-[9999] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">{t('loading_in_progress')}</p> {/* Use updated key */}
            </div>
        );
    }

    // Maintenance Mode
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
    return (
        <>
            <Header />
            {/* Add padding-bottom to main content on mobile to prevent overlap with bottom header */}
            <main className={cn("flex-grow px-4 py-8", isMobile ? "pb-24" : "")}>
                {children}
            </main>
            <WelcomePopup />
            {/* Add CookieConsent component here if created */}
            {/* <CookieConsent /> */}
            <Footer />
        </>
    );
}

// TODO: Create CookieConsent component
// This component should use a state to track if consent has been given (e.g., stored in localStorage)
// If consent not given, display a banner/dialog with accept/decline buttons.
// On accept, set the localStorage flag.
// This component would be conditionally rendered in ClientLayoutContent.
// Example placeholder:
// const CookieConsent = () => {
//     const [showConsent, setShowConsent] = useState(false);
//     useEffect(() => {
//         if (!localStorage.getItem('cookie_consent')) {
//             setShowConsent(true);
//         }
//     }, []);
//
//     const handleAccept = () => {
//         localStorage.setItem('cookie_consent', 'true');
//         setShowConsent(false);
//     }
//
//     if (!showConsent) return null;
//
//     return (
//         <div className="fixed bottom-0 left-0 right-0 bg-secondary p-4 border-t shadow-lg z-50">
//             <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
//                 <p className="text-sm text-secondary-foreground">Ce site utilise des cookies pour améliorer votre expérience.</p>
//                 <Button onClick={handleAccept} variant="destructive" size="sm">Accepter</Button>
//             </div>
//         </div>
//     );
// }

