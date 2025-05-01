// src/app/checkout/page.tsx
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Import RadioGroup
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Truck, CreditCard, User, Home, Phone, Mail, Loader2, Landmark, Smartphone, AlertCircle } from 'lucide-react'; // Added Landmark, Smartphone, AlertCircle
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { CartItem } from '@/context/CartContext';
import type { Order, PaymentMethod } from '@/lib/types'; // Import Order and PaymentMethod types
import { Label } from "@/components/ui/label"; // Import Label

// Payment method Zod enum
const paymentMethods: [PaymentMethod, ...PaymentMethod[]] = [
    'Paiement à la livraison',
    'Wave',
    'Orange Money',
    'Carte Bancaire'
];

// Define Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  address: z.string().min(10, {
    message: "L'adresse doit contenir au moins 10 caractères.",
  }),
  phone: z.string().min(8, {
    message: "Veuillez entrer un numéro de téléphone valide.",
  }).regex(/^\+?[0-9\s-]+$/, {
    message: "Numéro de téléphone invalide."
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }).optional().or(z.literal('')),
  notes: z.string().max(200, {
     message: "Les notes ne peuvent pas dépasser 200 caractères."
  }).optional(),
  paymentMethod: z.enum(paymentMethods, {
    required_error: "Veuillez sélectionner une méthode de paiement.",
  }),
  // Conditional fields for Card Payment
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCVC: z.string().optional(),
}).superRefine((data, ctx) => {
    // Add validation for card details if 'Carte Bancaire' is selected
    if (data.paymentMethod === 'Carte Bancaire') {
      if (!data.cardNumber || !/^\d{16}$/.test(data.cardNumber.replace(/\s/g, ''))) {
          ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Numéro de carte invalide (16 chiffres).",
              path: ["cardNumber"],
          });
      }
      if (!data.cardExpiry || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(data.cardExpiry)) {
          ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Date d'expiration invalide (MM/AA).",
              path: ["cardExpiry"],
          });
      }
      if (!data.cardCVC || !/^\d{3,4}$/.test(data.cardCVC)) {
          ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "CVC invalide (3 ou 4 chiffres).",
              path: ["cardCVC"],
          });
      }
    }
});


const ORDERS_STORAGE_KEY = 'sama_boutique_orders';

const saveOrder = (order: Order) => {
    if (typeof window === 'undefined') return;
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    orders.push(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
};


export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const totalPrice = getTotalPrice();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      address: "",
      phone: "",
      email: user?.email || "",
      notes: "",
      paymentMethod: 'Paiement à la livraison', // Default payment method
      cardNumber: "",
      cardExpiry: "",
      cardCVC: "",
    },
  });

  // Watch the selected payment method to conditionally show card fields
  const selectedPaymentMethod = form.watch("paymentMethod");

  useEffect(() => {
    if (user) {
      form.reset({
        ...form.getValues(), // Keep existing values first
        name: user.name,
        email: user.email,
      });
    }
  }, [user, form]);

  useEffect(() => {
      if (cart.length === 0 && !isSubmitting) {
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
        orderNumber: orderId, // Use unique ID as order number
        userId: user?.id ?? 'guest',
        customerInfo: {
            name: values.name,
            email: values.email || '',
            phone: values.phone,
            address: values.address,
        },
        items: cart,
        total: totalPrice, // Assuming getTotalPrice returns value in the correct unit (e.g., whole FCFA)
        status: 'En attente de paiement', // All orders start pending payment confirmation
        paymentMethod: values.paymentMethod, // Save selected method
        notes: values.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    console.log("Order Submitted:", newOrder);

    // Simulate API call delay & payment processing
    await new Promise(resolve => setTimeout(resolve, 1500 + (values.paymentMethod !== 'Paiement à la livraison' ? 1000 : 0)));

    try {
        saveOrder(newOrder);

         if (typeof window !== 'undefined') {
            const event = new CustomEvent('new-order', { detail: newOrder });
            window.dispatchEvent(event);
         }

        clearCart();
        router.push(`/order-confirmation?orderNumber=${newOrder.orderNumber}`);
    } catch (error) {
        console.error("Failed to save or process order:", error);
        toast({
            title: "Erreur de commande",
            description: "Impossible de finaliser la commande. Veuillez réessayer.",
            variant: "destructive",
        });
        setIsSubmitting(false);
    }
  }

  if (cart.length === 0) {
     return <div className="text-center py-10">Chargement...</div>;
  }


  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold text-center text-primary flex items-center justify-center gap-2">
        <CreditCard className="h-8 w-8" /> Passage à la caisse
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Customer Information & Payment Form */}
        <Form {...form}>
           <form onSubmit={form.handleSubmit(onSubmit)} id="checkout-form" className="lg:col-span-2 space-y-6">
               {/* Customer Info Card */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Vos Informations</CardTitle>
                        <CardDescription>Entrez vos détails pour la livraison.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                            <FormLabel className="flex items-center gap-1"><User className="h-4 w-4"/> Nom Complet</FormLabel>
                            <FormControl><Input placeholder="Votre nom et prénom" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem>
                            <FormLabel className="flex items-center gap-1"><Home className="h-4 w-4"/> Adresse de Livraison</FormLabel>
                            <FormControl><Textarea placeholder="Votre adresse complète..." {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem>
                                <FormLabel className="flex items-center gap-1"><Phone className="h-4 w-4"/> Téléphone</FormLabel>
                                <FormControl><Input type="tel" placeholder="Votre numéro de téléphone" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                <FormLabel className="flex items-center gap-1"><Mail className="h-4 w-4"/> Email (Optionnel)</FormLabel>
                                <FormControl><Input type="email" placeholder="Votre adresse email" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Notes Additionnelles (Optionnel)</FormLabel>
                            <FormControl><Textarea placeholder="Instructions spéciales..." className="resize-none" rows={3} {...field} /></FormControl>
                            <FormDescription className="text-right">{field.value?.length ?? 0}/200</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

               {/* Payment Method Card */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5 text-primary"/> Méthode de Paiement</CardTitle>
                         <CardDescription>Choisissez comment vous souhaitez payer.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="sr-only">Méthode de Paiement</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* COD */}
                                        <Label htmlFor="cod" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                            <RadioGroupItem value="Paiement à la livraison" id="cod" className="sr-only" />
                                            <Truck className="mb-3 h-6 w-6" />
                                            Paiement à la livraison
                                         </Label>
                                         {/* Wave */}
                                         <Label htmlFor="wave" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                             <RadioGroupItem value="Wave" id="wave" className="sr-only" />
                                             <Smartphone className="mb-3 h-6 w-6" /> {/* Placeholder icon */}
                                             Wave Sénégal
                                         </Label>
                                         {/* Orange Money */}
                                         <Label htmlFor="orange" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                             <RadioGroupItem value="Orange Money" id="orange" className="sr-only" />
                                              <Smartphone className="mb-3 h-6 w-6" /> {/* Placeholder icon */}
                                             Orange Money
                                         </Label>
                                          {/* Card */}
                                         <Label htmlFor="card" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                             <RadioGroupItem value="Carte Bancaire" id="card" className="sr-only" />
                                             <CreditCard className="mb-3 h-6 w-6" />
                                             Carte Bancaire
                                         </Label>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        {/* Conditional Card Details */}
                         {selectedPaymentMethod === 'Carte Bancaire' && (
                           <div className="space-y-4 mt-6 border-t pt-6">
                             <h3 className="text-md font-medium flex items-center gap-2"><CreditCard className="h-4 w-4"/>Détails de la carte</h3>
                             <FormField control={form.control} name="cardNumber" render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Numéro de Carte</FormLabel>
                                 <FormControl><Input placeholder="**** **** **** ****" {...field} /></FormControl>
                                 <FormMessage />
                               </FormItem>
                             )} />
                             <div className="grid grid-cols-2 gap-4">
                               <FormField control={form.control} name="cardExpiry" render={({ field }) => (
                                 <FormItem>
                                   <FormLabel>Expiration (MM/AA)</FormLabel>
                                   <FormControl><Input placeholder="MM/AA" {...field} /></FormControl>
                                   <FormMessage />
                                 </FormItem>
                               )} />
                               <FormField control={form.control} name="cardCVC" render={({ field }) => (
                                 <FormItem>
                                   <FormLabel>CVC</FormLabel>
                                   <FormControl><Input placeholder="123" {...field} /></FormControl>
                                   <FormMessage />
                                 </FormItem>
                               )} />
                             </div>
                           </div>
                         )}

                         {/* Instructions for Wave/Orange Money */}
                         {(selectedPaymentMethod === 'Wave' || selectedPaymentMethod === 'Orange Money') && (
                            <div className="mt-6 border-t pt-6 text-sm text-muted-foreground bg-secondary/50 p-4 rounded-md">
                                <p className="flex items-center gap-2 mb-2 font-medium text-secondary-foreground"><AlertCircle className="h-4 w-4 text-yellow-600"/>Instructions de Paiement ({selectedPaymentMethod})</p>
                                Vous recevrez les instructions de paiement par SMS ou Email après avoir confirmé votre commande. Votre commande sera validée après réception du paiement.
                                <br />
                                <strong className="text-secondary-foreground">Numéro à utiliser: +221 XX XXX XX XX</strong> {/* Replace with actual number */}
                            </div>
                         )}
                    </CardContent>
                </Card>

                {/* Submit Button (moved outside cards but within form) */}
                 <div className="flex justify-end">
                     <Button
                         type="submit"
                         form="checkout-form"
                         className="w-full lg:w-auto"
                         variant="destructive"
                         disabled={isSubmitting || cart.length === 0}
                     >
                         {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Traitement...</> : 'Confirmer la Commande'}
                     </Button>
                 </div>

           </form>
        </Form>

        {/* Order Summary Card (Remains the same) */}
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
                           alt={item.name} width={40} height={40}
                           className="rounded object-cover"
                           data-ai-hint={item.category === 'Services' ? 'service tech icon' : item.name.toLowerCase().split(' ')[0]}
                         />
                         <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-muted-foreground">Qté: {item.quantity}</p>
                         </div>
                      </div>
                      <p className="font-medium">{(item.price * item.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
                   </div>
                 ))}
             </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span>
            </div>
             {/* Display Selected Payment Method */}
            {selectedPaymentMethod && (
                <>
                 <Separator />
                 <div>
                     <p className="font-medium mb-1">Méthode Choisie</p>
                     <p className="text-sm text-muted-foreground">{selectedPaymentMethod}</p>
                 </div>
                </>
            )}
            <Separator />
             <div>
                <p className="font-medium mb-1">Boutique</p>
                <p className="text-sm text-muted-foreground">SamaBoutique</p>
             </div>
          </CardContent>
           {/* Footer moved to inside the form */}
        </Card>
      </div>
    </div>
  );
}
