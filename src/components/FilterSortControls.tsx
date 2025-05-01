'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, SortAsc } from 'lucide-react';

export function FilterSortControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentFilter = searchParams.get('filter') || 'all';
  const currentSort = searchParams.get('sort') || 'name_asc';

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('filter', value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // In a real app, categories might come from the backend
  const categories = ['all', 'Vêtements', 'Services', 'Accessoires'];

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 bg-secondary rounded-lg shadow">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Filter className="h-5 w-5 text-primary" />
        <Label htmlFor="filter-select" className="text-sm font-medium shrink-0">Filtrer par :</Label>
        <Select onValueChange={handleFilterChange} defaultValue={currentFilter} value={currentFilter}>
          <SelectTrigger id="filter-select" className="w-full sm:w-[180px] bg-background">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category === 'all' ? 'Tout afficher' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <SortAsc className="h-5 w-5 text-primary" />
        <Label htmlFor="sort-select" className="text-sm font-medium shrink-0">Trier par :</Label>
        <Select onValueChange={handleSortChange} defaultValue={currentSort} value={currentSort}>
          <SelectTrigger id="sort-select" className="w-full sm:w-[180px] bg-background">
            <SelectValue placeholder="Trier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Nom (A-Z)</SelectItem>
            <SelectItem value="name_desc">Nom (Z-A)</SelectItem>
            <SelectItem value="price_asc">Prix (Croissant)</SelectItem>
            <SelectItem value="price_desc">Prix (Décroissant)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
