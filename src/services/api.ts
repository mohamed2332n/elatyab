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

<<<<<<< HEAD
const secureRequest = async <T>(callback: () => T, options: RequestInit = {}): Promise<T> => {
  const protectedOptions = addCSRFProtection(options);
  if (!protectedOptions.headers || !protectedOptions.headers['X-Requested-With']) {
    throw new Error("CSRF Protection Error");
=======
    try {
      return await withTimeout(
        retryAsync(async () => {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const product = mockProducts.find(p => p.id === id);
          return product || null;
        }, 2, API.RETRY_DELAY),
        API.TIMEOUT
      );
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get all products with pagination
  getProducts: async (page: number = 1, pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE): Promise<PaginatedResponse<Product>> => {
    if (!Number.isInteger(page) || page < 1) {
      throw handleApiError(new Error('Invalid page number'));
    }
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > PAGINATION.MAX_PAGE_SIZE) {
      throw handleApiError(new Error('Invalid page size'));
    }

    try {
      return await withTimeout(
        retryAsync(async () => {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const items = mockProducts.slice(startIndex, endIndex);
          const total = mockProducts.length;

          return {
            data: items,
            total,
            page,
            pageSize,
            hasMore: endIndex < total
          };
        }, 2, API.RETRY_DELAY),
        API.TIMEOUT
      );
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Search products with validation
  searchProducts: async (query: string, filters?: { minPrice?: number; maxPrice?: number; inStock?: boolean }): Promise<Product[]> => {
    if (!query || typeof query !== 'string') {
      throw handleApiError(new Error('Invalid search query'));
    }

    const trimmedQuery = query.trim().toLowerCase();
    if (trimmedQuery.length === 0 || trimmedQuery.length > 100) {
      throw handleApiError(new Error('Search query must be between 1 and 100 characters'));
    }

    try {
      return await withTimeout(
        retryAsync(async () => {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          let results = mockProducts.filter(product => 
            product.name.toLowerCase().includes(trimmedQuery) ||
            product.description.toLowerCase().includes(trimmedQuery) ||
            product.tags.some(tag => tag.toLowerCase().includes(trimmedQuery))
          );

          // Apply filters
          if (filters?.minPrice !== undefined) {
            results = results.filter(p => p.discountedPrice >= filters.minPrice!);
          }
          if (filters?.maxPrice !== undefined) {
            results = results.filter(p => p.discountedPrice <= filters.maxPrice!);
          }
          if (filters?.inStock) {
            results = results.filter(p => p.isInStock);
          }

          return results;
        }, 2, API.RETRY_DELAY),
        API.TIMEOUT
      );
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get wallet data with error handling
  getWalletData: async (): Promise<WalletData> => {
    try {
      return await withTimeout(
        retryAsync(async () => {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 300));
          return mockWalletData;
        }, 2, API.RETRY_DELAY),
        API.TIMEOUT
      );
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Recharge wallet with validation
  rechargeWallet: async (amount: number): Promise<{ success: boolean; newBalance: number }> => {
    if (!Number.isFinite(amount) || amount < 100 || amount > 10000) {
      throw handleApiError(new Error('Recharge amount must be between 100 EGP and 10000 EGP'));
    }

    try {
      return await withTimeout(
        retryAsync(async () => {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // In a real app, this would validate payment and update server-side
          const newBalance = mockWalletData.balance + amount;
          mockWalletData.balance = newBalance;
          
          // Add transaction
          const newTransaction: WalletTransaction = {
            id: mockWalletData.transactions.length + 1,
            type: "credit",
            amount,
            description: "Wallet recharge",
            date: new Date().toISOString().split('T')[0]
          };
          
          mockWalletData.transactions.unshift(newTransaction);
          
          return { success: true, newBalance };
        }, 2, API.RETRY_DELAY),
        API.TIMEOUT
      );
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get cart items with error handling
  getCartItems: async (): Promise<CartItem[]> => {
    try {
      return await withTimeout(
        retryAsync(async () => {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // In a real app, this would fetch from server-side session or database
          // For this example, we'll return an empty array to force client to manage cart
          // but validate during checkout
          return [];
        }, 2, API.RETRY_DELAY),
        API.TIMEOUT
      );
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Add item to cart with validation
  addToCart: async (item: Omit<CartItem, "quantity">): Promise<{ success: boolean }> => {
    // Validate item structure
    if (!item.id || !item.name || !Number.isFinite(item.price)) {
      throw handleApiError(new Error('Invalid cart item'));
    }

    if (item.price <= 0) {
      throw handleApiError(new Error('Item price must be greater than 0'));
    }

    try {
      return await withTimeout(
        retryAsync(async () => {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // In a real app, this would validate the item exists and is in stock
          // then add to server-side cart
          return { success: true };
        }, 2, API.RETRY_DELAY),
        API.TIMEOUT
      );
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Update cart item quantity with validation
  updateCartItem: async (id: string, quantity: number): Promise<{ success: boolean }> => {
    if (!id || typeof id !== 'string') {
      throw handleApiError(new Error('Invalid item ID'));
    }

    if (!isValidQuantity(quantity)) {
      throw handleApiError(new Error(`Quantity must be between 1 and ${CART.MAX_QUANTITY}`));
    }

    try {
      return await withTimeout(
        retryAsync(async () => {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // In a real app, this would validate the item exists, is in stock,
          // and the quantity is valid
          return { success: true };
        }, 2, API.RETRY_DELAY),
        API.TIMEOUT
      );
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Remove item from cart with validation
  removeFromCart: async (id: string): Promise<{ success: boolean }> => {
    if (!id || typeof id !== 'string') {
      throw handleApiError(new Error('Invalid item ID'));
    }

    try {
      return await withTimeout(
        retryAsync(async () => {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // In a real app, this would remove from server-side cart
          return { success: true };
        }, 2, API.RETRY_DELAY),
        API.TIMEOUT
      );
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get orders with error handling
  getOrders: async (): Promise<Order[]> => {
    try {
      return await withTimeout(
        retryAsync(async () => {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 300));
          return mockOrders;
        }, 2, API.RETRY_DELAY),
        API.TIMEOUT
      );
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Place order with comprehensive validation
  placeOrder: async (items: OrderItem[], total: number): Promise<{ success: boolean; orderId: string }> => {
    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      throw handleApiError(new Error('Order must contain at least one item'));
    }

    // Validate each item
    for (const item of items) {
      const validation = validateData(cartItemSchema, item);
      if (!validation.success) {
        throw handleApiError(new Error(`Invalid cart item: ${validation.errors[0]}`));
      }
    }

    // Validate total
    if (!Number.isFinite(total) || total <= 0) {
      throw handleApiError(new Error('Invalid order total'));
    }

    try {
      return await withTimeout(
        retryAsync(async () => {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real app, this would:
          // 1. Validate all items exist and are in stock
          // 2. Validate prices match current server values
          // 3. Check user authentication
          // 4. Process payment
          // 5. Create order record
          // 6. Update inventory
          
          const orderId = `ORD-${String(mockOrders.length + 1).padStart(3, '0')}`;
          
          // Add new order
          const newOrder: Order = {
            id: orderId,
            date: new Date().toISOString().split('T')[0],
            status: "Confirmed",
            total,
            items: items.reduce((sum, item) => sum + item.quantity, 0),
            deliveryTime: "06:00 PM"
          };
          
          mockOrders.unshift(newOrder);
          
          return { success: true, orderId };
        }, 2, API.RETRY_DELAY),
        API.TIMEOUT
      );
    } catch (error) {
      throw handleApiError(error);
    }
>>>>>>> 2811c28a30579485cf3ae75f0af75c3bf0b92703
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