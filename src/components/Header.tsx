
// src/components/Header.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ShoppingCart, LayoutDashboard, LogOut, Contact, Home, Store, MapPin } from 'lucide-react'; // Updated icons
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useSettings } from '@/hooks/useSettings';
import { LanguageSwitcher } from '@/components/LanguageSwitcher'; // Import LanguageSwitcher
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

export function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { logoUrl, storeName } = useSettings();
  const { t } = useTranslation(); // Use the translation hook

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
    <header className="bg-secondary shadow-md sticky top-0 z-50">
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
          <span className={logoUrl ? 'hidden sm:inline' : 'inline'}>{storeName}</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" passHref>
            <Button variant="ghost" className="px-3 md:px-4 text-sm flex items-center gap-1"><Home className="h-4 w-4" />{t('header_home')}</Button>
          </Link>
          <Link href="/boutique" passHref>
            <Button variant="ghost" className="px-3 md:px-4 text-sm flex items-center gap-1"><Store className="h-4 w-4" />{t('header_shop')}</Button>
          </Link>
           <Link href="/suivi" passHref>
             <Button variant="ghost" className="px-3 md:px-4 text-sm flex items-center gap-1"><MapPin className="h-4 w-4"/>{t('header_track_order')}</Button>
           </Link>
          {userRole === 'guest' ? (
            <Link href="/account" passHref>
              <Button variant="ghost" className="px-3 md:px-4 text-sm">{t('header_account')}</Button>
            </Link>
          ) : userRole === 'admin' ? (
            <Link href="/admin" passHref>
              <Button variant="ghost" className="flex items-center gap-1 px-3 md:px-4 text-sm">
                <LayoutDashboard className="h-4 w-4" /> {t('header_admin_dashboard')}
              </Button>
            </Link>
          ) : ( // Customer or Manager
            <Link href="/dashboard" passHref>
              <Button variant="ghost" className="flex items-center gap-1 px-3 md:px-4 text-sm">
                <LayoutDashboard className="h-4 w-4" /> {t('header_user_dashboard')}
              </Button>
            </Link>
          )}
          <Link href="/contact" passHref>
            <Button variant="ghost" className="px-3 md:px-4 text-sm flex items-center gap-1"><Contact className="h-4 w-4"/>{t('header_contact')}</Button>
          </Link>
        </div>

        {/* Right Side Actions: Language, Cart, Logout */}
        <div className="flex items-center gap-1 sm:gap-2">
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
           {/* Consider a mobile menu trigger here for smaller screens */}
        </div>
      </nav>
       {/* Mobile Navigation Links (Optional - Example) */}
      <div className="md:hidden flex justify-center items-center gap-1 border-t border-border py-1 bg-background">
         <Link href="/" passHref><Button variant="ghost" size="sm" className="text-xs px-2 flex flex-col h-auto"><Home className="h-4 w-4"/>{t('header_home')}</Button></Link>
         <Link href="/boutique" passHref><Button variant="ghost" size="sm" className="text-xs px-2 flex flex-col h-auto"><Store className="h-4 w-4"/>{t('header_shop')}</Button></Link>
         <Link href="/suivi" passHref><Button variant="ghost" size="sm" className="text-xs px-2 flex flex-col h-auto"><MapPin className="h-4 w-4"/>{t('header_track_order')}</Button></Link>
          {userRole === 'guest' ? (
              <Link href="/account" passHref><Button variant="ghost" size="sm" className="text-xs px-2">{t('header_account')}</Button></Link>
          ) : (
               <Link href={userRole === 'admin' ? "/admin" : "/dashboard"} passHref>
                   <Button variant="ghost" size="sm" className="text-xs px-2 flex flex-col h-auto"><LayoutDashboard className="h-4 w-4"/>{t('header_user_dashboard')}</Button>
               </Link>
          )}
         <Link href="/contact" passHref><Button variant="ghost" size="sm" className="text-xs px-2 flex flex-col h-auto"><Contact className="h-4 w-4"/>{t('header_contact')}</Button></Link>
       </div>
    </header>
  );
}
