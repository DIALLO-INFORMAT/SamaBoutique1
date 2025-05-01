// src/app/admin/page.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users } from "lucide-react";

// Placeholder data - replace with actual data fetching
const stats = {
  revenue: 12500.50,
  orders: 350,
  customers: 120,
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Tableau de Bord Administrateur</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.customers}</div>
            {/* <p className="text-xs text-muted-foreground">
              +19% depuis le mois dernier
            </p> */}
          </CardContent>
        </Card>
        {/* Add more stats or charts as needed */}
      </div>

       {/* Placeholder for recent orders or other widgets */}
      <Card>
          <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Aucune activité récente à afficher (espace réservé).</p>
             {/* Future: Display recent orders, new users, etc. */}
          </CardContent>
      </Card>

    </div>
  );
}
