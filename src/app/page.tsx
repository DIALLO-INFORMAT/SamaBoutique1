// src/app/page.tsx
'use client'; // Needs to be a client component to use the hook

import { ProductList } from "@/components/ProductList";
import { HomeCarousel } from "@/components/HomeCarousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTranslation } from '@/hooks/useTranslation'; // Import the hook
import { useSettings } from '@/hooks/useSettings'; // Import useSettings

// Mock product data (replace with actual data fetching later)
// Ensure Product interface includes imageUrl
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string; // Add optional imageUrl
}

const allProducts: Product[] = []; // Empty array - products managed via admin


// Simulate fetching the 6 "most purchased" products
// In a real app, this would involve fetching data based on sales metrics
// For now, we'll just take the first 6 if available, or fewer.
const featuredProducts = allProducts.slice(0, 6);


// Partner logos are now fetched from settings

export default function Home() {
  const { t } = useTranslation(); // Use the translation hook
  const { carouselImages, partnerLogos, isLoading: settingsLoading } = useSettings(); // Get images from settings

  // Function to generate the link for a product
  const getProductLink = (product: Product): string => {
      // Link to the boutique page and pre-fill the search query with the product name
      const params = new URLSearchParams();
      params.set('search', product.name);
      return `/boutique?${params.toString()}`;
  };

  // Handle loading state for settings if needed
  if (settingsLoading) {
      return <div>{t('loading')}</div>; // Or a skeleton loader
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
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-primary">{t('footer_popular_products')}</h2>
        {/* Pass featuredProducts (now 6 items), viewMode, and the link generator function */}
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
