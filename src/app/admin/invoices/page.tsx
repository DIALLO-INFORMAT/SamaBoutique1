// src/app/admin/invoices/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Printer, Download, Share2 } from "lucide-react"; // Icons for actions - Added Share2
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order, OrderStatus } from '@/lib/types'; // Use Order type as base for invoice data
import { cn } from '@/lib/utils';

const ORDERS_STORAGE_KEY = 'sama_boutique_orders';

// Filter criteria for considering an order invoice-able (e.g., paid or shipped)
const INVOICEABLE_STATUSES: OrderStatus[] = ['Payé', 'Expédié', 'Livraison en cours', 'Livré'];

// --- Mock API Functions (using localStorage) ---
const fetchInvoiceableOrdersFromAPI = async (): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
    if (typeof window === 'undefined') return [];
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];

    // Filter orders that are potentially invoiceable and sort
    return orders
        .filter(order => INVOICEABLE_STATUSES.includes(order.status))
        .map(order => ({
            ...order,
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort newest first
};

// Placeholder function for viewing/printing/sharing invoice (same logic as customer page)
const handleViewInvoice = (orderId: string) => {
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
export default function AdminInvoicesPage() {
    const [invoices, setInvoices] = useState<Order[]>([]); // Using Order type for now
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const loadInvoices = async () => {
            setIsLoading(true);
            try {
                const fetchedOrders = await fetchInvoiceableOrdersFromAPI();
                setInvoices(fetchedOrders);
            } catch (error) {
                console.error("Failed to fetch invoices:", error);
                toast({ title: "Erreur", description: "Impossible de charger les factures.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        loadInvoices();
    }, [toast]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary">Gestion des Factures</h1>

            <Card className="shadow-md border-border">
                <CardHeader className="border-b border-border px-6 py-4">
                    <CardTitle>Factures Générées</CardTitle>
                    <CardDescription>Liste des factures basées sur les commandes complétées ou payées.</CardDescription>
                    {/* Optional: Add filters/search here */}
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="space-y-2 p-6">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                                    <Skeleton className="h-4 w-1/6" />
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-1/6 hidden md:block" />
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-8 w-8 ml-auto" />
                                </div>
                            ))}
                        </div>
                    ) : invoices.length === 0 ? (
                        <p className="text-center text-muted-foreground py-12">Aucune facture à afficher.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-6">N° Facture (Commande)</TableHead>
                                    <TableHead className="px-6">Client</TableHead>
                                    <TableHead className="hidden md:table-cell px-6">Date Commande</TableHead>
                                    <TableHead className="text-right px-6">Total</TableHead>
                                    <TableHead className="text-right px-6 w-[120px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium px-6 py-3">
                                            <span className="font-mono text-xs">{invoice.orderNumber}</span>
                                        </TableCell>
                                        <TableCell className="px-6 py-3">
                                            <div>{invoice.customerInfo.name}</div>
                                            <div className="text-xs text-muted-foreground">{invoice.customerInfo.email || invoice.customerInfo.phone}</div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell px-6 py-3 text-xs text-muted-foreground">
                                            {invoice.createdAt.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                        </TableCell>
                                        <TableCell className="text-right px-6 py-3 font-medium">
                                            {invoice.total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </TableCell>
                                        <TableCell className="text-right px-6 py-3 space-x-1">
                                            {/* Use the unified handler */}
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
