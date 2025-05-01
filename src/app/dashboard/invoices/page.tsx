// src/app/dashboard/invoices/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Printer, Download, FileText, AlertTriangle, Share2 } from "lucide-react"; // Added Share2
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order, OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

const ORDERS_STORAGE_KEY = 'sama_boutique_orders';

// Filter criteria for considering an order invoice-able (same as admin)
const INVOICEABLE_STATUSES: OrderStatus[] = ['Payé', 'Expédié', 'Livraison en cours', 'Livré'];

// --- Mock API Functions (using localStorage) ---
const fetchMyInvoiceableOrdersFromAPI = async (userId: string): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
    if (typeof window === 'undefined') return [];
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    const allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];

    // Filter orders for the current user AND invoiceable statuses
    return allOrders
        .filter(order => order.userId === userId && INVOICEABLE_STATUSES.includes(order.status))
        .map(order => ({
            ...order,
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort newest first
};

// Placeholder for printing/viewing/sharing (enhanced alert)
const handleViewInvoice = (orderId: string) => {
    // In a real app, this would open a new tab/modal with the formatted invoice.
    // You could use window.open('/invoice-viewer?orderId=' + orderId)
    // The invoice viewer page would fetch order details and render them.
    alert(`Fonctionnalité d'affichage/impression pour la facture ${orderId} à implémenter.

Ici, on pourrait générer une version imprimable/PDF de la facture avec tous les détails :
- Infos boutique (Logo, Nom, Adresse)
- Infos client (Nom, Adresse)
- N° Facture, N° Commande, Date
- Détails produits (Nom, Qté, Prix Unitaire, Total Ligne)
- Total HT, TVA (si applicable), Total TTC
- Méthode de paiement
- Statut commande

Un bouton "Partager" (WhatsApp, Email) pourrait aussi être ajouté ici.`);
};

// --- Component ---
export default function UserInvoicesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [invoices, setInvoices] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (user && !authLoading) {
            setIsLoading(true);
            const loadInvoices = async () => {
                try {
                    const fetchedOrders = await fetchMyInvoiceableOrdersFromAPI(user.id);
                    setInvoices(fetchedOrders);
                } catch (error) {
                    console.error("Failed to fetch user invoices:", error);
                    toast({ title: "Erreur", description: "Impossible de charger vos factures.", variant: "destructive" });
                } finally {
                    setIsLoading(false);
                }
            };
            loadInvoices();
        } else if (!authLoading) {
            // If not logged in or auth is still loading, stop the page loading state
            setIsLoading(false);
        }
    }, [user, authLoading, toast]);

    // Render loading or unauthorized state
    if (isLoading || authLoading) {
        return (
             <div className="space-y-8">
                 <h1 className="text-3xl font-bold text-primary flex items-center gap-2"><FileText /> Mes Factures</h1>
                 <Card>
                     <CardHeader>
                         <Skeleton className="h-6 w-1/4" />
                         <Skeleton className="h-4 w-1/2 mt-1" />
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

    if (!user) {
        return (
            <Card className="border-destructive bg-destructive/10 shadow-md mt-8">
               <CardContent className="p-6 flex flex-col items-center gap-4 text-destructive text-center">
                   <AlertTriangle className="h-10 w-10" />
                   <p className="font-semibold text-lg">Accès non autorisé</p>
                   <p>Veuillez vous connecter pour consulter vos factures.</p>
                   <Button variant="destructive" asChild className="mt-2">
                       <a href="/account">Se connecter</a>
                   </Button>
               </CardContent>
           </Card>
        );
    }


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2"><FileText /> Mes Factures</h1>

            <Card className="shadow-md border-border">
                <CardHeader className="border-b border-border px-6 py-4">
                    <CardTitle>Historique des Factures</CardTitle>
                    <CardDescription>Retrouvez ici les factures de vos commandes complétées.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {invoices.length === 0 ? (
                        <p className="text-center text-muted-foreground py-12">Aucune facture disponible pour le moment.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-6">N° Facture (Commande)</TableHead>
                                    <TableHead className="hidden md:table-cell px-6">Date Commande</TableHead>
                                    <TableHead className="text-right px-6">Total</TableHead>
                                     <TableHead className="text-center px-6">Statut Commande</TableHead>
                                    <TableHead className="text-right px-6 w-[120px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium px-6 py-3">
                                            <span className="font-mono text-xs">{invoice.orderNumber}</span>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell px-6 py-3 text-xs text-muted-foreground">
                                            {invoice.createdAt.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                        </TableCell>
                                        <TableCell className="text-right px-6 py-3 font-medium">
                                            {invoice.total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </TableCell>
                                         <TableCell className="text-center px-6 py-3">
                                             {/* Show order status for context */}
                                             <Badge variant={
                                                 invoice.status === 'Livré' ? 'default' :
                                                 invoice.status === 'Annulé' || invoice.status === 'Remboursé' ? 'destructive' : 'secondary'
                                                }
                                                className={cn("text-xs",
                                                     invoice.status === 'Livré' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-300' :
                                                     invoice.status === 'Expédié' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-purple-300' :
                                                     invoice.status === 'Payé' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300' :
                                                     'border-border' // Default outline/secondary style
                                                    )}
                                             >
                                                 {invoice.status}
                                             </Badge>
                                        </TableCell>
                                        <TableCell className="text-right px-6 py-3 space-x-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                title="Voir / Imprimer"
                                                onClick={() => handleViewInvoice(invoice.orderNumber)}
                                                className="flex items-center gap-1"
                                            >
                                                <Printer className="h-4 w-4" />
                                                <span className="hidden sm:inline">Voir</span>
                                            </Button>
                                            {/* Optional Share Button Placeholder */}
                                            {/* <Button variant="ghost" size="icon" title="Partager (bientôt disponible)">
                                                <Share2 className="h-4 w-4 text-muted-foreground" />
                                            </Button> */}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                 {/* Optional: Pagination */}
            </Card>
        </div>
    );
}
