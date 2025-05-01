
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
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

interface BoutiqueSidebarProps {
  categories: string[];
  brands: string[];
}

export function BoutiqueSidebar({ categories, brands }: BoutiqueSidebarProps) {
  const { t } = useTranslation(); // Use translation hook
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedBrands(searchParams.getAll('brand') || []);
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

   const updateUrlParams = useCallback(() => {
       const params = new URLSearchParams(searchParams);

       if (selectedCategory !== 'all') params.set('category', selectedCategory);
       else params.delete('category');

       params.delete('brand');
       selectedBrands.forEach(brand => params.append('brand', brand));

       if (minPrice) params.set('minPrice', minPrice);
       else params.delete('minPrice');

       if (maxPrice) params.set('maxPrice', maxPrice);
       else params.delete('maxPrice');

       if (searchTerm.length >= 2) params.set('search', searchTerm);
       else params.delete('search');

       router.push(`${pathname}?${params.toString()}`, { scroll: false });
   }, [selectedCategory, selectedBrands, minPrice, maxPrice, searchTerm, pathname, router, searchParams]);

   const handleCategoryChange = (value: string) => {
       setSelectedCategory(value);
   };

   const handleBrandChange = (brand: string, checked: boolean | string) => {
       setSelectedBrands(prev =>
           checked ? [...prev, brand] : prev.filter(b => b !== brand)
       );
   };

    const handlePriceChange = (type: 'min' | 'max', value: string) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (type === 'min') setMinPrice(numericValue);
        else setMaxPrice(numericValue);
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

         const params = new URLSearchParams();
         const currentSort = searchParams.get('sort');
          if (currentSort) {
              params.set('sort', currentSort);
          }
         router.push(`${pathname}?${params.toString()}`, { scroll: false });
     };


  return (
    // Removed sticky and top classes as they might conflict with Sheet behavior
    <Card className="shadow-none border-none md:shadow-md md:border md:sticky md:top-24">
      <CardHeader className="border-b border-border hidden md:flex">
        <CardTitle className="text-lg flex items-center gap-2">
          <ListFilter className="h-5 w-5 text-primary" /> {t('shop_filters')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Search Filter */}
        <div className="space-y-2">
            <Label htmlFor="search-filter" className="font-medium">{t('shop_search')}</Label>
            <div className="relative">
                 <Input
                     id="search-filter"
                     placeholder={t('shop_search_placeholder')}
                     value={searchTerm}
                     onChange={handleSearchChange}
                     className="pr-8"
                 />
                 <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {/* Description removed for brevity in mobile view */}
        </div>

        <Separator />

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="font-medium">{t('shop_category')}</Label>
          <RadioGroup value={selectedCategory} onValueChange={handleCategoryChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="cat-all" />
              <Label htmlFor="cat-all" className="font-normal cursor-pointer">{t('shop_all_categories')}</Label>
            </div>
            {categories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <RadioGroupItem value={category.toLowerCase()} id={`cat-${category.toLowerCase()}`} />
                <Label htmlFor={`cat-${category.toLowerCase()}`} className="font-normal cursor-pointer">{category}</Label> {/* Category names usually not translated */}
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Brand Filter */}
        <div className="space-y-2">
          <Label className="font-medium">{t('shop_brand')}</Label>
          {brands.map(brand => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.toLowerCase()}`}
                checked={selectedBrands.includes(brand.toLowerCase())}
                onCheckedChange={(checked) => handleBrandChange(brand.toLowerCase(), checked)}
              />
              <Label htmlFor={`brand-${brand.toLowerCase()}`} className="font-normal cursor-pointer">{brand}</Label> {/* Brand names usually not translated */}
            </div>
          ))}
        </div>

        <Separator />

        {/* Price Filter */}
        <div className="space-y-2">
             <Label className="font-medium">{t('shop_price')}</Label>
             <div className="flex gap-2 items-center">
                 <Input
                     type="number"
                     placeholder={t('shop_min_price')}
                     value={minPrice}
                     onChange={(e) => handlePriceChange('min', e.target.value)}
                     className="w-full text-sm h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                     min="0"
                     step="1"
                 />
                 <span>-</span>
                 <Input
                     type="number"
                     placeholder={t('shop_max_price')}
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
                <Filter className="mr-2 h-4 w-4" /> {t('shop_apply_filters')}
             </Button>
             <Button variant="outline" onClick={clearFilters} className="flex-grow">
                 <X className="mr-2 h-4 w-4" /> {t('shop_clear_filters')}
             </Button>
         </div>

      </CardContent>
    </Card>
  );
}
