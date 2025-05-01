
'use client';

import { useState, ChangeEvent } from 'react'; // Import useState, ChangeEvent
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
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react"; // Added Loader2, ImageIcon
import Link from "next/link";
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation
import Image from 'next/image'; // Import Image for preview

// Define Zod schema for form validation
const createProductSchema = (t: Function) => z.object({
  name: z.string().min(3, {
    message: t('admin_add_product_form_name') + " " + t('validation_min_chars', { count: 3 }),
  }),
  description: z.string().min(10, {
    message: t('admin_add_product_form_description') + " " + t('validation_min_chars', { count: 10 }),
  }).max(500, { message: t('admin_add_product_form_description') + " " + t('validation_max_chars', { count: 500 }) }),
  price: z.coerce.number().positive({ // coerce converts string input to number
    message: t('admin_add_product_form_price') + " " + t('validation_positive_number'),
  }),
  category: z.string().min(1, { message: t('validation_required_field', { field: t('admin_add_product_form_category') }) }),
  brand: z.string().min(2, { message: t('admin_add_product_form_brand') + " " + t('validation_min_chars', { count: 2 }) }), // Added brand
  image: z.instanceof(File).optional().nullable(), // Optional image upload, allow null
});

// Example categories and brands - fetch or define elsewhere in a real app
const categories = ["Vêtements", "Services", "Accessoires", "Autre"];
const brands = ["Marque A", "Marque B", "Marque C", "SamaServices", "Autre"]; // Example brands

const ADMIN_PRODUCTS_STORAGE_KEY = 'admin_products'; // Use a consistent key for admin

// Mock API function to add product (now accepts imageFile, but won't store it)
const addProductAPI = async (values: z.infer<ReturnType<typeof createProductSchema>>, imageFile?: File | null): Promise<void> => {
     console.log("Admin Adding Product via API:", values, "Image File:", imageFile?.name);
     await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network request

     if (typeof window !== 'undefined') {
         // NOTE: In a real app, upload imageFile here and get back a URL
         // const imageUrl = await uploadImage(imageFile); // Your upload function

         // Create the product data excluding the 'image' field
         const { image, ...productDataToSave } = values;

         const newProduct = {
             ...productDataToSave,
             id: `prod-${Date.now()}`,
             // imageUrl: imageUrl || `https://picsum.photos/seed/prod-${Date.now()}/400/300`, // Use uploaded URL or fallback
             imageUrl: `https://picsum.photos/seed/prod-${Date.now()}/400/300`, // Simulation fallback
         };
         const storedProducts = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
         const products = storedProducts ? JSON.parse(storedProducts) : [];
         products.push(newProduct);
         localStorage.setItem(ADMIN_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
     }
};


export default function AddProductPage() {
  const { t } = useTranslation(); // Use translation hook
  const productSchema = createProductSchema(t); // Create schema
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const [imagePreview, setImagePreview] = useState<string | null>(null); // State for image preview

  const form = useForm<z.infer<ReturnType<typeof createProductSchema>>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      brand: "", // Added brand default
      image: null, // Initialize as null
    },
  });

  async function onSubmit(values: z.infer<ReturnType<typeof createProductSchema>>) {
    setIsSubmitting(true); // Start loading
    const priceToSave = values.price;

    try {
        // Pass the image file to the API function
        await addProductAPI(values, values.image); // Use the API function
        toast({
            title: t('admin_add_product_toast_success_title'),
            description: t('admin_add_product_toast_success_description', { productName: values.name }),
            className: "bg-primary text-primary-foreground border-primary",
        });
        router.push('/admin/products'); // Redirect back to the products list
    } catch (error) {
        console.error("Failed to add product:", error);
        toast({ title: t('general_error'), description: t('admin_add_product_toast_error_description'), variant: "destructive" });
        setIsSubmitting(false); // Keep form enabled on error
    }
    // No need to explicitly set isSubmitting to false if redirecting
  }

   // Handle image selection and preview
   const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0];
     if (file) {
       form.setValue('image', file); // Set file in form state
       const reader = new FileReader();
       reader.onloadend = () => {
         setImagePreview(reader.result as string);
       };
       reader.readAsDataURL(file);
     } else {
       form.setValue('image', null); // Clear file in form state
       setImagePreview(null); // Clear preview
     }
   };


  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4 mb-6">
           <Link href="/admin/products" >
               <Button variant="outline" size="icon" aria-label={t('admin_add_product_back_button')}>
                   <ArrowLeft className="h-4 w-4" />
               </Button>
           </Link>
            <div>
                <h1 className="text-3xl font-bold text-primary">{t('admin_add_product_page_title')}</h1>
                <p className="text-muted-foreground">{t('admin_add_product_description')}</p>
            </div>
       </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-md border-border overflow-hidden"> {/* Added overflow */}
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
                        className="resize-y min-h-[100px]" // Allow vertical resize
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
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start"> {/* Changed to 3 cols */}
                 <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('admin_add_product_form_price')}</FormLabel>
                        <FormControl>
                         {/* Use step="1" for whole numbers common in XOF */}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                         {/* Can be Input or Select depending on how brands are managed */}
                        <FormControl>
                            {/* <Input placeholder="Nom de la marque" {...field} /> */}
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
          </Card>


            {/* Image Upload Card */}
            <Card className="shadow-md border-border overflow-hidden">
                 <CardHeader className="bg-muted/30 border-b border-border px-6 py-4">
                     <CardTitle>{t('admin_add_product_image_title')}</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                      {/* Image Preview */}
                      {imagePreview && (
                          <div className="mb-4">
                             <p className="text-sm font-medium mb-2">{t('admin_settings_form_preview_label')}</p>
                             <Image
                                 src={imagePreview}
                                 alt="Aperçu de l'image"
                                 width={200}
                                 height={150}
                                 className="rounded-md border border-border object-cover"
                             />
                          </div>
                       )}
                     <FormField
                         control={form.control}
                         name="image"
                         render={({ field: { onChange, value, ...rest } }) => ( // Destructure onChange
                             <FormItem>
                                 <FormLabel htmlFor="product-image" className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                                     <ImageIcon className="h-8 w-8"/>
                                     <span>{t('admin_add_product_image_label')}</span>
                                 </FormLabel>
                                 <FormControl>
                                     <Input
                                         id="product-image"
                                         type="file"
                                         accept="image/*"
                                         className="sr-only"
                                         onChange={handleImageChange} // Use custom handler
                                         {...rest} // Pass rest props
                                     />
                                 </FormControl>
                                 <FormDescription>
                                     {t('admin_add_product_image_description')}
                                 </FormDescription>
                                 <FormMessage />
                             </FormItem>
                         )}
                     />
                 </CardContent>
           </Card>


          <div className="flex justify-end pt-4">
              <Button
                 type="submit"
                 className="w-full md:w-auto min-w-[150px]" // Ensure minimum width
                 variant="destructive"
                 disabled={isSubmitting}
              >
                 {isSubmitting ? (
                     <>
                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('admin_add_product_submitting_button')}
                     </>
                 ) : (
                      t('admin_add_product_submit_button')
                 )}
              </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}



    