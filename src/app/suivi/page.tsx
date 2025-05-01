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
import { Search, Clock, Truck, PackageCheck, PackageX, RefreshCw, CircleDollarSign, HelpCircle, AlertTriangle, Loader2 } from "lucide-react";
import type { Order, OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge'; // Import Badge
import Link from 'next/link'; // Import Link

const ORDERS_STORAGE_KEY = 'sama_boutique_orders';

// Zod schema for the tracking form
const trackingSchema = z.object({
  orderNumber: z.string().min(5, { message: "Le numéro de commande semble trop court." }).trim(),
});

// --- Order Status Configuration (Copied from admin/orders) ---
interface StatusConfig {
    label: string;
    icon: React.ElementType;
    description: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    colorClass: string;
}

const statusConfig: Record<OrderStatus, StatusConfig> = {
    'En attente de paiement': { label: 'Attente Paiement', icon: Clock, description: "Votre commande est reçue et attend la confirmation du paiement.", variant: 'outline', colorClass: 'text-yellow-600 dark:text-yellow-400' },
    'Payé': { label: 'Payé', icon: CircleDollarSign, description: "Le paiement de votre commande a été confirmé.", variant: 'default', colorClass: 'text-green-600 dark:text-green-400' },
    'En cours de préparation': { label: 'Préparation', icon: RefreshCw, description: "Nous préparons votre commande pour l'expédition.", variant: 'secondary', colorClass: 'text-blue-600 dark:text-blue-400' },
    'Expédié': { label: 'Expédié', icon: Truck, description: "Votre commande a été expédiée et est en route.", variant: 'secondary', colorClass: 'text-purple-600 dark:text-purple-400' },
    'Livraison en cours': { label: 'En Livraison', icon: Truck, description: "Le livreur est en route pour vous livrer votre colis.", variant: 'secondary', colorClass: 'text-cyan-600 dark:text-cyan-400' },
    'Livré': { label: 'Livré', icon: PackageCheck, description: "Votre commande a été livrée avec succès.", variant: 'default', colorClass: 'text-green-700 dark:text-green-500' },
    'Annulé': { label: 'Annulé', icon: PackageX, description: "Votre commande a été annulée.", variant: 'destructive', colorClass: 'text-red-600 dark:text-red-400' },
    'Remboursé': { label: 'Remboursé', icon: RefreshCw, description: "Votre commande a été remboursée.", variant: 'destructive', colorClass: 'text-gray-500' },
};

// --- Find Order Function ---
const findOrder = (orderNumber: string): Order | null => {
    if (typeof window === 'undefined') return null;
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    const foundOrder = orders.find(order => order.orderNumber.toLowerCase() === orderNumber.toLowerCase());

    if (!foundOrder) return null;

    // Convert date strings back to Date objects
    return {
        ...foundOrder,
        createdAt: new Date(foundOrder.createdAt),
        updatedAt: new Date(foundOrder.updatedAt),
    };
};

// --- Component ---
export default function OrderTrackingPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof trackingSchema>>({
    resolver: zodResolver(trackingSchema),
    defaultValues: { orderNumber: "" },
  });

  function onSubmit(values: z.infer<typeof trackingSchema>) {
    setIsLoading(true);
    setError(null);
    setOrder(null);

    // Simulate searching for the order
    setTimeout(() => {
      const foundOrder = findOrder(values.orderNumber);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError("Numéro de commande invalide ou commande non trouvée.");
      }
      setIsLoading(false);
    }, 700); // Simulate network delay
  }

    const getStatusBadge = (status: OrderStatus) => {
        const config = statusConfig[status] || { label: status, icon: HelpCircle, variant: 'outline', colorClass: 'text-muted-foreground' };
        const IconComponent = config.icon && typeof config.icon !== 'string' ? config.icon : HelpCircle;
        return (
            <Badge variant={config.variant} className={cn("flex items-center gap-1 whitespace-nowrap text-sm px-3 py-1", config.colorClass, `border-${config.colorClass.replace('text-', '')}`)}>
                <IconComponent className="h-4 w-4" />
                {config.label}
            </Badge>
        );
    };

  return (
    <div className="container mx-auto max-w-2xl space-y-8 py-10">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
           <div className="flex justify-center mb-2">
              <Search className="h-8 w-8 text-primary" />
           </div>
          <CardTitle className="text-2xl font-bold text-primary">Suivi de Commande</CardTitle>
          <CardDescription>
            Entrez votre numéro de commande pour voir son statut actuel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-2">
              <FormField
                control={form.control}
                name="orderNumber"
                render={({ field }) => (
                  <FormItem className="flex-grow w-full">
                    <FormLabel className="sr-only">Numéro de Commande</FormLabel>
                    <FormControl>
                      <Input placeholder="Entrez votre numéro de commande (ex: SB-12345)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="destructive" className="w-full sm:w-auto" disabled={isLoading}>
                 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                {isLoading ? 'Recherche...' : 'Suivre'}
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
            <CardTitle>Détails de la Commande</CardTitle>
             <CardDescription>
                 Commande <span className="font-medium text-primary">{order.orderNumber}</span> passée le {order.createdAt.toLocaleDateString('fr-FR')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border rounded-lg p-4 bg-muted/50">
                 <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Statut Actuel</p>
                    {getStatusBadge(order.status)}
                 </div>
                 <p className="text-xs text-muted-foreground mt-2 sm:mt-0">
                     Dernière mise à jour: {order.updatedAt.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
             </div>

            <div className="text-sm">
               <p className="font-medium mb-1">Description du statut :</p>
               <p className="text-muted-foreground">{statusConfig[order.status]?.description || "Le statut de votre commande est en cours de mise à jour."}</p>
            </div>

            {/* Optional: Add timeline or more details here */}
            {/* Example: Order Items Summary */}
             <Separator />
            <div>
                <p className="font-medium mb-2">Résumé des articles :</p>
                 <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
                     {order.items.map(item => (
                         <li key={item.id}>
                             {item.name} (x{item.quantity}) - {(item.price * item.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                         </li>
                     ))}
                 </ul>
                <p className="mt-2 font-semibold text-right">
                     Total : {order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                 </p>
            </div>


          </CardContent>
           <CardFooter className="text-xs text-muted-foreground">
              Si vous avez des questions, veuillez <Link href="/contact" className="text-primary hover:underline">nous contacter</Link>.
           </CardFooter>
        </Card>
      )}
    </div>
  );
}
