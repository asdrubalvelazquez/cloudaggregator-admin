import { adminSupabaseServer } from "@/lib/adminSupabaseServer";

interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  status: string | null;
  plan: string | null;
  created_at: string;
}

export default async function BillingPage() {
  let subscriptions: Subscription[] = [];
  let error: string | null = null;

  try {
    const { data, error: fetchError } = await adminSupabaseServer
      .from("subscriptions")
      .select("id, user_id, stripe_subscription_id, status, plan, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (fetchError) throw fetchError;
    subscriptions = data || [];
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch subscriptions";
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
      <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Stripe ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No subscriptions found
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {sub.user_id.substring(0, 8)}...
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {sub.stripe_subscription_id || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {sub.plan || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {sub.status || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
