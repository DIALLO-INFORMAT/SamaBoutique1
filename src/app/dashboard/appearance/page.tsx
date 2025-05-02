// src/app/dashboard/appearance/page.tsx (Manager View)
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ImagePlus } from 'lucide-react';
import { useSettings, saveSettings, CarouselImage, PartnerLogo, Settings } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageManagementCard } from '@/components/ui/image-management-card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useRouter } from 'next/navigation'; // Import useRouter

export default function ManagerAppearancePage() {
  const { user, isLoading: authLoading } = useAuth(); // Get user and auth status
  const router = useRouter(); // For redirecting
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isLoading: settingsLoading, ...currentSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);

  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [partnerLogos, setPartnerLogos] = useState<PartnerLogo[]>([]);

  // Redirect if not manager
  useEffect(() => {
    if (!authLoading && user?.role !== 'manager') {
      toast({ title: t('dashboard_manager_unauthorized_access_toast_title'), description: "Accès refusé.", variant: "destructive" });
      router.replace('/dashboard');
    }
  }, [user, authLoading, toast, router, t]);

  // Initialize local states when settings load and user is a manager
  useEffect(() => {
    if (!settingsLoading && user?.role === 'manager') {
      setCarouselImages(currentSettings.carouselImages || []);
      setPartnerLogos(currentSettings.partnerLogos || []);
    }
  }, [settingsLoading, currentSettings, user]);

  const handleSaveChanges = useCallback(async () => {
    setIsSaving(true);
    try {
      const appearanceSettings: Partial<Settings> = {
        carouselImages: carouselImages,
        partnerLogos: partnerLogos,
      };
      saveSettings(appearanceSettings);
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: t('admin_settings_toast_save_success_title'),
        description: "Les images du carrousel et les logos partenaires ont été mis à jour.",
        className: 'bg-primary text-primary-foreground border-primary',
      });
    } catch (error) {
      console.error("Failed to save appearance settings:", error);
      toast({
        title: t('admin_settings_toast_save_error_title'),
        description: "Impossible d'enregistrer les modifications d'apparence.",
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [carouselImages, partnerLogos, t, toast]);

  // Show loading skeleton or unauthorized message
  if (settingsLoading || authLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">{t('manager_appearance_page_title')}</h1>
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-96 w-full max-w-3xl" />
        ))}
        <Skeleton className="h-10 w-40 bg-muted rounded ml-auto" />
      </div>
    );
  }

  // Render nothing further if not authorized (redirect handled in useEffect)
  if (user?.role !== 'manager') {
    return null;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">{t('manager_appearance_page_title')}</h1>
      <p className="text-muted-foreground">{t('manager_appearance_description')}</p>

      <ImageManagementCard<CarouselImage>
        title={t('admin_settings_carousel_title')}
        description={t('admin_settings_carousel_description')}
        images={carouselImages}
        onImagesChange={setCarouselImages}
        itemType="carousel"
      />

      <ImageManagementCard<PartnerLogo>
        title={t('admin_settings_partners_title')}
        description={t('admin_settings_partners_description')}
        images={partnerLogos}
        onImagesChange={setPartnerLogos}
        itemType="partner"
      />

      <div className="flex justify-end max-w-3xl">
        <Button
          onClick={handleSaveChanges}
          variant="destructive"
          disabled={isSaving || settingsLoading}
          className="min-w-[200px]"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSaving ? t('general_saving') : t('general_save')}
        </Button>
      </div>
    </div>
  );
}
