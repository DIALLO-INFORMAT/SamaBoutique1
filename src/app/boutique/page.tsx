// src/app/boutique/page.tsx
'use client'; // Need client component for state and drawer

import { useState } from 'react';
import { ProductList } from "@/components/ProductList";
import { BoutiqueSidebar } from "@/components/BoutiqueSidebar";
import { ShopSortControls } from "@/components/FilterSortControls";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ListFilter } from 'lucide-react';

// Mock product data (replace with actual data fetching)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Should be in XOF already
  category: string;
  brand: string; // Added brand
}

// In a real app, this fetch would happen server-side, potentially using searchParams
// For client-side filtering demo, we keep it simple
const fetchAllProducts = async (): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
     const allProductsData: Product[] = [
        { id: '1', name: "T-Shirt Classique", description: "Un t-shirt confortable en coton.", price: 10000, category: "Vêtements", brand: "Marque A" },
        { id: '2', name: "Service de Conception Web", description: "Création de site web sur mesure.", price: 300000, category: "Services", brand: "SamaServices" },
        { id: '3', name: "Casquette Logo", description: "Casquette brodée avec logo.", price: 15000, category: "Accessoires", brand: "Marque B" },
        { id: '4', name: "Consultation Marketing", description: "1 heure de consultation stratégique.", price: 75000, category: "Services", brand: "SamaServices" },
        { id: '5', name: "Sweat à Capuche", description: "Sweat chaud et stylé.", price: 25000, category: "Vêtements", brand: "Marque A" },
        { id: '6', name: "Mug Personnalisé", description: "Mug avec votre design.", price: 8000, category: "Accessoires", brand: "Marque C" },
        { id: '7', name: "Chemise Élégante", description: "Chemise pour occasions spéciales.", price: 35000, category: "Vêtements", brand: "Marque B" },
        { id: '8', name: "Maintenance Site Web", description: "Pack maintenance mensuel.", price: 50000, category: "Services", brand: "SamaServices" },
        // Add more products...
     ];
    return allProductsData;
}


export default function BoutiquePage() {
    // Assume fetchAllProducts runs server-side or use useEffect here if needed
    // For this demo, we'll assume initialProducts are passed or fetched synchronously client-side (not ideal for SSR/SSG)
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useState(() => {
        fetchAllProducts().then(data => {
            setAllProducts(data);
            setIsLoading(false);
        });
    });

    // Extract unique categories and brands for filtering options
    const categories = [...new Set(allProducts.map(p => p.category))];
    const brands = [...new Set(allProducts.map(p => p.brand))];

    if (isLoading) {
        // TODO: Add a proper loading skeleton here
        return <div className="container mx-auto px-4 py-10 text-center">Chargement des produits...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-6 md:py-10">
        <h1 className="text-3xl font-bold text-center mb-6 md:mb-8 text-primary">Notre Boutique</h1>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Sidebar for Filters - Hidden on small screens, shown in drawer */}
            <aside className="hidden md:block md:w-1/4 lg:w-1/5 sticky top-20 self-start"> {/* Make sidebar sticky */}
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
                                <ListFilter className="h-4 w-4" /> Filtres
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-3/4 sm:w-1/2 overflow-y-auto">
                             <SheetHeader className="border-b pb-4 mb-4">
                                <SheetTitle className="text-lg flex items-center gap-2">
                                    <ListFilter className="h-5 w-5 text-primary" /> Filtres
                                </SheetTitle>
                            </SheetHeader>
                            {/* Render Sidebar content inside the drawer */}
                            <BoutiqueSidebar categories={categories} brands={brands} />
                        </SheetContent>
                    </Sheet>

                    {/* Sorting Controls - always visible */}
                    <div className="flex-grow flex justify-end">
                         <ShopSortControls />
                    </div>
                </div>
                 {/* Pass initial products, filtering logic is inside ProductList */}
                <ProductList initialProducts={allProducts} />
            </main>
        </div>
        </div>
    );
}

// Force dynamic rendering to ensure searchParams are available client-side for filtering/sorting hooks
export const dynamic = 'force-dynamic';
