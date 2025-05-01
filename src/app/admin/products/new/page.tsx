'use client';

import { useState } from 'react'; // Import useState for loading state
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

// Define Zod schema for form validation
const productFormSchema = z.object({
  name: z.string().min(3, {
    message: "Le nom doit contenir au moins 3 caractères.",
  }),
  description: z.string().min(10, {
    message: "La description doit contenir au moins 10 caractères.",
  }).max(500, { message: "La description ne peut pas dépasser 500 caractères."}),
  price: z.coerce.number().positive({ // coerce converts string input to number
    message: "Le prix doit être un nombre positif.",
  }),
  category: z.string().min(1, { message: "Veuillez sélectionner une catégorie." }),
  brand: z.string().min(2, { message: "La marque doit contenir au moins 2 caractères." }), // Added brand
  // image: z.instanceof(File).optional(), // Placeholder for image upload
});

// Example categories and brands - fetch or define elsewhere in a real app
const categories = ["Vêtements", "Services", "Accessoires", "Autre"];
const brands = ["Marque A", "Marque B", "Marque C", "SamaServices", "Autre"]; // Example brands

export default function AddProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      brand: "", // Added brand default
      // image: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof productFormSchema>) {
    setIsSubmitting(true); // Start loading
    // Simulate adding product to database
    console.log("Adding Product:", values);
    // In a real app, send this data to your backend/API (e.g., using FormData if including files)
    // const formData = new FormData();
    // Object.entries(values).forEach(([key, value]) => {
    //   if (value instanceof File) {
    //     formData.append(key, value);
    //   } else if (value !== undefined && value !== null) {
    //     formData.append(key, String(value));
    //   }
    // });
    // await fetch('/api/products', { method: 'POST', body: formData });
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network request

    toast({
      title: "Produit Ajouté!",
      description: `Le produit "${values.name}" a été ajouté avec succès.`,
      className: "bg-primary text-primary-foreground border-primary",
    });
    router.push('/admin/products'); // Redirect back to the products list
    // No need to explicitly set isSubmitting to false if redirecting
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
                <h1 className="text-3xl font-bold text-primary">Ajouter un Nouveau Produit</h1>
                <p className="text-muted-foreground">Créez un nouvel article pour votre boutique.</p>
            </div>
       </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-md border-border overflow-hidden"> {/* Added overflow */}
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
                        className="resize-y min-h-[100px]" // Allow vertical resize
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
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start"> {/* Changed to 3 cols */}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                         {/* Can be Input or Select depending on how brands are managed */}
                        <FormControl>
                            {/* <Input placeholder="Nom de la marque" {...field} /> */}
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                     <CardTitle>Image du Produit</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                     {/* Basic file input placeholder */}
                     <FormItem>
                         <FormLabel htmlFor="product-image" className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                             <ImageIcon className="h-8 w-8"/>
                             <span>Cliquez ou glissez pour ajouter une image</span>
                         </FormLabel>
                         <FormControl>
                             <Input id="product-image" type="file" accept="image/*" className="sr-only" /* onChange={(e) => field.onChange(e.target.files?.[0])} */ />
                         </FormControl>
                         <FormDescription>
                             Téléchargez une image claire et attrayante (max 2MB, JPG/PNG).
                         </FormDescription>
                         <FormMessage />
                     </FormItem>

                     {/* Placeholder to show selected image preview */}
                      {/* {form.watch('image') && (
                         <div className="mt-4">
                           <p className="text-sm font-medium mb-2">Aperçu :</p>
                           <Image
                             src={URL.createObjectURL(form.watch('image')!)}
                             alt="Aperçu"
                             width={100}
                             height={100}
                             className="rounded-md border"
                           />
                         </div>
                       )} */}
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
                         Ajout en cours...
                     </>
                 ) : (
                     'Ajouter le Produit'
                 )}
              </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
