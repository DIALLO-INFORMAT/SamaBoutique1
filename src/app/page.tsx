// src/app/page.tsx
'use client'; // Needs to be a client component to use the hook

import { useState, useEffect } from 'react'; // Import useState and useEffect
import { ProductList } from "@/components/ProductList";
import { HomeCarousel } from "@/components/HomeCarousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTranslation } from '@/hooks/useTranslation'; // Import the hook
import { useSettings } from '@/hooks/useSettings'; // Import useSettings
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Mock product data (replace with actual data fetching later)
// Ensure Product interface includes imageUrl
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string; // Add optional imageUrl
  // Assuming products are added with a timestamp or identifiable order
  // createdAt?: Date; // Optional: Add if available for sorting
}

const ADMIN_PRODUCTS_STORAGE_KEY = 'admin_products'; // Key where products are stored

// Simulate fetching ALL products and then filtering/sorting
const fetchAllProductsFromStorage = (): Product[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    const storedProducts = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
    if (storedProducts) {
        try {
            const products: Product[] = JSON.parse(storedProducts);
            // Ensure imageUrl exists for fallback and sort by assumed add order (reverse)
             return products.map(p => ({
                ...p,
                imageUrl: p.imageUrl || `https://picsum.photos/seed/${p.id}/400/300`,
                // If createdAt exists, parse it:
                // createdAt: p.createdAt ? new Date(p.createdAt) : new Date(0) // Fallback date
            })).reverse(); // Reverse to get latest added first (simple approach)
            // If using createdAt: .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } catch (error) {
            console.error("Error parsing stored products:", error);
            localStorage.removeItem(ADMIN_PRODUCTS_STORAGE_KEY); // Clear corrupted data
        }
    }
    return []; // Return empty if no data or error
};


export default function Home() {
  const { t } = useTranslation(); // Use the translation hook
  const { carouselImages, partnerLogos, isLoading: settingsLoading } = useSettings(); // Get images from settings
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Fetch products on mount
  useEffect(() => {
     setIsLoadingProducts(true);
     const products = fetchAllProductsFromStorage();
     setAllProducts(products);
     setIsLoadingProducts(false);
  }, []);


  // Get the last 6 added products
  const featuredProducts = allProducts.slice(0, 6);

  // Function to generate the link for a product
  const getProductLink = (product: Product): string => {
      // Link to the boutique page and pre-fill the search query with the product name
      const params = new URLSearchParams();
      params.set('search', product.name);
      return `/boutique?${params.toString()}`;
  };

  // Handle loading state for settings if needed
  if (settingsLoading || isLoadingProducts) { // Check both loading states
      // Render skeleton loaders
      return (
          <div className="space-y-10 md:space-y-16">
               {/* Hero Skeleton */}
              <Skeleton className="w-full aspect-[12/5] bg-muted" />

               {/* Featured Products Skeleton */}
               <section className="container mx-auto px-4">
                  <Skeleton className="h-8 w-1/3 mx-auto mb-6 bg-muted" />
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
                  <div className="text-center mt-6 md:mt-8">
                     <Skeleton className="h-11 w-48 mx-auto rounded-md bg-muted" />
                 </div>
              </section>

              {/* CTA Skeleton */}
              <section className="container mx-auto px-4">
                  <Skeleton className="h-40 w-full rounded-lg bg-muted" />
              </section>

               {/* Partner Logos Skeleton */}
              <section className="container mx-auto px-4 py-6 md:py-8">
                  <Skeleton className="h-6 w-1/4 mx-auto mb-4 bg-muted" />
                   <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
                       {[...Array(6)].map((_, i) => (
                           <Skeleton key={i} className="h-16 w-32 sm:h-20 sm:w-40 rounded-md bg-muted"/>
                       ))}
                   </div>
              </section>
          </div>
      );
  }

  return (
    <div className="space-y-10 md:space-y-16">
      {/* Hero Section */}
      <section>
        <HomeCarousel images={carouselImages} /> {/* Pass images to carousel */}
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4">
        {/* Updated title */}
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-primary">{t('home_featured_products')}</h2>
        {/* Pass featuredProducts (last 6 added), viewMode, and the link generator function */}
        <ProductList
            initialProducts={featuredProducts}
            viewMode="grid"
            getProductHref={getProductLink}
        />
        <div className="text-center mt-6 md:mt-8">
           <Link href="/boutique" >
             <Button variant="destructive" size="lg">
               {t('home_view_all_products')} <ArrowRight className="ml-2 h-5 w-5" />
             </Button>
           </Link>
         </div>
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto px-4">
        <Card className="bg-secondary border-primary shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-2xl text-primary">{t('home_cta_title')}</CardTitle>
            <CardDescription className="text-sm md:text-base">
              {t('home_cta_description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
            <Link href="/boutique" >
               <Button variant="destructive" size="default" className="w-full sm:w-auto">{t('home_cta_explore')}</Button>
             </Link>
             <Link href="/contact" >
               <Button variant="outline" size="default" className="w-full sm:w-auto">{t('home_cta_contact')}</Button>
             </Link>
          </CardContent>
        </Card>
      </section>

      {/* Partner Logos Section */}
      <section className="container mx-auto px-4 py-6 md:py-8">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4 text-primary">{t('home_partners_title')}</h2>
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
          {partnerLogos.map((logo) => (
            <div key={logo.id} className="flex items-center justify-center h-16 w-32 sm:h-20 sm:w-40 border border-border rounded-md overflow-hidden p-1 bg-background">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={140}
                height={70}
                className="object-contain w-full h-full"
                data-ai-hint={logo.hint}
                 onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if image fails
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
