"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminSupabase } from "@/lib/adminSupabase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await adminSupabase.auth.getSession();
      
      if (!data.session) {
        router.push("/login");
        return;
      }

      // Check if user is in admin allowlist
      const { data: adminUser, error } = await adminSupabase
        .from("admin_users")
        .select("id")
        .eq("id", data.session.user.id)
        .single();

      if (error || !adminUser) {
        await adminSupabase.auth.signOut();
        router.push("/login?error=not_authorized");
        return;
      }

      setLoading(false);
    };

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

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
          <Link
            href="/dashboard/debug"
            className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            Debug
          </Link>
          <Link
            href="/logout"
            className="block px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
          >
            Logout
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
