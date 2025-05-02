// src/app/admin/settings/page.tsx
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
import {useEffect, useState, useCallback} from 'react';
import Image from 'next/image';
import {Loader2 } from 'lucide-react';
import { useSettings, saveSettings, Settings } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation';
import { Skeleton } from '@/components/ui/skeleton';


// Define Zod schema for CORE settings form validation (excluding image lists)
const createSettingsSchema = (t: Function) => z.object({
  storeName: z.string().min(3, {message: t('admin_settings_form_store_name') + " doit comporter au moins 3 caractères."}),
  supportEmail: z.string().email({message: t('admin_settings_form_support_email') + " doit être une adresse email valide."}),
  enableMaintenance: z.boolean().default(false),
  storeDescription: z.string().max(200, {
    message: t('admin_settings_form_store_description') + " ne peut pas dépasser 200 caractères.",
  }),
  primaryColor: z.string().regex(/^hsl\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*\)$/i, { // Allow spaces and optional %
    message: t('admin_settings_form_primary_color') + ' Doit être une valeur HSL valide (ex: hsl(154, 50%, 50%)).',
  }),
  logoUrl: z.string().url({message: t('admin_settings_form_logo_url') + ' Doit être une URL valide.'}).or(z.literal('')).optional(), // Allow empty string
  faviconUrl: z.string().url({message: t('admin_settings_form_favicon_url') + ' Doit être une URL valide.'}).or(z.literal('')).optional(), // Allow empty string
});


// --- Main Settings Page Component ---
export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const {isLoading: settingsLoading, ...currentSettings } = useSettings(); // Destructure isLoading separately
  const [isSubmitting, setIsSubmitting] = useState(false);

  const settingsSchema = createSettingsSchema(t);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
        storeName: '', supportEmail: '', enableMaintenance: false,
        storeDescription: '', primaryColor: '', logoUrl: '', faviconUrl: '',
    },
  });

  // Initialize form when settings load
  useEffect(() => {
      if (!settingsLoading && currentSettings) {
          const settingsToApply = {
                storeName: currentSettings.storeName || DEFAULT_SETTINGS.storeName,
                supportEmail: currentSettings.supportEmail || DEFAULT_SETTINGS.supportEmail,
                enableMaintenance: currentSettings.enableMaintenance || DEFAULT_SETTINGS.enableMaintenance,
                storeDescription: currentSettings.storeDescription || DEFAULT_SETTINGS.storeDescription,
                primaryColor: currentSettings.primaryColor || DEFAULT_SETTINGS.primaryColor,
                logoUrl: currentSettings.logoUrl || DEFAULT_SETTINGS.logoUrl,
                faviconUrl: currentSettings.faviconUrl || DEFAULT_SETTINGS.faviconUrl,
            };
           form.reset(settingsToApply);
           setLogoPreviewUrl(settingsToApply.logoUrl || undefined);
           setFaviconPreviewUrl(settingsToApply.faviconUrl || undefined);
      }
  }, [settingsLoading, currentSettings, form]); // form should be stable, but added form.reset dependency was causing issues

  // Preview states
   const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | undefined>(undefined);
   const [faviconPreviewUrl, setFaviconPreviewUrl] = useState<string | undefined>(undefined);

   // Update previews based on form values - Use useEffect with watched values
   const watchedLogoUrl = form.watch('logoUrl');
   const watchedFaviconUrl = form.watch('faviconUrl');

   useEffect(() => {
       setLogoPreviewUrl(watchedLogoUrl || undefined);
   }, [watchedLogoUrl]);

    useEffect(() => {
       setFaviconPreviewUrl(watchedFaviconUrl || undefined);
    }, [watchedFaviconUrl]);


  const handleSaveCoreSettings = useCallback(async () => {
    setIsSubmitting(true);
    // Validate core settings form
    const coreValuesValid = await form.trigger();
    if (!coreValuesValid) {
        toast({ title: t('general_error'), description: t('admin_settings_validation_error'), variant: 'destructive' });
        setIsSubmitting(false);
        return;
    }
    const coreValues = form.getValues();

    try {
        // Only save core settings here
        const coreSettingsToSave: Partial<Settings> = {
            ...coreValues,
            // Ensure we don't accidentally overwrite image lists if they were somehow included
            carouselImages: undefined,
            partnerLogos: undefined,
        };

        saveSettings(coreSettingsToSave);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

        toast({
            title: t('admin_settings_toast_save_success_title'),
            description: t('admin_settings_toast_save_success_description'),
            className: 'bg-primary text-primary-foreground border-primary',
        });
    } catch (error) {
        console.error("Failed to save core settings:", error);
         toast({
             title: t('admin_settings_toast_save_error_title'),
             description: t('admin_settings_toast_save_error_description'),
             variant: 'destructive',
         });
    } finally {
        setIsSubmitting(false);
    }
  }, [form, t, toast]);


   // Show loading skeleton if settings are loading
   if (settingsLoading) {
        return (
             <div className="space-y-8">
                 <h1 className="text-3xl font-bold text-primary">{t('admin_settings_page_title')}</h1>
                 {/* Skeleton for the core settings card */}
                 <Card className="max-w-3xl">
                     <CardHeader>
                         <Skeleton className="h-6 w-2/5 bg-muted" />
                         <Skeleton className="h-4 w-4/5 bg-muted mt-1" />
                     </CardHeader>
                     <CardContent className="space-y-6">
                         {[...Array(7)].map((_, j) => ( // Adjust skeleton count for core fields
                             <div key={j} className="space-y-2">
                                 <Skeleton className="h-4 w-1/4 bg-muted" />
                                 <Skeleton className="h-10 w-full bg-muted" />
                             </div>
                         ))}
                     </CardContent>
                 </Card>
                  <Skeleton className="h-10 w-40 bg-muted rounded ml-auto" /> {/* Save button skeleton */}
             </div>
        );
   }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">{t('admin_settings_page_title')}</h1>

      {/* Core Settings Form */}
      <Card className="max-w-3xl shadow-md border-border">
        <CardHeader>
          <CardTitle>{t('admin_settings_general_title')}</CardTitle>
          <CardDescription>
             {t('admin_settings_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            {/* Use a separate onSubmit handler for the form */}
            <form onSubmit={form.handleSubmit(handleSaveCoreSettings)} id="core-settings-form" className="space-y-8">
              {/* Store Name */}
              <FormField control={form.control} name="storeName" render={({ field }) => ( <FormItem> <FormLabel>{t('admin_settings_form_store_name')}</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
              {/* Support Email */}
              <FormField control={form.control} name="supportEmail" render={({ field }) => ( <FormItem> <FormLabel>{t('admin_settings_form_support_email')}</FormLabel> <FormControl><Input type="email" {...field} /></FormControl> <FormDescription>{t('admin_settings_form_support_email_desc')}</FormDescription> <FormMessage /> </FormItem> )}/>
              {/* Store Description */}
              <FormField control={form.control} name="storeDescription" render={({ field }) => ( <FormItem> <FormLabel>{t('admin_settings_form_store_description')}</FormLabel> <FormControl><Textarea {...field} rows={3} /></FormControl> <FormDescription>{t('admin_settings_form_store_description_desc')}</FormDescription> <FormMessage /> </FormItem> )}/>

              <Separator />

              {/* Logo URL */}
              <FormField control={form.control} name="logoUrl" render={({ field }) => (
                  <FormItem>
                      <FormLabel>{t('admin_settings_form_logo_url')}</FormLabel>
                      <FormControl><Input type="url" placeholder="https://.../logo.png" {...field} /></FormControl>
                      <FormDescription>{t('admin_settings_form_logo_url_desc')}</FormDescription>
                      <FormMessage />
                      {logoPreviewUrl ? (
                          <div className="mt-2">
                              <p className="text-sm font-medium">{t('admin_settings_form_preview_label')}</p>
                              <Image src={logoPreviewUrl} alt="Logo Preview" width={100} height={50} className="rounded border object-contain mt-1" onError={() => setLogoPreviewUrl(undefined)} />
                          </div>
                      ) : field.value && (
                           <p className="text-xs text-muted-foreground mt-1">{t('admin_settings_form_preview_error')}</p>
                      )}
                  </FormItem>
              )}/>

               {/* Favicon URL */}
              <FormField control={form.control} name="faviconUrl" render={({ field }) => (
                  <FormItem>
                      <FormLabel>{t('admin_settings_form_favicon_url')}</FormLabel>
                      <FormControl><Input type="url" placeholder="https://.../favicon.ico" {...field} /></FormControl>
                      <FormDescription>{t('admin_settings_form_favicon_url_desc')}</FormDescription>
                      <FormMessage />
                      {faviconPreviewUrl ? (
                          <div className="mt-2">
                              <p className="text-sm font-medium">{t('admin_settings_form_preview_label')}</p>
                              <Image src={faviconPreviewUrl} alt="Favicon Preview" width={32} height={32} className="rounded border object-contain mt-1" onError={() => setFaviconPreviewUrl(undefined)}/>
                          </div>
                      ): field.value && (
                           <p className="text-xs text-muted-foreground mt-1">{t('admin_settings_form_preview_error')}</p>
                      )}
                  </FormItem>
              )}/>

              <Separator />

              {/* Primary Color */}
              <FormField control={form.control} name="primaryColor" render={({ field }) => (
                  <FormItem>
                      <FormLabel>{t('admin_settings_form_primary_color')}</FormLabel>
                      <div className="flex items-center gap-2">
                          <FormControl><Input type="text" placeholder="hsl(154, 50%, 50%)" {...field} /></FormControl>
                          <div className="w-8 h-8 rounded border" style={{ backgroundColor: field.value || 'transparent' }}></div>
                      </div>
                      <FormDescription>{t('admin_settings_form_primary_color_desc')}</FormDescription>
                      <FormMessage />
                  </FormItem>
              )}/>

              <Separator />

              {/* Maintenance Mode */}
              <FormField control={form.control} name="enableMaintenance" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                          <FormLabel className="text-base">{t('admin_settings_form_maintenance_mode')}</FormLabel>
                          <FormDescription>{t('admin_settings_form_maintenance_mode_desc')}</FormDescription>
                      </div>
                      <FormControl>
                         <Switch
                             checked={field.value}
                             onCheckedChange={field.onChange}
                         />
                      </FormControl>
                  </FormItem>
              )}/>

              {/* Global Save Button - Now part of the form */}
              <div className="flex justify-end">
                 <Button
                     type="submit" // Submit the form
                     variant="destructive"
                     disabled={isSubmitting || settingsLoading}
                     className="min-w-[200px]"
                 >
                     {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                     {isSubmitting ? t('admin_settings_form_saving_button') : t('admin_settings_form_save_button')}
                 </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Save Button removed from here - It's now inside the form */}
      {/* <div className="flex justify-end max-w-3xl"> ... </div> */}
    </div>
  );
}

// Added DEFAULT_SETTINGS definition used in useEffect
const DEFAULT_SETTINGS: Settings = {
  storeName: 'SamaBoutique',
  supportEmail: 'support@samaboutique.com',
  enableMaintenance: false,
  storeDescription: 'Votre partenaire de confiance pour des produits et services de qualité.',
  primaryColor: 'hsl(154, 50%, 50%)',
  logoUrl: '',
  faviconUrl: '',
  carouselImages: [], // Defaults should be handled by useSettings hook itself now
  partnerLogos: [],
};
