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
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

const ORDERS_STORAGE_KEY = 'sama_boutique_orders';

// --- Order Status Configuration ---
interface StatusConfig {
    labelKey: string; // Use key for translation
    icon: React.ElementType;
    variant: "default" | "secondary" | "destructive" | "outline";
    colorClass: string; // Tailwind text color class
}

// Using keys from fr.json for labels
const statusConfig: Record<OrderStatus, StatusConfig> = {
    'En attente de paiement': { labelKey: 'order_status_pending_payment', icon: Clock, variant: 'outline', colorClass: 'text-yellow-600 dark:text-yellow-400' },
    'Payé': { labelKey: 'order_status_paid', icon: CircleDollarSign, variant: 'default', colorClass: 'text-green-600 dark:text-green-400' },
    'En cours de préparation': { labelKey: 'order_status_processing', icon: RefreshCw, variant: 'secondary', colorClass: 'text-blue-600 dark:text-blue-400' },
    'Expédié': { labelKey: 'order_status_shipped', icon: Truck, variant: 'secondary', colorClass: 'text-purple-600 dark:text-purple-400' },
    'Livraison en cours': { labelKey: 'order_status_delivering', icon: Truck, variant: 'secondary', colorClass: 'text-cyan-600 dark:text-cyan-400' },
    'Livré': { labelKey: 'order_status_delivered', icon: PackageCheck, variant: 'default', colorClass: 'text-green-700 dark:text-green-500' },
    'Annulé': { labelKey: 'order_status_cancelled', icon: PackageX, variant: 'destructive', colorClass: 'text-red-600 dark:text-red-400' },
    'Remboursé': { labelKey: 'order_status_refunded', icon: RefreshCw, variant: 'destructive', colorClass: 'text-gray-500' },
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
// Fetch ALL orders for Admin
const fetchOrdersFromAPI = async (): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
    if (typeof window === 'undefined') return [];
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    // Convert date strings back to Date objects and sort
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
     // Dispatch update event (optional, if needed by other components like manager dashboard)
     const event = new CustomEvent('order-updated', { detail: { orderId, newStatus } });
     window.dispatchEvent(event);
};

// --- Component ---
export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null); // Track which order is being updated
    const { toast } = useToast();
    const { t, currentLocale } = useTranslation(); // Use translation hook

    useEffect(() => {
        const loadOrders = async () => {
            setIsLoading(true);
            try {
                const fetchedOrders = await fetchOrdersFromAPI(); // Fetch all orders
                setOrders(fetchedOrders);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                toast({ title: t('general_error'), description: t('admin_orders_toast_status_error_description'), variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        loadOrders();

         // Listen for external order updates (e.g., from manager dashboard or user cancellation)
         const handleOrderUpdate = (event: Event) => {
             const { orderId, newStatus } = (event as CustomEvent).detail;
             setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date() } : o));
         };
         window.addEventListener('order-updated', handleOrderUpdate);
         // Listen for new orders placed by users/guests
         const handleNewOrder = (event: Event) => {
              const newOrder = (event as CustomEvent).detail as Order;
              // Add the new order to the beginning of the list after converting date strings
               setOrders(prev => [{...newOrder, createdAt: new Date(newOrder.createdAt), updatedAt: new Date(newOrder.updatedAt)}, ...prev]);
         }
         window.addEventListener('new-order', handleNewOrder);

         return () => {
             window.removeEventListener('order-updated', handleOrderUpdate);
             window.removeEventListener('new-order', handleNewOrder);
         }

    }, [toast, t]); // Added t dependency

    const handleStatusChange = async (orderId: string, orderNumber: string, newStatus: OrderStatus) => {
        setIsUpdating(orderId);
        try {
            await updateOrderStatusAPI(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date() } : o));
            toast({ title: t('admin_orders_toast_status_success_title'), description: t('admin_orders_toast_status_success_description', { orderId: orderNumber, status: t(statusConfig[newStatus]?.labelKey || newStatus) }), className: "bg-primary text-primary-foreground border-primary" });
        } catch (error) {
            console.error("Failed to update status:", error);
            toast({ title: t('general_error'), description: t('admin_orders_toast_status_error_description'), variant: "destructive" });
        } finally {
            setIsUpdating(null);
        }
    };

     const getStatusBadge = (status: OrderStatus) => {
        const config = statusConfig[status] || { labelKey: status, icon: HelpCircle, variant: 'outline', colorClass: 'text-muted-foreground' };
        // Ensure config.icon is a valid component type
        const IconComponent = config.icon && typeof config.icon !== 'string' ? config.icon : HelpCircle;
        return (
            <Badge variant={config.variant} className={cn("flex items-center gap-1 whitespace-nowrap", config.colorClass, `border-${config.colorClass.replace('text-', '')}`)}>
                 {createElement(IconComponent, { className: "h-3 w-3" })}
                {t(config.labelKey)} {/* Translate the label */}
            </Badge>
        );
    };


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary">{t('admin_orders_page_title')}</h1>

            <Card className="shadow-md border-border">
                <CardHeader className="border-b border-border px-6 py-4">
                    <CardTitle>{t('admin_orders_table_title')}</CardTitle>
                    <CardDescription>{t('admin_orders_description')}</CardDescription>
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
                        <p className="text-center text-muted-foreground py-12">{t('admin_orders_no_orders')}</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-6">{t('admin_orders_table_number')}</TableHead>
                                    <TableHead className="px-6">{t('admin_orders_table_customer')}</TableHead>
                                    <TableHead className="hidden md:table-cell px-6">{t('admin_orders_table_date')}</TableHead>
                                    <TableHead className="text-center px-6">{t('admin_orders_table_status')}</TableHead>
                                    <TableHead className="text-right px-6">{t('admin_orders_table_total')}</TableHead>
                                    <TableHead className="text-right px-6 w-[100px]">{t('admin_orders_table_actions')}</TableHead>
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
                                            {order.createdAt.toLocaleString(currentLocale, { dateStyle: 'short', timeStyle: 'short' })}
                                        </TableCell>
                                        <TableCell className="text-center px-6 py-3">
                                            {getStatusBadge(order.status)}
                                        </TableCell>
                                        <TableCell className="text-right px-6 py-3 font-medium">
                                            {order.total.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
                                                        <span className="sr-only">{t('admin_orders_action_label')}</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>{t('admin_orders_action_label')}</DropdownMenuLabel>
                                                    {/* View Details (Future) */}
                                                    {/* <DropdownMenuItem>Voir Détails</DropdownMenuItem> */}
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            <span>{t('admin_orders_change_status_label')}</span>
                                                        </DropdownMenuSubTrigger>
                                                         <DropdownMenuPortal>
                                                             <DropdownMenuSubContent>
                                                                 <DropdownMenuLabel>{t('admin_orders_new_status_label')}</DropdownMenuLabel>
                                                                 <DropdownMenuSeparator />
                                                                 {availableStatuses.map(status => {
                                                                      const config = statusConfig[status] || { icon: HelpCircle };
                                                                      // Ensure config.icon is a valid component type
                                                                       const IconComponent = config.icon && typeof config.icon !== 'string' ? config.icon : HelpCircle;
                                                                     return (
                                                                     <DropdownMenuItem
                                                                         key={status}
                                                                         disabled={order.status === status || isUpdating === order.id}
                                                                         onClick={() => handleStatusChange(order.id, order.orderNumber, status)}
                                                                         className={cn("flex items-center gap-2 cursor-pointer", statusConfig[status]?.colorClass)}
                                                                     >
                                                                         {createElement(IconComponent, { className: "h-4 w-4" })}
                                                                         {t(statusConfig[status]?.labelKey || status)} {/* Translate status */}
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

