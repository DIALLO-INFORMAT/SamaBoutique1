// src/components/OrderDetailsDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Order } from '@/lib/types';
import { useTranslation } from '@/hooks/useTranslation';
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Clock, Truck, PackageCheck, PackageX, RefreshCw, CircleDollarSign } from 'lucide-react'; // Status icons
import React, { createElement } from "react"; // Import createElement

interface OrderDetailsDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

// Reuse status config from orders page
interface StatusConfig {
    labelKey: string;
    icon: React.ElementType;
    variant: "default" | "secondary" | "destructive" | "outline";
    colorClass: string;
}

const statusConfig: Record<Order['status'], StatusConfig> = {
    'En attente de paiement': { labelKey: 'order_status_pending_payment', icon: Clock, variant: 'outline', colorClass: 'text-yellow-600 dark:text-yellow-400' },
    'Payé': { labelKey: 'order_status_paid', icon: CircleDollarSign, variant: 'default', colorClass: 'text-green-600 dark:text-green-400' },
    'En cours de préparation': { labelKey: 'order_status_processing', icon: RefreshCw, variant: 'secondary', colorClass: 'text-blue-600 dark:text-blue-400' },
    'Expédié': { labelKey: 'order_status_shipped', icon: Truck, variant: 'secondary', colorClass: 'text-purple-600 dark:text-purple-400' },
    'Livraison en cours': { labelKey: 'order_status_delivering', icon: Truck, variant: 'secondary', colorClass: 'text-cyan-600 dark:text-cyan-400' },
    'Livré': { labelKey: 'order_status_delivered', icon: PackageCheck, variant: 'default', colorClass: 'text-green-700 dark:text-green-500' },
    'Annulé': { labelKey: 'order_status_cancelled', icon: PackageX, variant: 'destructive', colorClass: 'text-red-600 dark:text-red-400' },
    'Remboursé': { labelKey: 'order_status_refunded', icon: RefreshCw, variant: 'destructive', colorClass: 'text-gray-500' },
};

export function OrderDetailsDialog({ order, isOpen, onClose }: OrderDetailsDialogProps) {
  const { t, currentLocale } = useTranslation();

  if (!order) {
    return null;
  }

   const getStatusBadge = (status: Order['status']) => {
        const config = statusConfig[status] || { labelKey: status, icon: HelpCircle, variant: 'outline', colorClass: 'text-muted-foreground' };
        const IconComponent = config.icon && typeof config.icon !== 'string' ? config.icon : HelpCircle;
        return (
            <Badge variant={config.variant} className={cn("flex items-center gap-1 whitespace-nowrap text-sm px-3 py-1", config.colorClass, `border-${config.colorClass.replace('text-', '')}`)}>
                 {createElement(IconComponent, { className: "h-4 w-4" })}
                {t(config.labelKey)}
            </Badge>
        );
    };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('track_order_details_title')}</DialogTitle>
          <DialogDescription>
              {t('track_order_number_label')} <span className="font-medium text-primary">{order.orderNumber}</span> - {t('track_order_placed_on', { date: order.createdAt.toLocaleDateString(currentLocale) })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
           {/* Status */}
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border rounded-lg p-4 bg-muted/50">
               <div>
                   <p className="text-sm font-medium text-muted-foreground mb-1">{t('track_order_current_status_label')}</p>
                   {getStatusBadge(order.status)}
               </div>
                <p className="text-xs text-muted-foreground mt-2 sm:mt-0">
                    {t('track_order_last_updated', { datetime: order.updatedAt.toLocaleString(currentLocale, { dateStyle: 'short', timeStyle: 'short' }) })}
                </p>
           </div>

           {/* Status Description */}
           <div className="text-sm">
              <p className="font-medium mb-1">{t('track_order_status_description_label')}</p>
              <p className="text-muted-foreground">{t(statusConfig[order.status]?.descriptionKey || '') || "Le statut de votre commande est en cours de mise à jour."}</p>
           </div>

          <Separator />

          {/* Customer Info */}
          <div>
             <h3 className="font-semibold mb-2">{t('checkout_customer_info_title')}</h3>
             <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                 <span>{t('checkout_form_name')}:</span><span className="font-medium text-foreground">{order.customerInfo.name}</span>
                 <span>{t('checkout_form_phone')}:</span><span className="font-medium text-foreground">{order.customerInfo.phone}</span>
                  {order.customerInfo.email && <><span>{t('checkout_form_email')}:</span><span className="font-medium text-foreground">{order.customerInfo.email}</span></>}
                 <span>{t('checkout_form_address')}:</span><span className="font-medium text-foreground">{order.customerInfo.address}</span>
                  {order.notes && <><span>{t('checkout_form_notes')}:</span><span className="font-medium text-foreground">{order.notes}</span></>}
             </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-3">{t('track_order_items_summary_label')}</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <Image
                    src={`https://picsum.photos/seed/${item.id}/50/50`}
                    alt={item.name}
                    width={50}
                    height={50}
                    className="rounded border object-cover flex-shrink-0"
                    data-ai-hint={item.category === 'Services' ? 'service tech icon' : item.name.toLowerCase().split(' ')[0]}
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-muted-foreground text-xs">
                       {t('cart_table_quantity')}: {item.quantity} x {item.price.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <p className="font-medium text-foreground flex-shrink-0">
                    {(item.price * item.quantity).toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

           {/* Total and Payment Method */}
           <div className="flex flex-col items-end text-sm">
                <div className="w-full sm:w-1/2 space-y-1">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('checkout_order_summary_total')}:</span>
                        <span className="font-semibold text-lg text-foreground">
                            {order.total.toLocaleString(currentLocale, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('checkout_payment_method_title')}:</span>
                        <span className="text-foreground">
                            {t(`checkout_payment_${order.paymentMethod.toLowerCase().replace(/ /g, '_').replace('à_la_', 'a_la_')}` as any) || order.paymentMethod}
                        </span>
                    </div>
                </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
