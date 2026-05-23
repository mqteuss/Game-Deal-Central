import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const firstDefined = (...values: Array<string | undefined>) =>
  values.find(value => typeof value === 'string' && value.trim().length > 0)?.trim() || '';

export const supabaseUrl = firstDefined(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.GD_PUBLIC_SUPABASE_URL,
  import.meta.env.GAMEDEALBD_GD_PUBLIC_SUPABASE_URL,
);

export const supabasePublicKey = firstDefined(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  import.meta.env.GD_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  import.meta.env.GAMEDEALBD_GD_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  import.meta.env.GD_PUBLIC_SUPABASE_ANON_KEY,
  import.meta.env.GAMEDEALBD_GD_PUBLIC_SUPABASE_ANON_KEY,
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublicKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublicKey)
  : null;
