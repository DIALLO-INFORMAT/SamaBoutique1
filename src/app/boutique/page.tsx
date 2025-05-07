
// src/app/boutique/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProductList } from "@/components/ProductList";
import { BoutiqueSidebar } from "@/components/BoutiqueSidebar";
import { ShopSortControls } from "@/components/FilterSortControls";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ListFilter, Loader2, Grid, List } from 'lucide-react'; // Added Grid, List
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import type { AdminProduct as Product } from '@/lib/types'; // Use AdminProduct as Product

const fetchAllProducts = async (): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
     if (typeof window === 'undefined') return [];
     const storedProducts = localStorage.getItem('admin_products');
     if (storedProducts) {
         try {
             const parsedProducts: Product[] = JSON.parse(storedProducts);
              return parsedProducts.map(p => ({
                  ...p,
                  imageUrl: p.imageUrl || `https://picsum.photos/seed/${p.id}/400/300`,
                  // Ensure sale properties exist, defaulting if necessary
                  isOnSale: p.isOnSale || false,
                  discountType: p.discountType,
                  discountValue: p.discountValue,
              }));
         } catch (error) {
             console.error("Error parsing stored products:", error);
              localStorage.removeItem('admin_products');
              return [];
         }
     } else {
          localStorage.setItem('admin_products', JSON.stringify([]));
          return [];
     }
}

export default function BoutiquePage() {
    const { t } = useTranslation();
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        setIsLoading(true);
        fetchAllProducts().then(data => {
            setAllProducts(data);
            setIsLoading(false);
        }).catch(error => {
            console.error("Failed to fetch products:", error);
            setIsLoading(false);
        });
    }, []);

    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
        return uniqueCategories.filter(Boolean); // Filter out any undefined/null categories
    }, [allProducts]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
                 <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                 <p className="text-muted-foreground">{t('loading')}</p>
             </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 md:py-10">
        <h1 className="text-3xl font-bold text-center mb-6 md:mb-8 text-primary">{t('shop_title')}</h1>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <aside className="hidden md:block md:w-1/4 lg:w-1/5 sticky top-24 self-start">
                <BoutiqueSidebar categories={categories} />
            </aside>

            <main className="w-full md:w-3/4 lg:w-4/5">
                <div className="flex justify-between items-center mb-4 md:mb-6 gap-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="md:hidden flex items-center gap-2 shrink-0">
                                <ListFilter className="h-4 w-4" /> {t('shop_filters')}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-3/4 sm:w-1/2 overflow-y-auto p-0">
                             <SheetHeader className="border-b p-4">
                                <SheetTitle className="text-lg flex items-center gap-2">
                                    <ListFilter className="h-5 w-5 text-primary" /> {t('shop_filters')}
                                </SheetTitle>
                            </SheetHeader>
                            <div className="p-4">
                               <BoutiqueSidebar categories={categories} />
                            </div>
                        </SheetContent>
                    </Sheet>

                    <div className="flex-grow flex justify-end">
                         <ShopSortControls />
                    </div>

                    <div className="flex items-center gap-1 border rounded-md p-0.5 bg-secondary">
                       <Button
                         variant={viewMode === 'grid' ? 'background' : 'ghost'}
                         size="icon"
                         onClick={() => setViewMode('grid')}
                         className={cn(
                           "h-8 w-8",
                           viewMode === 'grid' && 'bg-background text-primary shadow-sm'
                         )}
                         aria-label={t('shop_view_grid')}
                       >
                         <Grid className="h-4 w-4" />
                       </Button>
                       <Button
                         variant={viewMode === 'list' ? 'background' : 'ghost'}
                         size="icon"
                         onClick={() => setViewMode('list')}
                         className={cn(
                           "h-8 w-8",
                            viewMode === 'list' && 'bg-background text-primary shadow-sm'
                          )}
                          aria-label={t('shop_view_list')}
                       >
                         <List className="h-4 w-4" />
                       </Button>
                     </div>
                </div>
                <ProductList initialProducts={allProducts} viewMode={viewMode} />
            </main>
        </div>
        </div>
    );
}

export { useMemo } from 'react';
export const dynamic = 'force-dynamic';
