// src/app/boutique/page.tsx
import { ProductList } from "@/components/ProductList";
import { BoutiqueSidebar } from "@/components/BoutiqueSidebar";
import { ShopSortControls } from "@/components/FilterSortControls"; // Renamed component

// Mock product data (replace with actual data fetching)
// Ensure this type includes 'brand'
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Should be in XOF already
  category: string;
  brand: string; // Added brand
}

// In a real app, this fetch would happen server-side, potentially using searchParams
const fetchAllProducts = async (): Promise<Product[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100)); // Minimal delay for demo
    // Re-using the same mock data
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


export default async function BoutiquePage() {
  // Fetch all products initially. Filtering/sorting will happen client-side in ProductList for this example.
  const allProducts = await fetchAllProducts();

  // Extract unique categories and brands for filtering options
  const categories = [...new Set(allProducts.map(p => p.category))];
  const brands = [...new Set(allProducts.map(p => p.brand))];

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
          {/* Sorting Controls */}
          <ShopSortControls />
          <ProductList initialProducts={allProducts} />
        </main>
      </div>
    </div>
  );
}

// Force dynamic rendering to ensure searchParams are available client-side for filtering/sorting hooks
export const dynamic = 'force-dynamic';
