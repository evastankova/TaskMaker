"use client";

import SignOutButton from "@/components/auth/SignOutButton";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function AdminPage() {
  const {loading} = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Hello Admin! You logged in successfully!</h1>
      <SignOutButton />
    </div>
  );
}
