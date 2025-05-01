// src/components/BoutiqueSidebar.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Filter, ListFilter, Search, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface BoutiqueSidebarProps {
  categories: string[];
  brands: string[];
}

export function BoutiqueSidebar({ categories, brands }: BoutiqueSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- State for Filters ---
  // Initialize state directly from URL params on component mount/hydration
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Effect to synchronize state with URL on initial load and when URL changes externally
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedBrands(searchParams.getAll('brand') || []);
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);


   // --- Update URL Params Function ---
   // Use useCallback to memoize the function
   const updateUrlParams = useCallback(() => {
       const params = new URLSearchParams(searchParams); // Start with current params (including sort)

       // Update or delete params based on current state
       if (selectedCategory !== 'all') params.set('category', selectedCategory);
       else params.delete('category');

       params.delete('brand'); // Clear existing brands before adding current selection
       selectedBrands.forEach(brand => params.append('brand', brand));

       if (minPrice) params.set('minPrice', minPrice);
       else params.delete('minPrice');

       if (maxPrice) params.set('maxPrice', maxPrice);
       else params.delete('maxPrice');

       if (searchTerm.length >= 2) params.set('search', searchTerm); // Only add search if >= 2 chars
       else params.delete('search');


       router.push(`${pathname}?${params.toString()}`, { scroll: false });
   }, [selectedCategory, selectedBrands, minPrice, maxPrice, searchTerm, pathname, router, searchParams]); // Add all dependencies

   // --- Handlers ---
   const handleCategoryChange = (value: string) => {
       setSelectedCategory(value);
   };

   const handleBrandChange = (brand: string, checked: boolean | string) => {
       setSelectedBrands(prev =>
           checked ? [...prev, brand] : prev.filter(b => b !== brand)
       );
   };

    const handlePriceChange = (type: 'min' | 'max', value: string) => {
        // Basic validation: allow only numbers and empty string
        const numericValue = value.replace(/[^0-9]/g, '');
        if (type === 'min') setMinPrice(numericValue);
        else setMaxPrice(numericValue);
    };

     const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
         setSearchTerm(event.target.value);
         // Live search update (optional - requires debouncing usually)
         // For now, rely on the apply button
     };

     // Apply button click handler
     const applyFilters = () => {
         updateUrlParams();
     };

     // Clear button click handler
     const clearFilters = () => {
         setSelectedCategory('all');
         setSelectedBrands([]);
         setMinPrice('');
         setMaxPrice('');
         setSearchTerm('');

         // Clear URL params, keeping sort if present
         const params = new URLSearchParams();
         const currentSort = searchParams.get('sort');
          if (currentSort) {
              params.set('sort', currentSort);
          }
         router.push(`${pathname}?${params.toString()}`, { scroll: false });
     };


  return (
    <Card className="shadow-md border-border sticky top-24"> {/* Sticky position */}
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <ListFilter className="h-5 w-5 text-primary" /> Filtres
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Search Filter */}
        <div className="space-y-2">
            <Label htmlFor="search-filter" className="font-medium">Rechercher</Label>
            <div className="relative">
                 <Input
                     id="search-filter"
                     placeholder="Nom du produit..."
                     value={searchTerm}
                     onChange={handleSearchChange}
                     className="pr-8"
                 />
                 <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
             <p className="text-xs text-muted-foreground">Tapez au moins 2 lettres et appliquez.</p>
        </div>

        <Separator />

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="font-medium">Catégorie</Label>
          <RadioGroup value={selectedCategory} onValueChange={handleCategoryChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="cat-all" />
              <Label htmlFor="cat-all" className="font-normal cursor-pointer">Tout afficher</Label>
            </div>
            {categories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <RadioGroupItem value={category.toLowerCase()} id={`cat-${category.toLowerCase()}`} /> {/* Ensure value is lowercase */}
                <Label htmlFor={`cat-${category.toLowerCase()}`} className="font-normal cursor-pointer">{category}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Brand Filter */}
        <div className="space-y-2">
          <Label className="font-medium">Marque</Label>
          {brands.map(brand => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.toLowerCase()}`} // Ensure id is lowercase
                checked={selectedBrands.includes(brand.toLowerCase())}
                onCheckedChange={(checked) => handleBrandChange(brand.toLowerCase(), checked)}
              />
              <Label htmlFor={`brand-${brand.toLowerCase()}`} className="font-normal cursor-pointer">{brand}</Label>
            </div>
          ))}
        </div>

        <Separator />

        {/* Price Filter */}
        <div className="space-y-2">
             <Label className="font-medium">Prix (FCFA)</Label>
             <div className="flex gap-2 items-center">
                 <Input
                     type="number" // Use number for better input handling on mobile
                     placeholder="Min"
                     value={minPrice}
                     onChange={(e) => handlePriceChange('min', e.target.value)}
                     className="w-full text-sm h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // Hide spinners
                     min="0"
                     step="1" // Allow only whole numbers common for XOF
                 />
                 <span>-</span>
                 <Input
                     type="number"
                     placeholder="Max"
                     value={maxPrice}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                     className="w-full text-sm h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                     min="0"
                     step="1"
                 />
             </div>
        </div>

        <Separator />

        {/* Action Buttons */}
         <div className="flex flex-col sm:flex-row gap-2 pt-2">
             <Button variant="destructive" onClick={applyFilters} className="flex-grow">
                <Filter className="mr-2 h-4 w-4" /> Appliquer
             </Button>
             <Button variant="outline" onClick={clearFilters} className="flex-grow">
                 <X className="mr-2 h-4 w-4" /> Effacer
             </Button>
         </div>

      </CardContent>
    </Card>
  );
}
