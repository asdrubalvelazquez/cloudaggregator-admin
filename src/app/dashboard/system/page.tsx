import { adminSupabaseServer } from "@/lib/adminSupabaseServer";

export default async function SystemPage() {
  let metrics = {
    totalUsers: 0,
  };
  let error: string | null = null;
  let errorDetails: string | null = null;

  try {
    // Solo contamos auth.users - otras tablas no existen aún
    const { data, error: fetchError } = await adminSupabaseServer.auth.admin.listUsers();

    if (fetchError) {
      console.error('[Server] Users count error:', {
        message: fetchError.message,
        status: fetchError.status
      });
      throw fetchError;
    }

    metrics.totalUsers = data.users.length;
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
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">System</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-1">
        <div className="overflow-hidden rounded-lg bg-white px-6 py-8 shadow">
          <dt className="text-sm font-medium text-gray-500">Total Users</dt>
          <dd className="mt-2 text-3xl font-semibold text-gray-900">
            {metrics.totalUsers}
          </dd>
        </div>
      </div>
      <div className="mt-4 rounded-md bg-yellow-50 p-4">
        <p className="text-sm font-semibold text-yellow-800">Configuración pendiente</p>
        <p className="mt-2 text-xs text-yellow-700">
          Las tablas &apos;clouds&apos; y &apos;subscriptions&apos; no existen aún en el schema.
          Solo se muestra el conteo de usuarios de auth.users.
        </p>
      </div>
    </div>
  );
}
