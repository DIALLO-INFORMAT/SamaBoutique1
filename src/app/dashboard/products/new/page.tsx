
// src/app/dashboard/products/new/page.tsx (Manager's Add Product Page)
'use client';

import { useState, useEffect, ChangeEvent } from 'react'; // Added ChangeEvent
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
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation
import Image from 'next/image'; // Import Image

// Schema (same as admin add page, using text input for category/brand)
const createProductSchema = (t: Function) => z.object({
  name: z.string().min(3, { message: t('dashboard_add_product_form_name') + " " + t('validation_min_chars', { count: 3 }) }),
  description: z.string().min(10, { message: t('dashboard_add_product_form_description') + " " + t('validation_min_chars', { count: 10 }) }).max(500, { message: t('dashboard_add_product_form_description') + " " + t('validation_max_chars', { count: 500 }) }),
  price: z.coerce.number().positive({ message: t('dashboard_add_product_form_price') + " " + t('validation_positive_number') }),
  category: z.string().min(1, { message: t('validation_required_field', { field: t('dashboard_add_product_form_category') }) }), // Now a string input
  brand: z.string().min(2, { message: t('dashboard_add_product_form_brand') + " " + t('validation_min_chars', { count: 2 }) }), // Now a string input
  image: z.instanceof(File).optional().nullable(),
});

// Removed static categories and brands arrays
// const categories = ["Vêtements", "Services", "Accessoires", "Autre"];
// const brands = ["Marque A", "Marque B", "Marque C", "SamaServices", "Autre"];

// Mock API call to add product (scoped for manager if necessary)
const addManagerProductAPI = async (values: z.infer<ReturnType<typeof createProductSchema>>, imageFile?: File | null): Promise<void> => {
    console.log("Manager adding Product via API:", values, "Image File:", imageFile?.name);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network request

    if (typeof window !== 'undefined') {
        let imageUrl = `https://picsum.photos/seed/prod-mgr-${Date.now()}/400/300`; // Fallback
        if (imageFile) {
            console.log("Simulating manager image upload, using fallback picsum URL.");
            // In a real app: const imageUrl = await uploadImage(imageFile);
        }

        const { image, ...productDataToSave } = values;
        const newProduct = {
             ...productDataToSave,
             id: `mgr-prod-${Date.now()}`,
             imageUrl: imageUrl,
             price: Number(productDataToSave.price),
         };

        const storageKey = 'admin_products'; // Using admin storage key for simplicity, can be 'manager_products'
        const storedProducts = localStorage.getItem(storageKey);
        const products = storedProducts ? JSON.parse(storedProducts) : [];
        products.push(newProduct);
        localStorage.setItem(storageKey, JSON.stringify(products));
    }
};


export default function ManagerAddProductPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useTranslation(); // Use translation hook
  const productSchema = createProductSchema(t); // Create schema
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // State for image preview

   // Redirect or show error if not a manager
  useEffect(() => {
    if (!authLoading && user?.role !== 'manager') {
        toast({ title: t('dashboard_manager_unauthorized_access_toast_title'), description: t('dashboard_manager_unauthorized_access_toast_description'), variant: "destructive" });
        router.replace('/dashboard'); // Redirect if not manager
    }
  }, [user, authLoading, toast, router, t]); // Added t to dependency array

  const form = useForm<z.infer<ReturnType<typeof createProductSchema>>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: 0, category: "", brand: "", image: null },
  });

  async function onSubmit(values: z.infer<ReturnType<typeof createProductSchema>>) {
    setIsSubmitting(true);
    try {
         const priceToSave = values.price; // Assuming input is correct unit
         await addManagerProductAPI(values, values.image); // Pass image file
        toast({
          title: t('dashboard_add_product_toast_success_title'),
          description: t('dashboard_add_product_toast_success_description', { productName: values.name }),
          className: "bg-primary text-primary-foreground border-primary",
        });
        router.push('/dashboard/products'); // Redirect back to manager's products list
    } catch (error) {
        console.error("Failed to add product:", error);
        toast({ title: t('dashboard_add_product_toast_error_title'), description: t('dashboard_add_product_toast_error_description'), variant: "destructive" });
        setIsSubmitting(false);
    }
  }

  // Handle image selection and preview (same as admin)
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0];
     if (file) {
       form.setValue('image', file);
       const reader = new FileReader();
       reader.onloadend = () => setImagePreview(reader.result as string);
       reader.readAsDataURL(file);
     } else {
       form.setValue('image', null);
       setImagePreview(null);
     }
   };


   // Render loading or unauthorized state
  if (authLoading || !user) {
      return <div className="p-6"><Skeleton className="h-10 w-1/2 mb-4" /><Skeleton className="h-96 w-full" /></div>;
  }

  if (user.role !== 'manager') {
     // Message already shown by useEffect, avoid double rendering
     return null;
  }

  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4 mb-6">
           <Link href="/dashboard/products" > {/* Link back to manager's product list */}
               <Button variant="outline" size="icon" aria-label={t('dashboard_add_product_back_button')}>
                   <ArrowLeft className="h-4 w-4" />
               </Button>
           </Link>
            <div>
                <h1 className="text-3xl font-bold text-primary">{t('dashboard_add_product_page_title')}</h1>
                <p className="text-muted-foreground">{t('dashboard_add_product_description')}</p>
            </div>
       </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General Info Card */}
          <Card className="shadow-md border-border overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border px-6 py-4">
              <CardTitle>{t('dashboard_add_product_general_info_title')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>{t('dashboard_add_product_form_name')}</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
               <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>{t('dashboard_add_product_form_description')}</FormLabel> <FormControl><Textarea rows={4} {...field} /></FormControl> <FormDescription className="text-right text-xs">{t('contact_form_char_count', { count: field.value?.length ?? 0 })}</FormDescription> <FormMessage /> </FormItem> )} />
            </CardContent>
          </Card>

          {/* Pricing and Categorization Card */}
          <Card className="shadow-md border-border overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border px-6 py-4">
                <CardTitle>{t('dashboard_add_product_pricing_category_title')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                 <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>{t('dashboard_add_product_form_price')}</FormLabel> <FormControl><Input type="number" step="1" placeholder="0" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 {/* Category Input */}
                 <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>{t('dashboard_add_product_form_category')}</FormLabel> <FormControl><Input placeholder="Ex: Vêtements, Services" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 {/* Brand Input */}
                 <FormField control={form.control} name="brand" render={({ field }) => ( <FormItem> <FormLabel>{t('dashboard_add_product_form_brand')}</FormLabel> <FormControl><Input placeholder="Ex: Marque A, SamaServices" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            </CardContent>
          </Card>

            {/* Image Upload Card */}
            <Card className="shadow-md border-border overflow-hidden">
                 <CardHeader className="bg-muted/30 border-b border-border px-6 py-4"> <CardTitle>{t('dashboard_add_product_image_title')}</CardTitle> </CardHeader>
                 <CardContent className="p-6 space-y-4">
                     {/* Image Preview */}
                     {imagePreview && (
                          <div className="mb-4">
                             <p className="text-sm font-medium mb-2">{t('admin_settings_form_preview_label')}</p>
                             <Image src={imagePreview} alt="Aperçu" width={200} height={150} className="rounded-md border object-cover"/>
                          </div>
                       )}
                     <FormField
                         control={form.control}
                         name="image"
                         render={({ field: { onChange, value, ...rest } }) => (
                             <FormItem>
                                 <FormLabel htmlFor="product-image" className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                                      <ImageIcon className="h-8 w-8"/> <span>{t('dashboard_add_product_image_label')}</span>
                                  </FormLabel>
                                 <FormControl><Input id="product-image" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} {...rest} /></FormControl>
                                 <FormDescription>{t('dashboard_add_product_image_description')}</FormDescription> <FormMessage />
                             </FormItem>
                         )}
                      />
                 </CardContent>
           </Card>

          <div className="flex justify-end pt-4">
              <Button type="submit" className="min-w-[150px]" variant="destructive" disabled={isSubmitting}>
                 {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('dashboard_add_product_submitting_button')}</> : t('dashboard_add_product_submit_button')}
              </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
