"use client";

import { supabase } from "@/lib/supabase";
import { Product, User, Order, OrderItem, WalletData } from "@/lib/types";

export type { Product };

// Utility to map DB product to Frontend type based on current language
const mapProduct = (p: any, lang: string = 'en'): Product => ({
  id: p?.id || '',
  name: (lang === 'ar' ? p?.name_ar : p?.name_en) || 'Unnamed Product',
  description: (lang === 'ar' ? p?.description_ar : p?.description_en) || '',
  weight: p?.weight || "1 unit",
  originalPrice: Number(p?.old_price) || Number(p?.price) || 0,
  discountedPrice: Number(p?.price) || 0,
  discountPercent: p?.discount_percent || 0,
  isInStock: p?.is_in_stock ?? false,
  images: Array.isArray(p?.images) ? p.images : ["/placeholder.svg"],
  tags: [p?.unit, ...(p?.is_featured ? ['Featured'] : [])].filter(Boolean),
  rating: Number(p?.rating) || 0,
  reviewsCount: p?.total_reviews || 0,
  origin: (lang === 'ar' ? p?.origin_ar : p?.origin_en) || '',
  harvestDate: p?.created_at || new Date().toISOString(),
  freshness: "Fresh"
});

export const apiService = {
  login: async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      return !!data.user;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  },
  
  logout: async () => {
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
        
      return profile ? {
        id: profile.id,
        name: profile.name || user.email?.split('@')[0] || 'User',
        email: profile.email || user.email || '',
        phone: profile.phone || "",
        address: profile.full_address || "",
        avatar: profile.avatar_url
      } : null;
    } catch (err) {
      console.error("GetMe failed:", err);
      return null;
    }
  },

  getProducts: async (lang: string = 'en'): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return (data || []).map(p => mapProduct(p, lang));
    } catch (err) {
      console.error("GetProducts failed:", err);
      return [];
    }
  },

  getProduct: async (id: string, lang: string = 'en'): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return mapProduct(data, lang);
    } catch (err) {
      console.error("GetProduct failed:", err);
      return null;
    }
  },

  getCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("GetCategories failed:", err);
      return [];
    }
  },

  getWalletData: async (): Promise<WalletData> => {
    try {
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
    } catch (err) {
      console.error("GetWalletData failed:", err);
      return { balance: 0, transactions: [] };
    }
  },

  rechargeWallet: async (amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single();
    const newBalance = (Number(wallet?.balance) || 0) + amount;
    
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

  getOrders: async (): Promise<Order[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return (data || []).map(o => ({
        id: o.order_number || o.id,
        date: new Date(o.created_at).toLocaleDateString(),
        status: o.status || 'Pending',
        total: Number(o.total) || 0,
        items: o.items?.[0]?.count || 0,
        deliveryTime: "Today"
      }));
    } catch (err) {
      console.error("GetOrders failed:", err);
      return [];
    }
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

    const orderItems = items.map(i => ({
      order_id: order.id,
      product_id: i.id,
      product_name_en: i.name,
      product_name_ar: i.name,
      quantity: i.quantity,
      unit_price: i.price,
      total_price: i.price * i.quantity
    }));

    await supabase.from('order_items').insert(orderItems);
    
    return { success: true, orderId: order.id };
  },

  addToCart: async (item: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };
      
      const { error } = await supabase
        .from('cart_items')
        .upsert({ user_id: user.id, product_id: item.id, quantity: 1 }, { onConflict: 'user_id,product_id' });
      
      return { success: !error };
    } catch (err) {
      console.error("AddToCart failed:", err);
      return { success: false };
    }
  },

  updateCartItem: async (productId: string, quantity: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);
      return { success: !error };
    } catch (err) {
      console.error("UpdateCartItem failed:", err);
      return { success: false };
    }
  },

  removeFromCart: async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      return { success: !error };
    } catch (err) {
      console.error("RemoveFromCart failed:", err);
      return { success: false };
    }
  },

  getCartItems: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from('cart_items').select('*, product:products(*)').eq('user_id', user.id);
      return (data || [])
        .filter(item => item.product) // Safety check: ensure product exists
        .map(item => ({
          id: item.product_id,
          name: item.product.name_en || 'Product',
          price: Number(item.product.price) || 0,
          quantity: item.quantity,
          image: item.product.images?.[0] || "/placeholder.svg",
          weight: item.product.weight || ""
        }));
    } catch (err) {
      console.error("GetCartItems failed:", err);
      return [];
    }
  }
};