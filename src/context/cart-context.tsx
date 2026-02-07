"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { showError } from "@/utils/toast";
import { cartService } from "@/services/supabase/cart";
import { useAuth } from "./auth-context";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  weight?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart from Supabase when user logs in
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setItems([]);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await cartService.getCart(user.id);
      
      if (!error && data) {
        // Transform cart items to CartItem format
        const transformedItems: CartItem[] = data.map((item: any) => ({
          id: item.product_id,
          name: item.product?.name_en || '',
          price: item.product?.price || 0,
          quantity: item.quantity,
          image: item.product?.images?.[0],
          weight: item.product?.weight,
        }));
        setItems(transformedItems);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: Omit<CartItem, "quantity">) => {
    if (!user) {
      showError("Please login to add items to cart");
      return;
    }

    try {
      const { data, error } = await cartService.addToCart(user.id, item.id);
      
      if (error) throw error;

      // Reload cart to sync with database
      await loadCart();
    } catch (error) {
      showError("Failed to add item to cart");
      console.error("Error adding to cart:", error);
    }
  };

  const removeItem = async (id: string) => {
    if (!user) return;

    try {
      // Find the cart item ID
      const cartItem = items.find(i => i.id === id);
      if (!cartItem) return;

      // Get the cart item's database ID
      const { data: cartItems, error: fetchError } = await cartService.getCart(user.id);
      if (fetchError || !cartItems) throw fetchError;

      const dbId = cartItems.find((ci: any) => ci.product_id === id)?.id;
      if (!dbId) return;

      const { error } = await cartService.removeFromCart(dbId);
      if (error) throw error;

      // Update local state
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      showError("Failed to remove item from cart");
      console.error("Error removing from cart:", error);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    try {
      // Get the cart item's database ID
      const { data: cartItems, error: fetchError } = await cartService.getCart(user.id);
      if (fetchError || !cartItems) throw fetchError;

      const dbId = cartItems.find((ci: any) => ci.product_id === id)?.id;
      if (!dbId) return;

      const { error } = await cartService.updateQuantity(dbId, quantity);
      if (error) throw error;

      // Reload cart to sync
      await loadCart();
    } catch (error) {
      showError("Failed to update item quantity");
      console.error("Error updating quantity:", error);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await cartService.clearCart(user.id);
      if (error) throw error;

      setItems([]);
    } catch (error) {
      showError("Failed to clear cart");
      console.error("Error clearing cart:", error);
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart, 
      getTotalItems, 
      getTotalPrice,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}