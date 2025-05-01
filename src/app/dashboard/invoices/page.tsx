
// src/app/dashboard/invoices/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Printer, Download, FileText, AlertTriangle, Share2 } from "lucide-react"; // Added Download
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order, OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import Link from 'next/link'; // Import Link
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation
import { generateInvoicePDF } from '@/lib/invoice-pdf'; // Import PDF generation utility

const ORDERS_STORAGE_KEY = 'sama_boutique_orders';

// Filter criteria for considering an order invoice-able (same as admin)
const INVOICEABLE_STATUSES: OrderStatus[] = ['Payé', 'Expédié', 'Livraison en cours', 'Livré'];

// Reuse status config from orders page
interface StatusConfig {
    labelKey: string;
}
const statusConfig: Record<OrderStatus, StatusConfig> = {
    'En attente de paiement': { labelKey: 'order_status_pending_payment' },
    'Payé': { labelKey: 'order_status_paid' },
    'En cours de préparation': { labelKey: 'order_status_processing' },
    'Expédié': { labelKey: 'order_status_shipped' },
    'Livraison en cours': { labelKey: 'order_status_delivering' },
    'Livré': { labelKey: 'order_status_delivered' },
    'Annulé': { labelKey: 'order_status_cancelled' },
    'Remboursé': { labelKey: 'order_status_refunded' },
};

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
            items: order.items || [], // Ensure items exist
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort newest first
};

// Function for viewing/downloading/sharing invoice (customer version)
const handleInvoiceAction = async (order: Order, action: 'view' | 'download' | 'share') => {
    const { t } = useTranslation(); // Get t function inside the handler

    if (action === 'view' || action === 'download') {
        try {
            // Generate the PDF blob
            const pdfBlob = await generateInvoicePDF(order, t);

            // Create a URL for the blob
            const pdfUrl = URL.createObjectURL(pdfBlob);

            if (action === 'view') {
                // Open the PDF in a new tab for viewing/printing
                window.open(pdfUrl, '_blank');
                setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
            } else if (action === 'download') {
                // Create a temporary link to trigger download
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `facture-${order.orderNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(pdfUrl);
            }
        } catch (error) {
            console.error("Error generating or handling PDF:", error);
            alert(t('invoice_generate_error'));
        }
    } else if (action === 'share') {
        // Basic share functionality
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${t('invoice_share_title')} ${order.orderNumber}`,
                    text: `${t('invoice_share_text')} ${order.orderNumber}. Total: ${order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}`,
                    // url: Optionally share a link to the order status page
                });
            } catch (error) {
                console.error('Share failed:', error);
            }
        } else {
            alert(t('invoice_share_not_supported'));
        }
    }
};


// --- Component ---
export default function UserInvoicesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [invoices, setInvoices] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const { t } = useTranslation(); // Use translation hook

    useEffect(() => {
        if (user && !authLoading) {
            setIsLoading(true);
            const loadInvoices = async () => {
                try {
                    const fetchedOrders = await fetchMyInvoiceableOrdersFromAPI(user.id);
                    setInvoices(fetchedOrders);
                } catch (error) {
                    console.error("Failed to fetch user invoices:", error);
                    toast({ title: t('general_error'), description: t('dashboard_my_invoices_toast_load_error'), variant: "destructive" });
                } finally {
                    setIsLoading(false);
                }
            };
            loadInvoices();
        } else if (!authLoading) {
            // If not logged in or auth is still loading, stop the page loading state
            setIsLoading(false);
        }
    }, [user, authLoading, toast, t]); // Added t dependency

    // Render loading or unauthorized state
    if (isLoading || authLoading) {
        return (
             <div className="space-y-8">
                 <h1 className="text-3xl font-bold text-primary flex items-center gap-2"><FileText /> {t('dashboard_my_invoices_page_title')}</h1>
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
                   <p className="font-semibold text-lg">{t('dashboard_unauthorized_title')}</p>
                   <p>{t('dashboard_my_invoices_unauthorized_description')}</p>
                   <Button variant="destructive" asChild className="mt-2">
                       <Link href="/account">{t('dashboard_unauthorized_login')}</Link>
                   </Button>
               </CardContent>
           </Card>
        );
    }


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2"><FileText /> {t('dashboard_my_invoices_page_title')}</h1>

            <Card className="shadow-md border-border">
                <CardHeader className="border-b border-border px-6 py-4">
                    <CardTitle>{t('dashboard_my_invoices_table_title')}</CardTitle>
                    <CardDescription>{t('dashboard_my_invoices_description')}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {invoices.length === 0 ? (
                        <p className="text-center text-muted-foreground py-12">{t('dashboard_my_invoices_no_invoices')}</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-6">{t('dashboard_my_invoices_table_invoice_no')}</TableHead>
                                    <TableHead className="hidden md:table-cell px-6">{t('dashboard_my_invoices_table_order_date')}</TableHead>
                                    <TableHead className="text-right px-6">{t('dashboard_my_invoices_table_total')}</TableHead>
                                     <TableHead className="text-center px-6">{t('dashboard_my_invoices_table_status')}</TableHead>
                                    <TableHead className="text-right px-6 w-[180px]">{t('dashboard_my_invoices_table_actions')}</TableHead> {/* Adjusted width */}
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
                                                 {t(statusConfig[invoice.status]?.labelKey || invoice.status)} {/* Translate status */}
                                             </Badge>
                                        </TableCell>
                                        <TableCell className="text-right px-6 py-3 space-x-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                title={t('dashboard_my_invoices_view_print')}
                                                onClick={() => handleInvoiceAction(invoice, 'view')}
                                                className="flex items-center gap-1"
                                            >
                                                <Printer className="h-4 w-4" />
                                                <span className="hidden sm:inline">{t('invoice_action_view')}</span>
                                            </Button>
                                             <Button
                                                 variant="outline"
                                                 size="sm"
                                                 title={t('invoice_download_button')}
                                                 onClick={() => handleInvoiceAction(invoice, 'download')}
                                                 className="flex items-center gap-1"
                                            >
                                                 <Download className="h-4 w-4" />
                                                 <span className="hidden sm:inline">{t('invoice_download_button')}</span>
                                            </Button>
                                            {/* Optional Share Button */}
                                            <Button variant="ghost" size="icon" title={t('invoice_action_share')} onClick={() => handleInvoiceAction(invoice, 'share')}>
                                                 <Share2 className="h-4 w-4 text-muted-foreground" />
                                             </Button>
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


    