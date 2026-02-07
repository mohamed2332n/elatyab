/**
 * Centralized type definitions for the application
 */

import type React from 'react';

// Generic API Response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User/Auth types
export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (user: User, password: string) => Promise<void>;
}

// Product types
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

export interface ProductFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "price" | "rating" | "popularity" | "newest";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Cart types
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  weight?: string;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  loading: boolean;
}

export interface CartSummary {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  itemCount: number;
}

// Order types
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
  itemDetails?: OrderItem[];
}

export interface CreateOrderRequest {
  items: OrderItem[];
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
}

// Wallet types
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

export interface WalletContextType {
  balance: number;
  transactions: WalletTransaction[];
  addBalance: (amount: number) => Promise<void>;
  deductBalance: (amount: number) => Promise<void>;
  loading: boolean;
}

// Category types
export interface Category {
  id: number;
  name: string;
  icon: string;
  itemCount: number;
}

// Search and Filter types
export interface SearchFilters {
  query: string;
  category?: string;
  priceRange?: [number, number];
  inStock?: boolean;
  sortBy?: string;
}

// Review types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment: string;
}

// Wishlist types
export interface Wishlist {
  id: string;
  userId: string;
  productIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// Toast types
export interface ToastNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

// Component Props types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends ComponentProps {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
}

// Error types
export interface AppError extends Error {
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

// Loading/State types
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}
