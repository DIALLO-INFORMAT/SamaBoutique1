// src/app/dashboard/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react"; // For a view details button
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { useAuth } from '@/context/AuthContext'; // Import useAuth to fetch user-specific orders
import type { Order, OrderStatus } from '@/lib/types'; // Import full Order type
import { cn } from '@/lib/utils';
import { HelpCircle, Clock, Truck, PackageCheck, PackageX, RefreshCw, CircleDollarSign } from 'lucide-react'; // Import icons

const ORDERS_STORAGE_KEY = 'sama_boutique_orders';

// --- Order Status Configuration (Same as Admin/Manager) ---
interface StatusConfig {
    label: string;
    icon: React.ElementType;
    variant: "default" | "secondary" | "destructive" | "outline";
    colorClass: string;
}

const statusConfig: Record<OrderStatus, StatusConfig> = {
    'En attente de paiement': { label: 'Attente Paiement', icon: Clock, variant: 'outline', colorClass: 'text-yellow-600 dark:text-yellow-400' },
    'Payé': { label: 'Payé', icon: CircleDollarSign, variant: 'default', colorClass: 'text-green-600 dark:text-green-400' },
    'En cours de préparation': { label: 'Préparation', icon: RefreshCw, variant: 'secondary', colorClass: 'text-blue-600 dark:text-blue-400' },
    'Expédié': { label: 'Expédié', icon: Truck, variant: 'secondary', colorClass: 'text-purple-600 dark:text-purple-400' },
    'Livraison en cours': { label: 'En Livraison', icon: Truck, variant: 'secondary', colorClass: 'text-cyan-600 dark:text-cyan-400' },
    'Livré': { label: 'Livré', icon: PackageCheck, variant: 'default', colorClass: 'text-green-700 dark:text-green-500' },
    'Annulé': { label: 'Annulé', icon: PackageX, variant: 'destructive', colorClass: 'text-red-600 dark:text-red-400' },
    'Remboursé': { label: 'Remboursé', icon: RefreshCw, variant: 'destructive', colorClass: 'text-gray-500' },
};

// --- Mock API Function to fetch orders for the current user ---
const fetchMyOrdersFromAPI = async (userId: string): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
    if (typeof window === 'undefined') return [];
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    const allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    // Filter orders for the current user and parse dates
    return allOrders
        .filter(order => order.userId === userId)
        .map(order => ({
            ...order,
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort newest first
};


export default function UserOrdersPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && !authLoading) {
            setIsLoading(true);
            const loadOrders = async () => {
                try {
                    const fetchedOrders = await fetchMyOrdersFromAPI(user.id);
                    setOrders(fetchedOrders);
                } catch (error) {
                    console.error("Failed to fetch user orders:", error);
                    // Maybe show a toast error
                } finally {
                    setIsLoading(false);
                }
            };
            loadOrders();
        } else if (!authLoading) {
             // If not logged in or auth is still loading, stop the page loading state
             setIsLoading(false);
        }
    }, [user, authLoading]);

     const getStatusBadge = (status: OrderStatus) => {
        const config = statusConfig[status] || { label: status, icon: HelpCircle, variant: 'outline', colorClass: 'text-muted-foreground' };
        const IconComponent = config.icon && typeof config.icon !== 'string' ? config.icon : HelpCircle;
        return (
            <Badge variant={config.variant} className={cn("flex items-center gap-1 whitespace-nowrap", config.colorClass, `border-${config.colorClass.replace('text-', '')}`)}>
                <IconComponent className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Mes Commandes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Historique des Commandes</CardTitle>
          <CardDescription>Retrouvez ici toutes les commandes que vous avez passées.</CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading || authLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    {[...Array(3)].map((_, i) => ( // Show fewer skeletons
                         <div key={i} className="flex items-center space-x-4 p-4 border-b">
                             <div className="space-y-2 flex-grow">
                                 <Skeleton className="h-4 w-1/4" />
                                 <Skeleton className="h-4 w-1/5" />
                             </div>
                             <Skeleton className="h-6 w-24" />
                             <Skeleton className="h-8 w-20" />
                             <Skeleton className="h-8 w-8" />
                         </div>
                     ))}
                 </div>
            ) : !user ? (
                 <p className="text-center text-muted-foreground py-8">Veuillez vous connecter pour voir vos commandes.</p>
            ): orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Vous n'avez aucune commande pour le moment.</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Numéro</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium font-mono text-xs">{order.orderNumber}</TableCell>
                            <TableCell>{order.createdAt.toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell className="text-right font-medium">{order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</TableCell>
                            <TableCell className="text-center">
                                {getStatusBadge(order.status)}
                            </TableCell>
                            <TableCell className="text-right">
                                {/* Placeholder for view details action */}
                                <Button variant="ghost" size="icon" title="Voir les détails">
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Voir les détails</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
