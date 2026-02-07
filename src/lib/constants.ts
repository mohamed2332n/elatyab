/**
 * Application-wide constants
 * Centralized constants to avoid magic numbers and strings throughout the app
 */

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
} as const;

// Cart
export const CART = {
  FREE_DELIVERY_THRESHOLD: 500,
  STANDARD_DELIVERY_FEE: 30,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 99,
} as const;

// Authentication
export const AUTH = {
  STORAGE_KEY: "authenticated",
  USER_STORAGE_KEY: "user",
  WISHLIST_STORAGE_KEY: "wishlist",
} as const;

// API
export const API = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Rate Limiting
export const RATE_LIMIT = {
  SEARCH_LIMIT: 10, // requests per minute
  API_CALL_LIMIT: 30, // requests per minute
} as const;

// Product
export const PRODUCT = {
  IMAGES_PER_PRODUCT: 5,
  MIN_RATING: 0,
  MAX_RATING: 5,
  DEFAULT_IMAGE: "/placeholder.svg",
} as const;

// UI
export const UI = {
  TOAST_DURATION: 3000,
  LOADING_DELAY: 300,
  ANIMATION_DURATION: 200,
} as const;

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_SEARCH_LENGTH: 100,
  MIN_SEARCH_LENGTH: 1,
} as const;

// Order Status
export const ORDER_STATUS = {
  CONFIRMED: "Confirmed",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
} as const;

// Wallet
export const WALLET = {
  MIN_RECHARGE: 100,
  MAX_RECHARGE: 10000,
} as const;

// Category
export const CATEGORIES = [
  { id: 1, name: "Fruits", icon: "🍎", itemCount: 45 },
  { id: 2, name: "Vegetables", icon: "🥬", itemCount: 38 },
  { id: 3, name: "Snacks", icon: "🍿", itemCount: 22 },
  { id: 4, name: "Combos", icon: "🎁", itemCount: 16 },
] as const;
