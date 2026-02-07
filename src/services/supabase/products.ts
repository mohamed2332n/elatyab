import { supabase } from '@/config/supabase';

export const productsService = {
  // Get all products
  getAllProducts: async (limit = 50, offset = 0) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          category:categories(id, name_en, name_ar, icon)
        `,
        )
        .eq('is_active', true)
        .eq('is_in_stock', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .eq('is_in_stock', true)
        .order('name_en');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get single product
  getProduct: async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          category:categories(*),
          reviews(*)
        `,
        )
        .eq('id', productId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Search products
  searchProducts: async (query: string, language: 'en' | 'ar' = 'en') => {
    try {
      const nameCol = language === 'ar' ? 'name_ar' : 'name_en';
      const descCol = `description_${language}`;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(
          `${nameCol}.ilike.%${query}%,${descCol}.ilike.%${query}%`,
        )
        .eq('is_active', true)
        .eq('is_in_stock', true)
        .limit(20);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .eq('is_in_stock', true)
        .limit(10);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get discounted products
  getDiscountedProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('discount_percent', 0)
        .eq('is_active', true)
        .eq('is_in_stock', true)
        .order('discount_percent', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
