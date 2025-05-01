
'use client';

import Image from 'next/image';
// Use the more specific Product type if defined elsewhere (e.g., boutique/page.tsx)
// import type { Product } from '@/app/boutique/page';
// Temporary fallback type definition
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Assume price is in correct unit for XOF
  category: string;
  brand: string; // Ensure brand is included
}

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tag, ShoppingCart, Building } from 'lucide-react'; // Added Building icon for brand
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { t, currentLocale } = useTranslation(); // Use the translation hook

  // Placeholder image based on category or name
  const imageHint = product.category === 'Services' ? 'service tech' : product.name.toLowerCase().split(' ')[0];

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: t('cart_toast_added_title'),
      description: t('cart_toast_added_description', { itemName: product.name }),
      className: "border-primary bg-primary text-primary-foreground",
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg border border-border">
      <CardHeader className="p-0 relative">
        <Image
          src={`https://picsum.photos/seed/${product.id}/400/300`}
          alt={product.name} // Alt text generally shouldn't be translated if it's the product name
          width={400}
          height={300}
          className="w-full h-48 object-cover"
          data-ai-hint={imageHint}
        />
         <div className="absolute top-2 right-2 bg-secondary px-2 py-1 rounded-full text-xs font-medium text-secondary-foreground flex items-center gap-1 shadow">
           <Tag className="h-3 w-3"/>
           {product.category} {/* Category names might not need translation depending on context */}
         </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-2">
         <p className="text-xs text-muted-foreground flex items-center gap-1">
             <Building className="h-3 w-3" /> {product.brand} {/* Brand names usually not translated */}
         </p>
        <CardTitle className="text-lg leading-snug">{product.name}</CardTitle> {/* Product names usually not translated */}
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
          {product.description} {/* Descriptions might need translation in a real app */}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between items-center border-t border-border bg-muted/30">
        <span className="text-xl font-semibold text-primary">
          {product.price.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF' })}
        </span>
        <Button variant="destructive" size="sm" onClick={handleAddToCart}>
           <ShoppingCart className="mr-2 h-4 w-4" /> {t('product_card_add_to_cart')}
        </Button>
      </CardFooter>
    </Card>
  );
}
