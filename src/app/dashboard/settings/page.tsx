// src/app/dashboard/settings/page.tsx (Manager View - Placeholder)
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';

export default function ManagerSettingsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useTranslation();

    // Redirect if not manager or still loading
    useEffect(() => {
        if (!authLoading && user?.role !== 'manager') {
            toast({ title: t('dashboard_manager_unauthorized_access_toast_title'), description: "Accès refusé.", variant: "destructive" });
            router.replace('/dashboard');
        }
    }, [user, authLoading, toast, router, t]);

     // Render loading or unauthorized state
    if (authLoading) {
        return <div className="p-6 text-center">{t('loading')}</div>;
    }
    if (user?.role !== 'manager') {
        return null; // Redirect is handled by useEffect
    }


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">{t('admin_settings_page_title')} (Gestionnaire)</h1>
      {/* For now, show a placeholder indicating managers cannot edit general settings */}
       <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-md">
           <CardHeader>
               <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                   <AlertTriangle className="h-5 w-5" />
                   Accès Restreint
               </CardTitle>
           </CardHeader>
           <CardContent>
               <p className="text-yellow-800 dark:text-yellow-300">
                   Les gestionnaires ne peuvent pas modifier les paramètres généraux de la boutique. Seuls les administrateurs ont cette permission.
               </p>
               <p className="text-sm mt-2 text-muted-foreground">
                   Vous pouvez gérer les produits, les catégories, les étiquettes, les commandes et l'apparence de l'accueil depuis les autres sections de votre tableau de bord.
               </p>
           </CardContent>
       </Card>
    </div>
  );
}
```