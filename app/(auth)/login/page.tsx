"use client";

import SignInForm from "@/components/auth/SignInForm";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <SignInForm />
        </CardContent>
      </Card>
    </main>
  );
}