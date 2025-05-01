// src/components/Header.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ShoppingCart, LogOut } from 'lucide-react'; // Keep only needed icons
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useSettings } from '@/hooks/useSettings';
import { LanguageSwitcher } from '@/components/LanguageSwitcher'; // Import LanguageSwitcher
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile
import { cn } from '@/lib/utils';

export function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { logoUrl, storeName } = useSettings();
  const { t } = useTranslation(); // Use the translation hook
  const isMobile = useIsMobile(); // Check if mobile

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    toast({
      title: t('dashboard_toast_logout_title'),
      description: t('dashboard_toast_logout_description'),
    });
    router.push('/');
  };

  const userRole = user?.role || 'guest';

  return (
    <header className={cn(
        "bg-secondary shadow-md z-50",
         isMobile ? "fixed bottom-0 left-0 right-0 border-t" : "sticky top-0" // Position based on mobile
      )}>
      <nav className="container mx-auto px-2 sm:px-4 py-2 flex justify-between items-center">
        {/* Logo and Store Name */}
        <Link href="/" className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={t('site_name')}
              width={32}
              height={32}
              className="rounded-sm object-contain h-8 w-8 sm:h-10 sm:w-10"
            />
          ) : (
            <ShoppingBag className="h-6 w-6" />
          )}
          {/* Hide name on mobile if logo exists and header is at bottom */}
          <span className={cn(logoUrl && isMobile ? 'hidden' : 'inline', logoUrl ? 'hidden sm:inline' : 'inline')}>{storeName}</span>
        </Link>

        {/* Navigation Links - Hide on mobile when header is at bottom */}
        <div className={cn("hidden md:flex items-center gap-1", isMobile && "md:hidden")}>
          <Link href="/" passHref>
            <Button variant="ghost" className="px-3 md:px-4 text-sm">{t('header_home')}</Button>
          </Link>
          <Link href="/boutique" passHref>
            <Button variant="ghost" className="px-3 md:px-4 text-sm">{t('header_shop')}</Button>
          </Link>
           <Link href="/suivi" passHref>
             <Button variant="ghost" className="px-3 md:px-4 text-sm">{t('header_track_order')}</Button>
           </Link>
           <Link href="/account" passHref>
             <Button variant="ghost" className="px-3 md:px-4 text-sm">{t('header_account')}</Button>
           </Link>
           <Link href="/contact" passHref>
             <Button variant="ghost" className="px-3 md:px-4 text-sm">{t('header_contact')}</Button>
           </Link>
           {/* Dashboard links are handled in mobile bar below */}
        </div>

        {/* Right Side Actions: Language, Cart, Logout */}
        <div className={cn("flex items-center gap-1 sm:gap-2", isMobile && "flex-grow justify-end")}>
          <LanguageSwitcher />
          <Link href="/panier" passHref>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] leading-none h-4 rounded-full"
                >
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">{t('header_cart')}</span>
            </Button>
          </Link>
           {userRole !== 'guest' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-9 w-9 sm:h-10 sm:w-10 text-destructive hover:text-destructive"
              title={t('header_logout')}
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">{t('header_logout')}</span>
            </Button>
          )}
           {/* Consider a mobile menu trigger here for smaller screens if header stays top */}
        </div>
      </nav>
       {/* Mobile Navigation Links (Simplified - shown when header is at bottom) */}
       {isMobile && (
          <div className="flex justify-around items-center border-t border-border py-1 bg-background text-xs">
             <Link href="/" passHref><Button variant="ghost" size="sm" className="flex flex-col h-auto px-1"><span className="text-xs">{t('header_home')}</span></Button></Link>
             <Link href="/boutique" passHref><Button variant="ghost" size="sm" className="flex flex-col h-auto px-1"><span className="text-xs">{t('header_shop')}</span></Button></Link>
             <Link href="/suivi" passHref><Button variant="ghost" size="sm" className="flex flex-col h-auto px-1"><span className="text-xs">{t('header_track_order')}</span></Button></Link>
              {userRole === 'guest' ? (
                  <Link href="/account" passHref><Button variant="ghost" size="sm" className="flex flex-col h-auto px-1"><span className="text-xs">{t('header_account')}</span></Button></Link>
              ) : (
                   <Link href={userRole === 'admin' ? "/admin" : "/dashboard"} passHref>
                       <Button variant="ghost" size="sm" className="flex flex-col h-auto px-1"><span className="text-xs">{t('header_user_dashboard')}</span></Button>
                   </Link>
              )}
             <Link href="/contact" passHref><Button variant="ghost" size="sm" className="flex flex-col h-auto px-1"><span className="text-xs">{t('header_contact')}</span></Button></Link>
           </div>
       )}
    </header>
  );
}