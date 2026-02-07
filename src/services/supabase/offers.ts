import { supabase } from '@/config/supabase';

export const offersService = {
  // Get active offers
  getActiveOffers: async () => {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .gte('valid_till', now)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
