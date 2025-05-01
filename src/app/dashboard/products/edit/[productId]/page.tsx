// src/app/dashboard/products/edit/[productId]/page.tsx (Manager's Edit Page)
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
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

// Schema (same as admin edit page)
const productFormSchema = z.object({
  name: z.string().min(3), description: z.string().min(10).max(500),
  price: z.coerce.number().positive(), category: z.string().min(1),
  brand: z.string().min(2), /* newImage: z.instanceof(File).optional(), */
});

interface ManagerProduct { // Assuming same structure
  id: string; name: string; description: string; price: number; category: string; brand: string;
}

// Mock data fetching/updating (scoped for manager if needed)
// Use the same mock data source as admin for simplicity now
const fetchManagerProductById = async (productId: string): Promise<ManagerProduct | null> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    // Reusing admin fetch function logic for now
    const mockProducts: ManagerProduct[] = [
        { id: '1', name: "T-Shirt Classique", description: "Un t-shirt confortable en coton.", price: 10000, category: "Vêtements", brand: "Marque A" },
        { id: '2', name: "Service de Conception Web", description: "Création de site web sur mesure.", price: 300000, category: "Services", brand: "SamaServices" },
        { id: '3', name: "Casquette Logo", description: "Casquette brodée avec logo.", price: 15000, category: "Accessoires", brand: "Marque B" },
        { id: '4', name: "Consultation Marketing", description: "1 heure de consultation stratégique.", price: 75000, category: "Services", brand: "SamaServices" },
        { id: '5', name: "Sweat à Capuche", description: "Sweat chaud et stylé.", price: 25000, category: "Vêtements", brand: "Marque A" },
        { id: '6', name: "Mug Personnalisé", description: "Mug avec votre design.", price: 8000, category: "Accessoires", brand: "Marque C" },
    ];
    const storedProducts = localStorage.getItem('manager_products'); // Or use the same key as admin if manager edits all products
    const currentProducts = storedProducts ? JSON.parse(storedProducts) : mockProducts; // Fallback to mock if needed
    return currentProducts.find((p: ManagerProduct) => p.id === productId) || null;
};


const updateManagerProductAPI = async (productId: string, values: z.infer<typeof productFormSchema>): Promise<void> => {
    console.log("Manager updating Product via API:", productId, values);
    await new Promise(resolve => setTimeout(resolve, 1200));
    // Update in localStorage or call API
    const storageKey = 'manager_products'; // Or same as admin key
    const storedProducts = localStorage.getItem(storageKey);
    let products: ManagerProduct[] = storedProducts ? JSON.parse(storedProducts) : [];
    products = products.map(p => p.id === productId ? { ...p, ...values } : p);
    localStorage.setItem(storageKey, JSON.stringify(products));
};

// Example categories and brands
const categories = ["Vêtements", "Services", "Accessoires", "Autre"];
const brands = ["Marque A", "Marque B", "Marque C", "SamaServices", "Autre"];

export default function ManagerEditProductPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<ManagerProduct | null>(null);

  // Redirect or show error if not a manager
  useEffect(() => {
    if (!authLoading && user?.role !== 'manager') {
        toast({ title: "Accès non autorisé", description: "Seuls les gestionnaires peuvent modifier des produits.", variant: "destructive" });
        router.replace('/dashboard');
    }
  }, [user, authLoading, toast, router]);

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: "", description: "", price: 0, category: "", brand: "" },
  });

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
          });
        } else {
          toast({ title: "Erreur", description: "Produit non trouvé.", variant: "destructive" });
          router.replace('/dashboard/products');
        }
      } catch (error) {
         toast({ title: "Erreur", description: "Impossible de charger le produit.", variant: "destructive" });
         router.replace('/dashboard/products');
      } finally { setIsLoading(false); }
    };
    loadProduct();
  }, [productId, user, form, router, toast]);

  async function onSubmit(values: z.infer<typeof productFormSchema>) {
    if (!product) return;
    setIsSubmitting(true);
    try {
        const priceToSave = values.price; // Assuming input is correct unit
        await updateManagerProductAPI(productId, { ...values, price: priceToSave });
        toast({ title: "Produit Modifié!", description: `"${values.name}" a été mis à jour.`, className: "bg-primary text-primary-foreground border-primary" });
        router.push('/dashboard/products');
    } catch (error) {
        toast({ title: "Erreur", description: "La modification a échoué.", variant: "destructive" });
        setIsSubmitting(false);
    }
  }

  // Render loading or unauthorized state
  if (isLoading || authLoading || !user) {
      return <div className="p-6"><Skeleton className="h-10 w-1/2 mb-4" /><Skeleton className="h-[500px] w-full" /></div>;
  }
  if (user.role !== 'manager') {
     return <div className="p-6 text-center text-destructive">Accès réservé aux gestionnaires.</div>;
  }
  if (!product && !isLoading) { // Added check for product not found after loading
     return <div className="p-6 text-center text-destructive">Produit introuvable.</div>;
  }


  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4 mb-6">
           <Link href="/dashboard/products" passHref legacyBehavior> {/* Back to manager products */}
               <Button variant="outline" size="icon" aria-label="Retour"><ArrowLeft className="h-4 w-4" /></Button>
           </Link>
           <div>
               <h1 className="text-3xl font-bold text-primary">Modifier Produit</h1>
               <p className="text-muted-foreground">Mise à jour de "{product?.name}".</p>
           </div>
       </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Cards structure similar to Add/Admin Edit pages */}
            <Card className="shadow-md border-border">
                 <CardHeader className="bg-muted/30 border-b"><CardTitle>Infos Générales</CardTitle></CardHeader>
                 <CardContent className="p-6 space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nom</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea rows={4} {...field} /></FormControl> <FormDescription className="text-right text-xs">{field.value?.length ?? 0}/500</FormDescription> <FormMessage /> </FormItem> )} />
                 </CardContent>
            </Card>

            <Card className="shadow-md border-border">
                 <CardHeader className="bg-muted/30 border-b"><CardTitle>Prix & Catégorisation</CardTitle></CardHeader>
                 <CardContent className="p-6 grid md:grid-cols-3 gap-6">
                     <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Prix (FCFA)</FormLabel> <FormControl><Input type="number" step="1" placeholder="0" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                     <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>Catégorie</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="..." /></SelectTrigger></FormControl> <SelectContent>{categories.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
                     <FormField control={form.control} name="brand" render={({ field }) => ( <FormItem> <FormLabel>Marque</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="..." /></SelectTrigger></FormControl> <SelectContent>{brands.map(b=><SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
                 </CardContent>
            </Card>

            <Card className="shadow-md border-border">
                 <CardHeader className="bg-muted/30 border-b"><CardTitle>Image</CardTitle></CardHeader>
                 <CardContent className="p-6 space-y-4">
                     <div>
                         <p className="text-sm font-medium mb-2">Actuelle</p>
                         <Image src={`https://picsum.photos/seed/${product?.id}/200/150`} alt={product?.name || 'Produit'} width={200} height={150} className="rounded-md border object-cover"/>
                     </div>
                     <FormItem>
                        <FormLabel htmlFor="product-image" className="flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg p-4 justify-center text-muted-foreground hover:border-primary hover:text-primary"><ImageIcon className="h-6 w-6"/><span>Changer l'image (Optionnel)</span></FormLabel>
                        <FormControl><Input id="product-image" type="file" accept="image/*" className="sr-only" /></FormControl>
                        <FormDescription>Max 2MB.</FormDescription><FormMessage/>
                     </FormItem>
                 </CardContent>
            </Card>

              <div className="flex justify-end pt-4">
                  <Button type="submit" className="min-w-[200px]" variant="destructive" disabled={isSubmitting}>
                     {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde...</> : 'Sauvegarder Modifications'}
                  </Button>
              </div>
        </form>
      </Form>
    </div>
  );
}
