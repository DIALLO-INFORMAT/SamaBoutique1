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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Truck, CreditCard, User, Home, Phone, Mail, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import type { CartItem } from '@/context/CartContext'; // Import CartItem type
import type { Order } from '@/lib/types'; // Import Order type

// Define Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  address: z.string().min(10, {
    message: "L'adresse doit contenir au moins 10 caractères.",
  }),
  phone: z.string().min(8, { // Basic phone validation
    message: "Veuillez entrer un numéro de téléphone valide.",
  }).regex(/^\+?[0-9\s-]+$/, {
    message: "Numéro de téléphone invalide."
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }).optional().or(z.literal('')), // Email is optional
  notes: z.string().max(200, {
     message: "Les notes ne peuvent pas dépasser 200 caractères."
  }).optional(),
});

const ORDERS_STORAGE_KEY = 'sama_boutique_orders';

// Function to save order to localStorage
const saveOrder = (order: Order) => {
    if (typeof window === 'undefined') return;
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    orders.push(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
};


export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth(); // Get logged-in user
  const { toast } = useToast();
  const router = useRouter();
  const totalPrice = getTotalPrice();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "", // Pre-fill name if user is logged in
      address: "",
      phone: "",
      email: user?.email || "", // Pre-fill email if user is logged in
      notes: "",
    },
  });

   // Load user data into form when user context updates
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        address: form.getValues('address'), // Keep existing address if typed
        phone: form.getValues('phone'),     // Keep existing phone if typed
        notes: form.getValues('notes'),       // Keep existing notes if typed
      });
    }
  }, [user, form]);

  // Effect to check cart emptiness on client-side after mount
    useEffect(() => {
      if (cart.length === 0 && !isSubmitting) { // Avoid redirect during submission
          toast({
              title: "Panier Vide",
              description: "Ajoutez des articles à votre panier avant de passer à la caisse.",
              variant: "destructive",
          });
          router.push('/panier');
      }
  }, [cart, router, toast, isSubmitting]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    const orderId = `SB-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newOrder: Order = {
        id: orderId,
        orderNumber: orderId, // Use the same ID for order number initially
        userId: user?.id ?? 'guest', // Link to user or mark as guest
        customerInfo: {
            name: values.name,
            email: values.email || '',
            phone: values.phone,
            address: values.address,
        },
        items: cart,
        total: totalPrice,
        status: 'En attente de paiement', // Initial status
        paymentMethod: "Paiement à la livraison",
        notes: values.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    console.log("Order Submitted:", newOrder);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        saveOrder(newOrder); // Save order to local storage

         // --- Trigger Notifications (Simulated) ---
         // In a real app, this would happen server-side after saving the order
         if (typeof window !== 'undefined') {
            const event = new CustomEvent('new-order', { detail: newOrder });
            window.dispatchEvent(event);
         }
         // ---------------------------------------


        clearCart(); // Clear the cart
        // Redirect to confirmation page, passing the order number
        router.push(`/order-confirmation?orderNumber=${newOrder.orderNumber}`);
    } catch (error) {
        console.error("Failed to save or process order:", error);
        toast({
            title: "Erreur de commande",
            description: "Impossible de finaliser la commande. Veuillez réessayer.",
            variant: "destructive",
        });
        setIsSubmitting(false); // Re-enable button on error
    }
    // No need to set isSubmitting to false on success if redirecting
  }


  // Initial check (might run on server or before effect)
  if (cart.length === 0) {
     // Return null or a loading state until the effect runs and redirects
     return <div className="text-center py-10">Chargement...</div>;
  }


  return (
     // Added container and max-width here
    <div className="container mx-auto max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold text-center text-primary flex items-center justify-center gap-2">
        <CreditCard className="h-8 w-8" /> Passage à la caisse
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Information Form */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Vos Informations</CardTitle>
            <CardDescription>Entrez vos détails pour la livraison.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} id="checkout-form" className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><User className="h-4 w-4"/> Nom Complet</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom et prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Home className="h-4 w-4"/> Adresse de Livraison</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Votre adresse complète..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1"><Phone className="h-4 w-4"/> Téléphone</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="Votre numéro de téléphone" {...field} />
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
                          <FormLabel className="flex items-center gap-1"><Mail className="h-4 w-4"/> Email (Optionnel)</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Votre adresse email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>

                 <FormField
                   control={form.control}
                   name="notes"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Notes Additionnelles (Optionnel)</FormLabel>
                       <FormControl>
                         <Textarea
                           placeholder="Instructions spéciales pour la livraison, etc."
                           className="resize-none"
                           rows={3}
                           {...field}
                         />
                       </FormControl>
                        <FormDescription className="text-right">
                           {field.value?.length ?? 0}/200
                        </FormDescription>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Résumé de la Commande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                 {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                         <Image
                           src={`https://picsum.photos/seed/${item.id}/40/40`}
                           alt={item.name}
                           width={40}
                           height={40}
                           className="rounded object-cover"
                            data-ai-hint={item.category === 'Services' ? 'service tech icon' : item.name.toLowerCase().split(' ')[0]}
                         />
                         <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-muted-foreground">Qté: {item.quantity}</p>
                         </div>
                      </div>
                      <p className="font-medium">{(item.price * item.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                   </div>
                 ))}
             </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
            </div>
            <Separator />
             <div>
               <p className="font-medium mb-2">Méthode de Paiement</p>
               <div className="border rounded-md p-3 bg-secondary text-secondary-foreground flex items-center gap-2">
                  <Truck className="h-5 w-5"/>
                  <span>Paiement à la livraison</span>
               </div>
             </div>
             <Separator />
             <div>
                <p className="font-medium mb-1">Boutique</p>
                <p className="text-sm text-muted-foreground">SamaBoutique</p>
                {/* Add more store details if needed */}
                {/* <p className="text-sm text-muted-foreground">123 Rue Exemple, Ville</p> */}
                {/* <p className="text-sm text-muted-foreground">contact@samaboutique.com</p> */}
             </div>
          </CardContent>
          <CardFooter>
             <Button
                 type="submit"
                 form="checkout-form" // Link button to the form
                 className="w-full"
                 variant="destructive"
                 disabled={isSubmitting || cart.length === 0}
             >
                 {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Traitement...</> : 'Confirmer la Commande'}
             </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
