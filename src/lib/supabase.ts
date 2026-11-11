import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Acepta el nombre nuevo (publishable) o el antiguo (anon)
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigured = Boolean(url && key);

// Cliente único para el navegador. La seguridad la garantiza Row Level Security en la BD.
export const supabase: SupabaseClient = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-key",
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" } },
);
