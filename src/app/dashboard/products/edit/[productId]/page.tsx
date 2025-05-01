
// src/app/dashboard/products/edit/[productId]/page.tsx (Manager's Edit Page)
'use client';

import { useEffect, useState, ChangeEvent } from 'react'; // Added ChangeEvent
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
// Select components are no longer needed for category/brand
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Image as ImageIcon, LinkIcon } from "lucide-react"; // Added LinkIcon
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Import Tabs


// Schema (same as admin edit page, using text input for category/brand)
const createProductSchema = (t: Function) => z.object({
  name: z.string().min(3, { message: t('dashboard_edit_product_form_name') + " " + t('validation_min_chars', { count: 3 }) }),
  description: z.string().min(10, { message: t('dashboard_edit_product_form_description') + " " + t('validation_min_chars', { count: 10 }) }).max(500, { message: t('dashboard_edit_product_form_description') + " " + t('validation_max_chars', { count: 500 }) }),
  price: z.coerce.number().positive({ message: t('dashboard_edit_product_form_price') + " " + t('validation_positive_number') }),
  category: z.string().min(1, { message: t('validation_required_field', { field: t('dashboard_edit_product_form_category') }) }), // Now a string input
  brand: z.string().min(2, { message: t('dashboard_edit_product_form_brand') + " " + t('validation_min_chars', { count: 2 }) }), // Now a string input
  imageUrl: z.string().url({ message: t('admin_add_product_form_image_url_invalid') }).or(z.literal('')).optional(),
  imageFile: z.instanceof(File).optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.imageUrl && data.imageFile) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('admin_add_product_form_image_source_error'), path: ["imageUrl"] });
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('admin_add_product_form_image_source_error'), path: ["imageFile"] });
  }
});

interface ManagerProduct { // Assuming same structure as AdminProduct
  id: string; name: string; description: string; price: number; category: string; brand: string; imageUrl?: string;
}

// Mock data fetching/updating (scoped for manager if needed)
// Use the same mock data source as admin for simplicity now
const ADMIN_PRODUCTS_STORAGE_KEY = 'admin_products'; // Use admin key for simplicity

const fetchManagerProductById = async (productId: string): Promise<ManagerProduct | null> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    if (typeof window === 'undefined') return null;

    const storedProducts = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
    const products: ManagerProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
    const product = products.find((p: ManagerProduct) => p.id === productId);
    // Ensure imageUrl exists or provide fallback
    if (product && !product.imageUrl) {
       product.imageUrl = `https://picsum.photos/seed/${productId}/400/300`;
    }
    return product || null;
};


const updateManagerProductAPI = async (productId: string, values: z.infer<ReturnType<typeof createProductSchema>>, originalImageUrl?: string): Promise<void> => {
    console.log("Manager updating Product via API:", productId, values);
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network request

    if (typeof window !== 'undefined') {
        const storedProducts = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
        let products: ManagerProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex !== -1) {
            const { imageFile, ...productDataToSave } = values;
            let finalImageUrl = originalImageUrl;

            if (values.imageUrl) {
                finalImageUrl = values.imageUrl;
            } else if (values.imageFile) {
                finalImageUrl = `https://picsum.photos/seed/prod-mgr-updated-${Date.now()}/400/300`; // Simulate upload
                console.log("Simulating manager image upload, using new picsum URL.");
            } else if (values.imageUrl === '') {
                finalImageUrl = undefined;
            }

            products[productIndex] = {
                ...products[productIndex],
                ...productDataToSave,
                price: Number(productDataToSave.price),
                imageUrl: finalImageUrl,
            };
            localStorage.setItem(ADMIN_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
        }
    }
};

// Removed static categories and brands arrays
// const categories = ["Vêtements", "Services", "Accessoires", "Autre"];
// const brands = ["Marque A", "Marque B", "Marque C", "SamaServices", "Autre"];

export default function ManagerEditProductPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation(); // Use translation hook
  const productId = params.productId as string;
  const productSchema = createProductSchema(t); // Create schema

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<ManagerProduct | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageSourceType, setImageSourceType] = useState<'url' | 'file'>('url');

  // Redirect or show error if not a manager
  useEffect(() => {
    if (!authLoading && user?.role !== 'manager') {
        toast({ title: t('dashboard_manager_unauthorized_access_toast_title'), description: t('dashboard_manager_unauthorized_access_toast_description'), variant: "destructive" });
        router.replace('/dashboard');
    }
  }, [user, authLoading, toast, router, t]); // Added t to dependency array

  const form = useForm<z.infer<ReturnType<typeof createProductSchema>>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: 0, category: "", brand: "", imageUrl: "", imageFile: null },
  });

   // Watch form values for preview updates (same as admin)
   const watchedImageUrl = form.watch('imageUrl');
   const watchedImageFile = form.watch('imageFile');
   useEffect(() => {
     if (imageSourceType === 'file' && watchedImageFile instanceof File) {
       const reader = new FileReader();
       reader.onloadend = () => setImagePreview(reader.result as string);
       reader.readAsDataURL(watchedImageFile);
     } else if (imageSourceType === 'url' && watchedImageUrl) {
       setImagePreview(watchedImageUrl);
     } else {
       setImagePreview(product?.imageUrl || null);
     }
   }, [watchedImageUrl, watchedImageFile, imageSourceType, product?.imageUrl]);


  // Fetch product data
  useEffect(() => {
    if (!productId || user?.role !== 'manager') return;
    setIsLoading(true);
    const loadProduct = async () => {
      try {
        const foundProduct = await fetchManagerProductById(productId);
        if (foundProduct) {
          setProduct(foundProduct);
          form.reset({
            name: foundProduct.name, description: foundProduct.description,
            price: foundProduct.price, category: foundProduct.category, brand: foundProduct.brand,
            imageUrl: foundProduct.imageUrl || '', imageFile: null
          });
           setImagePreview(foundProduct.imageUrl || null);
           setImageSourceType(foundProduct.imageUrl ? 'url' : 'file');
        } else {
          toast({ title: t('dashboard_edit_product_not_found_error'), variant: "destructive" });
          router.replace('/dashboard/products');
        }
      } catch (error) {
         toast({ title: t('dashboard_edit_product_toast_error_title'), description: "Impossible de charger le produit.", variant: "destructive" });
         router.replace('/dashboard/products');
      } finally { setIsLoading(false); }
    };
    loadProduct();
  }, [productId, user, form, router, toast, t]); // Added t

  async function onSubmit(values: z.infer<ReturnType<typeof createProductSchema>>) {
    if (!product) return;
    setIsSubmitting(true);
    try {
        const finalValues = { ...values };
        if (imageSourceType === 'url') finalValues.imageFile = null;
        else finalValues.imageUrl = '';

        await updateManagerProductAPI(productId, finalValues, product.imageUrl);
        toast({ title: t('dashboard_edit_product_toast_success_title'), description: t('dashboard_edit_product_toast_success_description', { productName: values.name }), className: "bg-primary text-primary-foreground border-primary" });
        router.push('/dashboard/products');
    } catch (error) {
        toast({ title: t('dashboard_edit_product_toast_error_title'), description: t('dashboard_edit_product_toast_error_description'), variant: "destructive" });
        setIsSubmitting(false);
    }
  }

  // Handlers for image management (same as admin)
   const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0];
     if (file) {
       form.setValue('imageFile', file, { shouldValidate: true });
       form.setValue('imageUrl', '', { shouldValidate: true });
       setImageSourceType('file');
     } else {
       form.setValue('imageFile', null, { shouldValidate: true });
       setImagePreview(product?.imageUrl || null);
     }
   };
   const handleImageUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
       const url = event.target.value;
       form.setValue('imageUrl', url, { shouldValidate: true });
       if (url) {
            form.setValue('imageFile', null, { shouldValidate: true });
            setImageSourceType('url');
       } else {
           setImagePreview(product?.imageUrl || null);
       }
   };
   const handleImageSourceChange = (value: string) => {
       const newType = value as 'url' | 'file';
       setImageSourceType(newType);
       if (newType === 'url') form.setValue('imageFile', null, { shouldValidate: true });
       else form.setValue('imageUrl', '', { shouldValidate: true });
        setImagePreview(product?.imageUrl || null);
   };


  // Render loading or unauthorized state
  if (isLoading || authLoading || !user) {
      return <div className="p-6"><Skeleton className="h-10 w-1/2 mb-4" /><Skeleton className="h-[500px] w-full" /></div>;
  }
  if (user.role !== 'manager') {
     // Message already shown by useEffect, avoid double rendering
     return null;
  }
  if (!product && !isLoading) { // Added check for product not found after loading
     return <div className="p-6 text-center text-destructive">{t('dashboard_edit_product_not_found_error')}</div>;
  }


  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4 mb-6">
           <Link href="/dashboard/products" > {/* Back to manager products */}
               <Button variant="outline" size="icon" aria-label={t('dashboard_edit_product_back_button')}><ArrowLeft className="h-4 w-4" /></Button>
           </Link>
           <div>
               <h1 className="text-3xl font-bold text-primary">{t('dashboard_edit_product_page_title')}</h1>
               <p className="text-muted-foreground">{t('dashboard_edit_product_description', { productName: product?.name || '...' })}</p>
           </div>
       </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* General Info Card */}
            <Card className="shadow-md border-border">
                 <CardHeader className="bg-muted/30 border-b"><CardTitle>{t('dashboard_edit_product_general_info_title')}</CardTitle></CardHeader>
                 <CardContent className="p-6 space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>{t('dashboard_edit_product_form_name')}</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>{t('dashboard_edit_product_form_description')}</FormLabel> <FormControl><Textarea rows={4} {...field} /></FormControl> <FormDescription className="text-right text-xs">{t('contact_form_char_count', { count: field.value?.length ?? 0 })}</FormDescription> <FormMessage /> </FormItem> )} />
                 </CardContent>
            </Card>

            {/* Pricing and Categorization Card */}
            <Card className="shadow-md border-border">
                 <CardHeader className="bg-muted/30 border-b"><CardTitle>{t('dashboard_edit_product_pricing_category_title')}</CardTitle></CardHeader>
                 <CardContent className="p-6 grid md:grid-cols-3 gap-6">
                     <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>{t('dashboard_edit_product_form_price')}</FormLabel> <FormControl><Input type="number" step="1" placeholder="0" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                     {/* Category Input */}
                     <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>{t('dashboard_edit_product_form_category')}</FormLabel> <FormControl><Input placeholder="Ex: Vêtements, Services" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                     {/* Brand Input */}
                     <FormField control={form.control} name="brand" render={({ field }) => ( <FormItem> <FormLabel>{t('dashboard_edit_product_form_brand')}</FormLabel> <FormControl><Input placeholder="Ex: Marque A, SamaServices" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 </CardContent>
            </Card>

            {/* Image Management Card */}
            <Card className="shadow-md border-border">
                 <CardHeader className="bg-muted/30 border-b"><CardTitle>{t('dashboard_edit_product_image_title')}</CardTitle></CardHeader>
                 <CardContent className="p-6 space-y-4">
                     {/* Image Preview */}
                     {imagePreview && (
                         <div className="mb-4">
                            <p className="text-sm font-medium mb-2">{t('admin_settings_form_preview_label')}</p>
                            <Image src={imagePreview} alt={product?.name || 'Aperçu'} width={200} height={150} className="rounded-md border object-cover" onError={() => setImagePreview(null)} />
                         </div>
                     )}
                     {!imagePreview && product?.imageUrl && (
                         <div className="mb-4">
                            <p className="text-sm font-medium mb-2">{t('dashboard_edit_product_current_image_label')}</p>
                            <Image src={product.imageUrl} alt={product.name} width={200} height={150} className="rounded-md border object-cover"/>
                         </div>
                     )}

                     {/* Tabs for URL / File */}
                     <Tabs value={imageSourceType} onValueChange={handleImageSourceChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="url">{t('admin_add_product_image_source_url')}</TabsTrigger>
                            <TabsTrigger value="file">{t('admin_add_product_image_source_file')}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="url">
                           <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1"><LinkIcon className="h-4 w-4"/> {t('admin_add_product_form_image_url')}</FormLabel>
                                    <FormControl><Input type="url" placeholder="https://.../image.png" {...field} onChange={handleImageUrlChange} /></FormControl>
                                    <FormDescription>{t('admin_add_product_form_image_url_desc')}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </TabsContent>
                        <TabsContent value="file">
                             <FormField control={form.control} name="imageFile" render={({ field: { value, onChange, ...fieldProps } }) => (
                                 <FormItem>
                                     <FormLabel htmlFor="product-image" className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                                         <ImageIcon className="h-6 w-6"/> <span>{t('dashboard_edit_product_change_image_label')}</span>
                                     </FormLabel>
                                     <FormControl>
                                         <Input id="product-image" type="file" accept="image/*" className="sr-only" onChange={handleImageFileChange} {...fieldProps} />
                                     </FormControl>
                                     <FormDescription>{t('dashboard_edit_product_image_description')}</FormDescription>
                                     <FormMessage />
                                 </FormItem>
                             )} />
                        </TabsContent>
                      </Tabs>
                 </CardContent>
            </Card>

              <div className="flex justify-end pt-4">
                  <Button type="submit" className="min-w-[200px]" variant="destructive" disabled={isSubmitting}>
                     {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('dashboard_edit_product_submitting_button')}</> : t('dashboard_edit_product_submit_button')}
                  </Button>
              </div>
        </form>
      </Form>
    </div>
  );
}
