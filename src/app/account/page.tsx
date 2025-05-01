
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslation, useCallback } from '@/hooks/useTranslation'; // Import useTranslation and useCallback

// Wrap schema creation in a function to use the `t` function
const createLoginSchema = (t: Function) => z.object({
  email: z.string().email({ message: t('account_form_email') + " invalid." }),
  password: z.string().min(6, { message: t('account_form_password') + " must contain at least 6 characters." }),
});

const createRegisterSchema = (t: Function) => z.object({
  name: z.string().min(2, { message: t('account_form_name') + " must contain at least 2 characters." }),
  email: z.string().email({ message: t('account_form_email') + " invalid." }),
  password: z.string().min(6, { message: t('account_form_password') + " must contain at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: t('account_form_password') + " must contain at least 6 characters." }),
  role: z.enum(["admin", "manager", "customer"], {
    required_error: t('account_form_account_type') + " is required.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('account_form_password') + "s do not match.",
  path: ["confirmPassword"],
});


export default function AccountPage() {
  const { t } = useTranslation(); // Use translation hook
  const { toast } = useToast();
  const { login, signup, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Create schemas using the t function
  const loginSchema = createLoginSchema(t);
  const registerSchema = createRegisterSchema(t);

  // Redirect if user is already logged in
  if (user) {
     if (user.role === 'admin') {
       router.replace('/admin');
     } else {
        router.replace('/dashboard');
     }
     return <div className="text-center py-10">{t('account_redirecting')}</div>;
  }

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "customer" },
  });

  // Use useCallback for event handlers if needed, though not strictly necessary here
  const onLoginSubmit = useCallback(async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const loggedInUser = await login(values.email, values.password);
      toast({
        title: t('account_toast_login_success_title'),
        description: t('account_toast_login_success_description', { name: loggedInUser.name }),
        className: "bg-primary text-primary-foreground border-primary"
      });
      if (loggedInUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: t('account_toast_login_error_title'),
        description: error.message || t('account_toast_login_error_description'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [login, router, toast, t]); // Include dependencies

  const onRegisterSubmit = useCallback(async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    try {
      if ((values.role === 'admin' || values.role === 'manager') && user?.role !== 'admin') {
          values.role = 'customer';
          toast({
              title: t('account_toast_role_adjusted_title'),
              description: t('account_toast_role_adjusted_description'),
              variant: "default",
          });
      }

      await signup(values.name, values.email, values.password, values.role);
      toast({
        title: t('account_toast_register_success_title'),
        description: t('account_toast_register_success_description'),
        className: "bg-primary text-primary-foreground border-primary"
      });
      setActiveTab("login");
      registerForm.reset();
      loginForm.setValue("email", values.email);
    } catch (error: any) {
        console.error("Signup failed:", error);
        toast({
            title: t('account_toast_register_error_title'),
            description: error.message || t('account_toast_register_error_description'),
            variant: "destructive",
        });
    } finally {
      setIsLoading(false);
    }
  }, [signup, user, toast, setActiveTab, registerForm, loginForm, t]); // Include dependencies

  return (
    <div className="container mx-auto max-w-lg flex justify-center items-center py-12">
      <Card className="w-full shadow-xl rounded-lg border-primary/20">
        <CardHeader className="text-center pb-4 pt-6">
          <CardTitle className="text-3xl font-bold text-primary">
            {activeTab === "login" ? t('account_page_login_title') : t('account_page_register_title')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {activeTab === "login"
              ? t('account_page_login_description')
              : t('account_page_register_description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary rounded-md p-1">
              <TabsTrigger value="login" disabled={isLoading} className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md rounded-sm py-2 text-sm font-medium">
                {t('account_page_login_tab')}
              </TabsTrigger>
              <TabsTrigger value="register" disabled={isLoading} className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md rounded-sm py-2 text-sm font-medium">
                {t('account_page_register_tab')}
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
                        <FormLabel>{t('account_form_email')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('account_form_email_placeholder')} {...field} className="text-base"/>
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
                        <FormLabel>{t('account_form_password')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('account_form_password_placeholder')} {...field} className="text-base"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-11 text-base" disabled={isLoading} variant="destructive">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? t('account_form_login_loading') : t('account_form_login_button')}
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
                        <FormLabel>{t('account_form_name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('account_form_name_placeholder')} {...field} className="text-base"/>
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
                        <FormLabel>{t('account_form_email')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('account_form_email_placeholder')} {...field} className="text-base"/>
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
                        <FormLabel>{t('account_form_password')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('account_form_password_placeholder')} {...field} className="text-base"/>
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
                        <FormLabel>{t('account_form_confirm_password')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('account_form_confirm_password_placeholder')} {...field} className="text-base"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>{t('account_form_account_type')}</FormLabel>
                          <FormControl>
                             <RadioGroup
                               onValueChange={(value) => {
                                    if ((value === 'admin' || value === 'manager') && user?.role !== 'admin') {
                                        field.onChange('customer');
                                    } else {
                                        field.onChange(value as "admin" | "manager" | "customer");
                                    }
                                }}
                                value={field.value}
                                className="flex flex-col space-y-1"
                             >
                               <FormItem className="flex items-center space-x-3 space-y-0">
                                 <FormControl><RadioGroupItem value="customer" /></FormControl>
                                 <FormLabel className="font-normal">{t('account_form_role_customer')}</FormLabel>
                               </FormItem>
                               {user?.role === 'admin' && (
                                  <>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl><RadioGroupItem value="manager" /></FormControl>
                                      <FormLabel className="font-normal">{t('account_form_role_manager')}</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl><RadioGroupItem value="admin" /></FormControl>
                                      <FormLabel className="font-normal">{t('account_form_role_admin')}</FormLabel>
                                    </FormItem>
                                  </>
                               )}
                             </RadioGroup>
                          </FormControl>
                           <FormDescription>
                              {user?.role === 'admin'
                                ? t('account_form_role_description_admin')
                                : t('account_form_role_description_customer')}
                           </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <Button type="submit" className="w-full h-11 text-base" disabled={isLoading} variant="destructive">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? t('account_form_register_loading') : t('account_form_register_button')}
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
