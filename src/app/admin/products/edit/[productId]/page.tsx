
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation'; // use useParams to get productId
import { ArrowLeft, Loader2, Image as ImageIcon, LinkIcon } from "lucide-react"; // Added LinkIcon
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image'; // Import Image for display
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Import Tabs


// Define Zod schema for form validation
const createProductSchema = (t: Function) => z.object({
  name: z.string().min(3, {
    message: t('admin_add_product_form_name') + " " + t('validation_min_chars', { count: 3 }),
  }),
  description: z.string().min(10, {
    message: t('admin_add_product_form_description') + " " + t('validation_min_chars', { count: 10 }),
  }).max(500, { message: t('admin_add_product_form_description') + " " + t('validation_max_chars', { count: 500 }) }),
  price: z.coerce.number().positive({
    message: t('admin_add_product_form_price') + " " + t('validation_positive_number'),
  }),
  category: z.string().min(1, { message: t('validation_required_field', { field: t('admin_add_product_form_category') }) }),
  brand: z.string().min(2, { message: t('admin_add_product_form_brand') + " " + t('validation_min_chars', { count: 2 }) }),
  imageUrl: z.string().url({ message: t('admin_add_product_form_image_url_invalid') }).or(z.literal('')).optional(), // Optional image URL
  imageFile: z.instanceof(File).optional().nullable(), // Optional image file upload
}).superRefine((data, ctx) => {
  // Ensure only one image source is provided if either is present
  if (data.imageUrl && data.imageFile) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('admin_add_product_form_image_source_error'),
      path: ["imageUrl"], // Or path: ["imageFile"]
    });
     ctx.addIssue({ // Add to both fields for clarity
       code: z.ZodIssueCode.custom,
       message: t('admin_add_product_form_image_source_error'),
       path: ["imageFile"],
     });
  }
});


// Mock product data type
interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string; // Added brand
  imageUrl?: string; // Optional existing image URL
}

const ADMIN_PRODUCTS_STORAGE_KEY = 'admin_products';

// Mock data fetching function
const fetchProductById = async (productId: string): Promise<AdminProduct | null> => {
    console.log(`Fetching product ${productId}...`);
    await new Promise(resolve => setTimeout(resolve, 700));

    if (typeof window !== 'undefined') {
        const storedProducts = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
        const products: AdminProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
        const foundProduct = products.find(p => p.id === productId);
        if (foundProduct) {
             // Simulate having an imageUrl if not present (using picsum)
             if (!foundProduct.imageUrl) {
                 foundProduct.imageUrl = `https://picsum.photos/seed/${productId}/400/300`;
             }
            return foundProduct;
        }
    }
    // Fallback if not in localStorage (should not happen if products are managed)
    return null;
};


// Simulate API call to update product
const updateProductAPI = async (productId: string, values: z.infer<ReturnType<typeof createProductSchema>>, originalImageUrl?: string): Promise<void> => {
    console.log("Admin Updating Product via API:", productId, values);
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network request

    if (typeof window !== 'undefined') {
        const storedProducts = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
        let products: AdminProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex !== -1) {
            // Create the updated product data excluding the file upload field
            const { imageFile, ...productDataToSave } = values;

            let finalImageUrl = originalImageUrl; // Start with the original URL

            if (values.imageUrl) {
                // If URL is provided, use it
                finalImageUrl = values.imageUrl;
            } else if (values.imageFile) {
                // If file is provided, simulate upload and get a new URL
                // In a real app, upload imageFile here and get a new imageUrl
                // For simulation, we'll just generate a new picsum URL
                finalImageUrl = `https://picsum.photos/seed/prod-updated-${Date.now()}/400/300`;
                console.log("Simulating image upload for update, using new picsum URL.");
            } else if (values.imageUrl === '') {
                 // If URL field is explicitly cleared (and no file uploaded), remove the image URL
                finalImageUrl = undefined;
            }

            products[productIndex] = {
                ...products[productIndex], // Keep existing fields like ID
                ...productDataToSave,    // Apply other form updates
                price: Number(productDataToSave.price), // Ensure price is number
                imageUrl: finalImageUrl, // Set the determined image URL
            };
            localStorage.setItem(ADMIN_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
        }
    }
};


// Example categories and brands
const categories = ["Vêtements", "Services", "Accessoires", "Autre"];
const brands = ["Marque A", "Marque B", "Marque C", "SamaServices", "Autre"];

export default function EditProductPage() {
  const { t } = useTranslation(); // Use translation hook
  const productSchema = createProductSchema(t); // Create schema
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // State for image preview
  const [imageSourceType, setImageSourceType] = useState<'url' | 'file'>('url'); // Default to URL

  const form = useForm<z.infer<ReturnType<typeof createProductSchema>>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", description: "", price: 0, category: "", brand: "",
      imageUrl: "", imageFile: null,
    },
  });

   // Watch form values for preview updates
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
         // If URL is empty or no file, show original product image or nothing
         setImagePreview(product?.imageUrl || null);
      }
    }, [watchedImageUrl, watchedImageFile, imageSourceType, product?.imageUrl]);


  // Fetch product data on mount
  useEffect(() => {
    if (!productId) return;
    setIsLoading(true);
    const loadProduct = async () => {
      try {
        const foundProduct = await fetchProductById(productId);
        if (foundProduct) {
          setProduct(foundProduct);
          // Reset form with fetched product data
          form.reset({
            name: foundProduct.name,
            description: foundProduct.description,
            price: foundProduct.price,
            category: foundProduct.category,
            brand: foundProduct.brand,
            imageUrl: foundProduct.imageUrl || '', // Pre-fill URL field
            imageFile: null, // Reset file field on load
          });
           setImagePreview(foundProduct.imageUrl || null); // Set initial preview
           // Decide initial source type based on existing URL
           setImageSourceType(foundProduct.imageUrl ? 'url' : 'file');
        } else {
          toast({ title: t('general_error'), description: t('admin_edit_product_not_found_description'), variant: "destructive" });
          router.replace('/admin/products');
        }
      } catch (error) {
         console.error("Failed to fetch product:", error);
         toast({ title: t('general_error'), description: t('admin_products_toast_load_error_description'), variant: "destructive" });
         router.replace('/admin/products');
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
    // Don't include imagePreview in dependencies to avoid loops
  }, [productId, form.reset, router, toast, t]);


  async function onSubmit(values: z.infer<ReturnType<typeof createProductSchema>>) {
    if (!product) return;
    setIsSubmitting(true);

    try {
        // Determine which image source to use based on the active tab/selection
        const finalValues = { ...values };
        if (imageSourceType === 'url') {
            finalValues.imageFile = null; // Clear file if URL is the source
        } else {
            finalValues.imageUrl = ''; // Clear URL if file is the source
        }

        await updateProductAPI(productId, finalValues, product.imageUrl);
        toast({
          title: t('admin_edit_product_toast_success_title'),
          description: t('admin_edit_product_toast_success_description', { productName: values.name }),
           className: "bg-primary text-primary-foreground border-primary",
        });
        router.push('/admin/products'); // Redirect back to the products list
    } catch (error) {
        console.error("Failed to update product:", error);
        toast({ title: t('general_error'), description: t('admin_edit_product_toast_error_description'), variant: "destructive" });
        setIsSubmitting(false);
    }
  }

    // Handle image file selection
   const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0];
     if (file) {
       form.setValue('imageFile', file, { shouldValidate: true }); // Set file and trigger validation
       form.setValue('imageUrl', '', { shouldValidate: true }); // Clear URL field
       setImageSourceType('file'); // Switch to file source
     } else {
       form.setValue('imageFile', null, { shouldValidate: true }); // Clear file
       // Revert preview to original product image if file is cleared
       setImagePreview(product?.imageUrl || null);
     }
   };

    // Handle Image URL input change
    const handleImageUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
        const url = event.target.value;
        form.setValue('imageUrl', url, { shouldValidate: true });
        if (url) {
             form.setValue('imageFile', null, { shouldValidate: true }); // Clear file field if URL is entered
             setImageSourceType('url');
        } else {
            // If URL is cleared, reset preview to original (or null)
            setImagePreview(product?.imageUrl || null);
        }
    };

    // Handle tab change for image source
    const handleImageSourceChange = (value: string) => {
        const newType = value as 'url' | 'file';
        setImageSourceType(newType);
        // Optionally clear the other field when switching tabs
        if (newType === 'url') {
            form.setValue('imageFile', null, { shouldValidate: true });
        } else {
            form.setValue('imageUrl', '', { shouldValidate: true });
        }
         setImagePreview(product?.imageUrl || null); // Reset preview on tab switch initially
    };


  if (isLoading) {
    return ( /* Skeleton loading state... */ );
  }
   if (!product) {
       return <div className="text-center py-10"><p className="text-destructive">{t('admin_edit_product_not_found_description')}</p></div>;
   }


  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4 mb-6">
           <Link href="/admin/products" >
               <Button variant="outline" size="icon" aria-label={t('admin_add_product_back_button')}> <ArrowLeft className="h-4 w-4" /> </Button>
           </Link>
            <div>
                <h1 className="text-3xl font-bold text-primary">{t('admin_edit_product_page_title')}</h1>
                <p className="text-muted-foreground">{t('admin_edit_product_description', { productName: product.name })}</p>
            </div>
       </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* General Info Card */}
            <Card className="shadow-md border-border overflow-hidden">
                 <CardHeader className="bg-muted/30 border-b border-border px-6 py-4"><CardTitle>{t('admin_add_product_general_info_title')}</CardTitle></CardHeader>
                 <CardContent className="p-6 space-y-6">
                     <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>{t('admin_add_product_form_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                     <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>{t('admin_add_product_form_description')}</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormDescription className="text-right text-xs">{t('contact_form_char_count', { count: field.value?.length ?? 0 })}</FormDescription><FormMessage /></FormItem> )}/>
                 </CardContent>
             </Card>

            {/* Pricing and Categorization Card */}
             <Card className="shadow-md border-border overflow-hidden">
                 <CardHeader className="bg-muted/30 border-b border-border px-6 py-4"><CardTitle>{t('admin_add_product_pricing_category_title')}</CardTitle></CardHeader>
                 <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                     <FormField control={form.control} name="price" render={({ field }) => ( <FormItem><FormLabel>{t('admin_add_product_form_price')}</FormLabel><FormControl><Input type="number" step="1" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                     <FormField control={form.control} name="category" render={({ field }) => ( <FormItem><FormLabel>{t('admin_add_product_form_category')}</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('general_select_placeholder')} /></SelectTrigger></FormControl><SelectContent>{categories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem> )}/>
                     <FormField control={form.control} name="brand" render={({ field }) => ( <FormItem><FormLabel>{t('admin_add_product_form_brand')}</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('general_select_placeholder')} /></SelectTrigger></FormControl><SelectContent>{brands.map(brand => (<SelectItem key={brand} value={brand}>{brand}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem> )}/>
                 </CardContent>
            </Card>

            {/* Image Management Card */}
            <Card className="shadow-md border-border overflow-hidden">
                 <CardHeader className="bg-muted/30 border-b border-border px-6 py-4"><CardTitle>{t('admin_add_product_image_title')}</CardTitle></CardHeader>
                 <CardContent className="p-6 space-y-4">
                       {/* Image Preview */}
                       {imagePreview && (
                          <div className="mb-4">
                             <p className="text-sm font-medium mb-2">{t('admin_settings_form_preview_label')}</p>
                             <Image src={imagePreview} alt={product.name} width={200} height={150} className="rounded-md border border-border object-cover" onError={() => setImagePreview(null)} />
                          </div>
                       )}
                        {!imagePreview && product?.imageUrl && (
                            <div className="mb-4">
                                 <p className="text-sm font-medium mb-2">{t('admin_edit_product_current_image_label')}</p>
                                 <Image src={product.imageUrl} alt={product.name} width={200} height={150} className="rounded-md border border-border object-cover"/>
                            </div>
                        )}

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
                                         <ImageIcon className="h-6 w-6"/> <span>{t('admin_edit_product_change_image_label')}</span>
                                     </FormLabel>
                                     <FormControl>
                                         <Input id="product-image" type="file" accept="image/*" className="sr-only" onChange={handleImageFileChange} {...fieldProps} />
                                     </FormControl>
                                     <FormDescription>{t('admin_edit_product_image_description')}</FormDescription>
                                     <FormMessage />
                                 </FormItem>
                             )} />
                        </TabsContent>
                      </Tabs>
                 </CardContent>
             </Card>


              <div className="flex justify-end pt-4">
                  <Button type="submit" className="w-full md:w-auto min-w-[200px]" variant="destructive" disabled={isSubmitting} >
                     {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('admin_edit_product_submitting_button')}</>) : ( t('admin_edit_product_submit_button') )}
                  </Button>
              </div>
            </form>
          </Form>
    </div>
  );
}



    