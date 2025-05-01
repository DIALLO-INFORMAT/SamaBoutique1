
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
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

export function ShopSortControls() {
  const { t } = useTranslation(); // Use translation hook
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'name_asc';

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex justify-end items-center gap-2 mb-4">
        <SortAsc className="h-5 w-5 text-primary" />
        <Label htmlFor="sort-select" className="text-sm font-medium shrink-0">{t('shop_sort_by')}</Label>
        <Select onValueChange={handleSortChange} defaultValue={currentSort} value={currentSort}>
          <SelectTrigger id="sort-select" className="w-full sm:w-[180px] bg-background h-9 text-sm">
            <SelectValue placeholder={t('shop_sort_by')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">{t('shop_sort_name_asc')}</SelectItem>
            <SelectItem value="name_desc">{t('shop_sort_name_desc')}</SelectItem>
            <SelectItem value="price_asc">{t('shop_sort_price_asc')}</SelectItem>
            <SelectItem value="price_desc">{t('shop_sort_price_desc')}</SelectItem>
            {/* Add other sort options like 'newest', 'popularity' if needed */}
          </SelectContent>
        </Select>
      </div>
  );
}
