'use client';

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
import { ArrowLeft } from "lucide-react";
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
  // Add fields for image upload, stock, etc. later
});

// Example categories - fetch or define elsewhere in a real app
const categories = ["Vêtements", "Services", "Accessoires", "Autre"];

export default function AddProductPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
    },
  });

  async function onSubmit(values: z.infer<typeof productFormSchema>) {
    // Simulate adding product to database
    console.log("Adding Product:", values);
    // In a real app, send this data to your backend/API
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request

    toast({
      title: "Produit Ajouté!",
      description: `Le produit "${values.name}" a été ajouté avec succès.`,
      className: "bg-primary text-primary-foreground border-primary",
    });
    router.push('/admin/products'); // Redirect back to the products list
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
            <h1 className="text-3xl font-bold text-primary">Ajouter un Nouveau Produit</h1>
       </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Détails du Produit</CardTitle>
          <CardDescription>
            Remplissez les informations ci-dessous pour ajouter un nouveau produit ou service.
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
                      {field.value.length}/500
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              {/* Placeholder for image upload */}
               {/* <FormItem>
                   <FormLabel>Image</FormLabel>
                   <FormControl>
                       <Input type="file" accept="image/*" />
                   </FormControl>
                   <FormDescription>
                       Téléchargez une image pour votre produit (max 2MB).
                   </FormDescription>
                   <FormMessage />
               </FormItem> */}


              <Button
                 type="submit"
                 className="w-full md:w-auto"
                 variant="destructive"
                 disabled={form.formState.isSubmitting}
              >
                 {form.formState.isSubmitting ? 'Ajout en cours...' : 'Ajouter le Produit'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
