"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function useRequireAuth(redirectTo = "/login") {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!session) router.replace(redirectTo);
      else setLoading(false);
    })();

    // also react to auth changes (sign out, etc.)
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session) router.replace(redirectTo);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router, redirectTo]);

  return { loading };
}