// components/app-sidebar-shell.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';

import SignOutButton from "@/components/auth/SignOutButton";
import { Button } from "@/components/ui/button"
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/themeToggle';

type Profile = { id: string; email: string | null; role_id: number | null };
type RoleRow = { role: string };

function useUserInfo() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('email, role_id')
        .eq('id', user.id)
        .single();

      if (pErr || !profile) {
        setError(pErr?.message ?? 'Profile not found');
        setLoading(false);
        return;
      }

      setEmail(profile.email ?? user.email ?? null);

      if (profile.role_id != null) {
        const { data: r, error: rErr } = await supabase
          .from('roles')
          .select('role')
          .eq('id', profile.role_id)
          .single();
        if (rErr) setError(rErr.message);
        setRole((r as RoleRow | null)?.role ?? null);
      }

      setLoading(false);
    })();
  }, []);

  const initials = useMemo(() => {
    if (!email) return '?';
    const name = email.split('@')[0] ?? '';
    return name.slice(0, 2).toUpperCase();
  }, [email]);

  return { loading, email, role, initials, error };
}

export default function AppSidebarShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading, email, role, initials, error } = useUserInfo();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-background px-3 sm:px-4">
        {/* Menu trigger: visible on all breakpoints; hides while sheet is open */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              className={open ? 'hidden' : ''}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          {/* Sidebar as a Sheet with overlay (fades page) */}
          <SheetContent side="left" className="p-0 w-72 sm:w-96">
            

            <div className="flex h-full flex-col">
              <div className="p-4">
                <SheetHeader>
                  <SheetTitle className="text-xl">TaskMaker</SheetTitle>
                  <SheetDescription className="text-xs">Manage your tasks</SheetDescription>
                </SheetHeader>
              </div>

              <Separator />

              {/* User panel */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {loading ? 'Loading…' : email ?? '—'}
                    </div>
                    <div className="mt-1">
                      <Badge variant="secondary" className="capitalize">{role ?? 'role'}</Badge>
                    </div>
                  </div>
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>

              <Separator />

              

              <div className="mt-auto p-4 grid gap-2">
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="text-sm">Theme</span>
                  <ThemeToggle />
                </div>
                <SignOutButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* You can add right-side header actions here if needed */}
        <div className="ml-auto" />
      </header>

      {/* Page content */}
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
