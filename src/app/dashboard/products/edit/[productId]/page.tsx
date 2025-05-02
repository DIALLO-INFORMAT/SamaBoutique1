// src/app/dashboard/products/edit/[productId]/page.tsx (Manager's Edit Page)
'use client';

import { useEffect, useState, ChangeEvent } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Image as ImageIcon, LinkIcon, Percent } from "lucide-react"; // Added Percent
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdminProduct, Category, Tag } from '@/lib/types'; // Use AdminProduct, add Category, Tag
import { MultiSelect } from '@/components/ui/multi-select'; // Import MultiSelect
import { Switch } from '@/components/ui/switch'; // Import Switch


// --- Zod Schema Update ---
const createProductSchema = (t: Function) => z.object({
  name: z.string().min(3, { message: t('dashboard_edit_product_form_name') + " " + t('validation_min_chars', { count: 3 }) }),
  description: z.string().min(10, { message: t('dashboard_edit_product_form_description') + " " + t('validation_min_chars', { count: 10 }) }).max(500, { message: t('dashboard_edit_product_form_description') + " " + t('validation_max_chars', { count: 500 }) }),
  price: z.coerce.number().positive({ message: t('dashboard_edit_product_form_price') + " " + t('validation_positive_number') }),
  category: z.string().min(1, { message: t('validation_required_field', { field: t('dashboard_edit_product_form_category') }) }),
  tags: z.array(z.string()).optional(), // Array of tag IDs/names
  imageUrl: z.string().url({ message: t('admin_add_product_form_image_url_invalid') }).or(z.literal('')).optional(),
  imageFile: z.instanceof(File).optional().nullable(),
  isOnSale: z.boolean().default(false), // Add isOnSale field
}).superRefine((data, ctx) => {
  if (data.imageUrl && data.imageFile) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('admin_add_product_form_image_source_error'), path: ["imageUrl"] });
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('admin_add_product_form_image_source_error'), path: ["imageFile"] });
  }
});

// Storage keys (use admin keys for simplicity)
const ADMIN_PRODUCTS_STORAGE_KEY = 'admin_products';
const CATEGORIES_STORAGE_KEY = 'sama_boutique_categories';
const TAGS_STORAGE_KEY = 'sama_boutique_tags';

// --- Mock Data Fetching (Use admin versions) ---
const fetchProductById = async (productId: string): Promise<AdminProduct | null> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    if (typeof window === 'undefined') return null;
    const storedProducts = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
    const products: AdminProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
    const product = products.find((p: AdminProduct) => p.id === productId);
    if (product && !product.imageUrl) product.imageUrl = `https://picsum.photos/seed/${productId}/400/300`;
    return product || null;
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

// Use admin update API
const updateProductAPI = async (productId: string, values: z.infer<ReturnType<typeof createProductSchema>>, originalImageUrl?: string): Promise<void> => {
    console.log("Manager updating Product via API:", productId, values);
    await new Promise(resolve => setTimeout(resolve, 1200));
    if (typeof window !== 'undefined') {
        const storedProducts = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
        let products: AdminProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            const { imageFile, ...productDataToSave } = values;
            let finalImageUrl = originalImageUrl;
            if (values.imageUrl) finalImageUrl = values.imageUrl;
            else if (values.imageFile) finalImageUrl = `https://picsum.photos/seed/prod-mgr-updated-${Date.now()}/400/300`;
            else if (values.imageUrl === '') finalImageUrl = undefined;
            products[productIndex] = {
                ...products[productIndex], ...productDataToSave,
                price: Number(productDataToSave.price), imageUrl: finalImageUrl,
                tags: values.tags || [], // Ensure tags array exists
                isOnSale: values.isOnSale, // Save promotion status
            };
            localStorage.setItem(ADMIN_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
        }
    }
};


export default function ManagerEditProductPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const productId = params.productId as string;
  const productSchema = createProductSchema(t);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageSourceType, setImageSourceType] = useState<'url' | 'file'>('url');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingTaxonomies, setIsLoadingTaxonomies] = useState(true); // Separate loading for taxonomies

  // Redirect or show error if not a manager
  useEffect(() => {
    if (!authLoading && user?.role !== 'manager') {
        toast({ title: t('dashboard_manager_unauthorized_access_toast_title'), description: t('dashboard_manager_unauthorized_access_toast_description'), variant: "destructive" });
        router.replace('/dashboard');
    }
  }, [user, authLoading, toast, router, t]);

  const form = useForm<z.infer<ReturnType<typeof createProductSchema>>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: 0, category: "", tags: [], imageUrl: "", imageFile: null, isOnSale: false }, // Default isOnSale
  });

   // Watch form values for preview updates
   const watchedImageUrl = form.watch('imageUrl');
   const watchedImageFile = form.watch('imageFile');
   useEffect(() => {
     if (imageSourceType === 'file' && watchedImageFile instanceof File) { const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result as string); reader.readAsDataURL(watchedImageFile); }
     else if (imageSourceType === 'url' && watchedImageUrl) { setImagePreview(watchedImageUrl); }
     else { setImagePreview(product?.imageUrl || null); }
   }, [watchedImageUrl, watchedImageFile, imageSourceType, product?.imageUrl]);


  // Fetch product, categories, and tags data
  useEffect(() => {
    if (!productId || user?.role !== 'manager') return;
    setIsLoading(true);
    setIsLoadingTaxonomies(true); // Start loading taxonomies too
    const loadData = async () => {
      try {
        const [foundProduct, fetchedCategories, fetchedTags] = await Promise.all([
            fetchProductById(productId),
            fetchCategories(),
            fetchTags()
        ]);
        setCategories(fetchedCategories);
        setTags(fetchedTags);
        setIsLoadingTaxonomies(false); // Finish loading taxonomies

        if (foundProduct) {
          setProduct(foundProduct);
          form.reset({
            name: foundProduct.name, description: foundProduct.description, price: foundProduct.price,
            category: foundProduct.category,
            tags: foundProduct.tags || [], // Initialize tags
            imageUrl: foundProduct.imageUrl || '', imageFile: null,
            isOnSale: foundProduct.isOnSale || false, // Initialize isOnSale
          });
           setImagePreview(foundProduct.imageUrl || null);
           setImageSourceType(foundProduct.imageUrl ? 'url' : 'file');
        } else {
          toast({ title: t('dashboard_edit_product_not_found_error'), variant: "destructive" });
          router.replace('/dashboard/products');
        }
      } catch (error) {
         toast({ title: t('dashboard_edit_product_toast_error_title'), description: "Impossible de charger les données.", variant: "destructive" });
         router.replace('/dashboard/products');
         setIsLoadingTaxonomies(false); // Also stop loading taxonomies on error
      } finally { setIsLoading(false); } // Finish loading product data
    };
    loadData();
  }, [productId, user, form, router, toast, t]); // form.reset removed


  async function onSubmit(values: z.infer<ReturnType<typeof createProductSchema>>) {
    if (!product) return;
    setIsSubmitting(true);
    try {
        const finalValues = { ...values };
        if (imageSourceType === 'url') finalValues.imageFile = null;
        else finalValues.imageUrl = '';
        await updateProductAPI(productId, finalValues, product.imageUrl);
        toast({ title: t('dashboard_edit_product_toast_success_title'), description: t('dashboard_edit_product_toast_success_description', { productName: values.name }), className: "bg-primary text-primary-foreground border-primary" });
        router.push('/dashboard/products');
    } catch (error) {
        toast({ title: t('dashboard_edit_product_toast_error_title'), description: t('dashboard_edit_product_toast_error_description'), variant: "destructive" });
        setIsSubmitting(false);
    }
  }

  // Image Management Handlers (same as admin)
   const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) { form.setValue('imageFile', file, { shouldValidate: true }); form.setValue('imageUrl', '', { shouldValidate: true }); setImageSourceType('file'); } else { form.setValue('imageFile', null, { shouldValidate: true }); setImagePreview(product?.imageUrl || null); } };
   const handleImageUrlChange = (event: ChangeEvent<HTMLInputElement>) => { const url = event.target.value; form.setValue('imageUrl', url, { shouldValidate: true }); if (url) { form.setValue('imageFile', null, { shouldValidate: true }); setImageSourceType('url'); } else { setImagePreview(product?.imageUrl || null); } };
   const handleImageSourceChange = (value: string) => { const newType = value as 'url' | 'file'; setImageSourceType(newType); if (newType === 'url') form.setValue('imageFile', null, { shouldValidate: true }); else form.setValue('imageUrl', '', { shouldValidate: true }); setImagePreview(product?.imageUrl || null); };

   // Prepare options for Select components
   const categoryOptions = categories.map(cat => ({ value: cat.name, label: cat.name }));
   const tagOptions = tags.map(tag => ({ value: tag.name, label: tag.name }));


  // Render loading or unauthorized state
  if (isLoading || authLoading || !user) {
      return <div className="p-6"><Skeleton className="h-10 w-1/2 mb-4" /><Skeleton className="h-[500px] w-full" /></div>;
  }
  if (user.role !== 'manager') return null;
  if (!product && !isLoading) return <div className="p-6 text-center text-destructive">{t('dashboard_edit_product_not_found_error')}</div>;


  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4 mb-6">
           <Link href="/dashboard/products" ><Button variant="outline" size="icon" aria-label={t('dashboard_edit_product_back_button')}><ArrowLeft className="h-4 w-4" /></Button></Link>
           <div><h1 className="text-3xl font-bold text-primary">{t('dashboard_edit_product_page_title')}</h1><p className="text-muted-foreground">{t('dashboard_edit_product_description', { productName: product?.name || '...' })}</p></div>
       </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* General Info Card */}
            <Card className="shadow-md border-border">
                 <CardHeader className="bg-muted/30 border-b"><CardTitle>{t('dashboard_edit_product_general_info_title')}</CardTitle></CardHeader>
                 <CardContent className="p-6 space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>{t('dashboard_edit_product_form_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>{t('dashboard_edit_product_form_description')}</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormDescription className="text-right text-xs">{t('contact_form_char_count', { count: field.value?.length ?? 0 })}</FormDescription><FormMessage /></FormItem> )} />
                 </CardContent>
            </Card>

            {/* Pricing, Categorization, Tags, Promotion Card */}
            <Card className="shadow-md border-border">
                 <CardHeader className="bg-muted/30 border-b"><CardTitle>{t('dashboard_edit_product_pricing_category_title')}</CardTitle></CardHeader>
                 <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                     <FormField control={form.control} name="price" render={({ field }) => ( <FormItem><FormLabel>{t('dashboard_edit_product_form_price')}</FormLabel><FormControl><Input type="number" step="1" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem> )} />
                     {/* Category Select */}
                     <FormField control={form.control} name="category" render={({ field }) => (
                         <FormItem>
                             <FormLabel>{t('dashboard_add_product_form_category')}</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingTaxonomies}>
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
                             <FormLabel>{t('dashboard_add_product_form_tags')}</FormLabel>
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

            {/* Image Management Card */}
            <Card className="shadow-md border-border">
                 <CardHeader className="bg-muted/30 border-b"><CardTitle>{t('dashboard_edit_product_image_title')}</CardTitle></CardHeader>
                 <CardContent className="p-6 space-y-4">
                     {imagePreview && <div className="mb-4"><p className="text-sm font-medium mb-2">{t('admin_settings_form_preview_label')}</p><Image src={imagePreview} alt={product?.name || 'Aperçu'} width={200} height={150} className="rounded-md border object-cover" onError={() => setImagePreview(null)} /></div>}
                     {!imagePreview && product?.imageUrl && <div className="mb-4"><p className="text-sm font-medium mb-2">{t('dashboard_edit_product_current_image_label')}</p><Image src={product.imageUrl} alt={product.name} width={200} height={150} className="rounded-md border object-cover"/></div>}
                     <Tabs value={imageSourceType} onValueChange={handleImageSourceChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4"><TabsTrigger value="url">{t('admin_add_product_image_source_url')}</TabsTrigger><TabsTrigger value="file">{t('admin_add_product_image_source_file')}</TabsTrigger></TabsList>
                        <TabsContent value="url"><FormField control={form.control} name="imageUrl" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-1"><LinkIcon className="h-4 w-4"/> {t('admin_add_product_form_image_url')}</FormLabel><FormControl><Input type="url" placeholder="https://.../image.png" {...field} onChange={handleImageUrlChange} /></FormControl><FormDescription>{t('admin_add_product_form_image_url_desc')}</FormDescription><FormMessage /></FormItem> )}/></TabsContent>
                        <TabsContent value="file"><FormField control={form.control} name="imageFile" render={({ field: { value, onChange, ...fieldProps } }) => ( <FormItem><FormLabel htmlFor="product-image" className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"><ImageIcon className="h-6 w-6"/> <span>{t('dashboard_edit_product_change_image_label')}</span></FormLabel><FormControl><Input id="product-image" type="file" accept="image/*" className="sr-only" onChange={handleImageFileChange} {...fieldProps} /></FormControl><FormDescription>{t('dashboard_edit_product_image_description')}</FormDescription><FormMessage /></FormItem> )} /></TabsContent>
                      </Tabs>
                 </CardContent>
            </Card>

              <div className="flex justify-end pt-4">
                  <Button type="submit" className="min-w-[200px]" variant="destructive" disabled={isSubmitting || isLoadingTaxonomies}>
                     {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('dashboard_edit_product_submitting_button')}</> : t('dashboard_edit_product_submit_button')}
                  </Button>
              </div>
        </form>
      </Form>
    </div>
  );
}
