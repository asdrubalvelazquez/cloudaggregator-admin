import { adminSupabaseServer } from "@/lib/adminSupabaseServer";

export default async function BillingPage() {
  // NOTA: Tabla 'subscriptions' aún no existe en el schema de Supabase
  // TODO: Crear tabla antes de habilitar esta funcionalidad
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
      <div className="mt-4 rounded-md bg-yellow-50 p-4">
        <p className="text-sm font-semibold text-yellow-800">Configuración pendiente</p>
        <p className="mt-2 text-xs text-yellow-700">
          La tabla &apos;subscriptions&apos; no existe aún en el schema de Supabase.
          Ejecutar migración SQL para crear estructura.
        </p>
      </div>
    </div>
  );
}
