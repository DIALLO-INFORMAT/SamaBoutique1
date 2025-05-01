import { ProductList } from "@/components/ProductList";
import { HomeCarousel } from "@/components/HomeCarousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Mock product data (replace with actual data fetching later)
const allProducts = [
  { id: '1', name: "T-Shirt Classique", description: "Un t-shirt confortable en coton.", price: 19.99, category: "Vêtements", brand: "Marque A" },
  { id: '2', name: "Service de Conception Web", description: "Création de site web sur mesure.", price: 499.00, category: "Services", brand: "SamaServices" },
  { id: '3', name: "Casquette Logo", description: "Casquette brodée avec logo.", price: 24.99, category: "Accessoires", brand: "Marque B" },
  { id: '4', name: "Consultation Marketing", description: "1 heure de consultation stratégique.", price: 150.00, category: "Services", brand: "SamaServices" },
  { id: '5', name: "Sweat à Capuche", description: "Sweat chaud et stylé.", price: 45.00, category: "Vêtements", brand: "Marque A" },
  { id: '6', name: "Mug Personnalisé", description: "Mug avec votre design.", price: 14.99, category: "Accessoires", brand: "Marque C" },
  { id: '7', name: "Chemise Élégante", description: "Chemise pour occasions spéciales.", price: 59.99, category: "Vêtements", brand: "Marque B" },
  { id: '8', name: "Maintenance Site Web", description: "Pack maintenance mensuel.", price: 99.00, category: "Services", brand: "SamaServices" },
];

export type Product = typeof allProducts[0];

// Get a few featured products (e.g., first 3)
const featuredProducts = allProducts.slice(0, 3);

export default function Home() {
  return (
    <div className="space-y-12 md:space-y-16">
      {/* Hero Section with Carousel */}
      <section>
        <HomeCarousel />
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-primary">Nos Nouveautés</h2>
        {/* Pass only featured products to ProductList */}
        <ProductList initialProducts={featuredProducts} />
        <div className="text-center mt-8">
           <Link href="/boutique" passHref legacyBehavior>
             <Button variant="destructive" size="lg">
               Voir toute la boutique <ArrowRight className="ml-2 h-5 w-5" />
             </Button>
           </Link>
         </div>
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto px-4">
        <Card className="bg-secondary border-primary shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">Prêt à découvrir plus ?</CardTitle>
            <CardDescription>
              Explorez notre collection complète ou contactez-nous pour des solutions sur mesure.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/boutique" passHref legacyBehavior>
               <Button variant="destructive">Explorer la Boutique</Button>
             </Link>
             <Link href="/contact" passHref legacyBehavior>
               <Button variant="outline">Nous Contacter</Button>
             </Link>
          </CardContent>
        </Card>
      </section>

       {/* Optional: Categories or Brand Highlights */}
       {/* <section className="container mx-auto px-4">
           <h2 className="text-3xl font-bold text-center mb-8 text-primary">Catégories Populaires</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {/* Map through categories with images/links */}
           {/*</div>
       </section> */}
    </div>
  );
}
