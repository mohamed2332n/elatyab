import { supabase } from '@/config/supabase';

export const wishlistService = {
  // Get wishlist
  getWishlist: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(
          `
          *,
          product:products(*)
        `,
        )
        .eq('user_id', userId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Add to wishlist
  addToWishlist: async (userId: string, productId: string) => {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .insert({ user_id: userId, product_id: productId })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (userId: string, productId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Check if in wishlist
  isInWishlist: async (userId: string, productId: string) => {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { isInWishlist: !!data, error: null };
    } catch (error) {
      return { isInWishlist: false, error };
    }
  },
};
