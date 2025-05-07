// src/components/ProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types'; // Use the centralized Product type
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Removed CardDescription as it's not directly used in the final output shown
import { Button } from '@/components/ui/button';
import { Tag, ShoppingCart, Percent } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  href?: string;
}

export function ProductCard({ product, viewMode, href }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { t, currentLocale } = useTranslation();

  const imageHint = product.category === 'Services' ? 'service tech' : product.name.toLowerCase().split(' ')[0];
  const imageUrl = product.imageUrl || `https://picsum.photos/seed/${product.id}/400/300`;

  const calculateDiscountedPrice = (
    price: number,
    discountType?: 'percentage' | 'fixed_amount',
    discountValue?: number
  ): number => {
    if (!product.isOnSale || !discountType || !discountValue || discountValue <= 0) {
      return price;
    }
    if (discountType === 'percentage') {
      return price * (1 - discountValue / 100);
    }
    if (discountType === 'fixed_amount') {
      return Math.max(0, price - discountValue);
    }
    return price;
  };

  const discountedPrice = calculateDiscountedPrice(product.price, product.discountType, product.discountValue);
  const displayPrice = product.isOnSale ? discountedPrice : product.price;
  const originalPriceForDisplay = product.isOnSale ? product.price : null;


  const getDiscountBadgeText = (): string | null => {
    if (!product.isOnSale || !product.discountType || !product.discountValue || product.discountValue <= 0) {
      return null;
    }
    if (product.discountType === 'percentage') {
      return `-${product.discountValue}%`;
    }
    if (product.discountType === 'fixed_amount') {
      // Format fixed amount as currency
      return `-${product.discountValue.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return t('product_card_on_sale'); // Fallback, though should be covered
  };
  const discountBadgeText = getDiscountBadgeText();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product); // AddToCart in context will handle discounted price if applicable
    toast({
      title: t('cart_toast_added_title'),
      description: t('cart_toast_added_description', { itemName: product.name }),
      className: "border-primary bg-primary text-primary-foreground",
    });
  };

  const cardContent = (
    <Card className={cn(
        "overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg border border-border",
        viewMode === 'grid' ? "flex flex-col" : "flex flex-row items-start",
        href ? "hover:border-primary/50" : ""
    )}>
      <div className={cn(
          "relative",
          viewMode === 'grid' ? "w-full" : "w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0"
      )}>
        <Image
          src={imageUrl}
          alt={product.name}
          width={viewMode === 'grid' ? 400 : 128}
          height={viewMode === 'grid' ? 300 : 128}
          className={cn(
              "object-cover",
              viewMode === 'grid' ? "w-full h-48" : "w-full h-full rounded-l-lg"
          )}
          data-ai-hint={imageHint}
          onError={(e) => {
             (e.target as HTMLImageElement).srcset = `https://picsum.photos/seed/${product.id}/400/300`;
             (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.id}/400/300`;
          }}
        />
         {/* Category and Discount Badges for Grid View */}
         {viewMode === 'grid' && (
             <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                {discountBadgeText && (
                    <Badge variant="destructive" className="px-2 py-0.5 text-xs font-semibold flex items-center gap-1 shadow-md bg-orange-500 text-white border-orange-600">
                        <Percent className="h-3 w-3" /> {discountBadgeText.startsWith('-') ? discountBadgeText.substring(1) : discountBadgeText}
                    </Badge>
                )}
                <Badge variant="secondary" className="px-2 py-0.5 text-xs font-medium flex items-center gap-1 shadow">
                  <Tag className="h-3 w-3"/>
                  {product.category}
                </Badge>
             </div>
          )}
          {/* Discount Badge for List View */}
           {viewMode === 'list' && discountBadgeText && (
                <Badge variant="destructive" className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-semibold flex items-center gap-0.5 shadow-md bg-orange-500 text-white border-orange-600">
                    <Percent className="h-2.5 w-2.5" /> {discountBadgeText.startsWith('-') ? discountBadgeText.substring(1) : discountBadgeText}
                </Badge>
            )}
      </div>

      <div className={cn("flex flex-col flex-grow", viewMode === 'list' && "p-4")}>
        <CardContent className={cn("p-4 flex-grow space-y-1", viewMode === 'list' && "p-0")}>
             {viewMode === 'list' && (
                 <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground mb-1">
                     <span className="flex items-center gap-1"><Tag className="h-3 w-3"/> {product.category}</span>
                 </div>
             )}
            <CardTitle className={cn("leading-snug", viewMode === 'grid' ? "text-lg" : "text-base font-semibold")}>
                {product.name}
            </CardTitle>
            {/* Description can be shorter in grid view */}
            <p className={cn( "text-muted-foreground", viewMode === 'grid' ? "text-sm line-clamp-2" : "text-xs line-clamp-3")}>
              {product.description}
            </p>
        </CardContent>

        <CardFooter className={cn(
             "p-4 pt-2 flex justify-between items-center border-t border-border bg-muted/30",
             viewMode === 'list' && "p-0 pt-3 border-none bg-transparent mt-auto"
        )}>
          <div className="flex flex-col items-start">
            {originalPriceForDisplay && originalPriceForDisplay > displayPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {originalPriceForDisplay.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            )}
            <span className={cn("font-semibold text-primary", viewMode === 'grid' ? "text-xl" : "text-lg")}>
              {displayPrice.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
          <Button variant="destructive" size="sm" onClick={handleAddToCart}>
             <ShoppingCart className="mr-2 h-4 w-4" /> {t('product_card_add_to_cart')}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} passHref legacyBehavior>
        <a className="block h-full">
          {cardContent}
        </a>
      </Link>
    );
  }
  return cardContent;
}

