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

// Define Zod schema for form validation (same as add product + optional image update)
const productFormSchema = z.object({
  name: z.string().min(3, {
    message: "Le nom doit contenir au moins 3 caractères.",
  }),
  description: z.string().min(10, {
    message: "La description doit contenir au moins 10 caractères.",
  }).max(500, { message: "La description ne peut pas dépasser 500 caractères."}),
  price: z.coerce.number().positive({
    message: "Le prix doit être un nombre positif.",
  }),
  category: z.string().min(1, { message: "Veuillez sélectionner une catégorie." }),
  brand: z.string().min(2, { message: "La marque doit contenir au moins 2 caractères." }), // Added brand
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

// Mock data fetching function (replace with actual API call)
const fetchProductById = async (productId: string): Promise<AdminProduct | null> => {
    console.log(`Fetching product ${productId}...`);
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay
    const mockProducts: AdminProduct[] = [
        { id: '1', name: "T-Shirt Classique", description: "Un t-shirt confortable en coton.", price: 19.99, category: "Vêtements", brand: "Marque A" /*, imageUrl: `https://picsum.photos/seed/1/400/300` */ },
        { id: '2', name: "Service de Conception Web", description: "Création de site web sur mesure.", price: 499.00, category: "Services", brand: "SamaServices" /*, imageUrl: `https://picsum.photos/seed/2/400/300` */ },
        { id: '3', name: "Casquette Logo", description: "Casquette brodée avec logo.", price: 24.99, category: "Accessoires", brand: "Marque B" /*, imageUrl: `https://picsum.photos/seed/3/400/300` */ },
        // Add other mock products if needed
    ];
    return mockProducts.find(p => p.id === productId) || null;
};

// Simulate API call to update product
const updateProductAPI = async (productId: string, values: z.infer<typeof productFormSchema>): Promise<void> => {
    console.log("Updating Product via API:", productId, values);
    // In a real app, handle FormData if `newImage` exists
    // const formData = new FormData();
    // ... append fields ...
    // await fetch(`/api/products/${productId}`, { method: 'PUT', body: formData });
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network request
};


// Example categories and brands
const categories = ["Vêtements", "Services", "Accessoires", "Autre"];
const brands = ["Marque A", "Marque B", "Marque C", "SamaServices", "Autre"];

export default function EditProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string; // Get productId from URL

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<AdminProduct | null>(null);

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
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
            price: foundProduct.price,
            category: foundProduct.category,
            brand: foundProduct.brand,
          });
        } else {
          toast({
            title: "Erreur",
            description: "Produit non trouvé.",
            variant: "destructive",
          });
          router.replace('/admin/products'); // Use replace to avoid back button issues
        }
      } catch (error) {
         console.error("Failed to fetch product:", error);
         toast({ title: "Erreur", description: "Impossible de charger le produit.", variant: "destructive" });
         router.replace('/admin/products');
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [productId, form, router, toast]);


  async function onSubmit(values: z.infer<typeof productFormSchema>) {
    if (!product) return;
    setIsSubmitting(true);

    try {
        await updateProductAPI(productId, values);
        toast({
          title: "Produit Modifié!",
          description: `Le produit "${values.name}" a été mis à jour.`,
           className: "bg-primary text-primary-foreground border-primary",
        });
        router.push('/admin/products'); // Redirect back to the products list
    } catch (error) {
        console.error("Failed to update product:", error);
        toast({ title: "Erreur", description: "La modification a échoué.", variant: "destructive" });
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
       return <div className="text-center py-10"><p className="text-destructive">Produit non trouvé.</p></div>;
   }


  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4 mb-6">
           <Link href="/admin/products" passHref legacyBehavior>
               <Button variant="outline" size="icon" aria-label="Retour aux produits">
                   <ArrowLeft className="h-4 w-4" />
               </Button>
           </Link>
            <div>
                <h1 className="text-3xl font-bold text-primary">Modifier le Produit</h1>
                <p className="text-muted-foreground">Mise à jour de "{product.name}".</p>
            </div>
       </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* General Info Card */}
            <Card className="shadow-md border-border overflow-hidden">
                 <CardHeader className="bg-muted/30 border-b border-border px-6 py-4">
                     <CardTitle>Informations Générales</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-6">
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom du Produit/Service</FormLabel>
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Décrivez en détail votre produit ou service..."
                                className="resize-y min-h-[100px]"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-right text-xs">
                                {field.value?.length ?? 0}/500 caractères
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
                     <CardTitle>Prix et Catégorisation</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                     <FormField
                         control={form.control}
                         name="price"
                         render={({ field }) => (
                         <FormItem>
                             <FormLabel>Prix (EUR)</FormLabel>
                             <FormControl>
                             <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                             <FormLabel>Catégorie</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value}>
                             <FormControl>
                                 <SelectTrigger>
                                 <SelectValue placeholder="Sélectionnez..." />
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
                             <FormLabel>Marque</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value}>
                             <FormControl>
                                 <SelectTrigger>
                                 <SelectValue placeholder="Sélectionnez..." />
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
                     <CardTitle>Image du Produit</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                      <div>
                          <p className="text-sm font-medium mb-2">Image Actuelle</p>
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
                             <span>Changer l'image (Optionnel)</span>
                         </FormLabel>
                         <FormControl>
                             <Input id="product-image" type="file" accept="image/*" className="sr-only" /* onChange={(e) => field.onChange(e.target.files?.[0])} */ />
                         </FormControl>
                         <FormDescription>
                             Téléchargez une nouvelle image pour remplacer l'actuelle (max 2MB).
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
                          Sauvegarde...
                        </>
                     ) : (
                        'Sauvegarder les Modifications'
                     )}
                  </Button>
              </div>
            </form>
          </Form>
    </div>
  );
}
