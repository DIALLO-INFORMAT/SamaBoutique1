// src/app/dashboard/orders/page.tsx
'use client';

import { useState, useEffect, createElement } from 'react'; // Added createElement
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, AlertTriangle } from "lucide-react"; // Import icons
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { useAuth } from '@/context/AuthContext'; // Import useAuth to fetch user-specific orders
import type { Order, OrderStatus } from '@/lib/types'; // Import full Order type
import { cn } from '@/lib/utils';
import { HelpCircle, Clock, Truck, PackageCheck, PackageX, RefreshCw, CircleDollarSign } from 'lucide-react'; // Import icons
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation
import Link from 'next/link'; // Import Link for unauthorized message
import { OrderDetailsDialog } from '@/components/OrderDetailsDialog'; // Import the new dialog

const ORDERS_STORAGE_KEY = 'sama_boutique_orders';

// --- Order Status Configuration (Same as Admin/Manager) ---
interface StatusConfig {
    labelKey: string; // Use key for translation
    icon: React.ElementType;
    variant: "default" | "secondary" | "destructive" | "outline";
    colorClass: string;
}

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
    const { t, currentLocale } = useTranslation(); // Use translation hook
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // State for the selected order for details
    const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control the dialog

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
        const config = statusConfig[status] || { labelKey: status, icon: HelpCircle, variant: 'outline', colorClass: 'text-muted-foreground' };
        const IconComponent = config.icon && typeof config.icon !== 'string' ? config.icon : HelpCircle;
        return (
            <Badge variant={config.variant} className={cn("flex items-center gap-1 whitespace-nowrap", config.colorClass, `border-${config.colorClass.replace('text-', '')}`)}>
                 {createElement(IconComponent, { className: "h-3 w-3" })}
                {t(config.labelKey)} {/* Translate the label */}
            </Badge>
        );
    };

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsDialogOpen(true);
    };

    // Render loading state
   if (isLoading || authLoading) {
        return (
             <div className="space-y-8">
                 <Skeleton className="h-9 w-1/3 mb-4" />
                 <Card>
                     <CardHeader>
                         <Skeleton className="h-6 w-1/2" />
                     </CardHeader>
                     <CardContent className="space-y-4">
                         <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-10 w-full" />
                     </CardContent>
                 </Card>
             </div>
        );
    }

    // Render unauthorized state
   if (!user) {
       return (
           <Card className="border-destructive bg-destructive/10 shadow-md mt-8">
               <CardContent className="p-6 flex flex-col items-center gap-4 text-destructive text-center">
                   <AlertTriangle className="h-10 w-10" />
                   <p className="font-semibold text-lg">{t('dashboard_unauthorized_title')}</p>
                   <p>{t('dashboard_unauthorized_description')}</p>
                   <Button variant="destructive" asChild className="mt-2">
                       <Link href="/account">{t('dashboard_unauthorized_login')}</Link>
                   </Button>
               </CardContent>
           </Card>
       );
   }


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">{t('dashboard_my_orders_page_title')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard_my_orders_description')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-6"> {/* Adjusted padding */}
           {orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">{t('dashboard_my_orders_no_orders')}</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="px-4 md:px-6">{t('dashboard_my_orders_table_number')}</TableHead>
                        <TableHead className="px-4 md:px-6">{t('dashboard_my_orders_table_date')}</TableHead>
                        <TableHead className="text-right px-4 md:px-6">{t('dashboard_my_orders_table_total')}</TableHead>
                        <TableHead className="text-center px-4 md:px-6">{t('dashboard_my_orders_table_status')}</TableHead>
                        <TableHead className="text-right px-4 md:px-6">{t('dashboard_my_orders_table_actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                        <TableRow key={order.id}>
                             {/* Ensure orderNumber is displayed */}
                             <TableCell className="font-medium font-mono text-xs px-4 md:px-6">{order.orderNumber}</TableCell>
                             <TableCell className="px-4 md:px-6">{order.createdAt.toLocaleDateString(currentLocale)}</TableCell>
                             <TableCell className="text-right font-medium px-4 md:px-6">{order.total.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                             <TableCell className="text-center px-4 md:px-6">
                                {getStatusBadge(order.status)}
                            </TableCell>
                            <TableCell className="text-right px-4 md:px-6">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    title={t('dashboard_my_orders_view_details')}
                                    onClick={() => handleViewDetails(order)}
                                >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">{t('dashboard_my_orders_view_details')}</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>

        {/* Order Details Dialog */}
        <OrderDetailsDialog
            order={selectedOrder}
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
        />
    </div>
  );
}
