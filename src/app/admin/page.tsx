// src/app/admin/page.tsx
'use client'; // Required for potential future interactions or data fetching hooks

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingBag, Users, Box, Settings, ArrowRight, BarChart, Package } from "lucide-react"; // Added BarChart, Package
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Import useAuth to welcome the admin

// Placeholder data - replace with actual data fetching
const stats = {
  revenue: 1250050, // Assume price is in integer cents or smallest unit if not using floats
  orders: 350,
  customers: 120,
  products: 6,
};

export default function AdminDashboardPage() {
  const { user } = useAuth(); // Get logged-in user info

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
             <h1 className="text-3xl font-bold text-primary">Tableau de Bord Administrateur</h1>
             <p className="text-muted-foreground">
                Bienvenue, {user?.name || 'Admin'} ! Gérez votre boutique ici.
             </p>
          </div>
           {/* Optional: Add a quick action button like "View Site" */}
           {/* <Button variant="outline" size="sm">Voir le site</Button> */}
      </div>


      {/* Key Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border border-border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenu Total
            </CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
            </div>
             <p className="text-xs text-muted-foreground mt-1">
               Statistiques globales
             </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commandes</CardTitle>
            <ShoppingBag className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.orders}</div>
             <p className="text-xs text-muted-foreground mt-1">
                Nombre total de commandes
             </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clients</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.customers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                 Total des comptes clients
              </p>
          </CardContent>
        </Card>
         <Card className="shadow-sm border border-border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Produits</CardTitle>
            <Box className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
             <p className="text-xs text-muted-foreground mt-1">
                Articles actifs en boutique
             </p>
          </CardContent>
        </Card>
      </div>

       {/* Quick Actions / Navigation */}
       <Card className="shadow-md border border-border">
           <CardHeader>
               <CardTitle>Actions Rapides</CardTitle>
               <CardDescription>Accès direct aux sections clés.</CardDescription>
           </CardHeader>
           <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
               <Link href="/admin/products" passHref legacyBehavior>
                   <Button variant="outline" className="w-full justify-start gap-3 p-4 h-auto hover:bg-secondary transition-colors">
                       <Box className="h-5 w-5 text-primary" />
                       <div>
                           <span className="font-medium">Gérer les Produits</span>
                           <p className="text-xs text-muted-foreground">Ajouter, modifier, supprimer</p>
                       </div>
                       <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                   </Button>
               </Link>
                <Link href="/admin/orders" passHref legacyBehavior>
                   <Button variant="outline" className="w-full justify-start gap-3 p-4 h-auto hover:bg-secondary transition-colors">
                       <Package className="h-5 w-5 text-primary" />
                        <div>
                           <span className="font-medium">Gérer les Commandes</span>
                            <p className="text-xs text-muted-foreground">Statuts et détails</p>
                       </div>
                       <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                   </Button>
               </Link>
               <Link href="/admin/users" passHref legacyBehavior>
                   <Button variant="outline" className="w-full justify-start gap-3 p-4 h-auto hover:bg-secondary transition-colors">
                       <Users className="h-5 w-5 text-primary" />
                        <div>
                           <span className="font-medium">Gérer les Utilisateurs</span>
                            <p className="text-xs text-muted-foreground">Comptes et permissions</p>
                       </div>
                       <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                   </Button>
               </Link>
                <Link href="/admin/settings" passHref legacyBehavior>
                   <Button variant="outline" className="w-full justify-start gap-3 p-4 h-auto hover:bg-secondary transition-colors">
                       <Settings className="h-5 w-5 text-primary" />
                       <div>
                           <span className="font-medium">Paramètres Boutique</span>
                            <p className="text-xs text-muted-foreground">Configuration générale</p>
                       </div>
                       <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                   </Button>
               </Link>
           </CardContent>
       </Card>

      {/* Placeholder for recent activity or reports */}
      <Card className="shadow-md border border-border">
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5 text-primary"/> Activité Récente</CardTitle>
              <CardDescription>Un aperçu des dernières actions.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-center text-muted-foreground py-8">(Section des rapports et activités récentes à venir)</p>
             {/* Future: Display recent orders chart, new users list, etc. */}
             {/* Example: <RecentOrdersChart /> */}
          </CardContent>
      </Card>

    </div>
  );
}
