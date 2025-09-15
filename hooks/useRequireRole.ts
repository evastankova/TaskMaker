"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/**
 * Ensures the user is authenticated AND has the required role.
 * - If not logged in -> redirect to /login
 * - If logged in but missing the role -> redirectToIfUnauthorized (default: /dashboard)
 * - While checking -> returns { loading: true }
 */
export function useRequireRole(
  requiredRole: "admin" | "user",
  redirectToIfUnauthorized = "/dashboard"
) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // 1) must be logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!session) {
        router.replace("/login");
        return;
      }

      // 2) fetch profile role_id
      const userId = session.user.id;
      const { data: prof, error: pErr } = await supabase
        .from("profiles")
        .select("role_id")
        .eq("id", userId)
        .single();

      if (!mounted) return;

      if (!prof) {
        router.replace(redirectToIfUnauthorized);   // NOT /login
        return;
      }

      if (pErr) {
        router.replace("/login");
        return;
      }

      // 3) resolve the role name for that role_id
      // (could cache this, but fine for now)
      const { data: roleRow, error: rErr } = await supabase
        .from("roles")
        .select("id, name")
        .eq("id", prof.role_id)
        .single();

      if (!mounted) return;

      if (!roleRow) {
        router.replace(redirectToIfUnauthorized);   // NOT /login
        return;
      }

      if (rErr) {
        router.replace("/login");
        return;
      }

      // 4) authorize by role
      if (roleRow.name !== requiredRole) {
        router.replace(redirectToIfUnauthorized);
        return;
      }

      setLoading(false);
    })();

    // react to sign-outs in this tab
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [requiredRole, redirectToIfUnauthorized, router]);

  return { loading };
}