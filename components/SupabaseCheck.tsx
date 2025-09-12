"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SupabaseCheck() {
  const [status, setStatus] = useState<string>("");

  const check = async () => {
    setStatus("Checking...");
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      setStatus(`❌ Supabase error: ${error.message}`);
      return;
    }
    setStatus(
      `✅ Supabase reachable. Session: ${data.session ? "present" : "none"}`
    );
  };

  return (
    <div className="mt-6">
      <button
        onClick={check}
        className="rounded-lg px-4 py-2 border hover:bg-gray-50"
      >
        Check Supabase
      </button>
      {status && <p className="mt-3 text-sm text-gray-700">{status}</p>}
    </div>
  );
}