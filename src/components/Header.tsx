// src/components/Header.tsx
'use client'; // Make it a client component to use hooks

import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {ShoppingBag, ShoppingCart, Search, LayoutDashboard, LogOut} from 'lucide-react'; // Updated icons
import {useCart} from '@/context/CartContext'; // Import useCart
import {Badge} from '@/components/ui/badge'; // Import Badge
import {useAuth} from '@/context/AuthContext'; // Import useAuth
import {useRouter} from 'next/navigation'; // Import useRouter for redirect after logout
import {useToast} from '@/hooks/use-toast'; // Import useToast
import Image from 'next/image'; // Import Image
import {useSettings} from '@/hooks/useSettings'; // Import useSettings

export function Header() {
  const {cart} = useCart(); // Get cart state
  const {user, logout} = useAuth(); // Get user and logout function from AuthContext
  const router = useRouter();
  const {toast} = useToast();
  const {logoUrl, storeName} = useSettings(); // Get settings, including logoUrl
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0); // Calculate total items

  const handleLogout = () => {
    logout();
    toast({
      title: 'Déconnexion réussie',
      description: 'Vous avez été déconnecté.',
    });
    router.push('/'); // Redirect to homepage after logout
  };

  const userRole = user?.role || 'guest'; // Get role from context, default to guest

  return (
    <header className="bg-secondary shadow-md sticky top-0 z-50">
      {/* Reduced vertical padding py-2 */}
      <nav className="container mx-auto px-2 sm:px-4 py-2 flex justify-between items-center">
        <Link href="/" className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Logo"
              width={32} // Slightly smaller logo on mobile
              height={32}
              className="rounded-sm object-contain h-8 w-8 sm:h-10 sm:w-10" // Responsive size
            />
          ) : (
            <ShoppingBag className="h-6 w-6" />
          )}
           {/* Hide store name on very small screens if logo exists */}
           <span className={logoUrl ? 'hidden sm:inline' : 'inline'}>{storeName}</span>
        </Link>
        {/* Reduced gaps on smaller screens */}
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
           {/* Adjusted padding and text size */}
          <Link href="/" passHref>
            <Button variant="ghost" className="px-2 text-xs sm:text-sm sm:px-3 md:px-4">
              Accueil
            </Button>
          </Link>
          <Link href="/boutique" passHref>
            <Button variant="ghost" className="px-2 text-xs sm:text-sm sm:px-3 md:px-4">
              Boutique
            </Button>
          </Link>
           <Link href="/suivi" passHref>
             <Button variant="ghost" className="px-2 text-xs sm:text-sm sm:px-3 md:px-4">
               Suivi
             </Button>
           </Link>
          {/* Account/Dashboard/Admin links */}
           {userRole === 'guest' ? (
             <Link href="/account" passHref>
               <Button variant="ghost" className="px-2 text-xs sm:text-sm sm:px-3 md:px-4">
                 Compte
               </Button>
             </Link>
           ) : userRole === 'admin' ? (
             <Link href="/admin" passHref>
               <Button variant="ghost" className="flex items-center gap-1 px-2 text-xs sm:text-sm sm:px-3 md:px-4">
                 <LayoutDashboard className="h-4 w-4" /> <span className="hidden sm:inline">Admin</span>
               </Button>
             </Link>
           ) : ( // Customer or Manager
             <Link href="/dashboard" passHref>
               <Button variant="ghost" className="flex items-center gap-1 px-2 text-xs sm:text-sm sm:px-3 md:px-4">
                 <LayoutDashboard className="h-4 w-4" /> <span className="hidden sm:inline">Dashboard</span>
               </Button>
             </Link>
           )}
          <Link href="/contact" passHref>
            <Button variant="ghost" className="px-2 text-xs sm:text-sm sm:px-3 md:px-4">
              Contact
            </Button>
          </Link>
          {/* Logout button if logged in */}
          {userRole !== 'guest' && (
             <Button
               variant="ghost"
               onClick={handleLogout}
               className="flex items-center gap-1 px-2 text-xs sm:text-sm sm:px-3 md:px-4 text-destructive hover:text-destructive"
             >
               <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Déconnexion</span>
             </Button>
           )}
          {/* Cart Link - Icon only */}
          <Link href="/panier" passHref>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10"> {/* Consistent icon size */}
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] leading-none h-4 rounded-full" // Fine-tuned badge
                >
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">Panier</span>
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
