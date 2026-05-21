import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const globalForSupabase = globalThis as typeof globalThis & {
  supabaseClient?: SupabaseClient;
};

function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage:
        typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });
}

export const supabase =
  globalForSupabase.supabaseClient ?? createSupabaseClient();

if (typeof window !== "undefined") {
  globalForSupabase.supabaseClient = supabase;
}
