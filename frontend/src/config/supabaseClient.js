import { createClient } from '@supabase/supabase-js';

// Pull the cloud keys securely from your frontend/.env file at runtime
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize and export a single, reusable connection instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);