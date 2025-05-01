// src/components/Header.tsx
'use client'; // Make it a client component to use hooks

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ShoppingCart, User, LayoutGrid, Gauge, LogOut, Search } from 'lucide-react'; // Added Search for Suivi, removed Mail
import { useCart } from '@/context/CartContext'; // Import useCart
import { Badge } from '@/components/ui/badge'; // Import Badge
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useRouter } from 'next/navigation'; // Import useRouter for redirect after logout
import { useToast } from '@/hooks/use-toast'; // Import useToast

export function Header() {
  const { cart } = useCart(); // Get cart state
  const { user, logout } = useAuth(); // Get user and logout function from AuthContext
  const router = useRouter();
  const { toast } = useToast();

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0); // Calculate total items

  const handleLogout = () => {
    logout();
    toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté.",
    });
    router.push('/'); // Redirect to homepage after logout
  };

  const userRole = user?.role || 'guest'; // Get role from context, default to guest

  return (
    <header className="bg-secondary shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" />
          SamaBoutique
        </Link>
        <div className="flex items-center gap-1 md:gap-2"> {/* Reduced gap slightly */}
          {/* Reordered Links */}
          <Link href="/" passHref>
            <Button variant="ghost" className="px-2 md:px-4 text-sm">Accueil</Button>
          </Link>
          <Link href="/boutique" passHref>
              <Button variant="ghost" className="px-2 md:px-4 text-sm">Boutique</Button>
          </Link>

          {/* Conditional Dashboard Link (before Account/Login) */}
          {userRole === 'admin' && (
              <Link href="/admin" passHref>
                 <Button variant="ghost" className="flex items-center gap-1 px-2 md:px-4 text-sm">
                     <LayoutGrid className="h-4 w-4" /> Admin
                 </Button>
               </Link>
          )}
          {(userRole === 'customer' || userRole === 'manager') && ( // Include manager
               <Link href="/dashboard" passHref>
                 <Button variant="ghost" className="flex items-center gap-1 px-2 md:px-4 text-sm">
                    <Gauge className="h-4 w-4" /> Dashboard
                 </Button>
               </Link>
          )}

          {/* Account/Logout link */}
          {userRole === 'guest' ? (
            <Link href="/account" passHref>
               <Button variant="ghost" className="flex items-center gap-1 px-2 md:px-4 text-sm">
                  <User className="h-4 w-4" /> Compte
               </Button>
            </Link>
          ) : (
             <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-1 px-2 md:px-4 text-sm text-destructive hover:text-destructive">
                 <LogOut className="h-4 w-4" /> Déconnexion
             </Button>
          )}

          {/* Tracking Link */}
          <Link href="/suivi" passHref>
             <Button variant="ghost" className="flex items-center gap-1 px-2 md:px-4 text-sm">
                <Search className="h-4 w-4 hidden sm:inline-block"/> Suivi
             </Button>
          </Link>

          <Link href="/contact" passHref>
            <Button variant="ghost" className="px-2 md:px-4 text-sm"> {/* Removed icon */}
               Contact
            </Button>
          </Link>

           {/* Cart Link - Icon only */}
          <Link href="/panier" passHref>
            <Button variant="ghost" size="icon" className="relative"> {/* Always icon size */}
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full">
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
