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
import { KeyRound, User, Loader2 } from "lucide-react"; // Added User, Loader2
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useEffect, useState } from "react";

// Schema for profile update (excluding email for now)
const profileSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  // email: z.string().email({ message: "Email invalide." }), // Keep email display-only
});

// Schema for password change
const passwordSchema = z.object({
    currentPassword: z.string().min(1, { message: "Le mot de passe actuel est requis." }), // Min 1 to ensure it's not empty
    newPassword: z.string().min(6, { message: "Le nouveau mot de passe doit contenir au moins 6 caractères." }),
    confirmPassword: z.string().min(6, { message: "Veuillez confirmer le nouveau mot de passe." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les nouveaux mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

export default function UserProfilePage() {
  const { toast } = useToast();
  const { user, updateUserProfile, changePassword, isLoading: authLoading } = useAuth(); // Use context hooks
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);


  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: "", // Initialize empty, will be set by useEffect
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
      profileForm.reset({ name: user.name });
    }
  }, [user, profileForm]);


  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return;
    setIsProfileSubmitting(true);
    try {
      await updateUserProfile(user.id, { name: values.name }); // Update only name for now
      toast({
        title: "Profil Mis à Jour!",
        description: "Vos informations ont été enregistrées.",
         className: "bg-primary text-primary-foreground border-primary",
      });
    } catch (error: any) {
        console.error("Profile update failed:", error);
        toast({ title: "Erreur", description: error.message || "La mise à jour du profil a échoué.", variant: "destructive" });
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
        title: "Mot de Passe Modifié!",
        description: "Votre mot de passe a été changé avec succès.",
         className: "bg-primary text-primary-foreground border-primary",
      });
      passwordForm.reset(); // Reset password form
    } catch (error: any) {
        console.error("Password change failed:", error);
        // Determine specific error message
        let description = "La modification du mot de passe a échoué.";
        if (error.message === 'Incorrect current password') {
            description = "Le mot de passe actuel est incorrect.";
             passwordForm.setError("currentPassword", { type: "manual", message: "Mot de passe actuel incorrect." });
        } else if (error.message.includes('same as the current password')) {
            description = "Le nouveau mot de passe doit être différent de l'actuel.";
            passwordForm.setError("newPassword", { type: "manual", message: "Doit être différent du mot de passe actuel." });
        }
        toast({ title: "Erreur", description, variant: "destructive" });
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
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2"><User /> Mon Profil</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles et de sécurité.</p>
       </div>

      {/* Profile Information Card */}
      <Card className="shadow-md border-border">
        <CardHeader>
          <CardTitle>Informations Personnelles</CardTitle>
          <CardDescription>Mettez à jour votre nom.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom Complet</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom et prénom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {/* Display Email (read-only) */}
               <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" value={user.email} readOnly disabled className="bg-muted/50 cursor-not-allowed" />
                  </FormControl>
                   <FormDescription>
                      L'adresse email ne peut pas être modifiée.
                   </FormDescription>
               </FormItem>

              <Button
                 type="submit"
                 variant="destructive"
                 disabled={isProfileSubmitting || authLoading}
                 className="min-w-[150px]"
              >
                 {isProfileSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                 {isProfileSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      {/* Change Password Card */}
      <Card className="shadow-md border-border">
         <CardHeader>
           <CardTitle className="flex items-center gap-2"><KeyRound /> Sécurité</CardTitle>
           <CardDescription>Changez votre mot de passe.</CardDescription>
         </CardHeader>
         <CardContent>
           <Form {...passwordForm}>
             <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
               <FormField
                 control={passwordForm.control}
                 name="currentPassword"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Mot de Passe Actuel</FormLabel>
                     <FormControl>
                       <Input type="password" placeholder="********" {...field} />
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
                     <FormLabel>Nouveau Mot de Passe</FormLabel>
                     <FormControl>
                       <Input type="password" placeholder="Nouveau mot de passe (min. 6 caractères)" {...field} />
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
                     <FormLabel>Confirmer le Nouveau Mot de Passe</FormLabel>
                     <FormControl>
                       <Input type="password" placeholder="Confirmez le nouveau mot de passe" {...field} />
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
                   {isPasswordSubmitting ? 'Modification...' : 'Changer le Mot de Passe'}
               </Button>
             </form>
           </Form>
         </CardContent>
       </Card>
    </div>
  );
}
