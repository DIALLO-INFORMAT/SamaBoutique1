// src/context/CartContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { Product as AppProduct } from '@/lib/types'; // Use the AdminProduct as base Product type

// CartItem now includes originalPrice if a discount is applied
export interface CartItem extends AppProduct {
  quantity: number;
  originalPrice?: number; // Store the original price if different from the sale price
  // The 'price' field from AppProduct will now store the potentially discounted unit price in the cart
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: AppProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

const CART_STORAGE_KEY = 'sama_boutique_cart';

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        try {
          setCart(JSON.parse(storedCart));
        } catch (error) {
          console.error("Failed to parse cart from localStorage:", error);
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (product: AppProduct, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);

      let finalUnitPrice = product.price;
      let originalUnitPrice = product.price;
      let itemIsOnSale = false;

      if (product.isOnSale && product.discountType && product.discountValue && product.discountValue > 0) {
        itemIsOnSale = true;
        if (product.discountType === 'percentage') {
          finalUnitPrice = product.price * (1 - product.discountValue / 100);
        } else if (product.discountType === 'fixed_amount') {
          finalUnitPrice = Math.max(0, product.price - product.discountValue);
        }
      }
      finalUnitPrice = parseFloat(finalUnitPrice.toFixed(2)); // Ensure two decimal places for price


      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity, price: finalUnitPrice, originalPrice: itemIsOnSale ? originalUnitPrice : undefined } // Update price if it changed
            : item
        );
      } else {
        // Create a new cart item, ensuring all fields from AppProduct are spread
        const newCartItem: CartItem = {
          ...product, // Spread all properties of product
          price: finalUnitPrice, // This is the price per unit after discount
          originalPrice: itemIsOnSale ? originalUnitPrice : undefined,
          quantity,
        };
        return [...prevCart, newCartItem];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      ).filter(item => item.quantity > 0) // Remove item if quantity becomes 0
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    // The price in each cart item is already the final (potentially discounted) unit price
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getItemCount, getTotalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
