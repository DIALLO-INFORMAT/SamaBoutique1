// src/lib/types.ts
import type { CartItem } from '@/context/CartContext';

export type OrderStatus =
    | 'En attente de paiement'
    | 'Payé'
    | 'En cours de préparation'
    | 'Expédié'
    | 'Livraison en cours'
    | 'Livré'
    | 'Annulé'
    | 'Remboursé';

// Define specific payment method types
export type PaymentMethod =
    | 'Paiement à la livraison'
    | 'Wave'
    | 'Orange Money'
    | 'Carte Bancaire';

export interface Order {
  id: string;
  orderNumber: string; // Unique identifier for the order, suitable for tracking
  userId: string; // Link to user who placed the order ('guest' if not logged in)
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod; // Use the specific type here
  notes?: string;
  createdAt: Date;
  updatedAt: Date; // To track status changes
}
