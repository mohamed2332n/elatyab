"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";

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
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Mock product data for validation
const mockProducts: Record<string, { price: number; name: string }> = {
  "1": { name: "Fresh Apple", price: 129 },
  "2": { name: "Organic Banana", price: 69 },
  "3": { name: "Premium Mango", price: 199 },
  "4": { name: "Fresh Spinach", price: 39 },
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validate cart items
        const validItems = parsedCart.filter((item: CartItem) => 
          item.id && 
          item.name && 
          typeof item.price === 'number' && 
          item.price >= 0 &&
          typeof item.quantity === 'number' && 
          item.quantity > 0
        );
        setItems(validItems);
      }
    } catch (error) {
      console.error("Failed to initialize cart:", error);
      setItems([]);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const validateCartItem = (item: Omit<CartItem, "quantity">): boolean => {
    // In a real app, this would validate against server data
    // For now, we check against mock data
    const product = mockProducts[item.id];
    if (!product) {
      toast.error("Invalid product");
      return false;
    }
    
    // Validate price matches server data (mock)
    if (Math.abs(item.price - product.price) > 0.01) {
      toast.error("Product price has changed");
      return false;
    }
    
    return true;
  };

  const addItem = (item: Omit<CartItem, "quantity">) => {
    // Validate item before adding
    if (!validateCartItem(item)) {
      return;
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        // Limit quantity to prevent abuse
        if (existingItem.quantity >= 50) {
          toast.error("Maximum quantity reached for this item");
          return prevItems;
        }
        
        return prevItems.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const removeItem = (id: string) => {
    // Validate ID format
    if (!id || typeof id !== 'string') {
      toast.error("Invalid item ID");
      return;
    }
    
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    // Validate inputs
    if (!id || typeof id !== 'string') {
      toast.error("Invalid item ID");
      return;
    }
    
    if (typeof quantity !== 'number' || quantity < 0 || quantity > 50) {
      toast.error("Invalid quantity");
      return;
    }

    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
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
      isInitialized
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