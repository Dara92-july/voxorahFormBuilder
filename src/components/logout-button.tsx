
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError("Unable to log out. Please try again.");
      setLoading(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-300 dark:hover:bg-red-950 dark:hover:text-red-400"
      >
        {loading ? (
          <LoaderCircle size={19} className="animate-spin" />
        ) : (
          <LogOut size={19} />
        )}

        {loading ? "Logging out..." : "Logout"}
      </button>

      {error && (
        <p role="alert" className="mt-2 px-3 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
