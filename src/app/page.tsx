// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ProductList } from "@/components/ProductList";
import { HomeCarousel } from "@/components/HomeCarousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTranslation } from '@/hooks/useTranslation';
import { useSettings } from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminProduct as Product } from '@/lib/types'; // Use AdminProduct as Product

const ADMIN_PRODUCTS_STORAGE_KEY = 'admin_products';

const fetchAllProductsFromStorage = (): Product[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    const storedProducts = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
    if (storedProducts) {
        try {
            const products: Product[] = JSON.parse(storedProducts);
             return products.map(p => ({
                ...p,
                imageUrl: p.imageUrl || `https://picsum.photos/seed/${p.id}/400/300`,
                // Ensure sale properties exist for all products
                isOnSale: p.isOnSale || false,
                discountType: p.discountType,
                discountValue: p.discountValue,
            })).reverse();
        } catch (error) {
            console.error("Error parsing stored products:", error);
            localStorage.removeItem(ADMIN_PRODUCTS_STORAGE_KEY);
        }
    }
    return [];
};


export default function Home() {
  const { t } = useTranslation();
  const { carouselImages, partnerLogos, isLoading: settingsLoading } = useSettings();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
     setIsLoadingProducts(true);
     const products = fetchAllProductsFromStorage();
     setAllProducts(products);
     setIsLoadingProducts(false);
  }, []);

  const featuredProducts = allProducts.slice(0, 6);

  const getProductLink = (product: Product): string => {
      const params = new URLSearchParams();
      params.set('search', product.name);
      return `/boutique?${params.toString()}`;
  };

  if (settingsLoading || isLoadingProducts) {
      return (
          <div className="space-y-10 md:space-y-16">
              <Skeleton className="w-full aspect-[12/5] bg-muted" />
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
              <section className="container mx-auto px-4">
                  <Skeleton className="h-40 w-full rounded-lg bg-muted" />
              </section>
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
      <section>
        <HomeCarousel images={carouselImages} />
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-primary">{t('home_featured_products')}</h2>
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
                 onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
