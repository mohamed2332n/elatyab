import { createClient } from '@supabase/supabase-js';

// Accessing environment variables securely via Vite's import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Please click 'Add Supabase' integration button.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);