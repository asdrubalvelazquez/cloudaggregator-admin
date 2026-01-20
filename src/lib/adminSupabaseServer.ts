import "server-only";
import { createClient } from "@supabase/supabase-js";

// CRITICAL: These MUST point to the MAIN Cloud Aggregator Supabase project
// NOT a separate admin-only project. The service role key grants full access.

// Use empty string fallback for build time, but pages will check via isConfigured()
const supabaseUrl = process.env.ADMIN_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.ADMIN_SUPABASE_SERVICE_ROLE_KEY || "placeholder-key-for-build";

// Server-side only client with service role permissions
// NEVER expose this client to the browser
// Pages MUST check isConfigured() before using this client
export const adminSupabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
