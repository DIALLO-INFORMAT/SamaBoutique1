
'use client';

import Image from 'next/image';
// Re-import Product type definition if needed
import type { Product } from '@/app/boutique/page';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tag, ShoppingCart, Building } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils'; // Import cn

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list'; // Accept viewMode
}

export function ProductCard({ product, viewMode }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { t, currentLocale } = useTranslation();

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
    <Card className={cn(
        "overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg border border-border",
        viewMode === 'grid' ? "flex flex-col" : "flex flex-row items-start", // Conditional layout
    )}>
      {/* Image Section */}
      <div className={cn(
          "relative",
          viewMode === 'grid' ? "w-full" : "w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0" // Conditional size
      )}>
        <Image
          src={`https://picsum.photos/seed/${product.id}/400/300`}
          alt={product.name}
          width={viewMode === 'grid' ? 400 : 128}
          height={viewMode === 'grid' ? 300 : 128}
          className={cn(
              "object-cover",
              viewMode === 'grid' ? "w-full h-48" : "w-full h-full rounded-l-lg" // Conditional height/rounding
          )}
          data-ai-hint={imageHint}
        />
         {viewMode === 'grid' && ( // Show category tag only in grid view
             <div className="absolute top-2 right-2 bg-secondary px-2 py-1 rounded-full text-xs font-medium text-secondary-foreground flex items-center gap-1 shadow">
               <Tag className="h-3 w-3"/>
               {product.category}
             </div>
          )}
      </div>

       {/* Content Section */}
      <div className={cn(
          "flex flex-col flex-grow",
          viewMode === 'grid' ? "" : "p-4" // Add padding for list view
      )}>
        <CardContent className={cn(
            "p-4 flex-grow space-y-2",
             viewMode === 'list' && "p-0" // Remove padding if already applied
        )}>
             {/* Show brand/category differently in list view */}
             {viewMode === 'list' && (
                 <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground mb-1">
                     <span className="flex items-center gap-1"><Building className="h-3 w-3" /> {product.brand}</span>
                     <span className="flex items-center gap-1"><Tag className="h-3 w-3"/> {product.category}</span>
                 </div>
             )}
             {viewMode === 'grid' && ( // Show brand only in grid view here
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                     <Building className="h-3 w-3" /> {product.brand}
                  </p>
             )}

            <CardTitle className={cn(
                 "leading-snug",
                 viewMode === 'grid' ? "text-lg" : "text-base font-semibold" // Smaller title in list view
            )}>
                {product.name}
            </CardTitle>
            <CardDescription className={cn(
                "text-muted-foreground",
                 viewMode === 'grid' ? "text-sm line-clamp-2" : "text-xs line-clamp-3" // More lines in list view? Or less?
            )}>
              {product.description}
            </CardDescription>
        </CardContent>

        {/* Footer Section */}
        <CardFooter className={cn(
             "p-4 pt-2 flex justify-between items-center border-t border-border bg-muted/30",
             viewMode === 'list' && "p-0 pt-3 border-none bg-transparent mt-auto" // Adjust footer for list view
        )}>
          <span className={cn(
              "font-semibold text-primary",
              viewMode === 'grid' ? "text-xl" : "text-lg" // Slightly smaller price in list view
          )}>
            {product.price.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF' })}
          </span>
          <Button variant="destructive" size="sm" onClick={handleAddToCart}>
             <ShoppingCart className="mr-2 h-4 w-4" /> {t('product_card_add_to_cart')}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
