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
import { SortAsc } from 'lucide-react';

// Renamed from FilterSortControls
export function ShopSortControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Only handle sorting now
  const currentSort = searchParams.get('sort') || 'name_asc';

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams); // Keep existing filters
    params.set('sort', value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    // Simplified layout for only sorting
    <div className="flex justify-end items-center gap-2 mb-4">
        <SortAsc className="h-5 w-5 text-primary" />
        <Label htmlFor="sort-select" className="text-sm font-medium shrink-0">Trier par :</Label>
        <Select onValueChange={handleSortChange} defaultValue={currentSort} value={currentSort}>
          <SelectTrigger id="sort-select" className="w-full sm:w-[180px] bg-background h-9 text-sm">
            <SelectValue placeholder="Trier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Nom (A-Z)</SelectItem>
            <SelectItem value="name_desc">Nom (Z-A)</SelectItem>
            <SelectItem value="price_asc">Prix (Croissant)</SelectItem>
            <SelectItem value="price_desc">Prix (Décroissant)</SelectItem>
            {/* Add other sort options like 'newest', 'popularity' if needed */}
          </SelectContent>
        </Select>
      </div>
  );
}
