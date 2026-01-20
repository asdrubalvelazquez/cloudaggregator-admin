import { adminSupabaseServer } from "@/lib/adminSupabaseServer";

interface User {
  id: string;
  email: string;
  created_at: string;
}

export default async function UsersPage() {
  let users: User[] = [];
  let error: string | null = null;
  let errorDetails: string | null = null;

  try {
    // Using auth.admin.listUsers() with service role for auth users
    const { data, error: fetchError } = await adminSupabaseServer.auth.admin.listUsers();

    if (fetchError) {
      console.error('[Server] Users fetch error:', {
        message: fetchError.message,
        status: fetchError.status,
        name: fetchError.name
      });
      throw fetchError;
    }
    
    users = data.users.map(user => ({
      id: user.id,
      email: user.email || 'No email',
      created_at: user.created_at
    }));
    
    console.log(`[Server] Successfully fetched ${users.length} users`);
  } catch (e) {
    const err = e as any;
    error = err.message || "Failed to fetch users";
    errorDetails = JSON.stringify({
      message: err.message,
      status: err.status,
      code: err.code,
      details: err.details
    }, null, 2);
    console.error('[Server] Users page error:', errorDetails);
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">Error: {error}</p>
          {errorDetails && (
            <pre className="mt-2 text-xs text-red-700 overflow-auto">{errorDetails}</pre>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Users</h1>
      <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
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
