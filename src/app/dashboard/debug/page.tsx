import { adminSupabaseServer } from "@/lib/adminSupabaseServer";
import { listTables, getMissingTables, getProjectRef, EXPECTED_TABLES, isConfigured } from "@/lib/adminSchema";

export default async function DebugPage() {
  const configured = isConfigured();
  const projectRef = getProjectRef();
  let tables: string[] = [];
  let missingTables: string[] = [];
  let error: string | null = null;
  let authUsers: number = 0;
  let rpcExists = false;

  if (!configured) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Debug Info</h1>
        <div className="rounded-md bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-2">
            ⚠️ Configuration Error
          </h3>
          <p className="text-sm text-red-700">
            Admin panel is not properly configured. Missing environment variables:
          </p>
          <ul className="list-disc list-inside text-sm text-red-700 mt-2">
            <li>ADMIN_SUPABASE_URL</li>
            <li>ADMIN_SUPABASE_SERVICE_ROLE_KEY</li>
          </ul>
          <p className="text-sm text-red-700 mt-2">
            Check your .env.local file and ensure these variables point to the main Cloud Aggregator Supabase project.
          </p>
        </div>
      </div>
    );
  }

  try {
    // Get tables
    tables = await listTables();
    rpcExists = tables.length > 0 || await checkRPCExists();
    missingTables = await getMissingTables();

    // Count auth users
    const { data, error: authError } = await adminSupabaseServer.auth.admin.listUsers();
    if (!authError) {
      authUsers = data.users.length;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch debug info";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Debug Info</h1>

      {/* Project Info */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Supabase Project</h2>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Project Reference</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">{projectRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Auth Users Count</dt>
            <dd className="mt-1 text-sm text-gray-900">{authUsers}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">RPC Function Status</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {rpcExists ? (
                <span className="text-green-600">✓ list_public_tables() exists</span>
              ) : (
                <span className="text-red-600">✗ list_public_tables() not found</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* RPC Setup Instructions */}
      {!rpcExists && (
        <div className="rounded-md bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            📋 Setup Required
          </h3>
          <p className="text-sm text-blue-700 mb-2">
            The required RPC function is not installed. Run this SQL in your Supabase SQL Editor:
          </p>
          <pre className="mt-2 text-xs bg-blue-900 text-blue-50 p-3 rounded overflow-x-auto">
{`create or replace function public.list_public_tables()
returns table(table_name text)
language sql
security definer
as $$
  select tablename::text as table_name
  from pg_catalog.pg_tables
  where schemaname = 'public'
  order by tablename;
$$;

revoke all on function public.list_public_tables() from public;
grant execute on function public.list_public_tables() to anon, authenticated;`}
          </pre>
        </div>
      )}

      {/* Expected Tables */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected Tables</h2>
        <ul className="space-y-1">
          {EXPECTED_TABLES.map((table) => {
            const exists = tables.includes(table);
            return (
              <li key={table} className="flex items-center text-sm">
                <span className={`mr-2 ${exists ? 'text-green-600' : 'text-red-600'}`}>
                  {exists ? '✓' : '✗'}
                </span>
                <span className="font-mono">{table}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* All Tables */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          All Tables in Public Schema ({tables.length})
        </h2>
        {error ? (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        ) : tables.length === 0 ? (
          <p className="text-sm text-gray-500">
            No tables found. {!rpcExists && "Install the RPC function first."}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2">
            {tables.map((table) => (
              <li key={table} className="text-sm font-mono text-gray-700">
                {table}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Warnings */}
      {missingTables.length > 0 && rpcExists && (
        <div className="rounded-md bg-yellow-50 p-4">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">
            ⚠️ Missing Tables
          </h3>
          <p className="text-sm text-yellow-700 mb-2">
            The following expected tables are missing from the schema:
          </p>
          <ul className="list-disc list-inside text-sm text-yellow-700">
            {missingTables.map((table) => (
              <li key={table} className="font-mono">{table}</li>
            ))}
          </ul>
          <p className="text-sm text-yellow-700 mt-2">
            This may indicate that you&apos;re connected to the wrong Supabase project.
            Expected project: <strong>Cloud Aggregator main project</strong>, not the admin panel project.
          </p>
        </div>
      )}
    </div>
  );
}

async function checkRPCExists(): Promise<boolean> {
  try {
    const { error } = await adminSupabaseServer.rpc("list_public_tables");
    return !error;
  } catch {
    return false;
  }
}
