
// src/components/ProductList.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Product } from '@/app/boutique/page';
import { ProductCard } from './ProductCard';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, Loader2 } from 'lucide-react'; // Import Filter and Loader2 icon
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

interface ProductListProps {
  initialProducts: Product[];
}

export function ProductList({ initialProducts }: ProductListProps) {
  const { t } = useTranslation(); // Use translation hook
  const [products] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false); // Start with false, set true during calculation
  const searchParams = useSearchParams();

  const filteredAndSortedProducts = useMemo(() => {
    setIsLoading(true); // Set loading true when starting calculation

    const categoryFilter = searchParams.get('category')?.toLowerCase() || 'all';
    const brandFilters = searchParams.getAll('brand');
    const minPriceFilter = searchParams.get('minPrice');
    const maxPriceFilter = searchParams.get('maxPrice');
    const searchTermFilter = searchParams.get('search')?.toLowerCase() || '';
    const sort = searchParams.get('sort') || 'name_asc';

    let result = [...products];

    if (searchTermFilter.length >= 2) {
        result = result.filter(p =>
            p.name.toLowerCase().includes(searchTermFilter) ||
            p.description.toLowerCase().includes(searchTermFilter) ||
            p.brand.toLowerCase().includes(searchTermFilter) ||
            p.category.toLowerCase().includes(searchTermFilter)
        );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === categoryFilter);
    }

    if (brandFilters.length > 0) {
      result = result.filter(p => brandFilters.includes(p.brand.toLowerCase()));
    }

    const minPriceNum = minPriceFilter ? parseFloat(minPriceFilter) : null;
    const maxPriceNum = maxPriceFilter ? parseFloat(maxPriceFilter) : null;

    if (minPriceNum !== null && !isNaN(minPriceNum)) {
        result = result.filter(p => p.price >= minPriceNum);
    }
    if (maxPriceNum !== null && !isNaN(maxPriceNum)) {
        result = result.filter(p => p.price <= maxPriceNum);
    }

    switch (sort) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'name_desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'name_asc': default: result.sort((a, b) => a.name.localeCompare(a.name)); break;
    }

    // Simulate filtering/sorting delay ONLY for visual feedback
    // In a real app with server-side filtering, the loading state would be managed differently.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Adjust delay as needed

    // We need to return result immediately for responsiveness, but also cleanup timer
    // This approach might cause a flash if calculation is faster than delay.
    // A better approach involves signaling completion from the calculation itself.
    // For now, we'll rely on this simple delay.

    // Cleanup function for the timer
    // This runs if dependencies change before timeout finishes or on unmount
    const cleanup = () => clearTimeout(timer);
    // Attaching cleanup to the effect that depends on isLoading, or use a separate effect

    return result; // Return the calculated result

  }, [products, searchParams]); // Depend on base products and searchParams

   // Effect to manage the loading state based on the calculation finishing
   useEffect(() => {
      // This effect helps ensure isLoading becomes false after the calculation delay
      let timerId: NodeJS.Timeout | null = null;
      if (isLoading) {
          timerId = setTimeout(() => {
              setIsLoading(false);
          }, 500); // Match the delay in useMemo
      }
      return () => {
          if (timerId) clearTimeout(timerId);
      };
   }, [isLoading]);


  if (isLoading) {
     return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                 <div key={i} className="flex flex-col space-y-3 border border-border rounded-lg overflow-hidden shadow-sm bg-card">
                    <Skeleton className="h-[200px] w-full bg-muted" />
                    <div className="space-y-3 p-4">
                        <Skeleton className="h-5 w-3/4 bg-muted" />
                        <Skeleton className="h-4 w-full bg-muted" />
                         <Skeleton className="h-4 w-1/2 bg-muted" />
                         <div className="flex justify-between items-center pt-3">
                           <Skeleton className="h-6 w-1/4 bg-muted" />
                           <Skeleton className="h-10 w-1/3 rounded-md bg-muted" />
                         </div>
                    </div>
                </div>
            ))}
        </div>
     );
  }

  if (filteredAndSortedProducts.length === 0) {
    return (
        <div className="text-center py-16 text-muted-foreground bg-secondary rounded-lg">
            <Filter className="h-12 w-12 mx-auto mb-4 text-primary/50"/>
            <p className="text-lg font-medium">{t('shop_no_products_found')}</p>
            <p>{t('shop_adjust_filters')}</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAndSortedProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
