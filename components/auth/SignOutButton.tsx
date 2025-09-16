"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login"); // redirect back to login
  };

  return (
    <Button
      variant="destructive"
      onClick={handleSignOut}
    >
      Sign out
    </Button>
  );
}