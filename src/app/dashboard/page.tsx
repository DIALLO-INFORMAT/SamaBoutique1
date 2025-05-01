// src/app/dashboard/page.tsx
'use client'; // Needed for hooks

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, User, ArrowRight, Box } from "lucide-react"; // Added Box icon
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

// Placeholder for user data - will be replaced by context
// const userData = { ... };

// Mock recent orders (replace with actual data fetching if needed)
const mockRecentOrders = [
    { id: 'order1', date: '2024-05-20', total: 64.99, status: 'Livré' },
    { id: 'order2', date: '2024-05-25', total: 19.99, status: 'En cours de préparation' },
];

export default function UserDashboardPage() {
    const { user } = useAuth(); // Get user data from context

    if (!user) {
        // This should ideally be handled by the layout, but as a fallback:
        return <p>Chargement ou utilisateur non trouvé...</p>;
    }

    const recentOrders = mockRecentOrders; // Use mock data for now

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

        {/* Manager Specific Card */}
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
          {recentOrders.length > 0 ? (
            <ul className="space-y-4">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 last:border-none last:pb-0">
                  <div>
                    <p className="font-medium">Commande #{order.id.substring(0, 6)} <span className="text-muted-foreground text-sm">({new Date(order.date).toLocaleDateString('fr-FR')})</span></p>
                    <p className="text-sm text-muted-foreground">Total : {order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                  </div>
                  <span className={`mt-1 sm:mt-0 text-sm font-medium px-2 py-0.5 rounded ${
                        order.status === 'Livré' ? 'bg-green-100 text-green-700' :
                        order.status === 'Expédié' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Annulé' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700' // En cours
                    }`}>
                    {order.status}
                  </span>
                </li>
              ))}
               <div className="mt-4 text-center">
                    <Link href="/dashboard/orders" passHref legacyBehavior>
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
