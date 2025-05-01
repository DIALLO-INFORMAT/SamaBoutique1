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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation'; // use useParams to get productId
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';

// Define Zod schema for form validation (same as add product)
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
});

// Mock product data type
interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

// Mock product data (replace with actual data fetching)
const mockProducts: AdminProduct[] = [
  { id: '1', name: "T-Shirt Classique", description: "Un t-shirt confortable en coton.", price: 19.99, category: "Vêtements" },
  { id: '2', name: "Service de Conception Web", description: "Création de site web sur mesure.", price: 499.00, category: "Services" },
  { id: '3', name: "Casquette Logo", description: "Casquette brodée avec logo.", price: 24.99, category: "Accessoires" },
  { id: '4', name: "Consultation Marketing", description: "1 heure de consultation stratégique.", price: 150.00, category: "Services" },
  { id: '5', name: "Sweat à Capuche", description: "Sweat chaud et stylé.", price: 45.00, category: "Vêtements" },
  { id: '6', name: "Mug Personnalisé", description: "Mug avec votre design.", price: 14.99, category: "Accessoires" },
];


// Example categories
const categories = ["Vêtements", "Services", "Accessoires", "Autre"];

export default function EditProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string; // Get productId from URL

  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<AdminProduct | null>(null);

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { // Initialize with empty or default values
      name: "",
      description: "",
      price: 0,
      category: "",
    },
  });

  // Fetch product data on mount
  useEffect(() => {
    if (!productId) return;
    setIsLoading(true);
    // Simulate fetching product by ID
    const fetchProduct = async () => {
      // Replace with actual API call: fetch(`/api/products/${productId}`)
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      const foundProduct = mockProducts.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
        // Reset form with fetched product data
        form.reset({
          name: foundProduct.name,
          description: foundProduct.description,
          price: foundProduct.price,
          category: foundProduct.category,
        });
      } else {
        toast({
          title: "Erreur",
          description: "Produit non trouvé.",
          variant: "destructive",
        });
        router.push('/admin/products'); // Redirect if product not found
      }
      setIsLoading(false);
    };
    fetchProduct();
  }, [productId, form, router, toast]);


  async function onSubmit(values: z.infer<typeof productFormSchema>) {
    if (!product) return;

    // Simulate updating product in database
    console.log("Updating Product:", productId, values);
    // In a real app, send this data to your backend/API: PUT/PATCH `/api/products/${productId}`
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request

    toast({
      title: "Produit Modifié!",
      description: `Le produit "${values.name}" a été mis à jour avec succès.`,
       className: "bg-primary text-primary-foreground border-primary",
    });
    router.push('/admin/products'); // Redirect back to the products list
  }

  if (isLoading) {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                 <Skeleton className="h-10 w-10 rounded-md" />
                 <Skeleton className="h-8 w-64" />
            </div>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-10 w-full" />
                     </div>
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        </div>
    );
  }

   if (!product) {
       // This case should ideally be handled by the redirect in useEffect, but added for safety
       return <p className="text-center text-destructive">Produit non trouvé.</p>;
   }


  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4">
           <Link href="/admin/products" passHref>
               <Button variant="outline" size="icon">
                   <ArrowLeft className="h-4 w-4" />
                   <span className="sr-only">Retour</span>
               </Button>
           </Link>
            <h1 className="text-3xl font-bold text-primary">Modifier le Produit</h1>
       </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Modifier: {product.name}</CardTitle>
          <CardDescription>
            Mettez à jour les informations du produit ou service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        placeholder="Décrivez votre produit ou service..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-right">
                        {field.value?.length ?? 0}/500
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <SelectValue placeholder="Sélectionnez une catégorie" />
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
              </div>

              {/* Placeholder for image upload/display */}
              {/* <FormItem>
                 <FormLabel>Image Actuelle</FormLabel>
                 <Image src={`https://picsum.photos/seed/${product.id}/100/100`} alt={product.name} width={100} height={100} className="rounded-md border" />
                 <FormControl>
                     <Input type="file" accept="image/*" className="mt-2" />
                 </FormControl>
                 <FormDescription>
                     Téléchargez une nouvelle image pour remplacer l'actuelle (optionnel).
                 </FormDescription>
                 <FormMessage />
              </FormItem> */}


              <Button
                 type="submit"
                 className="w-full md:w-auto"
                 variant="destructive"
                 disabled={form.formState.isSubmitting}
              >
                 {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                 ) : (
                    'Sauvegarder les Modifications'
                 )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
