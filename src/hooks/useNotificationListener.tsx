// src/hooks/useNotificationListener.tsx
'use client';

import React, { useEffect } from 'react'; // Import React
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/types';
import type { UserRole } from '@/context/AuthContext';
import { BellRing } from 'lucide-react';

/**
 * Listens for 'new-order' custom events and shows a toast notification
 * if the current user's role is included in the `notifyRoles` array.
 * @param notifyRoles Array of roles that should receive the notification.
 */
export const useNotificationListener = (notifyRoles: UserRole[]) => {
    const { toast } = useToast();
    // In a real app, you'd get the current user's role from your auth context
    // const { user } = useAuth();
    // const currentUserRole = user?.role;

    useEffect(() => {
        const handleNewOrder = (event: Event) => {
            const order = (event as CustomEvent<Order>).detail;
            console.log('New order event received:', order);

            // Simulate getting current user role (replace with actual context logic)
             const authData = typeof window !== 'undefined' ? localStorage.getItem('sama_boutique_auth') : null;
             const currentUserRole = authData ? (JSON.parse(authData).role as UserRole) : 'guest';
             console.log('Current user role for notification check:', currentUserRole);


            if (currentUserRole && notifyRoles.includes(currentUserRole)) {
                console.log(`Role ${currentUserRole} should be notified. Showing toast.`);
                toast({
                    title: ( // Wrap JSX in parentheses for clarity (optional but good practice)
                        <div className="flex items-center gap-2">
                            <BellRing className="h-5 w-5 text-primary" />
                            Nouvelle Commande Reçue!
                        </div>
                    ),
                    description: `Commande #${order.orderNumber.substring(0, 8)} de ${order.customerInfo.name}. Total: ${order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`,
                    variant: 'default', // Or a custom variant
                    duration: 10000, // Keep toast longer
                    // Optional action to view the order
                    // action: (
                    //   <ToastAction altText="Voir">Voir</ToastAction>
                    // ),
                });
            } else {
                 console.log(`Role ${currentUserRole} is not in notifyRoles [${notifyRoles.join(', ')}]. No toast shown.`);
            }
        };

        // Ensure this runs only on the client
        if (typeof window !== 'undefined') {
             console.log(`Notification listener attached for roles: ${notifyRoles.join(', ')}`);
            window.addEventListener('new-order', handleNewOrder);

            // Cleanup listener on component unmount
            return () => {
                 console.log('Notification listener detached.');
                window.removeEventListener('new-order', handleNewOrder);
            };
        }
    }, [toast, notifyRoles]); // Re-run effect if toast function or notifyRoles change
};
