// src/app/boutique/page.tsx
import { ProductList } from "@/components/ProductList";
import { BoutiqueSidebar } from "@/components/BoutiqueSidebar";

// Mock product data (replace with actual data fetching)
// Ensure this type includes 'brand'
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string; // Added brand
}

const allProducts: Product[] = [
  { id: '1', name: "T-Shirt Classique", description: "Un t-shirt confortable en coton.", price: 19.99, category: "Vêtements", brand: "Marque A" },
  { id: '2', name: "Service de Conception Web", description: "Création de site web sur mesure.", price: 499.00, category: "Services", brand: "SamaServices" },
  { id: '3', name: "Casquette Logo", description: "Casquette brodée avec logo.", price: 24.99, category: "Accessoires", brand: "Marque B" },
  { id: '4', name: "Consultation Marketing", description: "1 heure de consultation stratégique.", price: 150.00, category: "Services", brand: "SamaServices" },
  { id: '5', name: "Sweat à Capuche", description: "Sweat chaud et stylé.", price: 45.00, category: "Vêtements", brand: "Marque A" },
  { id: '6', name: "Mug Personnalisé", description: "Mug avec votre design.", price: 14.99, category: "Accessoires", brand: "Marque C" },
  { id: '7', name: "Chemise Élégante", description: "Chemise pour occasions spéciales.", price: 59.99, category: "Vêtements", brand: "Marque B" },
  { id: '8', name: "Maintenance Site Web", description: "Pack maintenance mensuel.", price: 99.00, category: "Services", brand: "SamaServices" },
  // Add more products...
];

// Extract unique categories and brands for filtering options
const categories = [...new Set(allProducts.map(p => p.category))];
const brands = [...new Set(allProducts.map(p => p.brand))];

export default function BoutiquePage() {
  // In a real app, you would pass searchParams to ProductList
  // and potentially fetch products based on them server-side.
  // const { searchParams } = props;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Notre Boutique</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar for Filters */}
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <BoutiqueSidebar categories={categories} brands={brands} />
        </aside>

        {/* Product Listing Area */}
        <main className="w-full md:w-3/4 lg:w-4/5">
          {/* Optional: Add sort controls here if needed, similar to FilterSortControls but potentially integrated differently */}
          {/* <FilterSortControls /> */}
          <ProductList initialProducts={allProducts} />
        </main>
      </div>
    </div>
  );
}
