import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client — available once NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY are set. Returns null in local mode.
 *
 * Production wiring: pass the Clerk session token so Row Level Security can
 * read auth.jwt()->>'sub' (see supabase/schema.sql):
 *
 *   const { getToken } = useAuth() // from @clerk/nextjs
 *   createClient(url, anonKey, {
 *     global: { fetch: async (input, init) => {
 *       const token = await getToken()
 *       const headers = new Headers(init?.headers)
 *       headers.set("Authorization", `Bearer ${token}`)
 *       return fetch(input, { ...init, headers })
 *     }}})
 *
 * The local-first store (src/lib/store.ts) mirrors the schema 1:1, so the
 * upgrade path is swapping its persistence functions for supabase queries.
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
