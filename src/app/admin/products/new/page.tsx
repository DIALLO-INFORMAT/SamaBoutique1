// src/app/admin/products/new/page.tsx
'use client';

import { useState, useEffect, ChangeEvent } from 'react'; // Import useEffect
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Image as ImageIcon, Percent } from "lucide-react"; // Added Percent icon
import Link from "next/link";
import { useTranslation } from '@/hooks/useTranslation';
import Image from 'next/image';
import type { AdminProduct, Category, Tag } from '@/lib/types'; // Import types
import { MultiSelect } from '@/components/ui/multi-select'; // Import MultiSelect
import { Switch } from '@/components/ui/switch'; // Import Switch

// --- Zod Schema Update ---
const createProductSchema = (t: Function) => z.object({
  name: z.string().min(3, { message: t('admin_add_product_form_name') + " " + t('validation_min_chars', { count: 3 }) }),
  description: z.string().min(10, { message: t('admin_add_product_form_description') + " " + t('validation_min_chars', { count: 10 }) }).max(500, { message: t('admin_add_product_form_description') + " " + t('validation_max_chars', { count: 500 }) }),
  price: z.coerce.number().positive({ message: t('admin_add_product_form_price') + " " + t('validation_positive_number') }),
  category: z.string().min(1, { message: t('validation_required_field', { field: t('admin_add_product_form_category') }) }), // Required category ID/name
  tags: z.array(z.string()).optional(), // Array of tag IDs/names
  image: z.instanceof(File).optional().nullable(),
  isOnSale: z.boolean().default(false), // Add isOnSale field
});

// Storage keys
const ADMIN_PRODUCTS_STORAGE_KEY = 'admin_products';
const CATEGORIES_STORAGE_KEY = 'sama_boutique_categories';
const TAGS_STORAGE_KEY = 'sama_boutique_tags';

// --- Mock API Functions ---
const addProductAPI = async (values: z.infer<ReturnType<typeof createProductSchema>>, imageFile?: File | null): Promise<void> => {
     console.log("Admin Adding Product via API:", values, "Image File:", imageFile?.name);
     await new Promise(resolve => setTimeout(resolve, 1500));

     if (typeof window !== 'undefined') {
         let imageUrl = `https://picsum.photos/seed/prod-${Date.now()}/400/300`;
         if (imageFile) console.log("Simulating image upload, using fallback picsum URL for storage.");

         const { image, ...productDataToSave } = values;
         const newProduct: AdminProduct = {
             ...productDataToSave,
             id: `prod-${Date.now()}`,
             imageUrl: imageUrl,
             price: Number(productDataToSave.price),
             tags: values.tags || [], // Ensure tags array exists
             isOnSale: values.isOnSale, // Save promotion status
         };
         const storedProducts = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
         const products = storedProducts ? JSON.parse(storedProducts) : [];
         products.push(newProduct);
         localStorage.setItem(ADMIN_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
     }
};

const fetchCategories = async (): Promise<Category[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

const fetchTags = async (): Promise<Tag[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(TAGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export default function AddProductPage() {
  const { t } = useTranslation();
  const productSchema = createProductSchema(t);
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingTaxonomies, setIsLoadingTaxonomies] = useState(true);

  const form = useForm<z.infer<ReturnType<typeof createProductSchema>>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", description: "", price: 0, category: "",
      tags: [], image: null, isOnSale: false, // Default isOnSale to false
    },
  });

  // Fetch categories and tags on mount
  useEffect(() => {
      const loadTaxonomies = async () => {
          setIsLoadingTaxonomies(true);
          try {
              const [fetchedCategories, fetchedTags] = await Promise.all([
                  fetchCategories(),
                  fetchTags()
              ]);
              setCategories(fetchedCategories);
              setTags(fetchedTags);
          } catch (error) {
              toast({ title: t('general_error'), description: "Impossible de charger les catégories/étiquettes.", variant: "destructive" });
          } finally {
              setIsLoadingTaxonomies(false);
          }
      };
      loadTaxonomies();
  }, [toast, t]);

  async function onSubmit(values: z.infer<ReturnType<typeof createProductSchema>>) {
    setIsSubmitting(true);
    try {
        await addProductAPI(values, values.image);
        toast({ title: t('admin_add_product_toast_success_title'), description: t('admin_add_product_toast_success_description', { productName: values.name }), className: "bg-primary text-primary-foreground border-primary" });
        router.push('/admin/products');
    } catch (error) {
        console.error("Failed to add product:", error);
        toast({ title: t('general_error'), description: t('admin_add_product_toast_error_description'), variant: "destructive" });
        setIsSubmitting(false);
    }
  }

   // Handle image selection and preview
   const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0];
     if (file) { form.setValue('image', file); const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result as string); reader.readAsDataURL(file); }
     else { form.setValue('image', null); setImagePreview(null); }
   };

   // Prepare options for Select components
   const categoryOptions = categories.map(cat => ({ value: cat.name, label: cat.name })); // Using name as value for simplicity
   const tagOptions = tags.map(tag => ({ value: tag.name, label: tag.name })); // Using name as value


  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4 mb-6">
           <Link href="/admin/products" ><Button variant="outline" size="icon" aria-label={t('admin_add_product_back_button')}><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div><h1 className="text-3xl font-bold text-primary">{t('admin_add_product_page_title')}</h1><p className="text-muted-foreground">{t('admin_add_product_description')}</p></div>
       </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General Info Card */}
          <Card className="shadow-md border-border overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border px-6 py-4"><CardTitle>{t('admin_add_product_general_info_title')}</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>{t('admin_add_product_form_name')}</FormLabel><FormControl><Input placeholder="Ex: T-Shirt SamaBoutique" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>{t('admin_add_product_form_description')}</FormLabel><FormControl><Textarea placeholder="Décrivez en détail votre produit ou service..." rows={4} {...field} /></FormControl><FormDescription className="text-right text-xs">{t('contact_form_char_count', { count: field.value?.length ?? 0 })}</FormDescription><FormMessage /></FormItem> )}/>
            </CardContent>
          </Card>

          {/* Pricing, Categorization, Tags, Promotion Card */}
          <Card className="shadow-md border-border overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border px-6 py-4"><CardTitle>{t('admin_add_product_pricing_category_title')}</CardTitle></CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                 <FormField control={form.control} name="price" render={({ field }) => ( <FormItem><FormLabel>{t('admin_add_product_form_price')}</FormLabel><FormControl><Input type="number" step="1" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                 {/* Category Select */}
                 <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('admin_add_product_form_category')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingTaxonomies}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingTaxonomies ? t('loading') : t('admin_add_product_form_category_select')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categoryOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                 )}/>
                 {/* Tags MultiSelect */}
                 <FormField control={form.control} name="tags" render={({ field }) => (
                     <FormItem className="md:col-span-2">
                         <FormLabel>{t('admin_add_product_form_tags')}</FormLabel>
                         <FormControl>
                             <MultiSelect
                                 options={tagOptions}
                                 selected={field.value || []}
                                 onChange={field.onChange}
                                 placeholder={isLoadingTaxonomies ? t('loading') : t('admin_add_product_form_tags_select')}
                                 className="w-full"
                                 triggerClassName="min-h-10 h-auto"
                                 disabled={isLoadingTaxonomies}
                             />
                         </FormControl>
                         <FormMessage />
                     </FormItem>
                 )}/>
                  {/* Promotion Switch */}
                 <FormField
                     control={form.control}
                     name="isOnSale"
                     render={({ field }) => (
                     <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 md:col-span-2">
                         <div className="space-y-0.5">
                             <FormLabel className="text-base flex items-center gap-2"><Percent className="h-4 w-4"/> Mettre en Promotion</FormLabel>
                             <FormDescription>Activer pour afficher une étiquette "Promo" sur le produit.</FormDescription>
                         </div>
                         <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                     </FormItem>
                     )}
                 />
            </CardContent>
          </Card>

            {/* Image Upload Card */}
            <Card className="shadow-md border-border overflow-hidden">
                 <CardHeader className="bg-muted/30 border-b border-border px-6 py-4"><CardTitle>{t('admin_add_product_image_title')}</CardTitle></CardHeader>
                 <CardContent className="p-6 space-y-4">
                      {imagePreview && <div className="mb-4"><p className="text-sm font-medium mb-2">{t('admin_settings_form_preview_label')}</p><Image src={imagePreview} alt="Aperçu de l'image" width={200} height={150} className="rounded-md border border-border object-cover"/></div>}
                     <FormField control={form.control} name="image" render={({ field: { onChange, value, ...rest } }) => (
                         <FormItem>
                             <FormLabel htmlFor="product-image" className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"> <ImageIcon className="h-8 w-8"/> <span>{t('admin_add_product_image_label')}</span> </FormLabel>
                             <FormControl><Input id="product-image" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} {...rest} /></FormControl>
                             <FormDescription>{t('admin_add_product_image_description')}</FormDescription><FormMessage />
                         </FormItem>
                     )}/>
                 </CardContent>
           </Card>

          <div className="flex justify-end pt-4">
              <Button type="submit" className="w-full md:w-auto min-w-[150px]" variant="destructive" disabled={isSubmitting || isLoadingTaxonomies}>
                 {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('admin_add_product_submitting_button')}</>) : (t('admin_add_product_submit_button'))}
              </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
