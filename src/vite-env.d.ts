/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly GD_PUBLIC_SUPABASE_URL?: string;
  readonly GD_PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly GD_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly GAMEDEALBD_GD_PUBLIC_SUPABASE_URL?: string;
  readonly GAMEDEALBD_GD_PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly GAMEDEALBD_GD_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
