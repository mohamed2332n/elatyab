"use client";

import { Product, User, WalletData, Order, OrderItem } from "@/lib/types";
import { addCSRFProtection } from "@/utils/csrf";

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Fresh Organic Apples",
    description: "Crisp and juicy organic apples sourced directly from local farms.",
    weight: "1 kg",
    originalPrice: 199,
    discountedPrice: 129,
    discountPercent: 35,
    isInStock: true,
    images: ["/placeholder.svg"],
    tags: ["Organic", "Local"],
    rating: 4.5,
    reviewsCount: 128,
    origin: "India",
    harvestDate: "2023-05-15",
    freshness: "Very Fresh"
  }
];

const mockUserData: User = {
  id: "1",
  name: "John Doe",
  email: "demo@example.com",
  phone: "+91 9876543210",
  address: "123 Main St, New Delhi",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo"
};

const mockWalletData: WalletData = {
  balance: 1500,
  transactions: []
};

let sessionActive = false;

const secureRequest = async <T>(callback: () => T, options: RequestInit = {}): Promise<T> => {
  const protectedOptions = addCSRFProtection(options);
  if (!protectedOptions.headers || !protectedOptions.headers['X-Requested-With']) {
    throw new Error("Security Error");
  }
  await new Promise(r => setTimeout(r, 300));
  return callback();
};

export const apiService = {
  login: async (e: string, p: string) => secureRequest(() => {
    if (e === "demo@example.com" && p === "demo123") { sessionActive = true; return true; }
    return false;
  }),
  logout: async () => { sessionActive = false; },
  getMe: async () => secureRequest(() => sessionActive ? mockUserData : null),
  getProduct: async (id: string) => secureRequest(() => mockProducts.find(p => p.id === id) || null),
  getProducts: async () => secureRequest(() => [...mockProducts]),
  getWalletData: async () => secureRequest(() => mockWalletData),
  rechargeWallet: async (amt: number) => secureRequest(() => {
    mockWalletData.balance += amt;
    return { success: true, newBalance: mockWalletData.balance };
  }),
  getOrders: async () => secureRequest(() => []),
  placeOrder: async (items: OrderItem[], total: number) => secureRequest(() => ({ success: true, orderId: "ORD-123" })),
  addToCart: async (item: any) => ({ success: true }),
  getCartItems: async () => [],
  updateCartItem: async (id: string, q: number) => ({ success: true }),
  removeFromCart: async (id: string) => ({ success: true })
};