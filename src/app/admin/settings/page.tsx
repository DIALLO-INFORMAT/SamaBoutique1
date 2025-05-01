'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';
import {Switch} from '@/components/ui/switch';
import {Separator} from '@/components/ui/separator';
import {Textarea} from '@/components/ui/textarea';
import {useEffect, useState} from 'react';
import Image from 'next/image';
import {ImageIcon} from 'lucide-react';

// Define Zod schema for settings form validation
const settingsSchema = z.object({
  storeName: z.string().min(3, {message: 'Le nom de la boutique doit comporter au moins 3 caractères.'}),
  supportEmail: z.string().email({message: 'Veuillez entrer une adresse email valide.'}),
  enableMaintenance: z.boolean().default(false),
  storeDescription: z.string().max(200, {
    message: 'La description ne peut pas dépasser 200 caractères.',
  }),
  primaryColor: z.string().regex(/^hsl\(\d+,\s*\d+%,\s*\d+%\)$/, {
    message: 'Doit être une valeur HSL valide (ex: hsl(154, 50%, 50%)).',
  }),
  logoUrl: z.string().url({message: 'Doit être une URL valide.'}).optional(), // Added logo URL
  faviconUrl: z.string().url({message: 'Doit être une URL valide.'}).optional(), // Added favicon URL
  // Add more settings fields as needed: currency, language, API keys, etc.
});

// Simulate fetching current settings
const currentSettings = {
  storeName: 'SamaBoutique',
  supportEmail: 'support@samaboutique.com',
  enableMaintenance: false,
  storeDescription: 'Votre partenaire de confiance pour des produits et services de qualité.',
  primaryColor: 'hsl(154, 50%, 50%)',
  logoUrl: '', // Initial empty logo URL
  faviconUrl: '', // Initial empty favicon URL
};

export default function AdminSettingsPage() {
  const {toast} = useToast();
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | undefined>(undefined); // State for logo preview
  const [faviconPreviewUrl, setFaviconPreviewUrl] = useState<string | undefined>(undefined); // State for favicon preview

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: currentSettings, // Load current settings into the form
  });

  // Update logo preview when logoUrl changes
  useEffect(() => {
    if (form.watch('logoUrl')) {
      setLogoPreviewUrl(form.watch('logoUrl'));
    }
  }, [form.watch('logoUrl')]);

   // Update favicon preview when faviconUrl changes
  useEffect(() => {
    if (form.watch('faviconUrl')) {
      setFaviconPreviewUrl(form.watch('faviconUrl'));
    }
  }, [form.watch('faviconUrl')]);

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    // Simulate saving settings to the database
    console.log('Saving Settings:', values);
    // In a real app, send this data to your backend/API: PUT `/api/settings`
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request

    toast({
      title: 'Paramètres Enregistrés!',
      description: 'Vos paramètres ont été mis à jour avec succès.',
      className: 'bg-primary text-primary-foreground border-primary',
    });
    // Optionally refetch settings or update local state if needed
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Paramètres de la Boutique</h1>

      <Card className="max-w-3xl">
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

              {/* Store Description */}
              <FormField
                control={form.control}
                name="storeDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description de la Boutique</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Décrivez votre boutique..." {...field} rows={3} />
                    </FormControl>
                    <FormDescription>
                      Courte description de votre boutique (pour le footer).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Logo URL */}
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL du Logo</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL vers l'image de votre logo (PNG, JPG, SVG).
                    </FormDescription>
                    <FormMessage />
                    {logoPreviewUrl && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Aperçu du Logo:</p>
                        <Image
                           src={logoPreviewUrl}
                           alt="Aperçu du Logo"
                           width={100}
                           height={50}
                           className="rounded-md border border-border object-contain"
                           style={{maxWidth: '100%', height: 'auto'}}
                         />
                      </div>
                    )}
                  </FormItem>
                )}
              />

               {/* Favicon URL */}
              <FormField
                control={form.control}
                name="faviconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL du Favicon</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/favicon.ico" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL vers votre favicon (ICO, PNG).
                    </FormDescription>
                    <FormMessage />
                     {faviconPreviewUrl && (
                        <div className="mt-2">
                            <p className="text-sm font-medium">Aperçu du Favicon:</p>
                            <Image
                                src={faviconPreviewUrl}
                                alt="Aperçu du Favicon"
                                width={32}
                                height={32}
                                className="rounded-full border border-border object-contain"
                                style={{maxWidth: '100%', height: 'auto'}}
                             />
                        </div>
                     )}
                  </FormItem>
                )}
              />

              <Separator />

              {/* Primary Color */}
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couleur Primaire (HSL)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="hsl(154, 50%, 50%)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Entrez une valeur HSL pour la couleur principale de votre boutique.
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
