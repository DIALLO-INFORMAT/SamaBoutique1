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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

// Define Zod schema for settings form validation
const settingsSchema = z.object({
  storeName: z.string().min(3, { message: "Le nom de la boutique doit comporter au moins 3 caractères." }),
  supportEmail: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  enableMaintenance: z.boolean().default(false),
  // Add more settings fields as needed: currency, language, API keys, etc.
});

// Simulate fetching current settings
const currentSettings = {
    storeName: "SamaBoutique",
    supportEmail: "support@samaboutique.com",
    enableMaintenance: false,
};

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: currentSettings, // Load current settings into the form
  });

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    // Simulate saving settings to the database
    console.log("Saving Settings:", values);
    // In a real app, send this data to your backend/API: PUT `/api/settings`
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request

    toast({
      title: "Paramètres Enregistrés!",
      description: "Vos paramètres ont été mis à jour avec succès.",
      className: "bg-primary text-primary-foreground border-primary",
    });
    // Optionally refetch settings or update local state if needed
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Paramètres de la Boutique</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Paramètres Généraux</CardTitle>
          <CardDescription>
            Configurez les informations de base et les options de votre boutique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Store Name */}
              <FormField
                control={form.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la Boutique</FormLabel>
                    <FormControl>
                      <Input placeholder="Ma Super Boutique" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Support Email */}
              <FormField
                control={form.control}
                name="supportEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de Support</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@maboutique.com" {...field} />
                    </FormControl>
                     <FormDescription>
                        L'adresse email affichée pour le support client.
                     </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <Separator />

                {/* Maintenance Mode */}
               <FormField
                 control={form.control}
                 name="enableMaintenance"
                 render={({ field }) => (
                   <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                     <div className="space-y-0.5">
                       <FormLabel className="text-base">
                         Mode Maintenance
                       </FormLabel>
                       <FormDescription>
                         Activer pour afficher une page de maintenance aux visiteurs.
                       </FormDescription>
                     </div>
                     <FormControl>
                       <Switch
                         checked={field.value}
                         onCheckedChange={field.onChange}
                       />
                     </FormControl>
                   </FormItem>
                 )}
               />

              {/* Add more settings fields here */}

              <Button
                 type="submit"
                 variant="destructive"
                 disabled={form.formState.isSubmitting}
              >
                 {form.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer les Paramètres'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
