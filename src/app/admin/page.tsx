// src/app/admin/page.tsx

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingBag, Users, Box, Settings, ArrowRight } from "lucide-react";
import Link from "next/link";

// Placeholder data - replace with actual data fetching
const stats = {
  revenue: 12500.50,
  orders: 350,
  customers: 120,
  products: 6, // Add product count
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Tableau de Bord Administrateur</h1>
      <p className="text-muted-foreground">
        Bienvenue dans l'espace d'administration de SamaBoutique. Gérez vos produits, utilisateurs et paramètres ici.
      </p>

      {/* Key Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenu Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </div>
            {/* <p className="text-xs text-muted-foreground">
              +20.1% depuis le mois dernier
            </p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.orders}</div>
            {/* <p className="text-xs text-muted-foreground">
              +180.1% depuis le mois dernier
            </p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.customers}</div>
             {/* <p className="text-xs text-muted-foreground">
               +19% depuis le mois dernier
             </p> */}
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            {/* <p className="text-xs text-muted-foreground">
              +2 ajoutés ce mois-ci
            </p> */}
          </CardContent>
        </Card>
      </div>

       {/* Quick Actions / Navigation */}
       <Card>
           <CardHeader>
               <CardTitle>Actions Rapides</CardTitle>
               <CardDescription>Accédez rapidement aux sections clés de l'administration.</CardDescription>
           </CardHeader>
           <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
               <Link href="/admin/products" passHref legacyBehavior>
                   <Button variant="outline" className="w-full justify-start gap-2">
                       <Box className="h-4 w-4" />
                       Gérer les Produits
                       <ArrowRight className="h-4 w-4 ml-auto" />
                   </Button>
               </Link>
               <Link href="/admin/users" passHref legacyBehavior>
                   <Button variant="outline" className="w-full justify-start gap-2">
                       <Users className="h-4 w-4" />
                       Gérer les Utilisateurs
                       <ArrowRight className="h-4 w-4 ml-auto" />
                   </Button>
               </Link>
                <Link href="/admin/settings" passHref legacyBehavior>
                   <Button variant="outline" className="w-full justify-start gap-2">
                       <Settings className="h-4 w-4" />
                       Configurer les Paramètres
                       <ArrowRight className="h-4 w-4 ml-auto" />
                   </Button>
               </Link>
               {/* Add more quick links if needed */}
           </CardContent>
       </Card>

      {/* Placeholder for recent activity or reports */}
      <Card>
          <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
              <CardDescription>Dernières commandes et inscriptions.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Aucune activité récente à afficher (espace réservé).</p>
             {/* Future: Display recent orders, new users, etc. */}
          </CardContent>
      </Card>

    </div>
  );
}