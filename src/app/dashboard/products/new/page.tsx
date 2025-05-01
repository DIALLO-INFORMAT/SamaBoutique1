// src/app/dashboard/products/new/page.tsx (Manager's Add Product Page)
'use client';

import { useState, useEffect } from 'react';
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
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Skeleton } from '@/components/ui/skeleton';

// Schema (same as admin add page)
const productFormSchema = z.object({
  name: z.string().min(3, { message: "Le nom doit contenir au moins 3 caractères." }),
  description: z.string().min(10, { message: "La description doit contenir au moins 10 caractères." }).max(500),
  price: z.coerce.number().positive({ message: "Le prix doit être un nombre positif." }),
  category: z.string().min(1, { message: "Veuillez sélectionner une catégorie." }),
  brand: z.string().min(2, { message: "La marque doit contenir au moins 2 caractères." }),
  // image: z.instanceof(File).optional(),
});

// Example categories and brands
const categories = ["Vêtements", "Services", "Accessoires", "Autre"];
const brands = ["Marque A", "Marque B", "Marque C", "SamaServices", "Autre"];

// Simulate API call to add product (scoped for manager if necessary)
const addManagerProductAPI = async (values: z.infer<typeof productFormSchema>): Promise<void> => {
    console.log("Manager adding Product via API:", values);
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Add to localStorage or call API endpoint for managers
    const newProduct = { ...values, id: `prod-${Date.now()}` };
    const storedProducts = localStorage.getItem('manager_products');
    const products = storedProducts ? JSON.parse(storedProducts) : [];
    products.push(newProduct);
    localStorage.setItem('manager_products', JSON.stringify(products));
};

export default function ManagerAddProductPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

   // Redirect or show error if not a manager
  useEffect(() => {
    if (!authLoading && user?.role !== 'manager') {
        toast({ title: "Accès non autorisé", description: "Seuls les gestionnaires peuvent ajouter des produits.", variant: "destructive" });
        router.replace('/dashboard'); // Redirect if not manager
    }
  }, [user, authLoading, toast, router]);

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: "", description: "", price: 0, category: "", brand: "" },
  });

  async function onSubmit(values: z.infer<typeof productFormSchema>) {
    setIsSubmitting(true);
    try {
        await addManagerProductAPI(values);
        toast({
          title: "Produit Ajouté!",
          description: `"${values.name}" a été ajouté.`,
          className: "bg-primary text-primary-foreground border-primary",
        });
        router.push('/dashboard/products'); // Redirect back to manager's products list
    } catch (error) {
        console.error("Failed to add product:", error);
        toast({ title: "Erreur", description: "Impossible d'ajouter le produit.", variant: "destructive" });
        setIsSubmitting(false);
    }
  }

   // Render loading or unauthorized state
  if (authLoading || !user) {
      return <div className="p-6"><Skeleton className="h-10 w-1/2 mb-4" /><Skeleton className="h-96 w-full" /></div>;
  }

  if (user.role !== 'manager') {
     return <div className="p-6 text-center text-destructive">Accès réservé aux gestionnaires.</div>;
  }

  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4 mb-6">
           <Link href="/dashboard/products" passHref legacyBehavior> {/* Link back to manager's product list */}
               <Button variant="outline" size="icon" aria-label="Retour aux produits">
                   <ArrowLeft className="h-4 w-4" />
               </Button>
           </Link>
            <div>
                <h1 className="text-3xl font-bold text-primary">Ajouter un Produit</h1>
                <p className="text-muted-foreground">Créez un nouvel article pour la boutique.</p>
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
               <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nom</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
               <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea rows={4} {...field} /></FormControl> <FormDescription className="text-right text-xs">{field.value?.length ?? 0}/500</FormDescription> <FormMessage /> </FormItem> )} />
            </CardContent>
          </Card>

          {/* Pricing and Categorization Card */}
          <Card className="shadow-md border-border overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border px-6 py-4">
                <CardTitle>Prix et Catégorisation</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                 <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Prix (€)</FormLabel> <FormControl><Input type="number" step="0.01" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>Catégorie</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger></FormControl> <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name="brand" render={({ field }) => ( <FormItem> <FormLabel>Marque</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger></FormControl> <SelectContent>{brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
            </CardContent>
          </Card>

            {/* Image Upload Card */}
            <Card className="shadow-md border-border overflow-hidden">
                 <CardHeader className="bg-muted/30 border-b border-border px-6 py-4"> <CardTitle>Image</CardTitle> </CardHeader>
                 <CardContent className="p-6">
                     <FormItem>
                         <FormLabel htmlFor="product-image" className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"> <ImageIcon className="h-8 w-8"/> <span>Ajouter une image</span> </FormLabel>
                         <FormControl><Input id="product-image" type="file" accept="image/*" className="sr-only" /* onChange */ /></FormControl>
                         <FormDescription>Max 2MB, JPG/PNG.</FormDescription> <FormMessage />
                     </FormItem>
                 </CardContent>
           </Card>

          <div className="flex justify-end pt-4">
              <Button type="submit" className="min-w-[150px]" variant="destructive" disabled={isSubmitting}>
                 {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ajout...</> : 'Ajouter Produit'}
              </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
