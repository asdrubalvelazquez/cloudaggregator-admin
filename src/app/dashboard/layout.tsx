import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        </div>
        <nav className="px-4 space-y-1">
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/users"
            className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            Users
          </Link>
          <Link
            href="/dashboard/clouds"
            className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            Clouds
          </Link>
          <Link
            href="/dashboard/billing"
            className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            Billing
          </Link>
          <Link
            href="/dashboard/system"
            className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            System
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
