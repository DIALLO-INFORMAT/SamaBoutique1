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
import {ImageIcon, Loader2} from 'lucide-react';
import { useSettings, saveSettings } from '@/hooks/useSettings'; // Import useSettings and saveSettings

// Define Zod schema for settings form validation
const settingsSchema = z.object({
  storeName: z.string().min(3, {message: 'Le nom de la boutique doit comporter au moins 3 caractères.'}),
  supportEmail: z.string().email({message: 'Veuillez entrer une adresse email valide.'}),
  enableMaintenance: z.boolean().default(false),
  storeDescription: z.string().max(200, {
    message: 'La description ne peut pas dépasser 200 caractères.',
  }),
  primaryColor: z.string().regex(/^hsl\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*\)$/i, { // Allow spaces and optional %
    message: 'Doit être une valeur HSL valide (ex: hsl(154, 50%, 50%)).',
  }),
  logoUrl: z.string().url({message: 'Doit être une URL valide.'}).or(z.literal('')).optional(), // Allow empty string
  faviconUrl: z.string().url({message: 'Doit être une URL valide.'}).or(z.literal('')).optional(), // Allow empty string
});

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const currentSettings = useSettings(); // Use the hook to get current settings
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    // Default values will be set by useEffect based on currentSettings
    defaultValues: {
        storeName: '',
        supportEmail: '',
        enableMaintenance: false,
        storeDescription: '',
        primaryColor: '',
        logoUrl: '',
        faviconUrl: '',
    },
  });

  // Load current settings into the form when they are available or change
  useEffect(() => {
      if (!currentSettings.isLoading) {
          form.reset({
              storeName: currentSettings.storeName,
              supportEmail: currentSettings.supportEmail,
              enableMaintenance: currentSettings.enableMaintenance,
              storeDescription: currentSettings.storeDescription,
              primaryColor: currentSettings.primaryColor,
              logoUrl: currentSettings.logoUrl || '', // Ensure empty string if null/undefined
              faviconUrl: currentSettings.faviconUrl || '', // Ensure empty string
          });
      }
  }, [currentSettings, form]);


  // Preview states
   const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | undefined>(undefined);
   const [faviconPreviewUrl, setFaviconPreviewUrl] = useState<string | undefined>(undefined);

   // Update previews based on form values
   useEffect(() => {
     const subscription = form.watch((value, { name }) => {
       if (name === 'logoUrl') {
         setLogoPreviewUrl(value.logoUrl || undefined);
       }
       if (name === 'faviconUrl') {
         setFaviconPreviewUrl(value.faviconUrl || undefined);
       }
     });
     return () => subscription.unsubscribe();
   }, [form]);


  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    setIsSubmitting(true);
    try {
        // Use the imported saveSettings function
        saveSettings(values);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

        toast({
            title: 'Paramètres Enregistrés!',
            description: 'Vos paramètres ont été mis à jour avec succès.',
            className: 'bg-primary text-primary-foreground border-primary',
        });

        // Force reload or trigger context update if necessary
        // Might not be needed if useSettings updates via storage event
        // window.location.reload(); // Or a more subtle update

    } catch (error) {
        console.error("Failed to save settings:", error);
         toast({
             title: 'Erreur',
             description: 'Impossible d\'enregistrer les paramètres.',
             variant: 'destructive',
         });
    } finally {
        setIsSubmitting(false);
    }
  }

   // Show loading skeleton if settings are loading
   if (currentSettings.isLoading) {
        return (
             <div className="space-y-8">
                 <h1 className="text-3xl font-bold text-primary">Paramètres de la Boutique</h1>
                 <Card className="max-w-3xl">
                     <CardHeader>
                         <CardTitle><div className="h-6 w-3/5 bg-muted rounded animate-pulse"></div></CardTitle>
                         <CardDescription><div className="h-4 w-4/5 bg-muted rounded animate-pulse mt-1"></div></CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-6">
                         {[...Array(6)].map((_, i) => (
                           <div key={i} className="space-y-2">
                               <div className="h-4 w-1/4 bg-muted rounded animate-pulse"></div>
                               <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                           </div>
                         ))}
                         <div className="h-10 w-36 bg-muted rounded animate-pulse"></div>
                     </CardContent>
                 </Card>
             </div>
        );
   }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Paramètres de la Boutique</h1>

      <Card className="max-w-3xl shadow-md border-border">
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
              <FormField control={form.control} name="storeName" render={({ field }) => ( <FormItem> <FormLabel>Nom Boutique</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
              {/* Support Email */}
              <FormField control={form.control} name="supportEmail" render={({ field }) => ( <FormItem> <FormLabel>Email Support</FormLabel> <FormControl><Input type="email" {...field} /></FormControl> <FormDescription>Email affiché pour le support.</FormDescription> <FormMessage /> </FormItem> )}/>
              {/* Store Description */}
              <FormField control={form.control} name="storeDescription" render={({ field }) => ( <FormItem> <FormLabel>Description Boutique</FormLabel> <FormControl><Textarea {...field} rows={3} /></FormControl> <FormDescription>Courte description (footer).</FormDescription> <FormMessage /> </FormItem> )}/>

              <Separator />

              {/* Logo URL */}
              <FormField control={form.control} name="logoUrl" render={({ field }) => (
                  <FormItem>
                      <FormLabel>URL du Logo</FormLabel>
                      <FormControl><Input type="url" placeholder="https://.../logo.png" {...field} /></FormControl>
                      <FormDescription>URL de l'image (PNG, JPG, SVG).</FormDescription>
                      <FormMessage />
                      {logoPreviewUrl ? (
                          <div className="mt-2">
                              <p className="text-sm font-medium">Aperçu:</p>
                              <Image src={logoPreviewUrl} alt="Logo Preview" width={100} height={50} className="rounded border object-contain mt-1" onError={() => setLogoPreviewUrl(undefined)} />
                          </div>
                      ) : field.value && (
                           <p className="text-xs text-muted-foreground mt-1">Aperçu non disponible ou URL invalide.</p>
                      )}
                  </FormItem>
              )}/>

               {/* Favicon URL */}
              <FormField control={form.control} name="faviconUrl" render={({ field }) => (
                  <FormItem>
                      <FormLabel>URL du Favicon</FormLabel>
                      <FormControl><Input type="url" placeholder="https://.../favicon.ico" {...field} /></FormControl>
                      <FormDescription>URL du favicon (ICO, PNG).</FormDescription>
                      <FormMessage />
                      {faviconPreviewUrl ? (
                          <div className="mt-2">
                              <p className="text-sm font-medium">Aperçu:</p>
                              <Image src={faviconPreviewUrl} alt="Favicon Preview" width={32} height={32} className="rounded border object-contain mt-1" onError={() => setFaviconPreviewUrl(undefined)}/>
                          </div>
                      ): field.value && (
                           <p className="text-xs text-muted-foreground mt-1">Aperçu non disponible ou URL invalide.</p>
                      )}
                  </FormItem>
              )}/>

              <Separator />

              {/* Primary Color */}
              <FormField control={form.control} name="primaryColor" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Couleur Primaire (HSL)</FormLabel>
                      <div className="flex items-center gap-2">
                          <FormControl><Input type="text" placeholder="hsl(154, 50%, 50%)" {...field} /></FormControl>
                          <div className="w-8 h-8 rounded border" style={{ backgroundColor: field.value }}></div>
                      </div>
                      <FormDescription>Couleur principale (thème). Format: hsl(H, S%, L%)</FormDescription>
                      <FormMessage />
                  </FormItem>
              )}/>

              <Separator />

              {/* Maintenance Mode */}
              <FormField control={form.control} name="enableMaintenance" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                          <FormLabel className="text-base">Mode Maintenance</FormLabel>
                          <FormDescription>Activer pour afficher une page de maintenance.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
              )}/>

              <Button type="submit" variant="destructive" disabled={isSubmitting} className="min-w-[180px]">
                 {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                 {isSubmitting ? 'Enregistrement...' : 'Enregistrer Paramètres'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
