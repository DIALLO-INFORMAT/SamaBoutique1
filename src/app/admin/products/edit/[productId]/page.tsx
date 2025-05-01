'use client';

import { useEffect, useState } from 'react';
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
import { ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image'; // Import Image for display
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

// Define Zod schema for form validation (same as add product + optional image update)
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
  // newImage: z.instanceof(File).optional(), // Optional field for new image
});


// Mock product data type (ensure it matches API/DB)
interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string; // Added brand
  // imageUrl: string; // Add imageUrl if available
}

const ADMIN_PRODUCTS_STORAGE_KEY = 'admin_products'; // Use a consistent key for admin

// Mock data fetching function (replace with actual API call)
const fetchProductById = async (productId: string): Promise<AdminProduct | null> => {
    console.log(`Fetching product ${productId}...`);
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay

    // Try loading from localStorage first
    if (typeof window !== 'undefined') {
        const storedProducts = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
        const products: AdminProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
        const foundProduct = products.find(p => p.id === productId);
        if (foundProduct) return foundProduct;
    }

    // Fallback to initial mock data if not in localStorage (for initial setup/demo)
    const mockProducts: AdminProduct[] = [
        { id: '1', name: "T-Shirt Classique", description: "Un t-shirt confortable en coton.", price: 10000, category: "Vêtements", brand: "Marque A" },
        { id: '2', name: "Service de Conception Web", description: "Création de site web sur mesure.", price: 300000, category: "Services", brand: "SamaServices" },
        { id: '3', name: "Casquette Logo", description: "Casquette brodée avec logo.", price: 15000, category: "Accessoires", brand: "Marque B" },
        { id: '4', name: "Consultation Marketing", description: "1 heure de consultation stratégique.", price: 75000, category: "Services", brand: "SamaServices" },
        { id: '5', name: "Sweat à Capuche", description: "Sweat chaud et stylé.", price: 25000, category: "Vêtements", brand: "Marque A" },
        { id: '6', name: "Mug Personnalisé", description: "Mug avec votre design.", price: 8000, category: "Accessoires", brand: "Marque C" },
    ];
    return mockProducts.find(p => p.id === productId) || null;
};


// Simulate API call to update product
const updateProductAPI = async (productId: string, values: z.infer<ReturnType<typeof createProductSchema>>): Promise<void> => {
    console.log("Admin Updating Product via API:", productId, values);
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network request

    if (typeof window !== 'undefined') {
        const storedProducts = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
        let products: AdminProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
        products = products.map(p => p.id === productId ? { ...p, ...values, price: Number(values.price) } : p); // Ensure price is number
        localStorage.setItem(ADMIN_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
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
  const productId = params.productId as string; // Get productId from URL

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<AdminProduct | null>(null);

  const form = useForm<z.infer<ReturnType<typeof createProductSchema>>>({
    resolver: zodResolver(productSchema),
    defaultValues: { // Initialize with empty or default values
      name: "",
      description: "",
      price: 0,
      category: "",
      brand: "",
      // newImage: undefined,
    },
  });

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
            price: foundProduct.price, // Assume price is fetched in the correct unit
            category: foundProduct.category,
            brand: foundProduct.brand,
          });
        } else {
          toast({
            title: t('general_error'),
            description: t('admin_edit_product_not_found_description'),
            variant: "destructive",
          });
          router.replace('/admin/products'); // Use replace to avoid back button issues
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
  }, [productId, form, router, toast, t]); // Added t dependency


  async function onSubmit(values: z.infer<ReturnType<typeof createProductSchema>>) {
    if (!product) return;
    setIsSubmitting(true);

    try {
        // Ensure price is handled correctly (e.g., if input is in main unit, convert to smallest if needed)
        const priceToSave = values.price; // Assuming the input 'price' is already in the correct format/unit for saving
        await updateProductAPI(productId, { ...values, price: priceToSave });
        toast({
          title: t('admin_edit_product_toast_success_title'),
          description: t('admin_edit_product_toast_success_description', { productName: values.name }),
           className: "bg-primary text-primary-foreground border-primary",
        });
        router.push('/admin/products'); // Redirect back to the products list
    } catch (error) {
        console.error("Failed to update product:", error);
        toast({ title: t('general_error'), description: t('admin_edit_product_toast_error_description'), variant: "destructive" });
        setIsSubmitting(false); // Keep form enabled on error
    }
    // No need to set isSubmitting to false on success if redirecting
  }

  if (isLoading) {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
                 <Skeleton className="h-10 w-10 rounded-md" />
                 <Skeleton className="h-8 w-64" />
            </div>
             {[...Array(3)].map((_, i) => ( // Skeleton for 3 cards
                 <Card key={i} className="shadow-md border-border overflow-hidden">
                     <CardHeader className="bg-muted/30 border-b border-border px-6 py-4">
                          <Skeleton className="h-6 w-48" />
                     </CardHeader>
                     <CardContent className="p-6 space-y-6">
                          <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-24 w-full" />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <Skeleton className="h-10 w-full" />
                              <Skeleton className="h-10 w-full" />
                              <Skeleton className="h-10 w-full" />
                          </div>
                     </CardContent>
                 </Card>
             ))}
             <div className="flex justify-end pt-4">
                 <Skeleton className="h-10 w-36" />
             </div>
        </div>
    );
  }

   if (!product) {
       // This case should ideally be handled by the redirect in useEffect, but added for safety
       return <div className="text-center py-10"><p className="text-destructive">{t('admin_edit_product_not_found_description')}</p></div>;
   }


  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4 mb-6">
           <Link href="/admin/products" >
               <Button variant="outline" size="icon" aria-label={t('admin_add_product_back_button')}>
                   <ArrowLeft className="h-4 w-4" />
               </Button>
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
                 <CardHeader className="bg-muted/30 border-b border-border px-6 py-4">
                     <CardTitle>{t('admin_add_product_general_info_title')}</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-6">
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('admin_add_product_form_name')}</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: T-Shirt SamaBoutique" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                     <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('admin_add_product_form_description')}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Décrivez en détail votre produit ou service..."
                                className="resize-y min-h-[100px]"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                             <FormDescription className="text-right text-xs">
                                 {t('contact_form_char_count', { count: field.value?.length ?? 0 })}
                             </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                 </CardContent>
             </Card>

            {/* Pricing and Categorization Card */}
             <Card className="shadow-md border-border overflow-hidden">
                 <CardHeader className="bg-muted/30 border-b border-border px-6 py-4">
                     <CardTitle>{t('admin_add_product_pricing_category_title')}</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                     <FormField
                         control={form.control}
                         name="price"
                         render={({ field }) => (
                         <FormItem>
                             <FormLabel>{t('admin_add_product_form_price')}</FormLabel>
                             <FormControl>
                             {/* Using type="number" but without step="0.01" for whole numbers often used in XOF */}
                             <Input type="number" step="1" placeholder="0" {...field} />
                             </FormControl>
                             <FormMessage />
                         </FormItem>
                         )}
                     />
                     <FormField
                         control={form.control}
                         name="category"
                         render={({ field }) => (
                         <FormItem>
                             <FormLabel>{t('admin_add_product_form_category')}</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value}>
                             <FormControl>
                                 <SelectTrigger>
                                 <SelectValue placeholder={t('general_select_placeholder')} />
                                 </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                                 {categories.map(cat => (
                                     <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                 ))}
                             </SelectContent>
                             </Select>
                             <FormMessage />
                         </FormItem>
                         )}
                     />
                      <FormField
                         control={form.control}
                         name="brand"
                         render={({ field }) => (
                         <FormItem>
                             <FormLabel>{t('admin_add_product_form_brand')}</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value}>
                             <FormControl>
                                 <SelectTrigger>
                                 <SelectValue placeholder={t('general_select_placeholder')} />
                                 </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                                 {brands.map(brand => (
                                     <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                 ))}
                             </SelectContent>
                             </Select>
                             <FormMessage />
                         </FormItem>
                         )}
                     />
                 </CardContent>
            </Card>

            {/* Image Management Card */}
            <Card className="shadow-md border-border overflow-hidden">
                 <CardHeader className="bg-muted/30 border-b border-border px-6 py-4">
                     <CardTitle>{t('admin_add_product_image_title')}</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                      <div>
                          <p className="text-sm font-medium mb-2">{t('admin_edit_product_current_image_label')}</p>
                          <Image
                             src={`https://picsum.photos/seed/${product.id}/200/150`} // Placeholder
                             alt={product.name}
                             width={200}
                             height={150}
                             className="rounded-md border border-border object-cover"
                              data-ai-hint={product.category === 'Services' ? 'service tech icon' : product.name.toLowerCase().split(' ')[0]}
                           />
                      </div>
                     <FormItem>
                         <FormLabel htmlFor="product-image" className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                             <ImageIcon className="h-6 w-6"/>
                             <span>{t('admin_edit_product_change_image_label')}</span>
                         </FormLabel>
                         <FormControl>
                             <Input id="product-image" type="file" accept="image/*" className="sr-only" /* onChange={(e) => field.onChange(e.target.files?.[0])} */ />
                         </FormControl>
                         <FormDescription>
                             {t('admin_edit_product_image_description')}
                         </FormDescription>
                         <FormMessage />
                     </FormItem>
                      {/* Placeholder for new image preview */}
                       {/* {form.watch('newImage') && ( ... preview logic ... )} */}
                 </CardContent>
             </Card>


              <div className="flex justify-end pt-4">
                  <Button
                     type="submit"
                     className="w-full md:w-auto min-w-[200px]" // Ensure minimum width
                     variant="destructive"
                     disabled={isSubmitting}
                  >
                     {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           {t('admin_edit_product_submitting_button')}
                        </>
                     ) : (
                         t('admin_edit_product_submit_button')
                     )}
                  </Button>
              </div>
            </form>
          </Form>
    </div>
  );
}

