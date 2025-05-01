'use client';

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription, // Added FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react'; // Only keep Loader2
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Import RadioGroup

const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
});

// Add role to register schema
const registerSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Email invalide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
  confirmPassword: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
  role: z.enum(["admin", "manager", "customer"], {
    required_error: "Vous devez sélectionner un type de compte.",
  }), // Role selection added
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"], // path of error
});


export default function AccountPage() {
  const { toast } = useToast();
  const { login, signup, user } = useAuth(); // Use login and signup from context
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Redirect if user is already logged in
  if (user) {
     if (user.role === 'admin') {
       router.replace('/admin');
     } else {
        router.replace('/dashboard');
     }
     return <div className="text-center py-10">Redirection...</div>; // Show loading while redirecting
  }

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "customer" }, // Default role to customer
  });

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const loggedInUser = await login(values.email, values.password);
      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${loggedInUser.name}!`,
        className: "bg-primary text-primary-foreground border-primary"
      });
      // Redirect based on role
      if (loggedInUser.role === 'admin') {
        router.push('/admin');
      } else { // customer or manager
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: "Échec de la connexion",
        description: error.message || "Email ou mot de passe incorrect.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    try {
      // Prevent non-admin users from creating admin/manager accounts through UI for security
      // In a real app, backend validation is crucial. This is a basic UI guard.
      if ((values.role === 'admin' || values.role === 'manager') && user?.role !== 'admin') {
          // Default non-admins trying to create privileged accounts to 'customer'
          values.role = 'customer';
          toast({
              title: "Type de Compte Ajusté",
              description: "Le compte sera créé en tant que Client.",
              variant: "default", // Use default or a warning style
          });
          // Continue registration as customer
      }


      await signup(values.name, values.email, values.password, values.role);
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé. Vous pouvez maintenant vous connecter.",
        className: "bg-primary text-primary-foreground border-primary"
      });
      setActiveTab("login"); // Switch to login tab after registration
      registerForm.reset(); // Clear the registration form
      loginForm.setValue("email", values.email); // Pre-fill login email
    } catch (error: any) {
        console.error("Signup failed:", error);
        toast({
            title: "Échec de l'inscription",
            description: error.message || "Impossible de créer le compte. L'email existe peut-être déjà.",
            variant: "destructive",
        });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-lg flex justify-center items-center py-12"> {/* Adjusted max-width */}
      <Card className="w-full shadow-xl rounded-lg border-primary/20"> {/* Enhanced styling */}
        <CardHeader className="text-center pb-4 pt-6">
          <CardTitle className="text-3xl font-bold text-primary">
            {activeTab === "login" ? "Accès Membre" : "Créer un Compte"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {activeTab === "login"
              ? "Connectez-vous à votre espace SamaBoutique."
              : "Rejoignez notre communauté."}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary rounded-md p-1">
              <TabsTrigger value="login" disabled={isLoading} className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md rounded-sm py-2 text-sm font-medium">
                {/* Removed LogIn icon */}Se Connecter
              </TabsTrigger>
              <TabsTrigger value="register" disabled={isLoading} className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md rounded-sm py-2 text-sm font-medium">
                {/* Removed UserPlus icon */}S'inscrire
              </TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="votre.email@exemple.com" {...field} className="text-base"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} className="text-base"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-11 text-base" disabled={isLoading} variant="destructive">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null /* Removed LogIn icon */}
                    {isLoading ? "Connexion..." : "Se Connecter"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Registration Form */}
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom Complet</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom et prénom" {...field} className="text-base"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="votre.email@exemple.com" {...field} className="text-base"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Choisissez un mot de passe" {...field} className="text-base"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Retapez votre mot de passe" {...field} className="text-base"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   {/* Role Selection - Conditionally render based on if current user is admin */}
                   {/* Always show 'Client' option, hide others if not admin */}
                   <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Type de compte</FormLabel>
                          <FormControl>
                             <RadioGroup
                               onValueChange={(value) => {
                                    // Only allow setting admin/manager if the logged-in user is admin
                                    if ((value === 'admin' || value === 'manager') && user?.role !== 'admin') {
                                        field.onChange('customer'); // Force back to customer if not admin
                                    } else {
                                        field.onChange(value as "admin" | "manager" | "customer");
                                    }
                                }}
                                value={field.value}
                                className="flex flex-col space-y-1"
                             >
                               <FormItem className="flex items-center space-x-3 space-y-0">
                                 <FormControl>
                                   <RadioGroupItem value="customer" />
                                 </FormControl>
                                 <FormLabel className="font-normal">Client</FormLabel>
                               </FormItem>
                               {/* Only show Manager/Admin options if the current user is an admin */}
                               {user?.role === 'admin' && (
                                  <>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl><RadioGroupItem value="manager" /></FormControl>
                                      <FormLabel className="font-normal">Gestionnaire</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl><RadioGroupItem value="admin" /></FormControl>
                                      <FormLabel className="font-normal">Administrateur</FormLabel>
                                    </FormItem>
                                  </>
                               )}
                             </RadioGroup>
                          </FormControl>
                           <FormDescription>
                              {user?.role === 'admin'
                                ? "Sélectionnez le rôle pour le nouvel utilisateur."
                                : "Vous créez un compte Client."}
                           </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <Button type="submit" className="w-full h-11 text-base" disabled={isLoading} variant="destructive">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null /* Removed UserPlus icon */}
                    {isLoading ? "Inscription..." : "Créer le Compte"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
