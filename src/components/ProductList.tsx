'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Product } from '@/app/page'; // Corrected import path
import { ProductCard } from './ProductCard';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductListProps {
  initialProducts: Product[];
}

export function ProductList({ initialProducts }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(true); // Simulate loading
  const searchParams = useSearchParams();

  const filter = searchParams.get('filter') || 'all';
  const sort = searchParams.get('sort') || 'name_asc';

  // Simulate data fetching/loading effect on initial render and when params change
  useEffect(() => {
    setIsLoading(true);
    // In a real app, you'd fetch data based on filter/sort here
    const timer = setTimeout(() => {
      setProducts(initialProducts); // Reset to initial or fetch new data
      setIsLoading(false);
    }, 500); // Simulate network delay

    return () => clearTimeout(timer);
  }, [filter, sort, initialProducts]);


  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter
    if (filter !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === filter.toLowerCase());
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
  }, [products, filter, sort]);

  if (isLoading) {
     return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                 <div key={i} className="flex flex-col space-y-3 border border-border rounded-lg overflow-hidden">
                    <Skeleton className="h-[200px] w-full" />
                    <div className="space-y-3 p-4">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                         <div className="flex justify-between items-center pt-3">
                           <Skeleton className="h-6 w-1/4" />
                           <Skeleton className="h-10 w-1/3 rounded-md" />
                         </div>
                    </div>
                </div>
            ))}
        </div>
     );
  }

  if (filteredAndSortedProducts.length === 0) {
    return <p className="text-center text-muted-foreground mt-8">Aucun produit trouvé correspondant à vos critères.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAndSortedProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
