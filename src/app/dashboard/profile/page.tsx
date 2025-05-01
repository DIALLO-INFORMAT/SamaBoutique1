// src/app/dashboard/profile/page.tsx
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
import { Separator } from "@/components/ui/separator";
import { KeyRound, User, Loader2, Phone } from "lucide-react"; // Added Phone, User, Loader2
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useEffect, useState } from "react";
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

// Get translations
const t = useTranslation().t;

// Schema for profile update (including optional phone)
const createProfileSchema = (t: Function) => z.object({
  name: z.string().min(2, { message: t('dashboard_profile_form_name') + " doit contenir au moins 2 caractères." }),
  phone: z.string().optional().or(z.literal('')).refine(value => {
      // Allow empty string or validate phone number format (simple example)
      if (!value) return true;
      return /^\+?[0-9\s-]{8,}$/.test(value);
  }, { message: t('checkout_form_phone') + " invalide." }), // Reuse checkout validation message
});

// Schema for password change
const createPasswordSchema = (t: Function) => z.object({
    currentPassword: z.string().min(1, { message: t('dashboard_profile_form_current_password') + " est requis." }),
    newPassword: z.string().min(6, { message: t('dashboard_profile_form_new_password') + " doit contenir au moins 6 caractères." }),
    confirmPassword: z.string().min(6, { message: "Veuillez confirmer le nouveau mot de passe." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les nouveaux mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});


export default function UserProfilePage() {
  const { toast } = useToast();
  const { user, updateUserProfile, changePassword, isLoading: authLoading } = useAuth(); // Use context hooks
  const { t } = useTranslation(); // Use translation hook

  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // Create schemas using the translation function
  const profileSchema = createProfileSchema(t);
  const passwordSchema = createPasswordSchema(t);


  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: "",
        phone: "", // Initialize phone
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    },
  });

  // Load user data into profile form once available
  useEffect(() => {
    if (user) {
      profileForm.reset({
          name: user.name,
          phone: user.phone || '' // Load phone number
       });
    }
  }, [user, profileForm]);


  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return;
    setIsProfileSubmitting(true);
    try {
       // Construct updates object, ensuring phone is correctly handled (pass empty string or actual value)
      const updates: Partial<User> = {
          name: values.name,
          phone: values.phone || undefined, // Send undefined if empty, or the value
      };
      await updateUserProfile(user.id, updates);
      toast({
        title: t('dashboard_profile_toast_success_title'),
        description: t('dashboard_profile_toast_success_description'),
         className: "bg-primary text-primary-foreground border-primary",
      });
    } catch (error: any) {
        console.error("Profile update failed:", error);
        toast({
            title: t('dashboard_profile_toast_error_title'),
            description: error.message || "La mise à jour du profil a échoué.",
            variant: "destructive"
        });
    } finally {
        setIsProfileSubmitting(false);
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
     if (!user) return;
     setIsPasswordSubmitting(true);
    try {
      await changePassword(user.email, values.currentPassword, values.newPassword);
      toast({
        title: t('dashboard_password_toast_success_title'),
        description: t('dashboard_password_toast_success_description'),
         className: "bg-primary text-primary-foreground border-primary",
      });
      passwordForm.reset(); // Reset password form
    } catch (error: any) {
        console.error("Password change failed:", error);
        let description = t('dashboard_password_toast_error_description');
        if (error.message === 'Incorrect current password') {
            description = t('dashboard_password_toast_error_incorrect');
             passwordForm.setError("currentPassword", { type: "manual", message: description });
        } else if (error.message.includes('same as the current password')) {
            description = t('dashboard_password_toast_error_same');
            passwordForm.setError("newPassword", { type: "manual", message: description });
        }
        toast({ title: t('dashboard_profile_toast_error_title'), description, variant: "destructive" });
    } finally {
        setIsPasswordSubmitting(false);
    }
  }

  // Show loading skeleton or message if user data is not yet loaded
  if (authLoading || !user) {
      return (
          <div className="space-y-8">
              <Skeleton className="h-8 w-48" />
              {[...Array(2)].map((_, i) => (
                  <Card key={i}>
                      <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                      <CardContent className="space-y-6">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" /> {/* Added skeleton for phone */}
                          <Skeleton className="h-10 w-32" />
                      </CardContent>
                  </Card>
              ))}
          </div>
      );
  }

  return (
    <div className="space-y-8">
       <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2"><User /> {t('dashboard_profile_page_title')}</h1>
          <p className="text-muted-foreground">{t('dashboard_profile_description')}</p>
       </div>

      {/* Profile Information Card */}
      <Card className="shadow-md border-border">
        <CardHeader>
          <CardTitle>{t('dashboard_profile_info_title')}</CardTitle>
          <CardDescription>{t('dashboard_profile_info_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('dashboard_profile_form_name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('dashboard_profile_form_name_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {/* Phone Number Field */}
               <FormField
                 control={profileForm.control}
                 name="phone"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="flex items-center gap-1"><Phone className="h-4 w-4"/> {t('checkout_form_phone')}</FormLabel>
                     <FormControl>
                       <Input type="tel" placeholder={t('checkout_form_phone_placeholder')} {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               {/* Display Email (read-only) */}
               <FormItem>
                  <FormLabel>{t('dashboard_profile_form_email_label')}</FormLabel>
                  <FormControl>
                    <Input type="email" value={user.email} readOnly disabled className="bg-muted/50 cursor-not-allowed" />
                  </FormControl>
                   <FormDescription>
                      {t('dashboard_profile_form_email_description')}
                   </FormDescription>
               </FormItem>

              <Button
                 type="submit"
                 variant="destructive"
                 disabled={isProfileSubmitting || authLoading}
                 className="min-w-[150px]"
              >
                 {isProfileSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                 {isProfileSubmitting ? t('dashboard_profile_form_saving_button') : t('dashboard_profile_form_save_button')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      {/* Change Password Card */}
      <Card className="shadow-md border-border">
         <CardHeader>
           <CardTitle className="flex items-center gap-2"><KeyRound /> {t('dashboard_profile_security_title')}</CardTitle>
           <CardDescription>{t('dashboard_profile_security_description')}</CardDescription>
         </CardHeader>
         <CardContent>
           <Form {...passwordForm}>
             <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
               <FormField
                 control={passwordForm.control}
                 name="currentPassword"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{t('dashboard_profile_form_current_password')}</FormLabel>
                     <FormControl>
                       <Input type="password" placeholder={t('dashboard_profile_form_current_password_placeholder')} {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
                <FormField
                 control={passwordForm.control}
                 name="newPassword"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{t('dashboard_profile_form_new_password')}</FormLabel>
                     <FormControl>
                       <Input type="password" placeholder={t('dashboard_profile_form_new_password_placeholder')} {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
                <FormField
                 control={passwordForm.control}
                 name="confirmPassword"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{t('dashboard_profile_form_confirm_new_password')}</FormLabel>
                     <FormControl>
                       <Input type="password" placeholder={t('dashboard_profile_form_confirm_new_password_placeholder')} {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <Button
                   type="submit"
                   variant="destructive"
                   disabled={isPasswordSubmitting || authLoading}
                   className="min-w-[200px]"
               >
                   {isPasswordSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                   {isPasswordSubmitting ? t('dashboard_profile_form_changing_password_button') : t('dashboard_profile_form_change_password_button')}
               </Button>
             </form>
           </Form>
         </CardContent>
       </Card>
    </div>
  );
}
