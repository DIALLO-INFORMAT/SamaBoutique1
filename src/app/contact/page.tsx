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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// Removed Mail import from lucide-react

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  subject: z.string().min(5, {
    message: "Le sujet doit contenir au moins 5 caractères.",
  }),
  message: z.string().min(10, {
    message: "Le message doit contenir au moins 10 caractères.",
  }).max(500, {
    message: "Le message ne peut pas dépasser 500 caractères."
  }),
});

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Simulate sending the message
    console.log("Form submitted:", values);
    // In a real app, you would send this data to your backend/API
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request

    toast({
      title: "Message Envoyé!",
      description: "Merci de nous avoir contactés. Nous vous répondrons bientôt.",
      variant: "default", // Using default which uses primary color accents
      className: "bg-primary text-primary-foreground border-primary", // Custom styling for success
    });
    form.reset(); // Reset form after successful submission
  }

  return (
    // Added container and max-width here
    <div className="container mx-auto max-w-4xl flex justify-center py-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          {/* Removed Mail icon */}
          <CardTitle className="text-2xl font-bold text-primary">Contactez-nous</CardTitle>
          <CardDescription>
            Remplissez le formulaire ci-dessous pour nous envoyer un message.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                   control={form.control}
                   name="name"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Nom</FormLabel>
                       <FormControl>
                         <Input placeholder="Votre nom" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={form.control}
                   name="email"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Email</FormLabel>
                       <FormControl>
                         <Input type="email" placeholder="Votre email" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
              </div>
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sujet</FormLabel>
                    <FormControl>
                      <Input placeholder="Sujet de votre message" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tapez votre message ici..."
                        className="resize-none"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                     <FormDescription className="text-right">
                        {field.value.length}/500
                     </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                 type="submit"
                 className="w-full"
                 style={{ backgroundColor: 'hsl(35, 100%, 63%)', color: 'white' }} // Consider using variant="destructive" instead of inline style
                 disabled={form.formState.isSubmitting}
                 variant="destructive" // Use destructive variant for consistency
              >
                 {form.formState.isSubmitting ? 'Envoi en cours...' : 'Envoyer le Message'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
