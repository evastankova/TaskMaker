"use client";

import SignUpForm from "@/components/auth/SignUpForm";
import { Card, CardContent } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-2xl font-bold">Create account</h1>
          <SignUpForm />
        </CardContent>
      </Card>
    </main>
  );
}