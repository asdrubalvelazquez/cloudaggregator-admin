import { adminSupabaseServer } from "@/lib/adminSupabaseServer";

export default async function SystemPage() {
  let metrics = {
    totalUsers: 0,
    totalClouds: 0,
    totalSubscriptions: 0,
  };
  let error: string | null = null;

  try {
    const [usersResult, cloudsResult, subsResult] = await Promise.all([
      adminSupabaseServer.from("users").select("id", { count: "exact", head: true }),
      adminSupabaseServer.from("clouds").select("id", { count: "exact", head: true }),
      adminSupabaseServer.from("subscriptions").select("id", { count: "exact", head: true }),
    ]);

    if (usersResult.error) throw usersResult.error;
    if (cloudsResult.error) throw cloudsResult.error;
    if (subsResult.error) throw subsResult.error;

    metrics = {
      totalUsers: usersResult.count || 0,
      totalClouds: cloudsResult.count || 0,
      totalSubscriptions: subsResult.count || 0,
    };
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch metrics";
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System</h1>
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
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
    </div>
  );
}
