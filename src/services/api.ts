"use client";

import { supabase } from "@/lib/supabase";
import { Product, User, Order, OrderItem, WalletData } from "@/lib/types";

export type { Product };

// Utility to map DB product to Frontend type based on current language
const mapProduct = (p: any, lang: string = 'en'): Product => ({
  id: p.id,
  name: lang === 'ar' ? p.name_ar : p.name_en,
  description: lang === 'ar' ? p.description_ar : p.description_en,
  weight: p.weight || "1 unit",
  originalPrice: Number(p.old_price) || Number(p.price),
  discountedPrice: Number(p.price),
  discountPercent: p.discount_percent || 0,
  isInStock: p.is_in_stock,
  images: p.images || ["/placeholder.svg"],
  tags: [p.unit, ...(p.is_featured ? ['Featured'] : [])].filter(Boolean),
  rating: Number(p.rating) || 0,
  reviewsCount: p.total_reviews || 0,
  origin: lang === 'ar' ? p.origin_ar : p.origin_en,
  harvestDate: p.created_at,
  freshness: "Fresh"
});

export const apiService = {
  // Auth handled primarily in auth-context, but helper here
  login: async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    return !!data.user;
  },
  
  logout: async () => {
    await supabase.auth.signOut();
  },

  getMe: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    return profile ? {
      id: profile.id,
      name: profile.name || user.email?.split('@')[0],
      email: profile.email || user.email,
      phone: profile.phone || "",
      address: profile.full_address || "",
      avatar: profile.avatar_url
    } : null;
  },

  // Products
  getProducts: async (lang: string = 'en'): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return data.map(p => mapProduct(p, lang));
  },

  getProduct: async (id: string, lang: string = 'en'): Promise<Product | null> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return mapProduct(data, lang);
  },

  // Categories
  getCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    if (error) throw error;
    return data;
  },

  // Wallet
  getWalletData: async (): Promise<WalletData> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    const { data: txs } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return {
      balance: Number(wallet?.balance || 0),
      transactions: (txs || []).map(t => ({
        id: t.id,
        type: t.type as "credit" | "debit",
        amount: Number(t.amount),
        description: t.description,
        date: new Date(t.created_at).toLocaleDateString()
      }))
    };
  },

  rechargeWallet: async (amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // In a real app, this logic should be a Postgres Function (RPC) for atomicity
    const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single();
    const newBalance = (wallet?.balance || 0) + amount;
    
    await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);
    await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      type: 'credit',
      amount,
      description: 'Recharge',
      balance_after: newBalance
    });

    return { success: true, newBalance };
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data.map(o => ({
      id: o.order_number,
      date: new Date(o.created_at).toLocaleDateString(),
      status: o.status,
      total: Number(o.total),
      items: o.items?.[0]?.count || 0,
      deliveryTime: "Today"
    }));
  },

  placeOrder: async (items: OrderItem[], total: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const orderNumber = `ORD-${Date.now()}`;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        delivery_address: "Default Address",
        subtotal: total,
        total: total,
        payment_method: 'wallet',
        status: 'confirmed'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Item snapshots
    const orderItems = items.map(i => ({
      order_id: order.id,
      product_id: i.id,
      product_name_en: i.name,
      product_name_ar: i.name, // Simplified for mock
      quantity: i.quantity,
      unit_price: i.price,
      total_price: i.price * i.quantity
    }));

    await supabase.from('order_items').insert(orderItems);
    
    return { success: true, orderId: order.id };
  },

  // Cart (Server Sync)
  addToCart: async (item: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };
    
    const { error } = await supabase
      .from('cart_items')
      .upsert({ user_id: user.id, product_id: item.id, quantity: 1 }, { onConflict: 'user_id,product_id' });
    
    return { success: !error };
  },

  getCartItems: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase.from('cart_items').select('*, product:products(*)').eq('user_id', user.id);
    return (data || []).map(item => ({
      id: item.product_id,
      name: item.product.name_en,
      price: Number(item.product.price),
      quantity: item.quantity,
      image: item.product.images?.[0],
      weight: item.product.weight
    }));
  }
};