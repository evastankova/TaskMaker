"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

type Role = "admin" | "user" | null;

type AuthContextType = {
  user: User | null;
  role: Role;
  loading: boolean;
  signOut: () => Promise<void>; 
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  // 🔧 FUTURE: replace with a DB (profiles) fetch if you store roles there.
  const deriveRole = async (u: User | null): Promise<Role> => {
    if (!u) return null;
    return (u.app_metadata?.role as Role) ?? "user";
  };

  useEffect(() => {
    let unsub: (() => void) | undefined;

    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      setRole(await deriveRole(u));
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setRole(await deriveRole(u));
    });

    unsub = () => listener.subscription.unsubscribe();
    return () => unsub?.();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Consume anywhere: const { user, role, loading, signOut } = useAuth()
export const useAuth = () => useContext(AuthContext);