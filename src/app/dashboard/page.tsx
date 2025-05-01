// src/app/dashboard/page.tsx
'use client'; // Needed for simulated user data access

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, User, ArrowRight } from "lucide-react";
import Link from "next/link";

// Placeholder for user data - replace with actual data fetching based on auth
const userData = {
  name: "Alice Dupont", // Example user name
  recentOrders: [
    { id: 'order1', date: '2024-05-20', total: 64.99, status: 'Livré' },
    { id: 'order2', date: '2024-05-25', total: 19.99, status: 'En cours de préparation' },
  ],
};

export default function UserDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Bienvenue, {userData.name} !</h1>
      <p className="text-muted-foreground">
        C'est votre espace personnel pour gérer vos commandes et informations.
      </p>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package /> Mes Commandes</CardTitle>
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
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User /> Mon Profil</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle>Commandes Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {userData.recentOrders.length > 0 ? (
            <ul className="space-y-3">
              {userData.recentOrders.map((order) => (
                <li key={order.id} className="flex justify-between items-center border-b pb-2 last:border-none">
                  <div>
                    <p className="font-medium">Commande du {new Date(order.date).toLocaleDateString('fr-FR')}</p>
                    <p className="text-sm text-muted-foreground">Total : {order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                  </div>
                  <span className={`text-sm font-medium ${order.status === 'Livré' ? 'text-green-600' : 'text-orange-500'}`}>
                    {order.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Vous n'avez pas encore passé de commande.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}