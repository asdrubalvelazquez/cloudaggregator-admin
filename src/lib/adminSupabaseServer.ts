import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.ADMIN_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side only client with service role permissions
// NEVER expose this client to the browser
export const adminSupabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
