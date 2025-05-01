// src/app/suivi/page.tsx
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
import { Separator } from "@/components/ui/separator";
import { Clock, Truck, PackageCheck, PackageX, RefreshCw, CircleDollarSign, HelpCircle, AlertTriangle, Loader2 } from "lucide-react";
import type { Order, OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation
import React, { createElement } from 'react'; // Import React and createElement

const ORDERS_STORAGE_KEY = 'sama_boutique_orders';

// Adjust schema validation for shorter order number format (e.g., SB-XXXXXX)
const createTrackingSchema = (t: Function) => z.object({
  orderNumber: z.string()
                       .min(9, { message: t('track_order_invalid_format') }) // Use specific key
                       .regex(/^SB-[A-Z0-9]{6}$/i, { message: t('track_order_invalid_format') }) // Use specific key
                       .trim(),
});

// --- Order Status Configuration (with translation keys) ---
interface StatusConfig {
    labelKey: string; // Key for the status label (e.g., 'order_status_paid')
    descriptionKey: string; // Key for the status description
    icon: React.ElementType;
    variant: "default" | "secondary" | "destructive" | "outline";
    colorClass: string;
}

const statusConfig: Record<OrderStatus, StatusConfig> = {
    'En attente de paiement': { labelKey: 'order_status_pending_payment', descriptionKey: 'order_status_pending_payment_desc', icon: Clock, variant: 'outline', colorClass: 'text-yellow-600 dark:text-yellow-400' },
    'Payé': { labelKey: 'order_status_paid', descriptionKey: 'order_status_paid_desc', icon: CircleDollarSign, variant: 'default', colorClass: 'text-green-600 dark:text-green-400' },
    'En cours de préparation': { labelKey: 'order_status_processing', descriptionKey: 'order_status_processing_desc', icon: RefreshCw, variant: 'secondary', colorClass: 'text-blue-600 dark:text-blue-400' },
    'Expédié': { labelKey: 'order_status_shipped', descriptionKey: 'order_status_shipped_desc', icon: Truck, variant: 'secondary', colorClass: 'text-purple-600 dark:text-purple-400' },
    'Livraison en cours': { labelKey: 'order_status_delivering', descriptionKey: 'order_status_delivering_desc', icon: Truck, variant: 'secondary', colorClass: 'text-cyan-600 dark:text-cyan-400' },
    'Livré': { labelKey: 'order_status_delivered', descriptionKey: 'order_status_delivered_desc', icon: PackageCheck, variant: 'default', colorClass: 'text-green-700 dark:text-green-500' },
    'Annulé': { labelKey: 'order_status_cancelled', descriptionKey: 'order_status_cancelled_desc', icon: PackageX, variant: 'destructive', colorClass: 'text-red-600 dark:text-red-400' },
    'Remboursé': { labelKey: 'order_status_refunded', descriptionKey: 'order_status_refunded_desc', icon: RefreshCw, variant: 'destructive', colorClass: 'text-gray-500' },
};

// --- Find Order Function ---
const findOrder = (orderNumber: string): Order | null => {
    if (typeof window === 'undefined') return null;
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    // Find by the display orderNumber (SB-XXXXXX)
    const foundOrder = orders.find(order => order.orderNumber.toLowerCase() === orderNumber.toLowerCase());

    if (!foundOrder) return null;
    return {
        ...foundOrder,
        createdAt: new Date(foundOrder.createdAt),
        updatedAt: new Date(foundOrder.updatedAt),
    };
};

// --- Component ---
export default function OrderTrackingPage() {
  const { t, currentLocale } = useTranslation(); // Use translation hook
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const trackingSchema = createTrackingSchema(t); // Create schema inside component

  const form = useForm<z.infer<typeof trackingSchema>>({
    resolver: zodResolver(trackingSchema),
    defaultValues: { orderNumber: "" },
  });

  function onSubmit(values: z.infer<typeof trackingSchema>) {
    setIsLoading(true);
    setError(null);
    setOrder(null);

    setTimeout(() => {
      // Validation is now handled by Zod schema, just find the order
      const foundOrder = findOrder(values.orderNumber);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError(t('track_order_not_found_error'));
      }
      setIsLoading(false);
    }, 700);
  }

    const getStatusBadge = (status: OrderStatus) => {
        const config = statusConfig[status] || { labelKey: status, icon: HelpCircle, variant: 'outline', colorClass: 'text-muted-foreground' };
        const IconComponent = config.icon && typeof config.icon !== 'string' ? config.icon : HelpCircle;
        return (
            <Badge variant={config.variant} className={cn("flex items-center gap-1 whitespace-nowrap text-sm px-3 py-1", config.colorClass, `border-${config.colorClass.replace('text-', '')}`)}>
                <IconComponent className="h-4 w-4" />
                {t(config.labelKey)} {/* Translate the label */}
            </Badge>
        );
    };

  return (
    <div className="container mx-auto max-w-2xl space-y-8 py-10">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">{t('track_order_page_title')}</CardTitle>
          <CardDescription>{t('track_order_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-2">
              <FormField
                control={form.control}
                name="orderNumber"
                render={({ field }) => (
                  <FormItem className="flex-grow w-full">
                    <FormLabel className="sr-only">{t('track_order_input_placeholder')}</FormLabel>
                    <FormControl>
                       {/* Ensure placeholder reflects the new format */}
                      <Input placeholder={t('track_order_input_placeholder_format')} {...field} />
                    </FormControl>
                    <FormMessage /> {/* Displays Zod validation message */}
                  </FormItem>
                )}
              />
              <Button type="submit" variant="destructive" className="w-full sm:w-auto" disabled={isLoading}>
                 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? t('track_order_searching') : t('track_order_button')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

       {error && (
           <Card className="border-destructive bg-destructive/10 shadow-md">
               <CardContent className="p-4 flex items-center gap-3 text-destructive">
                   <AlertTriangle className="h-6 w-6" />
                   <p className="font-medium">{error}</p>
               </CardContent>
           </Card>
       )}

      {order && (
        <Card className="shadow-lg animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle>{t('track_order_details_title')}</CardTitle>
             <CardDescription>
                 {t('track_order_number_label')} <span className="font-medium text-primary">{order.orderNumber}</span> {t('track_order_placed_on', { date: order.createdAt.toLocaleDateString(currentLocale) })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border rounded-lg p-4 bg-muted/50">
                 <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{t('track_order_current_status_label')}</p>
                    {getStatusBadge(order.status)}
                 </div>
                 <p className="text-xs text-muted-foreground mt-2 sm:mt-0">
                     {t('track_order_last_updated', { datetime: order.updatedAt.toLocaleString(currentLocale, { dateStyle: 'short', timeStyle: 'short' }) })}
                </p>
             </div>

            <div className="text-sm">
               <p className="font-medium mb-1">{t('track_order_status_description_label')}</p>
               <p className="text-muted-foreground">{t(statusConfig[order.status]?.descriptionKey || '') || "Le statut de votre commande est en cours de mise à jour."}</p>
            </div>

             <Separator />
            <div>
                <p className="font-medium mb-2">{t('track_order_items_summary_label')}</p>
                 <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
                     {order.items.map(item => (
                         <li key={item.id}>
                             {item.name} (x{item.quantity}) - {(item.price * item.quantity).toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                         </li>
                     ))}
                 </ul>
                <p className="mt-2 font-semibold text-right">
                     {t('track_order_total_label')} : {order.total.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                 </p>
            </div>
          </CardContent>
           <CardFooter className="text-xs text-muted-foreground">
               {/* Use a simple interpolation without the Link component inside t() */}
               {t('track_order_contact_prompt', { link: '' })} {/* Pass empty string for the link placeholder initially */}
               <Link href="/contact" className="text-primary hover:underline ml-1">{t('track_order_contact_link_text')}</Link>.
           </CardFooter>
        </Card>
      )}
    </div>
  );
}
