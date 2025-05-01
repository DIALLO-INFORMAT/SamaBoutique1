// src/app/admin/orders/page.tsx
'use client';

import { useState, useEffect, createElement } from 'react'; // Import React
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, Clock, Truck, XCircle, RefreshCw, DollarSign, PackageCheck, PackageSearch, PackageX, CircleDollarSign, HelpCircle } from "lucide-react"; // Added HelpCircle
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order, OrderStatus } from '@/lib/types'; // Import Order types
import { cn } from '@/lib/utils';

const ORDERS_STORAGE_KEY = 'sama_boutique_orders';

// --- Order Status Configuration ---
interface StatusConfig {
    label: string;
    icon: React.ElementType;
    variant: "default" | "secondary" | "destructive" | "outline";
    colorClass: string; // Tailwind text color class
}

const statusConfig: Record<OrderStatus, StatusConfig> = {
    'En attente de paiement': { label: 'Attente Paiement', icon: Clock, variant: 'outline', colorClass: 'text-yellow-600 dark:text-yellow-400' },
    'Payé': { label: 'Payé', icon: CircleDollarSign, variant: 'default', colorClass: 'text-green-600 dark:text-green-400' },
    'En cours de préparation': { label: 'Préparation', icon: RefreshCw, variant: 'secondary', colorClass: 'text-blue-600 dark:text-blue-400' },
    'Expédié': { label: 'Expédié', icon: Truck, variant: 'secondary', colorClass: 'text-purple-600 dark:text-purple-400' },
    'Livraison en cours': { label: 'En Livraison', icon: Truck, variant: 'secondary', colorClass: 'text-cyan-600 dark:text-cyan-400' },
    'Livré': { label: 'Livré', icon: PackageCheck, variant: 'default', colorClass: 'text-green-700 dark:text-green-500' },
    'Annulé': { label: 'Annulé', icon: PackageX, variant: 'destructive', colorClass: 'text-red-600 dark:text-red-400' },
    'Remboursé': { label: 'Remboursé', icon: RefreshCw, variant: 'destructive', colorClass: 'text-gray-500' }, // Added Refunded
};

const availableStatuses: OrderStatus[] = [
    'En attente de paiement',
    'Payé',
    'En cours de préparation',
    'Expédié',
    'Livraison en cours',
    'Livré',
    'Annulé',
    'Remboursé'
];


// --- Mock API Functions (using localStorage) ---
const fetchOrdersFromAPI = async (): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
    if (typeof window === 'undefined') return [];
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    // Convert date strings back to Date objects
    return orders.map(order => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort newest first
};

const updateOrderStatusAPI = async (orderId: string, newStatus: OrderStatus): Promise<void> => {
    console.log(`Admin updating order ${orderId} status to ${newStatus}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    if (typeof window === 'undefined') return;
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    let orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    orders = orders.map(order =>
        order.id === orderId
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } // Update status and timestamp
            : order
    );
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
     // Dispatch update event (optional, if needed by other components)
     const event = new CustomEvent('order-updated', { detail: { orderId, newStatus } });
     window.dispatchEvent(event);
};

// --- Component ---
export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null); // Track which order is being updated
    const { toast } = useToast();

    useEffect(() => {
        const loadOrders = async () => {
            setIsLoading(true);
            try {
                const fetchedOrders = await fetchOrdersFromAPI();
                setOrders(fetchedOrders);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                toast({ title: "Erreur", description: "Impossible de charger les commandes.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        loadOrders();

         // Listen for external order updates (e.g., from manager dashboard)
         const handleOrderUpdate = (event: Event) => {
             const { orderId, newStatus } = (event as CustomEvent).detail;
             setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date() } : o));
         };
         window.addEventListener('order-updated', handleOrderUpdate);
         return () => window.removeEventListener('order-updated', handleOrderUpdate);

    }, [toast]);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        setIsUpdating(orderId);
        try {
            await updateOrderStatusAPI(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date() } : o));
            toast({ title: "Statut Modifié", description: `La commande ${orderId.substring(0, 8)}... est maintenant "${newStatus}".`, className: "bg-primary text-primary-foreground border-primary" });
        } catch (error) {
            console.error("Failed to update status:", error);
            toast({ title: "Erreur", description: "Impossible de modifier le statut.", variant: "destructive" });
        } finally {
            setIsUpdating(null);
        }
    };

    const getStatusBadge = (status: OrderStatus) => {
        const config = statusConfig[status] || { label: status, icon: HelpCircle, variant: 'outline', colorClass: 'text-muted-foreground' };
        // Ensure config.icon is a valid component type
        const IconComponent = config.icon && typeof config.icon !== 'string' ? config.icon : HelpCircle;
        return (
            <Badge variant={config.variant} className={cn("flex items-center gap-1 whitespace-nowrap", config.colorClass, `border-${config.colorClass.replace('text-', '')}`)}>
                 {createElement(IconComponent, { className: "h-3 w-3" })}
                {config.label}
            </Badge>
        );
    };


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary">Gestion des Commandes</h1>

            <Card className="shadow-md border-border">
                <CardHeader className="border-b border-border px-6 py-4">
                    <CardTitle>Toutes les Commandes</CardTitle>
                    <CardDescription>Suivez et mettez à jour le statut des commandes clients.</CardDescription>
                    {/* Optional: Add filters/search here */}
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="space-y-2 p-6">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                                    <Skeleton className="h-4 w-1/6" />
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-1/6 hidden md:block" />
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-8 w-8 ml-auto" />
                                </div>
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <p className="text-center text-muted-foreground py-12">Aucune commande trouvée.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-6">Numéro</TableHead>
                                    <TableHead className="px-6">Client</TableHead>
                                    <TableHead className="hidden md:table-cell px-6">Date</TableHead>
                                    <TableHead className="text-center px-6">Statut</TableHead>
                                    <TableHead className="text-right px-6">Total</TableHead>
                                    <TableHead className="text-right px-6 w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium px-6 py-3">
                                            <span className="font-mono text-xs">{order.orderNumber}</span>
                                        </TableCell>
                                        <TableCell className="px-6 py-3">
                                            <div>{order.customerInfo.name}</div>
                                            <div className="text-xs text-muted-foreground">{order.customerInfo.email || order.customerInfo.phone}</div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell px-6 py-3 text-xs text-muted-foreground">
                                            {order.createdAt.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                        </TableCell>
                                        <TableCell className="text-center px-6 py-3">
                                            {getStatusBadge(order.status)}
                                        </TableCell>
                                        <TableCell className="text-right px-6 py-3 font-medium">
                                            {order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                                        </TableCell>
                                        <TableCell className="text-right px-6 py-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        aria-haspopup="true"
                                                        size="icon"
                                                        variant="ghost"
                                                        disabled={isUpdating === order.id}
                                                    >
                                                        {isUpdating === order.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions Commande</DropdownMenuLabel>
                                                    {/* View Details (Future) */}
                                                    {/* <DropdownMenuItem>Voir Détails</DropdownMenuItem> */}
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            <span>Changer Statut</span>
                                                        </DropdownMenuSubTrigger>
                                                         <DropdownMenuPortal>
                                                             <DropdownMenuSubContent>
                                                                 <DropdownMenuLabel>Nouveau Statut</DropdownMenuLabel>
                                                                 <DropdownMenuSeparator />
                                                                 {availableStatuses.map(status => {
                                                                      const config = statusConfig[status] || { icon: HelpCircle };
                                                                      // Ensure config.icon is a valid component type
                                                                       const IconComponent = config.icon && typeof config.icon !== 'string' ? config.icon : HelpCircle;
                                                                     return (
                                                                     <DropdownMenuItem
                                                                         key={status}
                                                                         disabled={order.status === status || isUpdating === order.id}
                                                                         onClick={() => handleStatusChange(order.id, status)}
                                                                         className={cn("flex items-center gap-2", statusConfig[status]?.colorClass)}
                                                                     >
                                                                         {createElement(IconComponent, { className: "h-4 w-4" })}
                                                                         {status}
                                                                         {order.status === status && <CheckCircle className="ml-auto h-4 w-4 text-green-500" />}
                                                                     </DropdownMenuItem>
                                                                  );
                                                                  })}
                                                             </DropdownMenuSubContent>
                                                         </DropdownMenuPortal>
                                                    </DropdownMenuSub>
                                                    {/* Delete Order (Requires Confirmation) */}
                                                    {/* <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                        Supprimer Commande
                                                    </DropdownMenuItem> */}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                 {/* Optional: Pagination */}
            </Card>
        </div>
    );
}
