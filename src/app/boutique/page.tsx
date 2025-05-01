
// src/app/boutique/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ProductList } from "@/components/ProductList";
import { BoutiqueSidebar } from "@/components/BoutiqueSidebar";
import { ShopSortControls } from "@/components/FilterSortControls";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ListFilter, Loader2 } from 'lucide-react'; // Added Loader2
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

// Mock product data (replace with actual data fetching)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Should be in XOF already
  category: string;
  brand: string;
}

const fetchAllProducts = async (): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate slightly longer load
     const allProductsData: Product[] = [
        // Using the existing product list
        { id: '1', name: "T-Shirt Classique", description: "Un t-shirt confortable en coton.", price: 10000, category: "Vêtements", brand: "Marque A" },
        { id: '2', name: "Service de Conception Web", description: "Création de site web sur mesure.", price: 300000, category: "Services", brand: "SamaServices" },
        { id: '3', name: "Casquette Logo", description: "Casquette brodée avec logo.", price: 15000, category: "Accessoires", brand: "Marque B" },
        { id: '4', name: "Consultation Marketing", description: "1 heure de consultation stratégique.", price: 75000, category: "Services", brand: "SamaServices" },
        { id: '5', name: "Sweat à Capuche", description: "Sweat chaud et stylé.", price: 25000, category: "Vêtements", brand: "Marque A" },
        { id: '6', name: "Mug Personnalisé", description: "Mug avec votre design.", price: 8000, category: "Accessoires", brand: "Marque C" },
        { id: '7', name: "Chemise Élégante", description: "Chemise pour occasions spéciales.", price: 35000, category: "Vêtements", brand: "Marque B" },
        { id: '8', name: "Maintenance Site Web", description: "Pack maintenance mensuel.", price: 50000, category: "Services", brand: "SamaServices" },
     ];
    return allProductsData;
}

export default function BoutiquePage() {
    const { t } = useTranslation(); // Use translation hook
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Changed to useEffect to run client-side
    useEffect(() => {
        setIsLoading(true); // Set loading true when fetch starts
        fetchAllProducts().then(data => {
            setAllProducts(data);
            setIsLoading(false);
        }).catch(error => {
            console.error("Failed to fetch products:", error);
            setIsLoading(false); // Ensure loading is turned off on error
        });
    }, []); // Empty dependency array means this runs once on mount

    // Derive categories and brands after products are loaded
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
                {/* Mobile Filter Trigger & Sorting */}
                <div className="flex justify-between items-center mb-4 md:mb-6">
                    {/* Mobile Filter Drawer Trigger */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="md:hidden flex items-center gap-2">
                                <ListFilter className="h-4 w-4" /> {t('shop_filters')}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-3/4 sm:w-1/2 overflow-y-auto p-0"> {/* Remove padding for full height */}
                             <SheetHeader className="border-b p-4"> {/* Add padding here */}
                                <SheetTitle className="text-lg flex items-center gap-2">
                                    <ListFilter className="h-5 w-5 text-primary" /> {t('shop_filters')}
                                </SheetTitle>
                            </SheetHeader>
                            {/* Pass categories and brands */}
                            <div className="p-4"> {/* Add padding for content */}
                               <BoutiqueSidebar categories={categories} brands={brands} />
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Sorting Controls */}
                    <div className="flex-grow flex justify-end">
                         <ShopSortControls />
                    </div>
                </div>
                <ProductList initialProducts={allProducts} />
            </main>
        </div>
        </div>
    );
}

// Re-export useMemo from React
export { useMemo } from 'react';

// Keep dynamic rendering if relying on searchParams client-side
export const dynamic = 'force-dynamic';
