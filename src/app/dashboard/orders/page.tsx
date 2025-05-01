// src/app/dashboard/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react"; // For a view details button
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Mock order data type
interface UserOrder {
  id: string;
  orderNumber: string;
  date: Date;
  total: number;
  status: 'En cours de préparation' | 'Expédié' | 'Livré' | 'Annulé';
  // Add more details like items list, tracking number, etc.
}

// Mock order data (replace with actual data fetching)
const initialOrders: UserOrder[] = [
  { id: 'order1', orderNumber: '#SB1001', date: new Date(2024, 4, 20), total: 64.99, status: 'Livré' },
  { id: 'order2', orderNumber: '#SB1002', date: new Date(2024, 4, 25), total: 19.99, status: 'En cours de préparation' },
  { id: 'order3', orderNumber: '#SB1003', date: new Date(2024, 3, 10), total: 150.00, status: 'Livré' },
  { id: 'order4', orderNumber: '#SB1004', date: new Date(2024, 5, 1), total: 45.00, status: 'Expédié' },
  { id: 'order5', orderNumber: '#SB1005', date: new Date(2024, 2, 5), total: 14.99, status: 'Annulé' },
];


export default function UserOrdersPage() {
    const [orders, setOrders] = useState<UserOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Simulate fetching orders
        setTimeout(() => {
            setOrders(initialOrders);
            setIsLoading(false);
        }, 1000);
    }, []);

    const getStatusVariant = (status: UserOrder['status']): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'Livré': return 'default'; // Use primary color (often green in themes)
            case 'Expédié': return 'secondary';
            case 'En cours de préparation': return 'outline'; // Or secondary
            case 'Annulé': return 'destructive';
            default: return 'secondary';
        }
    };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Mes Commandes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Historique des Commandes</CardTitle>
          <CardDescription>Retrouvez ici toutes les commandes que vous avez passées.</CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    {[...Array(5)].map((_, i) => (
                         <div key={i} className="flex items-center space-x-4 p-4 border-b">
                             <div className="space-y-2 flex-grow">
                                 <Skeleton className="h-4 w-1/4" />
                                 <Skeleton className="h-4 w-1/5" />
                             </div>
                             <Skeleton className="h-6 w-24" />
                             <Skeleton className="h-8 w-20" />
                             <Skeleton className="h-8 w-8" />
                         </div>
                     ))}
                 </div>
            ) : orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Vous n'avez aucune commande pour le moment.</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Numéro</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.orderNumber}</TableCell>
                            <TableCell>{order.date.toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell className="text-right">{order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</TableCell>
                            <TableCell className="text-center">
                                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {/* Placeholder for view details action */}
                                <Button variant="ghost" size="icon" title="Voir les détails">
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Voir les détails</span>
                                </Button>
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