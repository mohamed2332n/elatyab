"use client";

import { supabase } from "@/integrations/supabase/client";

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

export interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
  deliveryTime: string;
}

export const apiService = {
  login: async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("[API] Attempting login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("[Supabase Auth Error]:", error);
        throw error;
      }
      return true;
    } catch (err: any) {
      console.error("[API Login Catch]:", err);
      throw err;
    }
  },

  signup: async (name: string, email: string, phone: string, password: string): Promise<void> => {
    try {
      console.log("[API] Attempting signup for:", email);
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, phone: phone },
        },
      });

      if (authError) {
        console.error("[Supabase Signup Error]:", authError);
        throw authError;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: name,
            phone: phone,
          });
        
        if (profileError) console.error("[Profile Creation Error]:", profileError);
      }
    } catch (err: any) {
      console.error("[API Signup Catch]:", err);
      throw err;
    }
  },

  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
  },

  getMe: async (): Promise<User | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        name: profile?.full_name || user.user_metadata.full_name || user.email?.split('@')[0],
        email: user.email || "",
        phone: profile?.phone || user.user_metadata.phone || "",
        address: profile?.address || "",
      };
    } catch (err) {
      return null;
    }
  },

  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    
    return (data || []).map(p => ({
      id: p.id,
      name: p.name_en,
      description: p.description_en || "",
      weight: "1 kg",
      originalPrice: p.price,
      discountedPrice: p.price * (1 - (p.discount_percentage || 0) / 100),
      discountPercent: p.discount_percentage || 0,
      isInStock: p.in_stock,
      images: [p.image_url || "/placeholder.svg"],
      tags: [],
      rating: p.rating || 0,
      reviewsCount: p.reviews_count || 0,
      origin: "Egypt",
      harvestDate: p.created_at,
      freshness: "Very Fresh"
    }));
  },

  getProduct: async (id: string): Promise<Product | null> => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) return null;
    return {
      id: data.id,
      name: data.name_en,
      description: data.description_en || "",
      weight: "1 kg",
      originalPrice: data.price,
      discountedPrice: data.price * (1 - (data.discount_percentage || 0) / 100),
      discountPercent: data.discount_percentage || 0,
      isInStock: data.in_stock,
      images: [data.image_url || "/placeholder.svg"],
      tags: [],
      rating: data.rating || 0,
      reviewsCount: data.reviews_count || 0,
      origin: "Egypt",
      harvestDate: data.created_at,
      freshness: "Very Fresh"
    };
  },

  placeOrder: async (items: any[], total: number): Promise<{ success: boolean; orderId: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: total,
        payment_method: 'card',
        delivery_address: "Maadi, Cairo"
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    return { success: true, orderId: order.id };
  },

  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(o => ({
      id: o.id,
      date: new Date(o.created_at).toLocaleDateString(),
      status: o.status,
      total: o.total_amount,
      items: o.order_items ? (o.order_items[0] as any).count : 0,
      deliveryTime: "06:00 PM"
    }));
  },

  getWalletData: async () => ({ balance: 0, transactions: [] }),
  rechargeWallet: async (amount: number) => ({ success: false, newBalance: 0 }),
  getCartItems: async () => [],
  addToCart: async (item: any) => ({ success: true }),
  removeFromCart: async (id: string) => ({ success: true }),
  updateCartItem: async (id: string, qty: number) => ({ success: true })
};