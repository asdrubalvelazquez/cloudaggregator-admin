"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminSupabase } from "@/lib/adminSupabase";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      await adminSupabase.auth.signOut();
      router.push("/login");
    };

    handleLogout();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-600">Logging out...</p>
    </div>
  );
}
