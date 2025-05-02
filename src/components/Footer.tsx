// src/components/Footer.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation
import { useEffect, useState } from 'react'; // Import useEffect and useState

// Define Product type (ensure consistency with other files)
interface FooterProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category?: string; // Added category for data-ai-hint
}

const ADMIN_PRODUCTS_STORAGE_KEY = 'admin_products';

// Fetch products from storage (same logic as homepage)
const fetchAllProductsFromStorage = (): FooterProduct[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    const storedProducts = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
    if (storedProducts) {
        try {
            const products: FooterProduct[] = JSON.parse(storedProducts);
            return products.map(p => ({
                ...p,
                imageUrl: p.imageUrl || `https://picsum.photos/seed/${p.id}/40/40`, // Smaller fallback for footer
            })).reverse(); // Assuming latest added are newest
        } catch (error) {
            console.error("Error parsing stored products for footer:", error);
            localStorage.removeItem(ADMIN_PRODUCTS_STORAGE_KEY);
        }
    }
    return [];
};


export function Footer() {
  const { storeDescription } = useSettings();
  const { t, currentLocale } = useTranslation(); // Use the translation hook
  const [footerProducts, setFooterProducts] = useState<FooterProduct[]>([]);

  useEffect(() => {
      const products = fetchAllProductsFromStorage();
      setFooterProducts(products.slice(0, 3)); // Get the first 3 products
  }, []); // Fetch on mount


  // Determine text direction based on locale (always LTR now)
  const textDir = 'ltr'; // Hardcoded to Left-to-Right

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
             {footerProducts.length > 0 ? (
                 <ul className="space-y-3">
                   {footerProducts.map(product => (
                     <li key={product.id} className="flex items-center gap-3">
                       <Image
                         src={product.imageUrl || `https://picsum.photos/seed/${product.id}/40/40`}
                         alt={product.name} // Use actual name for alt
                         width={40}
                         height={40}
                         className="rounded-md object-cover border border-border"
                         data-ai-hint={product.category === 'Services' ? 'service tech icon' : product.name.toLowerCase().split(' ')[0]}
                          onError={(e) => {
                             (e.target as HTMLImageElement).srcset = `https://picsum.photos/seed/${product.id}/40/40`;
                             (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.id}/40/40`;
                          }}
                       />
                       <div>
                         {/* Link to the specific product page or a filtered shop page */}
                         <Link href={`/boutique?search=${encodeURIComponent(product.name)}`} className="text-sm hover:text-primary transition-colors">
                           {product.name}
                         </Link>
                         <p className="text-xs text-muted-foreground">
                           {product.price.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                         </p>
                       </div>
                     </li>
                   ))}
                 </ul>
             ) : (
                 <p className="text-sm text-muted-foreground">{t('shop_no_products_found')}</p> // Show message if no products
             )}
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
