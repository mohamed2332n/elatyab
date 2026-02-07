"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiService } from "@/services/api";
import { showError } from "@/utils/toast";
import { useAuth } from "@/context/auth-context";

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
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Initialize cart from server when authenticated
  useEffect(() => {
    const initializeCart = async () => {
      if (isAuthenticated) {
        try {
          const serverItems = await apiService.getCartItems();
          setItems(serverItems);
        } catch (error) {
          console.error("Error initializing cart:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // For unauthenticated users, we clear items or use local storage
        setItems([]);
        setLoading(false);
      }
    };
    initializeCart();
  }, [isAuthenticated]);

  const addItem = async (item: Omit<CartItem, "quantity">) => {
    try {
      // Validate with server
      const result = await apiService.addToCart(item);
      if (result.success) {
        setItems(prevItems => {
          const existingItem = prevItems.find(i => i.id === item.id);
          if (existingItem) {
            return prevItems.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            );
          } else {
            return [...prevItems, { ...item, quantity: 1 }];
          }
        });
      } else {
        showError("Failed to add item to cart");
      }
    } catch (error) {
      showError("Failed to add item to cart");
      console.error("Error adding to cart:", error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      // Validate with server
      const result = await apiService.removeFromCart(id);
      if (result.success) {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
      } else {
        showError("Failed to remove item from cart");
      }
    } catch (error) {
      showError("Failed to remove item from cart");
      console.error("Error removing from cart:", error);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    try {
      // Validate with server
      const result = await apiService.updateCartItem(id, quantity);
      if (result.success) {
        setItems(prevItems =>
          prevItems.map(item => (item.id === id ? { ...item, quantity } : item))
        );
      } else {
        showError("Failed to update item quantity");
      }
    } catch (error) {
      showError("Failed to update item quantity");
      console.error("Error updating quantity:", error);
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        loading
      }}
    >
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