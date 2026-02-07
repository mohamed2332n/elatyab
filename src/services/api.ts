"use client";

// Mock API service to simulate server-side operations
// In a real application, this would make actual HTTP requests to a backend

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

// Mock data (Authority)
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
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
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
    { id: 2, type: "debit", amount: 450, description: "Order payment", date: "2023-05-10" },
    { id: 3, type: "credit", amount: 500, description: "Referral bonus", date: "2023-05-05" }
  ]
};

const mockOrders: Order[] = [
  { id: "ORD-001", date: "2023-05-15", status: "Delivered", total: 450, items: 5, deliveryTime: "06:30 PM" },
  { id: "ORD-002", date: "2023-05-10", status: "Out for delivery", total: 320, items: 3, deliveryTime: "05:45 PM" },
  { id: "ORD-003", date: "2023-05-05", status: "Confirmed", total: 780, items: 8, deliveryTime: "07:00 PM" }
];

// Mock session check
const isAuthenticated = () => {
  return !!localStorage.getItem("session_token");
};

// Mock API functions
export const apiService = {
  // Get current user profile (Secure: Fetches based on session token)
  getMe: async (): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!isAuthenticated()) return null;
    return mockUserData;
  },

  // Get product by ID (server-side validated)
  getProduct: async (id: string): Promise<Product | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const product = mockProducts.find(p => p.id === id);
    return product || null;
  },
  
  // Get all products (server-side validated)
  getProducts: async (): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProducts;
  },
  
  // Get wallet data (server-side validated)
  getWalletData: async (): Promise<WalletData | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!isAuthenticated()) return null;
    return mockWalletData;
  },
  
  // Recharge wallet (server-side validated)
  rechargeWallet: async (amount: number): Promise<{ success: boolean; newBalance: number }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!isAuthenticated()) return { success: false, newBalance: 0 };
    
    const newBalance = mockWalletData.balance + amount;
    mockWalletData.balance = newBalance;
    
    const newTransaction: WalletTransaction = {
      id: mockWalletData.transactions.length + 1,
      type: "credit",
      amount,
      description: "Wallet recharge",
      date: new Date().toISOString().split('T')[0]
    };
    
    mockWalletData.transactions.unshift(newTransaction);
    return { success: true, newBalance };
  },
  
  // Get cart items (server-side validated)
  getCartItems: async (): Promise<CartItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [];
  },
  
  // Add item to cart (server-side validated)
  addToCart: async (item: Omit<CartItem, "quantity">): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
  
  // Update cart item quantity (server-side validated)
  updateCartItem: async (id: string, quantity: number): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
  
  // Remove item from cart (server-side validated)
  removeFromCart: async (id: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
  
  // Get orders (server-side validated)
  getOrders: async (): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!isAuthenticated()) return [];
    return mockOrders;
  },
  
  // Place order (Secure: Total calculation happens here, not trusting client)
  placeOrder: async (items: OrderItem[]): Promise<{ success: boolean; orderId: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!isAuthenticated()) return { success: false, orderId: "" };
    
    // SERVER-SIDE CALCULATION: Recalculate total using official prices
    let calculatedTotal = 0;
    let itemCount = 0;

    for (const item of items) {
      const dbProduct = mockProducts.find(p => p.id === item.id);
      if (dbProduct && dbProduct.isInStock) {
        calculatedTotal += dbProduct.discountedPrice * item.quantity;
        itemCount += item.quantity;
      } else if (!dbProduct) {
        throw new Error(`Invalid product ID: ${item.id}`);
      }
    }

    // Apply delivery fee logic on server
    const deliveryFee = calculatedTotal >= 500 ? 0 : 30;
    const finalTotal = calculatedTotal + deliveryFee;

    // Check wallet balance on server
    if (mockWalletData.balance < finalTotal) {
      throw new Error("Insufficient wallet balance");
    }

    // Deduct from wallet
    mockWalletData.balance -= finalTotal;
    mockWalletData.transactions.unshift({
      id: mockWalletData.transactions.length + 1,
      type: "debit",
      amount: finalTotal,
      description: "Order payment",
      date: new Date().toISOString().split('T')[0]
    });

    const orderId = `ORD-${String(mockOrders.length + 1).padStart(3, '0')}`;
    
    const newOrder: Order = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      status: "Confirmed",
      total: finalTotal,
      items: itemCount,
      deliveryTime: "06:00 PM"
    };
    
    mockOrders.unshift(newOrder);
    return { success: true, orderId };
  }
};