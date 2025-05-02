
// src/app/admin/invoices/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Printer, Share2 } from "lucide-react"; // Icons for actions - Removed Download
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order, OrderStatus } from '@/lib/types'; // Use Order type as base for invoice data
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation
import { generateInvoicePDF } from '@/lib/invoice-pdf'; // Import PDF generation utility

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
            // Ensure items are CartItem[] - potentially needed if structure differs
            items: order.items || [],
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort newest first
};



// --- Component ---
export default function AdminInvoicesPage() {
    const [invoices, setInvoices] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const { t } = useTranslation(); // Use translation hook here

    const handleInvoiceAction = useCallback(async (order: Order, action: 'view' | 'share') => {
        // `t` function is accessible here because it's part of the component's scope
        if (action === 'view') {
            try {
                // Generate the PDF blob using the `t` function from the hook
                const pdfBlob = await generateInvoicePDF(order, t);

                // Create a URL for the blob
                const pdfUrl = URL.createObjectURL(pdfBlob);

                // Open the PDF in a new tab for viewing/printing
                window.open(pdfUrl, '_blank');
                // Revoke the URL after a short delay to allow the new tab to load
                setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);

            } catch (error) {
                console.error("Error generating or handling PDF:", error);
                toast({ title: t('general_error'), description: t('invoice_generate_error'), variant: 'destructive'});
            }
        } else if (action === 'share') {
            // Basic share functionality (can be expanded)
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: `${t('invoice_share_title')} ${order.orderNumber}`,
                        text: `${t('invoice_share_text')} ${order.orderNumber}. Total: ${order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}`,
                        // url: window.location.href // Or a link to the order tracking page
                    });
                } catch (error) {
                    console.error('Share failed:', error);
                    toast({ title: t('general_error'), description: t('invoice_share_not_supported'), variant: 'destructive'});
                }
            } else {
                toast({ title: t('general_error'), description: t('invoice_share_not_supported'), variant: 'destructive'});
            }
        }
    }, [t, toast]); // Ensure t and toast are dependencies


    useEffect(() => {
        const loadInvoices = async () => {
            setIsLoading(true);
            try {
                const fetchedOrders = await fetchInvoiceableOrdersFromAPI();
                setInvoices(fetchedOrders);
            } catch (error) {
                console.error("Failed to fetch invoices:", error);
                toast({ title: t('general_error'), description: t('admin_invoices_toast_load_error_description'), variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        loadInvoices();
    }, [toast, t]); // Added t dependency

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary">{t('admin_invoices_page_title')}</h1>

            <Card className="shadow-md border-border">
                <CardHeader className="border-b border-border px-6 py-4">
                    <CardTitle>{t('admin_invoices_table_title')}</CardTitle>
                    <CardDescription>{t('admin_invoices_description')}</CardDescription>
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
                                    <Skeleton className="h-8 w-24 ml-auto" /> {/* Adjusted size for one button */}
                                </div>
                            ))}
                        </div>
                    ) : invoices.length === 0 ? (
                        <p className="text-center text-muted-foreground py-12">{t('admin_invoices_no_invoices')}</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-6">{t('admin_invoices_table_invoice_no')}</TableHead>
                                    <TableHead className="px-6">{t('admin_invoices_table_customer')}</TableHead>
                                    <TableHead className="hidden md:table-cell px-6">{t('admin_invoices_table_order_date')}</TableHead>
                                    <TableHead className="text-right px-6">{t('admin_invoices_table_total')}</TableHead>
                                    <TableHead className="text-right px-6 w-[120px]">{t('admin_invoices_table_actions')}</TableHead>
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
                                            {/* View/Print Button */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                title={t('admin_invoices_view_print_button')}
                                                onClick={() => handleInvoiceAction(invoice, 'view')}
                                                className="flex items-center gap-1"
                                            >
                                                <Printer className="h-4 w-4" />
                                                <span className="hidden sm:inline">{t('invoice_action_view')}</span>
                                            </Button>
                                            {/* Download Button Removed */}
                                            {/* Optional Share Button Placeholder */}
                                            {/* <Button variant="ghost" size="icon" title={t('invoice_share_button_soon')} onClick={() => handleInvoiceAction(invoice.orderNumber, 'share')}>
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
```