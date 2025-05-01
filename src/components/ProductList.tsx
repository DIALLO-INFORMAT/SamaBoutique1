// src/components/ProductList.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Product } from '@/app/boutique/page'; // Ensure this path is correct
import { ProductCard } from './ProductCard';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface ProductListProps {
  initialProducts: Product[];
  viewMode: 'grid' | 'list'; // Accept viewMode prop
  getProductHref?: (product: Product) => string | undefined; // Optional href generator
}

const ITEMS_PER_PAGE = 12; // Increased items per page

export function ProductList({ initialProducts, viewMode, getProductHref }: ProductListProps) {
  const { t } = useTranslation();
  const [products] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();

  const filteredAndSortedProducts = useMemo(() => {
    setIsLoading(true); // Start loading when filters change

    const categoryFilter = searchParams.get('category') || 'all'; // Use original case from URL
    const brandFilters = searchParams.getAll('brand'); // Use original case from URL
    const minPriceFilter = searchParams.get('minPrice');
    const maxPriceFilter = searchParams.get('maxPrice');
    const searchTermFilter = searchParams.get('search')?.toLowerCase() || '';
    const sort = searchParams.get('sort') || 'name_asc';

    let result = [...products];

    // Search Filter (apply first if present)
    if (searchTermFilter.length >= 2) {
        result = result.filter(p =>
            p.name.toLowerCase().includes(searchTermFilter) ||
            p.description.toLowerCase().includes(searchTermFilter) ||
            p.brand.toLowerCase().includes(searchTermFilter) ||
            p.category.toLowerCase().includes(searchTermFilter)
        );
    }

    // Category Filter
    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter); // Match original case
    }

    // Brand Filter
    if (brandFilters.length > 0) {
      result = result.filter(p => brandFilters.includes(p.brand)); // Match original case
    }

    // Price Filter
    const minPriceNum = minPriceFilter ? parseFloat(minPriceFilter) : null;
    const maxPriceNum = maxPriceFilter ? parseFloat(maxPriceFilter) : null;

    if (minPriceNum !== null && !isNaN(minPriceNum)) {
        result = result.filter(p => p.price >= minPriceNum);
    }
    if (maxPriceNum !== null && !isNaN(maxPriceNum)) {
        result = result.filter(p => p.price <= maxPriceNum);
    }

    // Sorting
    switch (sort) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'name_desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'name_asc': default: result.sort((a, b) => a.name.localeCompare(a.name)); break;
    }

    // Reset to page 1 whenever filters change significantly (search, category, brand, price)
     const currentFilterKey = `${categoryFilter}-${brandFilters.join(',')}-${minPriceFilter}-${maxPriceFilter}-${searchTermFilter}`;
     // Use a ref or state to store the previous key if needed, but for simplicity,
     // we'll just reset to page 1 on every filter evaluation.
     setCurrentPage(1);


    // Simulate loading delay AFTER filtering/sorting is done
    const timer = setTimeout(() => setIsLoading(false), 300);
    // Cleanup function for the timer is handled in the useEffect below

    return result;

  }, [products, searchParams]);

  // Separate useEffect for loading state management based on filter changes
   useEffect(() => {
     // This effect triggers whenever filteredAndSortedProducts recalculates
     // which happens when searchParams changes.
     setIsLoading(true); // Assume loading starts
     const timer = setTimeout(() => setIsLoading(false), 300); // Set timeout to end loading
     return () => clearTimeout(timer); // Cleanup timeout
   }, [searchParams]); // Depend only on searchParams

  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(startIndex, endIndex);
  }, [filteredAndSortedProducts, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

   // --- SKELETON LOADING ---
   if (isLoading) {
     return (
       <div className={cn(
           "grid gap-6",
           viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
       )}>
         {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
             viewMode === 'grid' ? (
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
             ) : (
                  <div key={i} className="flex gap-4 border border-border rounded-lg overflow-hidden shadow-sm bg-card p-4">
                     <Skeleton className="h-24 w-24 rounded-md bg-muted flex-shrink-0" />
                     <div className="flex-grow space-y-2">
                         <Skeleton className="h-5 w-3/5 bg-muted" />
                         <Skeleton className="h-4 w-1/2 bg-muted" />
                         <Skeleton className="h-4 w-full bg-muted" />
                         <Skeleton className="h-4 w-4/5 bg-muted" />
                         <div className="flex justify-between items-center pt-2">
                             <Skeleton className="h-6 w-1/4 bg-muted" />
                             <Skeleton className="h-9 w-1/4 rounded-md bg-muted" />
                         </div>
                     </div>
                 </div>
             )
         ))}
       </div>
     );
   }

  // --- NO PRODUCTS FOUND ---
  if (filteredAndSortedProducts.length === 0) {
    return (
        <div className="text-center py-16 text-muted-foreground bg-secondary rounded-lg">
            <Filter className="h-12 w-12 mx-auto mb-4 text-primary/50"/>
            <p className="text-lg font-medium">{t('shop_no_products_found')}</p>
            <p>{t('shop_adjust_filters')}</p>
        </div>
    );
  }

  // --- RENDER PRODUCT LIST ---
  return (
    <div className="space-y-8">
      <div className={cn(
          "grid gap-6",
          viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
      )}>
        {paginatedProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            viewMode={viewMode}
            href={getProductHref ? getProductHref(product) : undefined} // Pass generated href
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            size="sm"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> {t('pagination_previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('pagination_page', { current: currentPage, total: totalPages })}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            size="sm"
          >
             {t('pagination_next')} <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

