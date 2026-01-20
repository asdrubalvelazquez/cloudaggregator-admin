import { adminSupabaseServer } from "@/lib/adminSupabaseServer";

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

  try {
    const { data, error: fetchError } = await adminSupabaseServer
      .from("clouds")
      .select("id, provider, account_email, owner_id, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (fetchError) throw fetchError;
    clouds = data || [];
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch clouds";
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clouds</h1>
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
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
