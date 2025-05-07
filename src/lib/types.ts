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
  items: CartItem[]; // CartItem already includes optional imageUrl
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod; // Use the specific type here
  notes?: string;
  createdAt: Date;
  updatedAt: Date; // To track status changes
}

// Interface for Admin Products (might be identical to Product in boutique)
export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // Now references Category.id or name
  imageUrl?: string; // Optional image URL
  tags?: string[]; // Array of Tag IDs or names
  isOnSale?: boolean; // Flag to indicate if the product is on promotion
  discountType?: 'percentage' | 'fixed_amount'; // Type of discount
  discountValue?: number; // Value of the discount
}

// Interface for Categories
export interface Category {
    id: string;
    name: string;
    description?: string;
    // parentId?: string; // Optional: for nested categories
    createdAt: Date;
}

// Interface for Tags
export interface Tag {
    id: string;
    name: string;
    createdAt: Date;
}
