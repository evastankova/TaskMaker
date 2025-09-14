"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login"); // redirect back to login
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
    >
      Sign out
    </button>
  );
}