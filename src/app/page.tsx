
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
  brand: string;
  imageUrl?: string; // Add optional imageUrl
}

const allProducts: Product[] = [
  { id: '1', name: "T-Shirt Classique", description: "Un t-shirt confortable en coton.", price: 10000, category: "Vêtements", brand: "Marque A", imageUrl: `https://picsum.photos/seed/1/400/300` },
  { id: '2', name: "Service de Conception Web", description: "Création de site web sur mesure.", price: 300000, category: "Services", brand: "SamaServices", imageUrl: `https://picsum.photos/seed/2/400/300` },
  { id: '3', name: "Casquette Logo", description: "Casquette brodée avec logo.", price: 15000, category: "Accessoires", brand: "Marque B", imageUrl: `https://picsum.photos/seed/3/400/300` },
  { id: '4', name: "Consultation Marketing", description: "1 heure de consultation stratégique.", price: 75000, category: "Services", brand: "SamaServices", imageUrl: `https://picsum.photos/seed/4/400/300` },
  { id: '5', name: "Sweat à Capuche", description: "Sweat chaud et stylé.", price: 25000, category: "Vêtements", brand: "Marque A", imageUrl: `https://picsum.photos/seed/5/400/300` },
  { id: '6', name: "Mug Personnalisé", description: "Mug avec votre design.", price: 8000, category: "Accessoires", brand: "Marque C", imageUrl: `https://picsum.photos/seed/6/400/300` },
  { id: '7', name: "Chemise Élégante", description: "Chemise pour occasions spéciales.", price: 35000, category: "Vêtements", brand: "Marque B", imageUrl: `https://picsum.photos/seed/7/400/300` },
  { id: '8', name: "Maintenance Site Web", description: "Pack maintenance mensuel.", price: 50000, category: "Services", brand: "SamaServices", imageUrl: `https://picsum.photos/seed/8/400/300` },
];


const featuredProducts = allProducts.slice(0, 3);

// Partner logos are now fetched from settings

export default function Home() {
  const { t } = useTranslation(); // Use the translation hook
  const { carouselImages, partnerLogos, isLoading: settingsLoading } = useSettings(); // Get images from settings

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
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-primary">{t('home_featured_products')}</h2>
        {/* Pass featuredProducts and viewMode */}
        <ProductList initialProducts={featuredProducts} viewMode="grid" />
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
