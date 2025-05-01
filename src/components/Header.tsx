import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Mail } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-secondary shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center max-w-4xl">
        <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" />
          SamaBoutique
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" passHref>
            <Button variant="ghost">Accueil</Button>
          </Link>
          <Link href="/contact" passHref>
            <Button variant="ghost" className="flex items-center gap-1">
               <Mail className="h-4 w-4" /> Contact
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
