
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Truck, CreditCard, User, Home, Phone, Mail, Loader2, Landmark, Smartphone, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { CartItem } from '@/context/CartContext'; // CartItem now has originalPrice and price (final unit price)
import type { Order, PaymentMethod } from '@/lib/types';
import { Label } from "@/components/ui/label";
import { useTranslation } from '@/hooks/useTranslation';

const paymentMethods: [PaymentMethod, ...PaymentMethod[]] = [
    'Paiement à la livraison',
    'Wave',
    'Orange Money',
    'Carte Bancaire'
];

const createFormSchema = (t: Function) => z.object({
  name: z.string().min(2, {
    message: t('checkout_form_name') + " must contain at least 2 characters.",
  }),
  address: z.string().min(10, {
    message: t('checkout_form_address') + " must contain at least 10 characters.",
  }),
  phone: z.string().min(8, {
    message: t('checkout_form_phone') + " must be a valid phone number.",
  }).regex(/^\+?[0-9\s-]+$/, {
    message: t('checkout_form_phone') + " invalid."
  }),
  email: z.string().email({
    message: t('checkout_form_email') + " must be a valid email address.",
  }).optional().or(z.literal('')),
  notes: z.string().max(200, {
     message: t('checkout_form_notes') + " cannot exceed 200 characters."
  }).optional(),
  paymentMethod: z.enum(paymentMethods, {
    required_error: t('checkout_payment_method_title') + " is required.",
  }),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCVC: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.paymentMethod === 'Carte Bancaire') {
      if (!data.cardNumber || !/^\d{16}$/.test(data.cardNumber.replace(/\s/g, ''))) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('checkout_card_number') + " invalid (16 digits).", path: ["cardNumber"] });
      }
      if (!data.cardExpiry || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(data.cardExpiry)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('checkout_card_expiry') + " invalid (MM/YY).", path: ["cardExpiry"] });
      }
      if (!data.cardCVC || !/^\d{3,4}$/.test(data.cardCVC)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('checkout_card_cvc') + " invalid (3 or 4 digits).", path: ["cardCVC"] });
      }
    }
});

const ORDERS_STORAGE_KEY = 'sama_boutique_orders';

const generateOrderNumber = (): string => {
    const prefix = "SB";
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${randomPart}`;
};


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
  const { t, currentLocale } = useTranslation();
  const totalPrice = getTotalPrice();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = createFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      address: "",
      phone: user?.phone || "",
      email: user?.email || "",
      notes: "",
      paymentMethod: 'Paiement à la livraison',
      cardNumber: "",
      cardExpiry: "",
      cardCVC: "",
    },
  });

  const selectedPaymentMethod = form.watch("paymentMethod");

  useEffect(() => {
    if (user) {
      form.reset({
        ...form.getValues(),
        name: user.name,
        email: user.email,
        phone: user.phone || form.getValues().phone || "",
      });
    }
  }, [user, form]);

  useEffect(() => {
      if (cart.length === 0 && !isSubmitting) {
          toast({
              title: t('checkout_toast_empty_cart_title'),
              description: t('checkout_toast_empty_cart_description'),
              variant: "destructive",
          });
          router.push('/panier');
      }
  }, [cart, router, toast, isSubmitting, t]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    const internalId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const displayOrderNumber = generateOrderNumber();

    const newOrder: Order = {
        id: internalId,
        orderNumber: displayOrderNumber,
        userId: user?.id ?? 'guest',
        customerInfo: {
            name: values.name,
            email: values.email || '',
            phone: values.phone,
            address: values.address,
        },
        // Ensure items in the order reflect the final state (including possibly discounted prices)
        // The `cart` items from context should already have the final `price` per unit.
        items: cart.map(cartItem => ({
            ...cartItem, // Spread all properties from CartItem
            // `price` in CartItem is the final unit price
        })),
        total: totalPrice,
        status: 'En attente de paiement',
        paymentMethod: values.paymentMethod,
        notes: values.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    console.log("Order Submitted:", newOrder);
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
            title: t('checkout_toast_error_title'),
            description: t('checkout_toast_error_description'),
            variant: "destructive",
        });
        setIsSubmitting(false);
    }
  }

  if (cart.length === 0 && !isSubmitting) {
     return <div className="text-center py-10">{t('loading')}</div>;
  }


  return (
    <div className="container mx-auto max-w-6xl px-2 sm:px-4 space-y-8 py-6 md:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary flex items-center justify-center gap-2">
         {t('checkout_page_title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 items-start">
        <Form {...form}>
           <form onSubmit={form.handleSubmit(onSubmit)} id="checkout-form" className="lg:col-span-3 space-y-6">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary"/> {t('checkout_customer_info_title')}</CardTitle>
                        <CardDescription>{t('checkout_customer_info_description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 md:space-y-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                            <FormLabel className="flex items-center gap-1"><User className="h-4 w-4"/> {t('checkout_form_name')}</FormLabel>
                            <FormControl><Input placeholder={t('checkout_form_name_placeholder')} {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem>
                            <FormLabel className="flex items-center gap-1"><Home className="h-4 w-4"/> {t('checkout_form_address')}</FormLabel>
                            <FormControl><Textarea placeholder={t('checkout_form_address_placeholder')} {...field} rows={3} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem>
                                <FormLabel className="flex items-center gap-1"><Phone className="h-4 w-4"/> {t('checkout_form_phone')}</FormLabel>
                                <FormControl><Input type="tel" placeholder={t('checkout_form_phone_placeholder')} {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                <FormLabel className="flex items-center gap-1"><Mail className="h-4 w-4"/> {t('checkout_form_email')} ({t('checkout_form_optional')})</FormLabel>
                                <FormControl><Input type="email" placeholder={t('checkout_form_email_placeholder')} {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t('checkout_form_notes')} ({t('checkout_form_optional')})</FormLabel>
                            <FormControl><Textarea placeholder={t('checkout_form_notes_placeholder')} className="resize-none" rows={2} {...field} /></FormControl>
                            <FormDescription className="text-right text-xs">{t('contact_form_char_count', { count: field.value?.length ?? 0 })}</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5 text-primary"/> {t('checkout_payment_method_title')}</CardTitle>
                         <CardDescription>{t('checkout_payment_method_description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="sr-only">{t('checkout_payment_method_title')}</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <Label htmlFor="cod" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer text-center text-xs sm:text-sm">
                                            <RadioGroupItem value="Paiement à la livraison" id="cod" className="sr-only" />
                                            <Truck className="mb-2 h-5 w-5 sm:mb-3 sm:h-6 sm:w-6" />
                                            {t('checkout_payment_cod')}
                                         </Label>
                                         <Label htmlFor="wave" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer text-center text-xs sm:text-sm">
                                             <RadioGroupItem value="Wave" id="wave" className="sr-only" />
                                             <Smartphone className="mb-2 h-5 w-5 sm:mb-3 sm:h-6 sm:w-6" />
                                             {t('checkout_payment_wave')}
                                         </Label>
                                         <Label htmlFor="orange" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer text-center text-xs sm:text-sm">
                                             <RadioGroupItem value="Orange Money" id="orange" className="sr-only" />
                                              <Smartphone className="mb-2 h-5 w-5 sm:mb-3 sm:h-6 sm:w-6" />
                                             {t('checkout_payment_orange_money')}
                                         </Label>
                                         <Label htmlFor="card" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer text-center text-xs sm:text-sm">
                                             <RadioGroupItem value="Carte Bancaire" id="card" className="sr-only" />
                                             <CreditCard className="mb-2 h-5 w-5 sm:mb-3 sm:h-6 sm:w-6" />
                                             {t('checkout_payment_card')}
                                         </Label>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                         {selectedPaymentMethod === 'Carte Bancaire' && (
                           <div className="space-y-4 mt-6 border-t pt-6">
                             <h3 className="text-md font-medium flex items-center gap-2"><CreditCard className="h-4 w-4"/>{t('checkout_card_details_title')}</h3>
                             <FormField control={form.control} name="cardNumber" render={({ field }) => (
                               <FormItem>
                                 <FormLabel>{t('checkout_card_number')}</FormLabel>
                                 <FormControl><Input placeholder={t('checkout_card_number_placeholder')} {...field} /></FormControl>
                                 <FormMessage />
                               </FormItem>
                             )} />
                             <div className="grid grid-cols-2 gap-4">
                               <FormField control={form.control} name="cardExpiry" render={({ field }) => (
                                 <FormItem>
                                   <FormLabel>{t('checkout_card_expiry')}</FormLabel>
                                   <FormControl><Input placeholder={t('checkout_card_expiry_placeholder')} {...field} /></FormControl>
                                   <FormMessage />
                                 </FormItem>
                               )} />
                               <FormField control={form.control} name="cardCVC" render={({ field }) => (
                                 <FormItem>
                                   <FormLabel>{t('checkout_card_cvc')}</FormLabel>
                                   <FormControl><Input placeholder={t('checkout_card_cvc_placeholder')} {...field} /></FormControl>
                                   <FormMessage />
                                 </FormItem>
                               )} />
                             </div>
                           </div>
                         )}

                         {(selectedPaymentMethod === 'Wave' || selectedPaymentMethod === 'Orange Money') && (
                            <div className="mt-6 border-t pt-6 text-sm text-muted-foreground bg-secondary/50 p-4 rounded-md">
                                <p className="flex items-center gap-2 mb-2 font-medium text-secondary-foreground">
                                    <AlertCircle className="h-4 w-4 text-yellow-600"/>
                                    {t('checkout_payment_instructions_title', { method: selectedPaymentMethod })}
                                </p>
                                {t('checkout_payment_instructions_body')}
                                <br />
                                <strong className="text-secondary-foreground">
                                   {t('checkout_payment_instructions_number', { number: '+221 XX XXX XX XX' })}
                                </strong>
                            </div>
                         )}
                    </CardContent>
                </Card>
           </form>
        </Form>

        <Card className="shadow-lg lg:col-span-2 sticky top-24">
          <CardHeader>
            <CardTitle>{t('checkout_order_summary_title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                 {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center text-sm gap-2">
                      <div className="flex items-center gap-2 flex-grow min-w-0">
                         <Image
                           src={item.imageUrl || `https://picsum.photos/seed/${item.id}/40/40`}
                           alt={item.name} width={40} height={40}
                           className="rounded object-cover flex-shrink-0 border"
                           data-ai-hint={item.category === 'Services' ? 'service tech icon' : item.name.toLowerCase().split(' ')[0]}
                           onError={(e) => {
                               (e.target as HTMLImageElement).srcset = `https://picsum.photos/seed/${item.id}/40/40`;
                               (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/40/40`;
                           }}
                         />
                         <div className="min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-muted-foreground text-xs">{t('cart_table_quantity')}: {item.quantity}</p>
                             {item.originalPrice && item.originalPrice > item.price && (
                                <p className="text-xs text-muted-foreground">
                                  <span className="line-through">{item.originalPrice.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                  <span className="text-primary ml-1">({t('checkout_item_discounted')})</span>
                                </p>
                             )}
                         </div>
                      </div>
                      <p className="font-medium text-right flex-shrink-0">{(item.price * item.quantity).toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                   </div>
                 ))}
             </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>{t('checkout_order_summary_total')}</span>
              <span>{totalPrice.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
            {selectedPaymentMethod && (
                <>
                 <Separator />
                 <div className="text-sm">
                     <p className="font-medium mb-1">{t('checkout_order_summary_chosen_method')}</p>
                     <p className="text-muted-foreground">
                        {selectedPaymentMethod === 'Paiement à la livraison' ? t('checkout_payment_cod') :
                         selectedPaymentMethod === 'Wave' ? t('checkout_payment_wave') :
                         selectedPaymentMethod === 'Orange Money' ? t('checkout_payment_orange_money') :
                         selectedPaymentMethod === 'Carte Bancaire' ? t('checkout_payment_card') :
                         selectedPaymentMethod}
                     </p>
                 </div>
                </>
            )}
            <Separator />
             <div className="text-sm">
                <p className="font-medium mb-1">{t('checkout_order_summary_shop')}</p>
                <p className="text-muted-foreground">{t('site_name')}</p>
             </div>
          </CardContent>
           <CardFooter className="mt-4">
              <Button
                 type="submit"
                 form="checkout-form"
                 className="w-full"
                 variant="destructive"
                 disabled={isSubmitting || cart.length === 0}
              >
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {t('checkout_processing')}</> : t('checkout_confirm_order')}
              </Button>
           </CardFooter>
        </Card>
      </div>
    </div>
  );
}
