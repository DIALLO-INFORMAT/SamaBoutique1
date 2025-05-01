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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus } from 'lucide-react';

// Placeholder for future auth implementation
// import { signIn, signUp } from '@/lib/auth'; // Adjust path as needed

const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Email invalide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
  confirmPassword: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"], // path of error
});


export default function AccountPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    console.log("Login attempt:", values);
    // Placeholder: Replace with actual authentication logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Connexion réussie (simulation)",
      description: "Vous êtes maintenant connecté.",
      className: "bg-primary text-primary-foreground border-primary"
    });
    // Redirect user after successful login, e.g., router.push('/dashboard');
    setIsLoading(false);
    // loginForm.reset(); // Reset form on success? Maybe not needed if redirecting
  }

  async function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    console.log("Registration attempt:", values);
    // Placeholder: Replace with actual registration logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Inscription réussie (simulation)",
      description: "Votre compte a été créé. Vous pouvez maintenant vous connecter.",
      className: "bg-primary text-primary-foreground border-primary"
    });
    setActiveTab("login"); // Switch to login tab after registration
    setIsLoading(false);
    registerForm.reset();
  }

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-primary">
            {activeTab === "login" ? "Connexion" : "Créer un Compte"}
          </CardTitle>
          <CardDescription>
            {activeTab === "login"
              ? "Accédez à votre compte SamaBoutique."
              : "Rejoignez-nous pour gérer vos commandes."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" disabled={isLoading}><LogIn className="mr-2 h-4 w-4"/>Se Connecter</TabsTrigger>
              <TabsTrigger value="register" disabled={isLoading}><UserPlus className="mr-2 h-4 w-4"/>S'inscrire</TabsTrigger>
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
                          <Input type="email" placeholder="votre.email@exemple.com" {...field} />
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
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading} variant="destructive">
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
                          <Input placeholder="Votre nom et prénom" {...field} />
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
                          <Input type="email" placeholder="votre.email@exemple.com" {...field} />
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
                          <Input type="password" placeholder="Choisissez un mot de passe" {...field} />
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
                          <Input type="password" placeholder="Retapez votre mot de passe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading} variant="destructive">
                    {isLoading ? "Inscription..." : "Créer le Compte"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        {/* Optional Footer can be added here */}
        {/* <CardFooter> ... </CardFooter> */}
      </Card>
    </div>
  );
}
