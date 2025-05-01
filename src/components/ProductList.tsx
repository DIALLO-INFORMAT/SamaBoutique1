'use client';

import { useState, useEffect, useMemo } from 'react';
// Use the specific Product type from boutique page or a shared location
import type { Product } from '@/app/boutique/page';
import { ProductCard } from './ProductCard';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductListProps {
  initialProducts: Product[]; // Now expecting products with brand
}

export function ProductList({ initialProducts }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(true); // Simulate loading
  const searchParams = useSearchParams();

  // Extract filter parameters from URL
  const categoryFilter = searchParams.get('category') || 'all';
  const brandFilters = searchParams.getAll('brand'); // Can be multiple
  const minPriceFilter = searchParams.get('minPrice');
  const maxPriceFilter = searchParams.get('maxPrice');
  const searchTermFilter = searchParams.get('search')?.toLowerCase() || '';
  const sort = searchParams.get('sort') || 'name_asc'; // Get sort param

  // Simulate data fetching/loading effect on initial render and when params change
  useEffect(() => {
    setIsLoading(true);
    // In a real app, you'd fetch data based on *all* filters server-side
    // For client-side simulation, we just use initialProducts
    const timer = setTimeout(() => {
      setProducts(initialProducts); // Reset to initial or fetch new data
      setIsLoading(false);
    }, 500); // Simulate network delay

    return () => clearTimeout(timer);
  // Depend on searchParams string representation to refetch/re-filter
  }, [searchParams.toString(), initialProducts]);


  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Apply Search Filter
    if (searchTermFilter) {
        result = result.filter(p =>
            p.name.toLowerCase().includes(searchTermFilter) ||
            p.description.toLowerCase().includes(searchTermFilter)
        );
    }

    // Apply Category Filter
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Apply Brand Filter (Multiple)
    if (brandFilters.length > 0) {
      result = result.filter(p => brandFilters.includes(p.brand.toLowerCase()));
    }

    // Apply Price Filter
    const minPriceNum = minPriceFilter ? parseFloat(minPriceFilter) : null;
    const maxPriceNum = maxPriceFilter ? parseFloat(maxPriceFilter) : null;

    if (minPriceNum !== null) {
        result = result.filter(p => p.price >= minPriceNum);
    }
    if (maxPriceNum !== null) {
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
    return result;
  }, [products, categoryFilter, brandFilters, minPriceFilter, maxPriceFilter, searchTermFilter, sort]); // Add all filters to dependency array

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
