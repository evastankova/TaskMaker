"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormData = { 
  email: string; 
  password: string 
};

type ProfileWithRole = {
  role_id: number;
  roles: {
    role: string;
  };
};


export default function SignUpForm() {
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { email: "", password: "" },
  });

  const ensureProfile = async (userId: string, email:string) => {
    const {data: role, error: roleError} = await supabase 
        .from("roles")
        .select("id")
        .eq("role", "user")
        .single();
      if (roleError) throw roleError;

      const { error: upsertErr } = await supabase.from("profiles").upsert({
        id: userId,
        email,
        role_id: role.id, // todo: change if no default role 
      });
    if (upsertErr) throw upsertErr;
  }

  const onSubmit = async ({ email, password }: FormData) => {
    setServerError("");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    const user = data.user;
    const session  = data.session;

    if (!user || !session) {
      setServerError("Sign-up succeeded but no session is active.");
      return;
    }

    try {
      await ensureProfile(user.id, user.email ?? email);
    } catch (e: any) {
      setServerError(e?.message ?? "Failed to create profile");
      return;
    }

    const { data: prof } = await supabase
      .from("profiles")
      .select("role_id, roles:role_id(role)")
      .eq("id", user.id)
      .single<ProfileWithRole>();

    window.location.assign(prof?.roles?.role === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

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
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create account"}
      </Button>
    </form>
  );
}