"use client";

import SignUpForm from "@/components/auth/SignUpForm";
import { Card, CardContent } from "@/components/ui/card";
import BackgroundWrapper from "@/components/backgroundWrapper";

export default function SignUpPage() {
  return (
    <BackgroundWrapper image="/desk_messy.jpg">
    <main className="min-h-screen grid place-items-center p-6">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-4xl font-bold text-white">Create account</h1>
          <SignUpForm />
        </CardContent>
    </main>
    </BackgroundWrapper>
  );
}