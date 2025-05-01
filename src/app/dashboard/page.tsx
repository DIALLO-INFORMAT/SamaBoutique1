// src/app/dashboard/page.tsx
'use client'; // Needed for hooks

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, User, ArrowRight, Box } from "lucide-react"; // Added Box icon
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import type { Order } from "@/lib/types"; // Import full Order type
import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { cn } from '@/lib/utils'; // For conditional styling

// --- Mock API Function to fetch recent orders for the current user ---
const fetchMyRecentOrdersFromAPI = async (userId: string, limit: number = 2): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate delay
    const ORDERS_STORAGE_KEY = 'sama_boutique_orders';
    if (typeof window === 'undefined') return [];
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    const allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    // Filter, parse dates, sort, and limit
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

// Status badge configuration (simplified from orders page)
const getStatusClass = (status: Order['status']): string => {
    switch (status) {
        case 'Livré': return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
        case 'Expédié':
        case 'Livraison en cours': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
        case 'Annulé':
        case 'Remboursé': return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
        case 'En attente de paiement':
        case 'Payé':
        case 'En cours de préparation':
        default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
    }
};


export default function UserDashboardPage() {
    const { user, isLoading: authLoading } = useAuth(); // Get user data from context
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

     // Fetch recent orders
     useEffect(() => {
         if (user && !authLoading) {
             setIsLoadingOrders(true);
             fetchMyRecentOrdersFromAPI(user.id)
                 .then(setRecentOrders)
                 .finally(() => setIsLoadingOrders(false));
         } else if (!authLoading) {
             setIsLoadingOrders(false); // Stop loading if no user
         }
     }, [user, authLoading]);


    if (authLoading || !user) {
        // Display loading skeleton or redirect message
        return (
             <div className="space-y-8">
                  {/* Welcome Header Skeleton */}
                  <div>
                       <Skeleton className="h-9 w-1/2 mb-2" />
                       <Skeleton className="h-5 w-3/4" />
                  </div>
                  {/* Quick Links Skeleton */}
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
                   {/* Recent Orders Skeleton */}
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
         <h1 className="text-3xl font-bold text-primary">Bienvenue, {user.name} !</h1>
         <p className="text-muted-foreground">
           Votre espace personnel {user.role === 'manager' ? 'Gestionnaire' : 'Client'} SamaBoutique.
         </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> {/* Adjusted grid */}

        {/* Manager Specific Card: Manage Products */}
        {user.role === 'manager' && (
            <Card className="hover:shadow-lg transition-shadow border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Box className="text-primary" /> Gérer Produits</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Ajouter ou modifier les produits de la boutique.</CardDescription>
                <Link href="/dashboard/products" passHref legacyBehavior>
                  <Button variant="link" className="px-0 mt-2 text-primary">
                    Accéder à la gestion <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
        )}

         {/* Manager Specific Card: Manage Orders */}
         {user.role === 'manager' && (
             <Card className="hover:shadow-lg transition-shadow border border-border">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Package className="text-primary" /> Gérer Commandes</CardTitle>
               </CardHeader>
               <CardContent>
                 <CardDescription>Suivre et mettre à jour le statut des commandes.</CardDescription>
                 <Link href="/dashboard/manage-orders" passHref legacyBehavior>
                   <Button variant="link" className="px-0 mt-2 text-primary">
                     Voir les commandes <ArrowRight className="ml-1 h-4 w-4" />
                   </Button>
                 </Link>
               </CardContent>
             </Card>
         )}

        {/* Customer Specific Card: My Orders (Hidden for Manager) */}
        {user.role === 'customer' && (
             <Card className="hover:shadow-lg transition-shadow border border-border">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Package className="text-primary" /> Mes Commandes</CardTitle>
               </CardHeader>
               <CardContent>
                 <CardDescription>Voir l'historique et le statut de vos commandes.</CardDescription>
                 <Link href="/dashboard/orders" passHref legacyBehavior>
                   <Button variant="link" className="px-0 mt-2 text-primary">
                     Voir mes commandes <ArrowRight className="ml-1 h-4 w-4" />
                   </Button>
                 </Link>
               </CardContent>
             </Card>
        )}

        {/* Common Card: My Profile */}
        <Card className="hover:shadow-lg transition-shadow border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="text-primary" /> Mon Profil</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Mettre à jour vos informations personnelles.</CardDescription>
            <Link href="/dashboard/profile" passHref legacyBehavior>
              <Button variant="link" className="px-0 mt-2 text-primary">
                Gérer mon profil <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Summary */}
      <Card className="shadow-md border border-border">
        <CardHeader>
          <CardTitle>Commandes Récentes</CardTitle>
          <CardDescription>Vos dernières commandes passées.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingOrders ? (
             <div className="space-y-4">
                 <Skeleton className="h-5 w-32" />
                 <Skeleton className="h-5 w-24" />
                 <Skeleton className="h-5 w-32 mt-2" />
                 <Skeleton className="h-5 w-24" />
             </div>
          ) : recentOrders.length > 0 ? (
            <ul className="space-y-4">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 last:border-none last:pb-0">
                  <div>
                    <p className="font-medium">Commande #{order.orderNumber.substring(0, 8)} <span className="text-muted-foreground text-sm">({order.createdAt.toLocaleDateString('fr-FR')})</span></p>
                    <p className="text-sm text-muted-foreground">Total : {order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
                  </div>
                  <span className={cn(
                        "mt-1 sm:mt-0 text-xs font-medium px-2 py-0.5 rounded-full",
                        getStatusClass(order.status)
                    )}>
                    {order.status}
                  </span>
                </li>
              ))}
               <div className="mt-4 text-center">
                     <Link href={user.role === 'manager' ? "/dashboard/manage-orders" : "/dashboard/orders"} passHref legacyBehavior>
                       <Button variant="outline" size="sm">Voir toutes les commandes</Button>
                    </Link>
                </div>
            </ul>
          ) : (
            <p className="text-center text-muted-foreground py-8">Vous n'avez pas encore passé de commande.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
