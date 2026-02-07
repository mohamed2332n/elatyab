/**
 * Centralized type definitions for the application
 */

import type React from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

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

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  weight?: string;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
  deliveryTime: string;
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