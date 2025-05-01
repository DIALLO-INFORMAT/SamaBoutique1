
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

// Mock product data (replace with actual data fetching)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Should be in XOF already
  category: string;
  brand: string;
  imageUrl?: string; // Add optional imageUrl
}

const fetchAllProducts = async (): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate slightly longer load
     const allProductsData: Product[] = [
        { id: '1', name: "T-Shirt Classique", description: "Un t-shirt confortable en coton.", price: 10000, category: "Vêtements", brand: "Marque A", imageUrl: `https://picsum.photos/seed/1/400/300` },
        { id: '2', name: "Service de Conception Web", description: "Création de site web sur mesure.", price: 300000, category: "Services", brand: "SamaServices", imageUrl: `https://picsum.photos/seed/2/400/300` },
        { id: '3', name: "Casquette Logo", description: "Casquette brodée avec logo.", price: 15000, category: "Accessoires", brand: "Marque B", imageUrl: `https://picsum.photos/seed/3/400/300` },
        { id: '4', name: "Consultation Marketing", description: "1 heure de consultation stratégique.", price: 75000, category: "Services", brand: "SamaServices", imageUrl: `https://picsum.photos/seed/4/400/300` },
        { id: '5', name: "Sweat à Capuche", description: "Sweat chaud et stylé.", price: 25000, category: "Vêtements", brand: "Marque A", imageUrl: `https://picsum.photos/seed/5/400/300` },
        { id: '6', name: "Mug Personnalisé", description: "Mug avec votre design.", price: 8000, category: "Accessoires", brand: "Marque C", imageUrl: `https://picsum.photos/seed/6/400/300` },
        { id: '7', name: "Chemise Élégante", description: "Chemise pour occasions spéciales.", price: 35000, category: "Vêtements", brand: "Marque B", imageUrl: `https://picsum.photos/seed/7/400/300` },
        { id: '8', name: "Maintenance Site Web", description: "Pack maintenance mensuel.", price: 50000, category: "Services", brand: "SamaServices", imageUrl: `https://picsum.photos/seed/8/400/300` },
        { id: '9', name: "Autocollants Logo", description: "Lot de 50 autocollants.", price: 5000, category: "Accessoires", brand: "Marque C", imageUrl: `https://picsum.photos/seed/9/400/300` },
        { id: '10', name: "Pantalon Cargo", description: "Pantalon pratique et résistant.", price: 30000, category: "Vêtements", brand: "Marque A", imageUrl: `https://picsum.photos/seed/10/400/300` },
        { id: '11', name: "Rédaction Contenu Web", description: "Service de rédaction SEO (500 mots).", price: 25000, category: "Services", brand: "SamaServices", imageUrl: `https://picsum.photos/seed/11/400/300` },
        { id: '12', name: "Porte-clés Design", description: "Porte-clés en métal.", price: 3000, category: "Accessoires", brand: "Marque B", imageUrl: `https://picsum.photos/seed/12/400/300` },
     ];
     // Ensure products in localStorage also have imageUrl (for consistency)
     if (typeof window !== 'undefined') {
        const storedProducts = localStorage.getItem('admin_products'); // Or relevant key
        if (storedProducts) {
            try {
                const parsedProducts: Product[] = JSON.parse(storedProducts);
                 return parsedProducts.map(p => ({
                     ...p,
                     imageUrl: p.imageUrl || `https://picsum.photos/seed/${p.id}/400/300`
                 }));
            } catch (error) {
                console.error("Error parsing stored products:", error);
            }
        } else {
             localStorage.setItem('admin_products', JSON.stringify(allProductsData)); // Store initial if empty
        }
     }

    return allProductsData;
}

export default function BoutiquePage() {
    const { t } = useTranslation();
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // State for view mode

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

    const categories = useMemo(() => [...new Set(allProducts.map(p => p.category))], [allProducts]);
    const brands = useMemo(() => [...new Set(allProducts.map(p => p.brand))], [allProducts]);

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
            {/* Sidebar for Filters */}
            <aside className="hidden md:block md:w-1/4 lg:w-1/5 sticky top-24 self-start">
                <BoutiqueSidebar categories={categories} brands={brands} />
            </aside>

            {/* Product Listing Area */}
            <main className="w-full md:w-3/4 lg:w-4/5">
                {/* Mobile Filter Trigger & Sorting & View Toggle */}
                <div className="flex justify-between items-center mb-4 md:mb-6 gap-4">
                    {/* Mobile Filter Drawer Trigger */}
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
                               <BoutiqueSidebar categories={categories} brands={brands} />
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Sorting Controls */}
                    <div className="flex-grow flex justify-end">
                         <ShopSortControls />
                    </div>

                     {/* View Mode Toggle */}
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
                {/* Pass viewMode and products to ProductList */}
                <ProductList initialProducts={allProducts} viewMode={viewMode} />
            </main>
        </div>
        </div>
    );
}

// Re-export useMemo from React
export { useMemo } from 'react';

// Keep dynamic rendering if relying on searchParams client-side
export const dynamic = 'force-dynamic';


    