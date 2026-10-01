import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { CartItem } from '../types';
import { getCart, addToCart, removeFromCart, updateCartItem } from '../api/cart';
import { useAuth } from './AuthContext';

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (bookId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );

  const refreshCart = useCallback(async () => {
    try {
      const cart = await getCart();
      setItems(cart.items);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, refreshCart]);

  async function addItem(bookId: string, quantity: number) {
    const cart = await addToCart(bookId, quantity);
    setItems(cart.items ?? []);
  }

  async function removeItem(itemId: string) {
    // DELETE returns { message } not a Cart — refresh the full cart instead
    await removeFromCart(itemId);
    await refreshCart();
  }

  async function updateItem(itemId: string, quantity: number) {
    // PATCH returns a single item not a Cart — refresh the full cart instead
    await updateCartItem(itemId, quantity);
    await refreshCart();
  }

  function clearCart() {
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        addItem,
        removeItem,
        updateItem,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
