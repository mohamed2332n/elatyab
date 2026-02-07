/**
 * Wishlist Context with LocalStorage Persistence
 * Manages user's favorite/wishlist items across sessions
 */

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { AUTH } from "@/lib/constants";
import { safeJsonParse, safeJsonStringify } from "@/utils/error-handler";

interface WishlistContextType {
  wishlistItems: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);

  // Initialize wishlist from localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem(AUTH.WISHLIST_STORAGE_KEY);
    if (savedWishlist) {
      const parsed = safeJsonParse<string[]>(savedWishlist, []);
      if (Array.isArray(parsed)) {
        setWishlistItems(parsed);
      }
    }
  }, []);

  // Persist to localStorage whenever wishlist changes
  useEffect(() => {
    const serialized = safeJsonStringify(wishlistItems, '[]');
    localStorage.setItem(AUTH.WISHLIST_STORAGE_KEY, serialized);
  }, [wishlistItems]);

  const addToWishlist = (productId: string) => {
    if (!productId || typeof productId !== 'string') return;
    
    setWishlistItems(prev => {
      if (!prev.includes(productId)) {
        return [...prev, productId];
      }
      return prev;
    });
  };

  const removeFromWishlist = (productId: string) => {
    if (!productId || typeof productId !== 'string') return;
    
    setWishlistItems(prev => prev.filter(id => id !== productId));
  };

  const toggleWishlist = (productId: string) => {
    if (!productId || typeof productId !== 'string') return;
    
    setWishlistItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.includes(productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem(AUTH.WISHLIST_STORAGE_KEY);
  };

  const getWishlistCount = (): number => {
    return wishlistItems.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        getWishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
