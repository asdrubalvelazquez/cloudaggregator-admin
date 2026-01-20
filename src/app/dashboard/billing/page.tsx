import { adminSupabaseServer } from "@/lib/adminSupabaseServer";
import { tableExists } from "@/lib/adminSchema";
import Link from "next/link";

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
  let errorDetails: string | null = null;
  
  // Check if table exists first
  const tableExistsResult = await tableExists("subscriptions");
  
  if (!tableExistsResult) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
        <div className="mt-4 rounded-md bg-yellow-50 p-4">
          <p className="text-sm font-semibold text-yellow-800">Table &apos;subscriptions&apos; not found</p>
          <p className="mt-2 text-xs text-yellow-700">
            The &apos;subscriptions&apos; table does not exist in the connected Supabase project.
            You may be connected to the wrong project.
          </p>
          <Link href="/dashboard/debug" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
            → Check Debug Info
          </Link>
        </div>
      </div>
    );
  }

  try {
    const { data, error: fetchError } = await adminSupabaseServer
      .from("subscriptions")
      .select("id, user_id, stripe_subscription_id, status, plan, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (fetchError) {
      console.error('[Server] Subscriptions fetch error:', {
        message: fetchError.message,
        code: fetchError.code,
        details: fetchError.details,
        hint: fetchError.hint
      });
      throw fetchError;
    }
    
    subscriptions = data || [];
    console.log(`[Server] Successfully fetched ${subscriptions.length} subscriptions`);
  } catch (e) {
    const err = e as any;
    error = err.message || "Failed to fetch subscriptions";
    errorDetails = JSON.stringify({
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint
    }, null, 2);
    console.error('[Server] Billing page error:', errorDetails);
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
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
