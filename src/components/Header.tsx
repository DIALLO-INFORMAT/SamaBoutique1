'use client'; // Make it a client component to use hooks

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Mail, ShoppingCart, User } from 'lucide-react'; // Added User icon
import { useCart } from '@/context/CartContext'; // Import useCart
import { Badge } from '@/components/ui/badge'; // Import Badge

export function Header() {
  const { cart } = useCart(); // Get cart state
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0); // Calculate total items

  return (
    <header className="bg-secondary shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center max-w-4xl">
        <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" />
          SamaBoutique
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" passHref>
            <Button variant="ghost" className="px-2 md:px-4">Accueil</Button>
          </Link>
          <Link href="/contact" passHref>
            <Button variant="ghost" className="flex items-center gap-1 px-2 md:px-4">
               <Mail className="h-4 w-4 hidden sm:inline-block" /> Contact
            </Button>
          </Link>
          <Link href="/account" passHref>
             <Button variant="ghost" className="flex items-center gap-1 px-2 md:px-4">
                <User className="h-4 w-4" /> Compte
             </Button>
          </Link>
          <Link href="/panier" passHref>
            <Button variant="ghost" className="relative flex items-center gap-1 px-2 md:px-4">
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline-block">Panier</span>
              {itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-1 md:-right-2 px-1.5 py-0.5 text-xs rounded-full">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
