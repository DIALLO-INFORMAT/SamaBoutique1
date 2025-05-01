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
import { KeyRound } from "lucide-react"; // Icon for password section

// Schema for profile update
const profileSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Email invalide." }),
  // Add other fields like phone, address if needed
});

// Schema for password change
const passwordSchema = z.object({
    currentPassword: z.string().min(6, { message: "Le mot de passe actuel est requis." }),
    newPassword: z.string().min(6, { message: "Le nouveau mot de passe doit contenir au moins 6 caractères." }),
    confirmPassword: z.string().min(6, { message: "Veuillez confirmer le nouveau mot de passe." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les nouveaux mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});


// Placeholder user data - replace with actual data fetching
const currentUser = {
    name: "Alice Dupont",
    email: "alice.d@example.com",
};

export default function UserProfilePage() {
  const { toast } = useToast();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: currentUser, // Load current user data
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    },
  });


  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    // Simulate updating profile information
    console.log("Updating Profile:", values);
    // In a real app, send this data to your backend API
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Profil Mis à Jour!",
      description: "Vos informations ont été enregistrées.",
       className: "bg-primary text-primary-foreground border-primary",
    });
    // Optionally update local state or refetch user data
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    // Simulate changing password
    console.log("Changing Password for:", currentUser.email); // Log email for context
    // In a real app, send values to your backend API for validation and update
    // Make sure to handle errors (e.g., incorrect current password)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Example success feedback
    toast({
      title: "Mot de Passe Modifié!",
      description: "Votre mot de passe a été changé avec succès.",
       className: "bg-primary text-primary-foreground border-primary",
    });
    passwordForm.reset(); // Reset password form
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Mon Profil</h1>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Personnelles</CardTitle>
          <CardDescription>Mettez à jour votre nom et votre adresse email.</CardDescription>
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
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre.email@exemple.com" {...field} disabled />
                      {/* Typically email is not editable directly, or requires verification */}
                    </FormControl>
                     <FormDescription>
                        L'email ne peut pas être modifié ici. Contactez le support si nécessaire.
                     </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Add fields for phone, address here if managed by user */}
              <Button
                 type="submit"
                 variant="destructive"
                 disabled={profileForm.formState.isSubmitting}
              >
                 {profileForm.formState.isSubmitting ? 'Sauvegarde...' : 'Sauvegarder les Informations'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      {/* Change Password Card */}
      <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2"><KeyRound /> Changer le Mot de Passe</CardTitle>
           <CardDescription>Mettez à jour votre mot de passe pour sécuriser votre compte.</CardDescription>
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
                       <Input type="password" placeholder="Nouveau mot de passe" {...field} />
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
                   disabled={passwordForm.formState.isSubmitting}
               >
                   {passwordForm.formState.isSubmitting ? 'Modification...' : 'Changer le Mot de Passe'}
               </Button>
             </form>
           </Form>
         </CardContent>
       </Card>
    </div>
  );
}