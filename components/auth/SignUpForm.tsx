"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormData = { email: string; password: string; role: "user" | "admin" };

export default function SignUpForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { email: "", password: "", role: "user" },
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

    // redirect based on chosen role
    window.location.assign(role === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email", {
            required: "Email is required",
            pattern: { value: /^\S+@\S+$/i, message: "Enter a valid email" },
          })}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Minimum 6 characters"
          {...register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "At least 6 characters" },
          })}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Role choice */}
      <div className="space-y-2">
        <Label>Role</Label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="user"
              {...register("role")}
              defaultChecked
            />
            <span>User</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="admin" {...register("role")} />
            <span>Admin</span>
          </label>
        </div>
      </div>

      {/* Errors */}
      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      {/* Submit */}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create account"}
      </Button>

      {/* Log in redirect */}
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => router.push("/login")}
      >
        Log in
      </Button>
    </form>
  );
}
