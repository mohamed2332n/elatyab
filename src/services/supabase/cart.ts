import { supabase } from '@/config/supabase';

export const cartService = {
  // Get user cart
  getCart: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
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

  // Add to cart
  addToCart: async (userId: string, productId: string, quantity = 1) => {
    try {
      // Check if item already exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existing) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({ user_id: userId, product_id: productId, quantity })
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      }
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update cart item quantity
  updateQuantity: async (cartItemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        return await cartService.removeFromCart(cartItemId);
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Remove from cart
  removeFromCart: async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Clear cart
  clearCart: async (userId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },
};
