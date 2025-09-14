"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import SignOutButton from "@/components/auth/SignOutButton";

export default function DashboardPage() {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">You logged in successfully!</h1>
      <SignOutButton />
    </div>
  );
}
