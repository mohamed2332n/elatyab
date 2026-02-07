"use client";

import { addCSRFProtection } from "@/utils/csrf";

export interface Product {
  id: string;
  name: string;
  description: string;
  weight: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  isInStock: boolean;
  images: string[];
  tags: string[];
  rating: number;
  reviewsCount: number;
  origin: string;
  harvestDate: string;
  freshness: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  weight?: string;
}

export interface WalletTransaction {
  id: number;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
}

export interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
  deliveryTime: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Fresh Organic Apples",
    description: "Crisp and juicy organic apples sourced directly from local farms. Perfect for snacking or adding to your favorite recipes.",
    weight: "1 kg",
    originalPrice: 199,
    discountedPrice: 129,
    discountPercent: 35,
    isInStock: true,
    images: ["/placeholder.svg"],
    tags: ["Organic", "Local", "Fresh"],
    rating: 4.5,
    reviewsCount: 128,
    origin: "Himalayan Farms, India",
    harvestDate: "2023-05-15",
    freshness: "Very Fresh"
  },
  {
    id: "2",
    name: "Organic Banana",
    description: "Fresh organic bananas rich in potassium and vitamins. Grown naturally without pesticides.",
    weight: "1 dozen",
    originalPrice: 89,
    discountedPrice: 69,
    discountPercent: 22,
    isInStock: true,
    images: ["/placeholder.svg"],
    tags: ["Organic", "Fresh"],
    rating: 4.3,
    reviewsCount: 95,
    origin: "Kerala Farms, India",
    harvestDate: "2023-05-18",
    freshness: "Very Fresh"
  },
  {
    id: "3",
    name: "Premium Mango",
    description: "Juicy and sweet premium mangoes from the orchards of Maharashtra. Perfect for summer refreshment.",
    weight: "1 kg",
    originalPrice: 299,
    discountedPrice: 199,
    discountPercent: 33,
    isInStock: true,
    images: ["/placeholder.svg"],
    tags: ["Organic", "Seasonal"],
    rating: 4.7,
    reviewsCount: 210,
    origin: "Maharashtra Farms, India",
    harvestDate: "2023-05-20",
    freshness: "Very Fresh"
  },
  {
    id: "4",
    name: "Fresh Spinach",
    description: "Tender and fresh spinach leaves, rich in iron and vitamins. Perfect for salads and cooking.",
    weight: "250g",
    originalPrice: 49,
    discountedPrice: 39,
    discountPercent: 20,
    isInStock: true,
    images: ["/placeholder.svg"],
    tags: ["Organic", "Leafy"],
    rating: 4.2,
    reviewsCount: 78,
    origin: "Punjab Farms, India",
    harvestDate: "2023-05-21",
    freshness: "Very Fresh"
  }
];

const mockUserData: User = {
  id: "1",
  name: "John Doe",
  email: "user@example.com",
  phone: "+91 9876543210",
  address: "123 Main Street, Apartment 4B, New Delhi, 110001"
};

const mockWalletData: WalletData = {
  balance: 1500,
  transactions: [
    { id: 1, type: "credit", amount: 2000, description: "Wallet recharge", date: "2023-05-15" },
    { id: 2, type: "debit", amount: 450, description: "Order payment", date: "2023-05-10" }
  ]
};

const mockOrders: Order[] = [
  { id: "ORD-001", date: "2023-05-15", status: "Delivered", total: 450, items: 5, deliveryTime: "06:30 PM" }
];

let inMemorySessionActive = false;

const secureRequest = async <T>(callback: () => T, options: RequestInit = {}): Promise<T> => {
  const protectedOptions = addCSRFProtection(options);
  if (!protectedOptions.headers || !protectedOptions.headers['X-Requested-With']) {
    throw new Error("CSRF Protection Error");
  }
  await new Promise(resolve => setTimeout(resolve, 300));
  return callback();
};

export const apiService = {
  login: async (email: string, password: string): Promise<boolean> => {
    return secureRequest(() => {
      if (email === "demo@example.com" && password === "demo123") {
        inMemorySessionActive = true;
        return true;
      }
      return false;
    }, { method: 'POST' });
  },

  logout: async (): Promise<void> => {
    return secureRequest(() => {
      inMemorySessionActive = false;
    }, { method: 'POST' });
  },

  getMe: async (): Promise<User | null> => {
    return secureRequest(() => {
      if (!inMemorySessionActive) return null;
      return { ...mockUserData };
    });
  },

  getProduct: async (id: string): Promise<Product | null> => {
    return secureRequest(() => mockProducts.find(p => p.id === id) || null);
  },
  
  getProducts: async (): Promise<Product[]> => {
    return secureRequest(() => [...mockProducts]);
  },
  
  getWalletData: async (): Promise<WalletData> => {
    return secureRequest(() => ({ ...mockWalletData }));
  },
  
  rechargeWallet: async (amount: number): Promise<{ success: boolean; newBalance: number }> => {
    return secureRequest(() => {
      mockWalletData.balance += amount;
      mockWalletData.transactions.unshift({
        id: Date.now(),
        type: "credit",
        amount,
        description: "Wallet recharge",
        date: new Date().toISOString().split('T')[0]
      });
      return { success: true, newBalance: mockWalletData.balance };
    }, { method: 'POST' });
  },
  
  getOrders: async (): Promise<Order[]> => {
    return secureRequest(() => [...mockOrders]);
  },
  
  placeOrder: async (items: OrderItem[], total: number): Promise<{ success: boolean; orderId: string }> => {
    return secureRequest(() => {
      const orderId = `ORD-${Math.floor(Math.random() * 1000)}`;
      const newOrder: Order = {
        id: orderId,
        date: new Date().toISOString().split('T')[0],
        status: "Confirmed",
        total,
        items: items.length,
        deliveryTime: "06:00 PM"
      };
      mockOrders.unshift(newOrder);
      return { success: true, orderId };
    }, { method: 'POST' });
  },

  addToCart: async (item: any) => ({ success: true }),
  removeFromCart: async (id: string) => ({ success: true }),
  updateCartItem: async (id: string, qty: number) => ({ success: true }),
  getCartItems: async () => []
};