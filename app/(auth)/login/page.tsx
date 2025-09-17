"use client";

import SignInForm from "@/components/auth/SignInForm";
import { Card, CardContent } from "@/components/ui/card";
import BackgroundWrapper from "@/components/backgroundWrapper";

export default function LoginPage() {
  return (
    <BackgroundWrapper image="/desk_messy.jpg">
    <main className="min-h-screen grid place-items-center p-6">
      
        <CardContent className="p-6 space-y-4">
          <h1 className="text-4xl font-bold text-white">Log in</h1>
          <SignInForm />
        </CardContent>
      
    </main>
    </BackgroundWrapper>
  );
}