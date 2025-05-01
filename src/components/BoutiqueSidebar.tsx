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
import { useState, useEffect } from 'react';

interface BoutiqueSidebarProps {
  categories: string[];
  brands: string[];
}

export function BoutiqueSidebar({ categories, brands }: BoutiqueSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- State for Filters ---
  // Initialize state from URL params or defaults
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(searchParams.getAll('brand') || []);
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '');
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');

   // --- Update URL Params Function ---
   const updateUrlParams = () => {
       const params = new URLSearchParams();

       // Add params only if they have a non-default value
       if (selectedCategory !== 'all') params.set('category', selectedCategory);
       selectedBrands.forEach(brand => params.append('brand', brand));
       if (minPrice) params.set('minPrice', minPrice);
       if (maxPrice) params.set('maxPrice', maxPrice);
       if (searchTerm) params.set('search', searchTerm);

       // Add existing sort parameter if present
       const currentSort = searchParams.get('sort');
       if (currentSort) {
           params.set('sort', currentSort);
       }

       router.push(`${pathname}?${params.toString()}`, { scroll: false });
   };

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
        if (type === 'min') setMinPrice(value);
        else setMaxPrice(value);
    };

     const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
         setSearchTerm(event.target.value);
     };

     const applyFilters = () => {
         updateUrlParams();
     };

     const clearFilters = () => {
         setSelectedCategory('all');
         setSelectedBrands([]);
         setMinPrice('');
         setMaxPrice('');
         setSearchTerm('');
         // Clear URL params as well
         const params = new URLSearchParams();
         const currentSort = searchParams.get('sort');
          if (currentSort) {
              params.set('sort', currentSort); // Keep sort if present
          }
         router.push(`${pathname}?${params.toString()}`, { scroll: false });
     };

     // Effect to apply filters immediately on simple changes (like category)
     // Use a button for more complex filter applications (like price range, multiple brands)
     // useEffect(() => {
     //     updateUrlParams();
     // }, [selectedCategory, selectedBrands]); // Add other relevant states if needed


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
                <RadioGroupItem value={category.toLowerCase()} id={`cat-${category}`} />
                <Label htmlFor={`cat-${category}`} className="font-normal cursor-pointer">{category}</Label>
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
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand.toLowerCase())}
                onCheckedChange={(checked) => handleBrandChange(brand.toLowerCase(), checked)}
              />
              <Label htmlFor={`brand-${brand}`} className="font-normal cursor-pointer">{brand}</Label>
            </div>
          ))}
        </div>

        <Separator />

        {/* Price Filter */}
        <div className="space-y-2">
             <Label className="font-medium">Prix</Label>
             <div className="flex gap-2 items-center">
                 <Input
                     type="number"
                     placeholder="Min €"
                     value={minPrice}
                     onChange={(e) => handlePriceChange('min', e.target.value)}
                     className="w-full text-sm h-9"
                     min="0"
                 />
                 <span>-</span>
                 <Input
                     type="number"
                     placeholder="Max €"
                     value={maxPrice}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                     className="w-full text-sm h-9"
                     min="0"
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
