// src/app/dashboard/manage-orders/page.tsx (Manager's View)
'use client';

import { useState, useEffect, createElement } from 'react'; // Import React and createElement
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
import { MoreHorizontal, CheckCircle, Clock, Truck, XCircle, RefreshCw, DollarSign, PackageCheck, PackageSearch, PackageX, CircleDollarSign, HelpCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order, OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useRouter } from 'next/navigation'; // Import for redirect

const ORDERS_STORAGE_KEY = 'sama_boutique_orders';

// --- Order Status Configuration (Same as Admin) ---
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

// Define which statuses a Manager can set (potentially restricted)
const managerAllowedStatuses: OrderStatus[] = [
    'En cours de préparation',
    'Expédié',
    'Livraison en cours',
    'Livré',
    'Annulé', // Managers might be allowed to cancel
    // 'Payé', // Maybe only admin can mark as paid?
    // 'Remboursé' // Maybe only admin can issue refunds?
];


// --- Mock API Functions (using localStorage - Same as Admin for now) ---
const fetchOrdersFromAPI = async (): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (typeof window === 'undefined') return [];
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    return orders.map(order => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

const updateOrderStatusAPI = async (orderId: string, newStatus: OrderStatus): Promise<void> => {
    console.log(`Manager updating order ${orderId} status to ${newStatus}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    if (typeof window === 'undefined') return;
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    let orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    orders = orders.map(order =>
        order.id === orderId
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
    );
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
     // Dispatch update event so Admin dashboard can see changes too
     const event = new CustomEvent('order-updated', { detail: { orderId, newStatus } });
     window.dispatchEvent(event);
};

// --- Component ---
export default function ManagerOrdersPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const { toast } = useToast();

     // Redirect or show error if not a manager
    useEffect(() => {
        if (!authLoading && user?.role !== 'manager') {
            toast({ title: "Accès non autorisé", description: "Seuls les gestionnaires peuvent gérer les commandes.", variant: "destructive" });
            router.replace('/dashboard'); // Redirect if not manager
        }
    }, [user, authLoading, toast, router]);

    useEffect(() => {
        // Only load if user is a manager
        if (user?.role === 'manager') {
            const loadOrders = async () => {
                setIsLoading(true);
                try {
                    const fetchedOrders = await fetchOrdersFromAPI();
                    setOrders(fetchedOrders);
                } catch (error) {
                    toast({ title: "Erreur", description: "Impossible de charger les commandes.", variant: "destructive" });
                } finally {
                    setIsLoading(false);
                }
            };
            loadOrders();

            // Listen for external order updates (e.g., from admin dashboard)
            const handleOrderUpdate = (event: Event) => {
                const { orderId, newStatus } = (event as CustomEvent).detail;
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date() } : o));
            };
            window.addEventListener('order-updated', handleOrderUpdate);
            return () => window.removeEventListener('order-updated', handleOrderUpdate);

        } else if (!authLoading) {
            // If auth is loaded and user is not manager, stop loading
            setIsLoading(false);
        }
    }, [user, authLoading, toast]);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        if (!managerAllowedStatuses.includes(newStatus)) {
            toast({ title: "Action non autorisée", description: "Vous n'avez pas la permission de définir ce statut.", variant: "destructive"});
            return;
        }
        setIsUpdating(orderId);
        try {
            await updateOrderStatusAPI(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date() } : o));
            toast({ title: "Statut Modifié", description: `Commande mise à jour: "${newStatus}".`, className: "bg-primary text-primary-foreground border-primary" });
        } catch (error) {
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


     // Render loading or unauthorized state
    if (isLoading || authLoading) {
        return <div className="p-6"><Skeleton className="h-10 w-1/2 mb-4" /><Skeleton className="h-64 w-full" /></div>;
    }

    if (user?.role !== 'manager') {
        // Message already shown by useEffect, avoid double rendering
        return null; // Or a simple placeholder
    }


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary">Gestion des Commandes (Gestionnaire)</h1>

            <Card className="shadow-md border-border">
                <CardHeader className="border-b border-border px-6 py-4">
                    <CardTitle>Commandes Clients</CardTitle>
                    <CardDescription>Suivez et mettez à jour le statut des commandes.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {orders.length === 0 ? (
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
                                        <TableCell className="font-mono text-xs px-6 py-3">{order.number}</TableCell>
                                        <TableCell className="px-6 py-3">{order.customerInfo.name}</TableCell>
                                        <TableCell className="hidden md:table-cell px-6 py-3 text-xs text-muted-foreground">
                                            {order.createdAt.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                        </TableCell>
                                        <TableCell className="text-center px-6 py-3">{getStatusBadge(order.status)}</TableCell>
                                        <TableCell className="text-right px-6 py-3 font-medium">
                                            {order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </TableCell>
                                        <TableCell className="text-right px-6 py-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" disabled={isUpdating === order.id}>
                                                        {isUpdating === order.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>Changer Statut</DropdownMenuSubTrigger>
                                                        <DropdownMenuPortal>
                                                            <DropdownMenuSubContent>
                                                                <DropdownMenuLabel>Nouveau Statut</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                {managerAllowedStatuses.map(status => {
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
                                                                {/* Optionally show disallowed statuses as disabled */}
                                                                {/* {availableStatuses.filter(s => !managerAllowedStatuses.includes(s)).map(status => (
                                                                    <DropdownMenuItem key={status} disabled className="flex items-center gap-2 text-muted-foreground">
                                                                        {React.createElement(statusConfig[status]?.icon || HelpCircle, { className: "h-4 w-4" })}
                                                                        {status} (Admin requis)
                                                                    </DropdownMenuItem>
                                                                ))} */}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuPortal>
                                                    </DropdownMenuSub>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
