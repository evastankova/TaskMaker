// app/admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppSidebarShell from "@/components/appSidebar";
import { Textarea } from "@/components/ui/textarea";
import BackgroundWrapper from "@/components/backgroundWrapper";

// --- Types ---
type Profile = { id: string; email: string | null; role_id: number | null };
type StatusRow = { id: number; name: string };
type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null; // "YYYY-MM-DD" or null
  status_id: number;
  assignee: string | null; // profiles.id or null
  created_by: string | null;
};

export default function AdminPage() {
  const [uid, setUid] = useState<string | null>(null);

  // dropdown data
  const [users, setUsers] = useState<Profile[]>([]);
  const [statuses, setStatuses] = useState<StatusRow[]>([]);
  const [adminRoleId, setAdminRoleId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // tasks
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [deadlineDate, setDeadlineDate] = useState(""); // "YYYY-MM-DD"

  // --- Filters ---
  const [assigneeFilter, setAssigneeFilter] = useState<"all" | "unassigned" | string>("all");
  const [deadlineFilter, setDeadlineFilter] = useState<"all" | "today" | "overdue">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | number>("all");

  const router = useRouter();

  const statusMap = useMemo(
    () => Object.fromEntries(statuses.map((s) => [s.id, s.name])),
    [statuses]
  );
  const userMap = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u.email ?? u.id])),
    [users]
  );

  // load current user
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUid(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? null);
    })();
  }, []);

  const displayName = userEmail ? userEmail.split("@")[0] : "Admin";

  // load options + tasks
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");

      const { data: sts, error: stsErr } = await supabase
        .from("statuses")
        .select("id, name")
        .order("id", { ascending: true });
      if (stsErr) setError(stsErr.message);
      else setStatuses(sts ?? []);

      // ⬇️ add this block before the profiles query
      const { data: adminRole, error: roleErr } = await supabase
        .from("roles")
        .select("id")
        .eq("role", "admin")
        .single();

      if (!roleErr && adminRole?.id != null) {
        setAdminRoleId(adminRole.id as number);
      }


      const { data: ppl, error: pplErr } = await supabase.from("profiles").select("id, email, role_id");
      if (pplErr) setError(pplErr.message);
      else setUsers(ppl ?? []);

      const { data: tsk, error: tErr } = await supabase
        .from("tasks")
        .select("id, title, description, deadline, created_by, status_id, assignee")
        .order("created_at", { ascending: false });

      if (tErr) setError(tErr.message);
      else setTasks((tsk ?? []) as TaskRow[]);

      setLoading(false);
    })();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDeadlineDate("");
    setAssigneeId(undefined);
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) {
      setError("No current user.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required!");
      return;
    }
    if (!assigneeId) {
      setError("The task must be assigned!");
      return;
    }

    setSaving(true);
    setError("");

    const payload: Partial<TaskRow> = {
      title: title.trim(),
      description: description.trim() || null,
      status_id: 2, // default
      assignee: assigneeId,
      created_by: uid,
      deadline: deadlineDate || null,
    };

    const { data, error: insErr } = await supabase
      .from("tasks")
      .insert(payload)
      .select("id, title, description, deadline, created_by, status_id, assignee")
      .single();

    setSaving(false);

    if (insErr) {
      setError(insErr.message);
      return;
    }

    setTasks((prev) => [data as TaskRow, ...prev]);
    resetForm();
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    const prev = tasks;
    setTasks((t) => t.filter((x) => x.id !== id)); // optimistic
    const { error: delErr } = await supabase.from("tasks").delete().eq("id", id);
    if (delErr) {
      setError(delErr.message);
      setTasks(prev); // rollback
    }
  };

  // ⬇️ replace the whole userOptions memo
  const userOptions = useMemo(
    () =>
      users
        .filter((u) => (adminRoleId == null ? true : u.role_id !== adminRoleId)) // hide admins
        .slice()
        .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""))
        .map((u) => ({ value: u.id, label: u.email ?? u.id })),
    [users, adminRoleId]
  );


  const statusOptions = useMemo(
    () => statuses.map((s) => ({ value: s.id, label: s.name })),
    [statuses]
  );

  // date helpers for filters
  const todayString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const isOverdue = (dateStr: string | null) => !!dateStr && dateStr < todayString();
  const isDueToday = (dateStr: string | null) => !!dateStr && dateStr === todayString();

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (assigneeFilter === "unassigned" && t.assignee) return false;
      if (assigneeFilter !== "all" && assigneeFilter !== "unassigned") {
        if (t.assignee !== assigneeFilter) return false;
      }
      if (deadlineFilter === "today" && !isDueToday(t.deadline)) return false;
      if (deadlineFilter === "overdue" && !isOverdue(t.deadline)) return false;
      if (statusFilter !== "all" && t.status_id !== statusFilter) return false;
      return true;
    });
  }, [tasks, assigneeFilter, deadlineFilter, statusFilter]);

  const clearFilters = () => {
    setAssigneeFilter("all");
    setDeadlineFilter("all");
    setStatusFilter("all");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <BackgroundWrapper image="/coffee_laptop.jpg">
    <AppSidebarShell>
      <main className="max-w-5xl mx-auto p-6 space-y-6 min-h-dvh">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-semibold text-white">Hello {displayName}!</h1>
            <p className="text-sm text-muted-foreground text-white">
              Create tasks and assign them to users.
            </p>
          </div>
        </header>

        {/* Create form */}
        <h1 className="text-3xl font-medium text-white">Create a new task:</h1>
        <section className="rounded-2xl border p-4">

          <form onSubmit={createTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="block text-white">Title: *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title…"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="block text-white">Description:</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description…"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee" className="block text-white">Assign to: *</Label>
              <select
                id="assignee"
                className="mt-1 w-full h-10 px-3 rounded-md bg-white border border-gray-300"
                value={assigneeId ?? ""}
                onChange={(e) => setAssigneeId(e.target.value || undefined)}
              >
                <option value="">Choose assignee</option>
                {userOptions.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="block text-white">Deadline:</Label>
              <Input
                id="deadline"
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={saving || !uid} variant="outlineWhite">
                {saving ? "Creating…" : "Create task"}
              </Button>
            </div>
          </form>

          {error && <p className="text-lg text-destructive">{error}</p>}
        </section>

        <h1 className="text-3xl font-medium text-white">All Tasks:</h1>

        {/* Filters */}
        <section className="rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-medium mb-3 text-white">Filters</h1>
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Assignee filter */}
            <div className="space-y-3">
              <Label htmlFor="f-assignee" className="block text-white">Assignee</Label>
              <select
                id="f-assignee"
                className="rounded-md h-10 px-3 w-full bg-white border border-gray-300"
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
              >
                <option value="all">All</option>
                {userOptions.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline filter */}
            <div className="space-y-3">
              <Label htmlFor="f-deadline" className="block text-white">Deadline</Label>
              <select
                id="f-deadline"
                className="rounded-md h-10 px-3 w-full bg-white border border-gray-300"
                value={deadlineFilter}
                onChange={(e) => setDeadlineFilter(e.target.value as "all" | "today" | "overdue")}
              >
                <option value="all">All</option>
                <option value="today">Due Today</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Status filter */}
            <div className="space-y-3">
              <Label htmlFor="f-status" className="block text-white">Status</Label>
              <select
                id="f-status"
                className="rounded-md h-10 px-3 w-full bg-white border border-gray-300"
                value={statusFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setStatusFilter(val === "all" ? "all" : Number(val));
                }}
              >
                <option value="all">All</option>
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Task list */}
        <section className="space-y-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-16 text-center text-lg md:text-xl text-muted-foreground text-white">
              No tasks match your filters.
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredTasks.map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-medium">{t.title}</div>
                      {t.description && (
                        <div className="text-sm text-muted-foreground">{t.description}</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Status: <span className="font-medium">{statusMap[t.status_id] ?? "—"}</span>
                        {" • "}
                        Assignee:{" "}
                        <span className="font-medium">
                          {t.assignee ? userMap[t.assignee] ?? t.assignee : "Unassigned"}
                        </span>
                        {t.deadline ? (
                          <>
                            {" • "}Due:{" "}
                            <span className="font-medium">
                              {new Date(t.deadline + "T00:00:00").toLocaleDateString()}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="destructive" onClick={() => deleteTask(t.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>


          )}
        </section>
      </main>
    </AppSidebarShell>
    </BackgroundWrapper>
  );
}