import { adminSupabaseServer } from "@/lib/adminSupabaseServer";
import { tableExists } from "@/lib/adminSchema";
import Link from "next/link";

export default async function SystemPage() {
  let metrics = {
    totalUsers: 0,
    totalClouds: 0,
    totalSubscriptions: 0,
  };
  let error: string | null = null;
  let errorDetails: string | null = null;
  let missingTables: string[] = [];

  try {
    // Check which tables exist
    const [cloudsExists, subsExists] = await Promise.all([
      tableExists("clouds"),
      tableExists("subscriptions")
    ]);

    // Count auth.users always available
    const { data: authData } = await adminSupabaseServer.auth.admin.listUsers();
    metrics.totalUsers = authData?.users.length || 0;

    // Only query tables that exist
    if (cloudsExists) {
      const { count } = await adminSupabaseServer
        .from("clouds")
        .select("id", { count: "exact", head: true });
      metrics.totalClouds = count || 0;
    } else {
      missingTables.push("clouds");
    }

    if (subsExists) {
      const { count } = await adminSupabaseServer
        .from("subscriptions")
        .select("id", { count: "exact", head: true });
      metrics.totalSubscriptions = count || 0;
    } else {
      missingTables.push("subscriptions");
    }

    console.log('[Server] Successfully fetched system metrics:', metrics);
  } catch (e) {
    const err = e as any;
    error = err.message || "Failed to fetch metrics";
    errorDetails = JSON.stringify({
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint
    }, null, 2);
    console.error('[Server] System page error:', errorDetails);
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System</h1>
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">Error: {error}</p>
          {errorDetails && (
            <pre className="mt-2 text-xs text-red-700 overflow-auto">{errorDetails}</pre>
          )}
          <Link href="/dashboard/debug" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
            → Check Debug Info
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">System</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-6 py-8 shadow">
          <dt className="text-sm font-medium text-gray-500">Total Users</dt>
          <dd className="mt-2 text-3xl font-semibold text-gray-900">
            {metrics.totalUsers}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-6 py-8 shadow">
          <dt className="text-sm font-medium text-gray-500">Total Clouds</dt>
          <dd className="mt-2 text-3xl font-semibold text-gray-900">
            {metrics.totalClouds}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-6 py-8 shadow">
          <dt className="text-sm font-medium text-gray-500">Total Subscriptions</dt>
          <dd className="mt-2 text-3xl font-semibold text-gray-900">
            {metrics.totalSubscriptions}
          </dd>
        </div>
      </div>
      {missingTables.length > 0 && (
        <div className="mt-4 rounded-md bg-yellow-50 p-4">
          <p className="text-sm font-semibold text-yellow-800">⚠️ Missing Tables</p>
          <p className="mt-2 text-xs text-yellow-700">
            The following tables are missing: {missingTables.join(", ")}.
            You may be connected to the wrong Supabase project.
          </p>
          <Link href="/dashboard/debug" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
            → Check Debug Info
          </Link>
        </div>
      )}
    </div>
  );
}
