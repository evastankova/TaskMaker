"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BackgroundWrapper from "../backgroundWrapper";

type FormData = { email: string; password: string; role: "user" | "admin" };

export default function SignUpForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
  } = useForm<FormData>({
    defaultValues: { email: "", password: "", role: "user" },
    mode: "onChange",        // ✅ validate as user types
    reValidateMode: "onChange",
  });

  // helper to look up role_id from roles table
  const getRoleIdByName = async (name: "user" | "admin") => {
    const { data, error } = await supabase
      .from("roles")
      .select("id")
      .eq("role", name)
      .single();
    if (error || !data) throw error ?? new Error("Role not found");
    return data.id as number;
  };

  const onSubmit = async ({ email, password, role }: FormData) => {
    setServerError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    const user = data.user;
    const session = data.session;
    if (!user || !session) {
      setServerError("Sign-up succeeded but no active session.");
      return;
    }

    try {
      const role_id = await getRoleIdByName(role);
      const { error: upsertErr } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email ?? email,
        role_id,
      });
      if (upsertErr) throw upsertErr;
    } catch (e: any) {
      setServerError(e?.message ?? "Failed to create profile");
      return;
    }

    window.location.assign(role === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-4">
      {/* Decoy fields to suppress password managers */}
      <input
        type="text"
        name="fake-username"
        autoComplete="username"
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        data-1p-ignore
        data-lpignore="true"
      />
      <input
        type="password"
        name="fake-password"
        autoComplete="new-password"
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        data-1p-ignore
        data-lpignore="true"
      />

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="off"
          inputMode="email"
          spellCheck={false}
          autoCapitalize="none"
          aria-invalid={!!errors.email || undefined}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Enter a valid email",
            },
          })}
        />
        {/* Show email error only after field is edited; disappears immediately when valid */}
        {dirtyFields.email && errors.email && (
          <p className="text-lg text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Minimum 6 characters"
          autoComplete="new-password"
          spellCheck={false}
          aria-invalid={!!errors.password || undefined}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "At least 6 characters" },
          })}
        />
        {/* Show password error only after field is edited; disappears as soon as length >= 6 */}
        {dirtyFields.password && errors.password && (
          <p className="text-lg text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label className="text-white">Role</Label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" value="user" {...register("role")} defaultChecked />
            <span className="text-white">User</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="admin" {...register("role")} />
            <span className="text-white">Admin</span>
          </label>
        </div>
      </div>

      {serverError && <p className="text-lg text-destructive">{serverError}</p>}

      <Button type="submit" disabled={loading} className="w-full" variant="outlineWhite">
        {loading ? "Creating..." : "Create account"}
      </Button>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => router.push("/login")}
      >
        Already have an account? Log in here
      </Button>
    </form>
  );
}
