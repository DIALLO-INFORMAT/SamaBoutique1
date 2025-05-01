// src/components/ProductList.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
// Use the specific Product type from boutique page or a shared location
import type { Product } from '@/app/boutique/page'; // Assuming Product includes brand
import { ProductCard } from './ProductCard';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter } from 'lucide-react'; // Import Filter icon

interface ProductListProps {
  initialProducts: Product[]; // Expecting products with brand
}

export function ProductList({ initialProducts }: ProductListProps) {
  const [products] = useState<Product[]>(initialProducts); // Keep initial products as the base dataset
  const [isLoading, setIsLoading] = useState(false); // Manage loading state for simulated delay
  const searchParams = useSearchParams();

  // Re-run filtering/sorting whenever searchParams change
  const filteredAndSortedProducts = useMemo(() => {
    setIsLoading(true); // Set loading true when recalculating

    // Extract filter parameters from URL
    const categoryFilter = searchParams.get('category')?.toLowerCase() || 'all';
    const brandFilters = searchParams.getAll('brand'); // Already lowercase from sidebar
    const minPriceFilter = searchParams.get('minPrice');
    const maxPriceFilter = searchParams.get('maxPrice');
    const searchTermFilter = searchParams.get('search')?.toLowerCase() || '';
    const sort = searchParams.get('sort') || 'name_asc';

    let result = [...products];

    // Apply Search Filter (only if >= 2 chars)
    if (searchTermFilter.length >= 2) {
        result = result.filter(p =>
            p.name.toLowerCase().includes(searchTermFilter) ||
            p.description.toLowerCase().includes(searchTermFilter) ||
            p.brand.toLowerCase().includes(searchTermFilter) ||
            p.category.toLowerCase().includes(searchTermFilter)
        );
    }

    // Apply Category Filter
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === categoryFilter);
    }

    // Apply Brand Filter (Multiple)
    if (brandFilters.length > 0) {
      result = result.filter(p => brandFilters.includes(p.brand.toLowerCase()));
    }

    // Apply Price Filter
    const minPriceNum = minPriceFilter ? parseFloat(minPriceFilter) : null;
    const maxPriceNum = maxPriceFilter ? parseFloat(maxPriceFilter) : null;

    if (minPriceNum !== null && !isNaN(minPriceNum)) {
        result = result.filter(p => p.price >= minPriceNum);
    }
    if (maxPriceNum !== null && !isNaN(maxPriceNum)) {
        result = result.filter(p => p.price <= maxPriceNum);
    }


    // Sort
    switch (sort) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'name_asc':
      default:
        result.sort((a, b) => a.name.localeCompare(a.name));
        break;
    }

    // Simulate delay for loading indicator
     const timer = setTimeout(() => {
       setIsLoading(false);
     }, 300); // Short delay

    // Return result immediately for responsiveness, loading handles visual delay
    return result;

  }, [products, searchParams]); // Depend on base products and searchParams

  // Cleanup timer on unmount or if dependencies change before timeout
   useEffect(() => {
     // This effect is primarily for cleanup if needed, main logic is in useMemo
     let timer: NodeJS.Timeout;
     if(isLoading){
        timer = setTimeout(() => setIsLoading(false), 300); // Ensure loading resets
     }
     return () => clearTimeout(timer);
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
            <p className="text-lg font-medium">Aucun produit trouvé.</p>
            <p>Essayez d'ajuster vos filtres de recherche.</p>
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
