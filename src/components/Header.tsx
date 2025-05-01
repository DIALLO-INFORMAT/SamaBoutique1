// src/components/Header.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ShoppingCart, LogOut, Home, Package, Phone, User as UserIcon, LayoutDashboard } from 'lucide-react'; // Adjusted icons for mobile nav
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useSettings } from '@/hooks/useSettings';
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
      {/* Top Bar (Logo, Desktop Nav, Cart/Logout) */}
      <nav className={cn(
          "container mx-auto px-2 sm:px-4 py-2 flex justify-between items-center",
          isMobile && "border-b" // Add border-bottom for mobile top bar
          )}>
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
          {/* Hide name on mobile if logo exists */}
          <span className={cn(logoUrl && isMobile ? 'hidden' : 'inline', 'hidden sm:inline')}>{storeName}</span>
        </Link>

        {/* Desktop Navigation Links */}
        {!isMobile && (
            <div className="hidden md:flex items-center gap-1">
                <Link href="/" >
                    <Button variant="ghost" className="px-3 md:px-4 text-sm">{t('header_home')}</Button>
                </Link>
                <Link href="/boutique" >
                    <Button variant="ghost" className="px-3 md:px-4 text-sm">{t('header_shop')}</Button>
                </Link>
                <Link href="/suivi" >
                    <Button variant="ghost" className="px-3 md:px-4 text-sm">{t('header_track_order')}</Button>
                </Link>
                 <Link href="/account" >
                    <Button variant="ghost" className="px-3 md:px-4 text-sm">{t('header_account')}</Button>
                </Link>
                <Link href="/contact" >
                    <Button variant="ghost" className="px-3 md:px-4 text-sm">{t('header_contact')}</Button>
                </Link>
                {/* Conditional Dashboard Link for Desktop */}
                {userRole === 'admin' && (
                     <Link href="/admin" >
                         <Button variant="ghost" className="px-3 md:px-4 text-sm text-primary">{t('header_admin_dashboard')}</Button>
                    </Link>
                 )}
                 {(userRole === 'customer' || userRole === 'manager') && (
                     <Link href="/dashboard" >
                         <Button variant="ghost" className="px-3 md:px-4 text-sm text-primary">{t('header_user_dashboard')}</Button>
                     </Link>
                 )}
            </div>
         )}


        {/* Right Side Actions: Cart, Logout */}
        {/* Keep Cart and Logout always visible */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Removed LanguageSwitcher */}
          <Link href="/panier" >
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
        </div>
      </nav>

       {/* Mobile Navigation Bar (at the bottom) */}
       {isMobile && (
          <div className="flex justify-around items-center py-1 bg-background text-xs">
             <Link href="/" >
                <Button variant="ghost" size="sm" className="flex flex-col h-auto px-1 py-1 space-y-0.5">
                    <Home className="h-4 w-4"/><span>{t('header_home')}</span>
                </Button>
             </Link>
             <Link href="/boutique" >
                 <Button variant="ghost" size="sm" className="flex flex-col h-auto px-1 py-1 space-y-0.5">
                    <Package className="h-4 w-4"/><span>{t('header_shop')}</span>
                 </Button>
             </Link>
             <Link href="/suivi" >
                 <Button variant="ghost" size="sm" className="flex flex-col h-auto px-1 py-1 space-y-0.5">
                    <Package className="h-4 w-4 transform rotate-45"/><span>{t('header_track_order')}</span>
                 </Button>
             </Link>
              {userRole === 'guest' ? (
                  <Link href="/account" >
                      <Button variant="ghost" size="sm" className="flex flex-col h-auto px-1 py-1 space-y-0.5">
                         <UserIcon className="h-4 w-4"/><span>{t('header_account')}</span>
                      </Button>
                  </Link>
              ) : (
                   <Link href={userRole === 'admin' ? "/admin" : "/dashboard"} >
                       <Button variant="ghost" size="sm" className="flex flex-col h-auto px-1 py-1 space-y-0.5 text-primary">
                           <LayoutDashboard className="h-4 w-4"/><span>{t('header_user_dashboard')}</span>
                       </Button>
                   </Link>
              )}
             <Link href="/contact" >
                 <Button variant="ghost" size="sm" className="flex flex-col h-auto px-1 py-1 space-y-0.5">
                    <Phone className="h-4 w-4"/><span>{t('header_contact')}</span>
                 </Button>
            </Link>
           </div>
       )}
    </header>
  );
}
