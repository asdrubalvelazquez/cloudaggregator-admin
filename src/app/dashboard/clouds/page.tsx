import { adminSupabaseServer } from "@/lib/adminSupabaseServer";
import { tableExists } from "@/lib/adminSchema";
import Link from "next/link";

interface Cloud {
  id: string;
  provider: string;
  account_email: string;
  owner_id: string;
  status: string | null;
  created_at: string;
}

export default async function CloudsPage() {
  let clouds: Cloud[] = [];
  let error: string | null = null;
  let errorDetails: string | null = null;
  
  // Check if table exists first
  const tableExistsResult = await tableExists("clouds");
  
  if (!tableExistsResult) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clouds</h1>
        <div className="mt-4 rounded-md bg-yellow-50 p-4">
          <p className="text-sm font-semibold text-yellow-800">Table &apos;clouds&apos; not found</p>
          <p className="mt-2 text-xs text-yellow-700">
            The &apos;clouds&apos; table does not exist in the connected Supabase project.
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
      .from("clouds")
      .select("id, provider, account_email, owner_id, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (fetchError) {
      console.error('[Server] Clouds fetch error:', {
        message: fetchError.message,
        code: fetchError.code,
        details: fetchError.details,
        hint: fetchError.hint
      });
      throw fetchError;
    }
    
    clouds = data || [];
    console.log(`[Server] Successfully fetched ${clouds.length} clouds`);
  } catch (e) {
    const err = e as any;
    error = err.message || "Failed to fetch clouds";
    errorDetails = JSON.stringify({
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint
    }, null, 2);
    console.error('[Server] Clouds page error:', errorDetails);
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clouds</h1>
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
      <h1 className="text-3xl font-bold text-gray-900">Clouds</h1>
      <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Account Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Owner ID
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
            {clouds.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No clouds found
                </td>
              </tr>
            ) : (
              clouds.map((cloud) => (
                <tr key={cloud.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {cloud.provider}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {cloud.account_email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {cloud.owner_id.substring(0, 8)}...
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {cloud.status || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(cloud.created_at).toLocaleDateString()}
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
