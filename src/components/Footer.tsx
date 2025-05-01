
// src/components/Footer.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

// Mock product data (replace with actual data later)
const featuredFooterProducts = [
  { id: '1', name: 'T-Shirt Classique', price: 10000 },
  { id: '3', name: 'Casquette Logo', price: 15000 },
  { id: '6', name: 'Mug Personnalisé', price: 8000 },
];

export function Footer() {
  const { storeDescription } = useSettings();
  const { t, currentLocale } = useTranslation(); // Use the translation hook

  // Determine text direction based on locale
  const textDir = currentLocale === 'ar' ? 'rtl' : 'ltr';

  return (
    <footer className="bg-secondary text-secondary-foreground mt-16 border-t border-border" dir={textDir}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Section 1: About */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2 mb-2">
              <ShoppingBag className="h-6 w-6" />
              {t('site_name')}
            </Link>
            <p className="text-sm">{storeDescription || t('footer_about_us')}</p> {/* Use store description or fallback translation */}
          </div>

          {/* Section 2: Important Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">{t('footer_useful_links')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  {t('header_home')}
                </Link>
              </li>
              <li>
                <Link href="/boutique" className="hover:text-primary transition-colors">
                  {t('header_shop')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  {t('footer_contact_us')}
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-primary transition-colors">
                  {t('footer_my_account')}
                </Link>
              </li>
              <li>
                <Link href="/suivi" className="hover:text-primary transition-colors">
                  {t('footer_track_order')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Featured Products */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">{t('footer_popular_products')}</h3>
            <ul className="space-y-3">
              {featuredFooterProducts.map(product => (
                <li key={product.id} className="flex items-center gap-3">
                  <Image
                    src={`https://picsum.photos/seed/${product.id}/40/40`}
                    alt={product.name} // Use actual name for alt, translation might not be needed here
                    width={40}
                    height={40}
                    className="rounded-md object-cover border border-border"
                    data-ai-hint={product.name.toLowerCase().split(' ')[0]}
                  />
                  <div>
                    {/* Product names are usually not translated in this context, link to shop */}
                    <Link href="/boutique" className="text-sm hover:text-primary transition-colors">
                      {product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {product.price.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF' })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright */}
      <div className="bg-muted text-muted-foreground border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-xs">
          &copy; {new Date().getFullYear()} {t('site_name')}. {t('copyright')}. {t('developed_by')}.
        </div>
      </div>
    </footer>
  );
}
