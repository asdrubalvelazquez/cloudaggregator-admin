import "server-only";
import { adminSupabaseServer } from "./adminSupabaseServer";

export const EXPECTED_TABLES = [
  "admin_users",
  "clouds", 
  "subscriptions",
  "users"
];

/**
 * Lists all tables in the public schema using the RPC function
 * REQUIRES: list_public_tables() function to be created in Supabase:
 * 
 * create or replace function public.list_public_tables()
 * returns table(table_name text)
 * language sql
 * security definer
 * as $$
 *   select tablename::text as table_name
 *   from pg_catalog.pg_tables
 *   where schemaname = 'public'
 *   order by tablename;
 * $$;
 */
export async function listTables(): Promise<string[]> {
  try {
    const { data, error } = await adminSupabaseServer.rpc("list_public_tables");

    if (error) {
      console.error("[Schema] Failed to list tables via RPC:", error);
      // If RPC doesn't exist, return empty array (not a hard error)
      return [];
    }

    return data?.map((row: any) => row.table_name) || [];
  } catch (e) {
    console.error("[Schema] Exception listing tables:", e);
    return [];
  }
}

/**
 * Checks if a specific table exists in the public schema
 */
export async function tableExists(tableName: string): Promise<boolean> {
  const tables = await listTables();
  return tables.includes(tableName);
}

/**
 * Gets missing tables from expected list
 */
export async function getMissingTables(): Promise<string[]> {
  const tables = await listTables();
  return EXPECTED_TABLES.filter(expected => !tables.includes(expected));
}

/**
 * Gets project reference from Supabase URL
 * Returns just the subdomain (project ref) without exposing full URL
 */
export function getProjectRef(): string {
  const url = process.env.ADMIN_SUPABASE_URL || "";
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    // Extract project ref (e.g., "abcdefgh" from "abcdefgh.supabase.co")
    const parts = hostname.split(".");
    return parts[0] || "not-configured";
  } catch {
    return "not-configured";
  }
}

/**
 * Checks if the admin panel is properly configured
 */
export function isConfigured(): boolean {
  const url = process.env.ADMIN_SUPABASE_URL;
  const key = process.env.ADMIN_SUPABASE_SERVICE_ROLE_KEY;
  return !!(url && key && url !== "" && key !== "");
}
