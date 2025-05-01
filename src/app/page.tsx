import { ProductList } from "@/components/ProductList";
import { HomeCarousel } from "@/components/HomeCarousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

// Mock product data (replace with actual data fetching later)
const allProducts = [
  { id: '1', name: "T-Shirt Classique", description: "Un t-shirt confortable en coton.", price: 10000, category: "Vêtements", brand: "Marque A" },
  { id: '2', name: "Service de Conception Web", description: "Création de site web sur mesure.", price: 300000, category: "Services", brand: "SamaServices" },
  { id: '3', name: "Casquette Logo", description: "Casquette brodée avec logo.", price: 15000, category: "Accessoires", brand: "Marque B" },
  { id: '4', name: "Consultation Marketing", description: "1 heure de consultation stratégique.", price: 75000, category: "Services", brand: "SamaServices" },
  { id: '5', name: "Sweat à Capuche", description: "Sweat chaud et stylé.", price: 25000, category: "Vêtements", brand: "Marque A" },
  { id: '6', name: "Mug Personnalisé", description: "Mug avec votre design.", price: 8000, category: "Accessoires", brand: "Marque C" },
  { id: '7', name: "Chemise Élégante", description: "Chemise pour occasions spéciales.", price: 35000, category: "Vêtements", brand: "Marque B" },
  { id: '8', name: "Maintenance Site Web", description: "Pack maintenance mensuel.", price: 50000, category: "Services", brand: "SamaServices" },
];

export type Product = typeof allProducts[0];

// Get a few featured products (e.g., first 3)
const featuredProducts = allProducts.slice(0, 3);

// Array of partner logos with placeholder URLs
const partnerLogos = [
    { id: 'logo1', src: "https://picsum.photos/seed/logo1/100/50", alt: "Partner Logo 1", hint: "partner technology" },
    { id: 'logo2', src: "https://picsum.photos/seed/logo2/100/50", alt: "Partner Logo 2", hint: "partner business" },
    { id: 'logo3', src: "https://picsum.photos/seed/logo3/100/50", alt: "Partner Logo 3", hint: "partner finance" },
    { id: 'logo4', src: "https://picsum.photos/seed/logo4/100/50", alt: "Partner Logo 4", hint: "partner innovation" },
    { id: 'logo5', src: "https://picsum.photos/seed/logo5/100/50", alt: "Partner Logo 5", hint: "partner solutions" },
    { id: 'logo6', src: "https://picsum.photos/seed/logo6/100/50", alt: "Partner Logo 6", hint: "partner network" },
];


export default function Home() {
  return (
    // Adjusted vertical spacing
    <div className="space-y-10 md:space-y-16">
      {/* Hero Section with Carousel */}
      <section>
        <HomeCarousel />
      </section>

      {/* Featured Products Section */}
       {/* Adjusted margin-bottom */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-primary">Nos Nouveautés</h2>
        {/* Pass only featured products to ProductList */}
        <ProductList initialProducts={featuredProducts} />
         {/* Adjusted margin-top */}
        <div className="text-center mt-6 md:mt-8">
           <Link href="/boutique" passHref legacyBehavior>
              {/* Adjusted button size for mobile */}
             <Button variant="destructive" size="default" className="sm:size-lg">
               Voir toute la boutique <ArrowRight className="ml-2 h-5 w-5" />
             </Button>
           </Link>
         </div>
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto px-4">
        <Card className="bg-secondary border-primary shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-2xl text-primary">Prêt à découvrir plus ?</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Explorez notre collection complète ou contactez-nous pour des solutions sur mesure.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
             {/* Adjusted button size for mobile */}
            <Link href="/boutique" passHref legacyBehavior>
               <Button variant="destructive" size="default" className="w-full sm:w-auto">Explorer la Boutique</Button>
             </Link>
             <Link href="/contact" passHref legacyBehavior>
               <Button variant="outline" size="default" className="w-full sm:w-auto">Nous Contacter</Button>
             </Link>
          </CardContent>
        </Card>
      </section>

      {/* Partner Logos Section */}
      <section className="container mx-auto px-4 py-6 md:py-8">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4 text-primary">Nos Partenaires</h2>
         {/* Adjusted gaps and item sizes for responsiveness */}
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
          {partnerLogos.map((logo) => (
            <div key={logo.id} className="flex items-center justify-center h-16 w-32 sm:h-20 sm:w-40 border border-border rounded-md overflow-hidden p-1 bg-background">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={140} // Slightly smaller base width
                height={70} // Slightly smaller base height
                className="object-contain w-full h-full"
                data-ai-hint={logo.hint}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
