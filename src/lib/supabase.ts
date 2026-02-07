import { createClient } from '@supabase/supabase-js';

// Accessing environment variables securely via Vite's import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use fallback values to prevent createClient from throwing a crash-inducing error
const fallbackUrl = "https://placeholder.supabase.co";
const fallbackKey = "placeholder-key";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing! Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(
  supabaseUrl || fallbackUrl, 
  supabaseAnonKey || fallbackKey
);