import { ProductList } from "@/components/ProductList";
import { FilterSortControls } from "@/components/FilterSortControls";

// Mock product data (replace with actual data fetching later)
const products = [
  { id: '1', name: "T-Shirt Classique", description: "Un t-shirt confortable en coton.", price: 19.99, category: "Vêtements" },
  { id: '2', name: "Service de Conception Web", description: "Création de site web sur mesure.", price: 499.00, category: "Services" },
  { id: '3', name: "Casquette Logo", description: "Casquette brodée avec logo.", price: 24.99, category: "Accessoires" },
  { id: '4', name: "Consultation Marketing", description: "1 heure de consultation stratégique.", price: 150.00, category: "Services" },
  { id: '5', name: "Sweat à Capuche", description: "Sweat chaud et stylé.", price: 45.00, category: "Vêtements" },
  { id: '6', name: "Mug Personnalisé", description: "Mug avec votre design.", price: 14.99, category: "Accessoires" },
];

export type Product = typeof products[0];

export default function Home() {
  return (
     // Added container and max-width here for homepage content
    <div className="container mx-auto max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold text-center text-primary">Nos Produits & Services</h1>
      <FilterSortControls />
      <ProductList initialProducts={products} />
    </div>
  );
}
