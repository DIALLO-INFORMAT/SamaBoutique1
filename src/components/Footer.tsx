// src/components/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import {ShoppingBag} from 'lucide-react';
import {useSettings} from '@/hooks/useSettings'; // Import the hook

// Mock product data (replace with actual data later)
// Ensure prices are in XOF format
const featuredFooterProducts = [
  {id: '1', name: 'T-Shirt Classique', price: 10000},
  {id: '3', name: 'Casquette Logo', price: 15000},
  {id: '6', name: 'Mug Personnalisé', price: 8000},
];

export function Footer() {
  const {storeDescription} = useSettings(); // Use the hook to get settings

  return (
    <footer className="bg-secondary text-secondary-foreground mt-16 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Section 1: About */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2 mb-2">
              <ShoppingBag className="h-6 w-6" />
              SamaBoutique
            </Link>
            <p className="text-sm">{storeDescription}</p> {/* Use store description from settings */}
            {/* Add social media icons or other info here if needed */}
          </div>

          {/* Section 2: Important Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Liens Utiles</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/boutique" className="hover:text-primary transition-colors">
                  Boutique
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contactez-nous
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-primary transition-colors">
                  Mon Compte
                </Link>
              </li>
              <li>
                <Link href="/suivi" className="hover:text-primary transition-colors">
                  Suivi de Commande
                </Link>
              </li>
              {/* Add more links like FAQ, Terms & Conditions, Privacy Policy */}
            </ul>
          </div>

          {/* Section 3: Featured Products */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Produits Populaires</h3>
            <ul className="space-y-3">
              {featuredFooterProducts.map(product => (
                <li key={product.id} className="flex items-center gap-3">
                  <Image
                    src={`https://picsum.photos/seed/${product.id}/40/40`}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="rounded-md object-cover border border-border"
                    data-ai-hint={product.name.toLowerCase().split(' ')[0]} // Basic hint
                  />
                  <div>
                    <Link href="/boutique" className="text-sm hover:text-primary transition-colors">
                      {product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {product.price.toLocaleString('fr-FR', {style: 'currency', currency: 'XOF'})}
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
          &copy; {new Date().getFullYear()} SamaBoutique. Tous droits réservés. Développé par WKB.
        </div>
      </div>
    </footer>
  );
}
