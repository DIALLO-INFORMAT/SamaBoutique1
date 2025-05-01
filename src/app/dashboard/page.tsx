// src/app/dashboard/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, User, ArrowRight, Box, Loader2 } from "lucide-react"; // Added Loader2
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import type { Order, OrderStatus } from '@/lib/types'; // Import OrderStatus
import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

const fetchMyRecentOrdersFromAPI = async (userId: string, limit: number = 2): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const ORDERS_STORAGE_KEY = 'sama_boutique_orders';
    if (typeof window === 'undefined') return [];
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    const allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    return allOrders
        .filter(order => order.userId === userId)
        .map(order => ({
            ...order,
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
};

const getStatusClass = (status: Order['status']): string => {
    switch (status) {
        case 'Livré': return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
        case 'Expédié':
        case 'Livraison en cours': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
        case 'Annulé':
        case 'Remboursé': return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
        default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
    }
};


export default function UserDashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { t, currentLocale } = useTranslation(); // Use translation hook
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

     useEffect(() => {
         if (user && !authLoading) {
             setIsLoadingOrders(true);
             fetchMyRecentOrdersFromAPI(user.id)
                 .then(setRecentOrders)
                 .finally(() => setIsLoadingOrders(false));
         } else if (!authLoading) {
             setIsLoadingOrders(false);
         }
     }, [user, authLoading]);


    if (authLoading || !user) {
        return (
             <div className="space-y-8">
                  <div>
                       <Skeleton className="h-9 w-1/2 mb-2" />
                       <Skeleton className="h-5 w-3/4" />
                  </div>
                   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                                <CardContent className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-5 w-1/3 mt-2" />
                                </CardContent>
                            </Card>
                        ))}
                   </div>
                   <Card>
                      <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                      <CardContent className="space-y-4">
                          {[...Array(2)].map((_, i) => (
                              <div key={i} className="flex justify-between items-center border-b pb-3 last:border-none">
                                  <div className="space-y-2">
                                       <Skeleton className="h-4 w-32" />
                                       <Skeleton className="h-4 w-24" />
                                  </div>
                                   <Skeleton className="h-6 w-20" />
                              </div>
                          ))}
                      </CardContent>
                   </Card>
             </div>
        );
    }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
         <h1 className="text-3xl font-bold text-primary">{t('dashboard_welcome', { name: user.name })}</h1>
         <p className="text-muted-foreground">
           {user.role === 'manager' ? t('dashboard_description_manager') : t('dashboard_description_customer')}
         </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

        {/* Manager Specific Card: Manage Products */}
        {user.role === 'manager' && (
            <Card className="hover:shadow-lg transition-shadow border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Box className="text-primary" /> {t('dashboard_manage_products_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t('dashboard_manage_products_description')}</CardDescription>
                <Link href="/dashboard/products" passHref legacyBehavior>
                  <Button variant="link" className="px-0 mt-2 text-primary">
                    {t('dashboard_manage_products_link')} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
        )}

         {/* Manager Specific Card: Manage Orders */}
         {user.role === 'manager' && (
             <Card className="hover:shadow-lg transition-shadow border border-border">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Package className="text-primary" /> {t('dashboard_manage_orders_title')}</CardTitle>
               </CardHeader>
               <CardContent>
                 <CardDescription>{t('dashboard_manage_orders_description')}</CardDescription>
                 <Link href="/dashboard/manage-orders" passHref legacyBehavior>
                   <Button variant="link" className="px-0 mt-2 text-primary">
                     {t('dashboard_manage_orders_link')} <ArrowRight className="ml-1 h-4 w-4" />
                   </Button>
                 </Link>
               </CardContent>
             </Card>
         )}

        {/* Customer Specific Card: My Orders (Hidden for Manager) */}
        {user.role === 'customer' && (
             <Card className="hover:shadow-lg transition-shadow border border-border">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Package className="text-primary" /> {t('dashboard_my_orders_title')}</CardTitle>
               </CardHeader>
               <CardContent>
                 <CardDescription>{t('dashboard_my_orders_description')}</CardDescription>
                 <Link href="/dashboard/orders" passHref legacyBehavior>
                   <Button variant="link" className="px-0 mt-2 text-primary">
                     {t('dashboard_my_orders_link')} <ArrowRight className="ml-1 h-4 w-4" />
                   </Button>
                 </Link>
               </CardContent>
             </Card>
        )}

        {/* Common Card: My Profile */}
        <Card className="hover:shadow-lg transition-shadow border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="text-primary" /> {t('dashboard_my_profile_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{t('dashboard_my_profile_description')}</CardDescription>
            <Link href="/dashboard/profile" passHref legacyBehavior>
              <Button variant="link" className="px-0 mt-2 text-primary">
                {t('dashboard_my_profile_link')} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Summary */}
      <Card className="shadow-md border border-border">
        <CardHeader>
          <CardTitle>{t('dashboard_recent_orders_title')}</CardTitle>
          <CardDescription>{t('dashboard_recent_orders_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingOrders ? (
             <div className="flex justify-center items-center py-8">
                 <Loader2 className="h-8 w-8 animate-spin text-primary"/>
             </div>
          ) : recentOrders.length > 0 ? (
            <ul className="space-y-4">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 last:border-none last:pb-0">
                  <div>
                    {/* Translate order status label */}
                    <p className="font-medium">
                        {t('track_order_number_label')} #{order.orderNumber.substring(0, 8)} <span className="text-muted-foreground text-sm">({order.createdAt.toLocaleDateString(currentLocale)})</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{t('track_order_total_label')} : {order.total.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                  <span className={cn(
                        "mt-1 sm:mt-0 text-xs font-medium px-2 py-0.5 rounded-full",
                        getStatusClass(order.status)
                    )}>
                    {t(statusConfig[order.status]?.labelKey || order.status)} {/* Translate status */}
                  </span>
                </li>
              ))}
               <div className="mt-4 text-center">
                     <Link href={user.role === 'manager' ? "/dashboard/manage-orders" : "/dashboard/orders"} passHref legacyBehavior>
                       <Button variant="outline" size="sm">{t('dashboard_recent_orders_view_all')}</Button>
                    </Link>
                </div>
            </ul>
          ) : (
            <p className="text-center text-muted-foreground py-8">{t('dashboard_recent_orders_none')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Import and use statusConfig from tracking page or define locally
const statusConfig: Record<OrderStatus, { labelKey: string }> = {
    'En attente de paiement': { labelKey: 'order_status_pending_payment' },
    'Payé': { labelKey: 'order_status_paid' },
    'En cours de préparation': { labelKey: 'order_status_processing' },
    'Expédié': { labelKey: 'order_status_shipped' },
    'Livraison en cours': { labelKey: 'order_status_delivering' },
    'Livré': { labelKey: 'order_status_delivered' },
    'Annulé': { labelKey: 'order_status_cancelled' },
    'Remboursé': { labelKey: 'order_status_refunded' },
};
