
// src/components/LanguageSwitcher.tsx
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale, availableLocales } from '@/context/LocaleContext';
import { Globe } from "lucide-react";

const localeLabels: Record<string, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const handleLocaleChange = (newLocale: string) => {
    // Ensure the selected value is a valid Locale type before setting
    if (availableLocales.includes(newLocale as any)) {
        setLocale(newLocale as any);
    }
  };

  return (
     <Select onValueChange={handleLocaleChange} defaultValue={locale} value={locale}>
      <SelectTrigger className="w-auto h-9 px-2 bg-secondary text-secondary-foreground border-border text-xs sm:text-sm gap-1">
         <Globe className="h-4 w-4"/>
        <SelectValue placeholder="Langue" />
      </SelectTrigger>
      <SelectContent>
        {availableLocales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {localeLabels[loc] || loc.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
