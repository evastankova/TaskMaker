"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormData = { email: string; password: string };

export default function SignInForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
  } = useForm<FormData>({
    defaultValues: { email: "", password: "" },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const getRoleIdByName = async (name: "user" | "admin") => {
    const { data, error } = await supabase
      .from("roles")
      .select("id")
      .eq("role", name)
      .single();
    if (error || !data) throw error ?? new Error("Role not found");
    return data.id as number;
  };

  const onSubmit = async ({ email, password }: FormData) => {
    setServerError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    const user = data.user;
    if (!user) {
      setServerError("No user after login");
      return;
    }

    const { data: prof, error: pErr } = await supabase
      .from("profiles")
      .select("role_id")
      .eq("id", user.id)
      .single();
    if (pErr || !prof) {
      setServerError(pErr?.message ?? "Profile not found");
      return;
    }

    try {
      const adminId = await getRoleIdByName("admin");
      if (prof.role_id === adminId) router.replace("/admin");
      else router.replace("/dashboard");
    } catch (e: any) {
      setServerError(e?.message ?? "Failed to resolve role");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="off"
          spellCheck={false}
          {...register("email", {
            required: "Email is required",
          })}
        />
        {dirtyFields.email && errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
          spellCheck={false}
          {...register("password", {
            required: "Password is required",
          })}
        />
        {dirtyFields.password && errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Server errors */}
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Signing in..." : "Sign in"}
      </Button>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => router.push("/signup")}
      >
        No account yet? Sign up here
      </Button>
    </form>
  );
}
