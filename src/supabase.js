import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verifica se as chaves foram preenchidas no .env
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'SUA_URL_DO_SUPABASE' &&
  supabaseAnonKey !== 'SUA_CHAVE_ANON_DO_SUPABASE';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
