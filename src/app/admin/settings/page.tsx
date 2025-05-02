
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
import {useEffect, useState, useCallback} from 'react'; // Import useCallback
import Image from 'next/image';
import {ImageIcon, Loader2, Trash2, PlusCircle} from 'lucide-react'; // Added Trash2, PlusCircle
import { useSettings, saveSettings, CarouselImage, PartnerLogo, Settings } from '@/hooks/useSettings'; // Import settings hooks and types
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { Label } from "@/components/ui/label"; // Import Label

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

// --- Helper: Image Management Card ---
interface ImageItem {
  id?: string; // Optional ID for partner logos
  src: string;
  alt: string;
  hint: string;
}

interface ImageManagementCardProps<T extends ImageItem> {
  title: string;
  description: string;
  images: T[];
  onImagesChange: (images: T[]) => void;
  itemType: 'carousel' | 'partner'; // To handle ID for partners
}

function ImageManagementCard<T extends ImageItem>({
  title,
  description,
  images,
  onImagesChange,
  itemType,
}: ImageManagementCardProps<T>) {
    const { t } = useTranslation();
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageAlt, setNewImageAlt] = useState('');
    const [newImageHint, setNewImageHint] = useState('');
    const [error, setError] = useState('');

    const handleAddImage = () => {
        setError('');
        // Basic URL validation (can be more robust)
        if (!newImageUrl.startsWith('http://') && !newImageUrl.startsWith('https://')) {
            setError(t('admin_settings_form_image_url_invalid'));
            return;
        }
        if (!newImageAlt) {
             setError(t('admin_settings_form_alt_text_required'));
             return;
        }
        if (!newImageHint) {
            setError(t('admin_settings_form_ai_hint_required'));
             return;
        }

        const newItem: T = {
            src: newImageUrl,
            alt: newImageAlt,
            hint: newImageHint,
            ...(itemType === 'partner' && { id: `logo-${Date.now()}` }), // Add ID for partners
        } as T;

        onImagesChange([...images, newItem]);
        setNewImageUrl('');
        setNewImageAlt('');
        setNewImageHint('');
    };

    const handleRemoveImage = (index: number) => {
        onImagesChange(images.filter((_, i) => i !== index));
    };

    return (
        <Card className="shadow-md border-border">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* List Current Images */}
                {images.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 border rounded-md p-3">
                        {images.map((img, index) => (
                            <div key={img.id || index} className="flex items-center justify-between gap-2 border-b pb-2 last:border-b-0">
                                <div className="flex items-center gap-2 flex-grow min-w-0">
                                    <Image
                                        src={img.src}
                                        alt={img.alt}
                                        width={itemType === 'carousel' ? 80 : 60}
                                        height={itemType === 'carousel' ? 40 : 30}
                                        className="rounded border object-contain bg-muted"
                                        onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if image fails
                                    />
                                    <div className="text-xs flex-grow min-w-0">
                                        <p className="font-medium truncate" title={img.alt}>{img.alt}</p>
                                        <p className="text-muted-foreground truncate" title={img.src}>{img.src}</p>
                                        <p className="text-muted-foreground truncate" title={img.hint}>Hint: {img.hint}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveImage(index)} className="text-destructive h-7 w-7">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('admin_settings_no_images')}</p>
                )}

                <Separator />

                {/* Add New Image Form */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('admin_settings_add_new_image')}</Label>
                     <Input
                         type="url"
                         placeholder={t('admin_settings_form_image_url')}
                         value={newImageUrl}
                         onChange={(e) => setNewImageUrl(e.target.value)}
                     />
                     <Input
                         type="text"
                         placeholder={t('admin_settings_form_alt_text')}
                         value={newImageAlt}
                         onChange={(e) => setNewImageAlt(e.target.value)}
                         maxLength={50}
                     />
                      <Input
                         type="text"
                         placeholder={t('admin_settings_form_ai_hint')}
                         value={newImageHint}
                         onChange={(e) => setNewImageHint(e.target.value)}
                         maxLength={30}
                         />
                     {error && <p className="text-xs text-destructive">{error}</p>}
                     <Button size="sm" variant="outline" onClick={handleAddImage} disabled={!newImageUrl || !newImageAlt || !newImageHint} className="w-full sm:w-auto">
                         <PlusCircle className="mr-2 h-4 w-4" /> {t('admin_settings_add_image_button')}
                     </Button>
                      {/* Replaced FormDescription with a simple p tag */}
                     <p className="text-xs text-muted-foreground">
                        {itemType === 'carousel' ? t('admin_settings_carousel_hint_desc') : t('admin_settings_partner_hint_desc')}
                     </p>
                </div>
            </CardContent>
        </Card>
    );
}


// --- Main Settings Page Component ---
export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const {isLoading: settingsLoading, ...currentSettings } = useSettings(); // Destructure isLoading separately
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local state for image lists, initialized from global settings
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [partnerLogos, setPartnerLogos] = useState<PartnerLogo[]>([]);

  const settingsSchema = createSettingsSchema(t);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
        storeName: '', supportEmail: '', enableMaintenance: false,
        storeDescription: '', primaryColor: '', logoUrl: '', faviconUrl: '',
    },
  });

  // Initialize form and local image states when settings load
  useEffect(() => {
      if (!settingsLoading) {
          const settingsToApply = {
                storeName: currentSettings.storeName,
                supportEmail: currentSettings.supportEmail,
                enableMaintenance: currentSettings.enableMaintenance,
                storeDescription: currentSettings.storeDescription,
                primaryColor: currentSettings.primaryColor,
                logoUrl: currentSettings.logoUrl || '',
                faviconUrl: currentSettings.faviconUrl || '',
            };
           form.reset(settingsToApply);
           setCarouselImages(currentSettings.carouselImages || []); // Initialize local state
           setPartnerLogos(currentSettings.partnerLogos || []);     // Initialize local state
      }
  }, [settingsLoading, currentSettings, form]); // Add form as dependency

  // Preview states
   const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | undefined>(undefined);
   const [faviconPreviewUrl, setFaviconPreviewUrl] = useState<string | undefined>(undefined);

   // Update previews based on form values
   useEffect(() => {
     const subscription = form.watch((value, { name }) => {
       if (name === 'logoUrl') setLogoPreviewUrl(value.logoUrl || undefined);
       if (name === 'faviconUrl') setFaviconPreviewUrl(value.faviconUrl || undefined);
     });
     return () => subscription.unsubscribe();
   }, [form]);


  const handleSaveAllSettings = useCallback(async () => {
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
        // Combine core settings with the current state of image lists
        const allSettingsToSave: Partial<Settings> = {
            ...coreValues,
            carouselImages: carouselImages, // Use local state
            partnerLogos: partnerLogos,     // Use local state
        };

        saveSettings(allSettingsToSave);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

        toast({
            title: t('admin_settings_toast_save_success_title'),
            description: t('admin_settings_toast_save_success_description'),
            className: 'bg-primary text-primary-foreground border-primary',
        });
    } catch (error) {
        console.error("Failed to save settings:", error);
         toast({
             title: t('admin_settings_toast_save_error_title'),
             description: t('admin_settings_toast_save_error_description'),
             variant: 'destructive',
         });
    } finally {
        setIsSubmitting(false);
    }
  }, [form, carouselImages, partnerLogos, t, toast]);


   // Show loading skeleton if settings are loading
   if (settingsLoading) {
        return (
             <div className="space-y-8">
                 <h1 className="text-3xl font-bold text-primary">{t('admin_settings_page_title')}</h1>
                 {[...Array(3)].map((_, i) => ( // Skeleton for 3 cards
                     <Card key={i} className="max-w-3xl">
                         <CardHeader>
                             <Skeleton className="h-6 w-2/5 bg-muted" />
                             <Skeleton className="h-4 w-4/5 bg-muted mt-1" />
                         </CardHeader>
                         <CardContent className="space-y-6">
                             {[...Array(i === 0 ? 7 : 4)].map((_, j) => ( // More skeletons for first card
                                 <div key={j} className="space-y-2">
                                     <Skeleton className="h-4 w-1/4 bg-muted" />
                                     <Skeleton className="h-10 w-full bg-muted" />
                                 </div>
                             ))}
                         </CardContent>
                     </Card>
                 ))}
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
            <form id="core-settings-form" className="space-y-8"> {/* No onSubmit here */}
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
                          <div className="w-8 h-8 rounded border" style={{ backgroundColor: field.value }}></div>
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

              {/* Removed Save Button from here */}
            </form>
          </Form>
        </CardContent>
      </Card>

       {/* Carousel Image Management Card */}
       <ImageManagementCard<CarouselImage>
          title={t('admin_settings_carousel_title')}
          description={t('admin_settings_carousel_description')}
          images={carouselImages}
          onImagesChange={setCarouselImages}
          itemType="carousel"
       />

        {/* Partner Logos Management Card */}
        <ImageManagementCard<PartnerLogo>
           title={t('admin_settings_partners_title')}
           description={t('admin_settings_partners_description')}
           images={partnerLogos}
           onImagesChange={setPartnerLogos}
           itemType="partner"
        />

      {/* Global Save Button */}
      <div className="flex justify-end max-w-3xl">
         <Button
             onClick={handleSaveAllSettings}
             variant="destructive"
             disabled={isSubmitting || settingsLoading}
             className="min-w-[200px]"
         >
             {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
             {isSubmitting ? t('admin_settings_form_saving_button') : t('admin_settings_form_save_button')}
         </Button>
      </div>
    </div>
  );
}
