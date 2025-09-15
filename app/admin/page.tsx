// app/admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- Types ---
type Profile = { id: string; email: string | null };
type StatusRow = { id: number; name: string }; // your statuses table now uses `name`
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
  // current user (for created_by)
  const [uid, setUid] = useState<string | null>(null);

  // dropdown data
  const [users, setUsers] = useState<Profile[]>([]);
  const [statuses, setStatuses] = useState<StatusRow[]>([]);

  // tasks
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusId, setStatusId] = useState<number | undefined>(undefined);
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [deadlineDate, setDeadlineDate] = useState(""); // "YYYY-MM-DD"

  // --- Filters ---
  const [assigneeFilter, setAssigneeFilter] = useState<"all" | "unassigned" | string>("all");
  const [deadlineFilter, setDeadlineFilter] = useState<"all" | "today" | "overdue">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | number>("all");

  const router = useRouter();

  // resolve labels without joins
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
    })();
  }, []);

  // load options + tasks
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");

      // statuses
      const { data: sts, error: stsErr } = await supabase
        .from("statuses")
        .select("id, name")
        .order("id", { ascending: true });
      if (stsErr) setError(stsErr.message);
      else setStatuses(sts ?? []);

      // users (profiles)
      const { data: ppl, error: pplErr } = await supabase.from("profiles").select("id, email");
      if (pplErr) setError(pplErr.message);
      else setUsers(ppl ?? []);

      // tasks (no joins, just raw ids)
      const { data: tsk, error: tErr } = await supabase
        .from("tasks")
        .select("id, title, description, deadline, created_by, status_id, assignee")
        .order("created_at", { ascending: false }); // if you don't have created_at, switch to .order("id", { ascending: false })

      if (tErr) setError(tErr.message);
      else setTasks((tsk ?? []) as TaskRow[]);

      setLoading(false);
    })();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDeadlineDate("");
    setStatusId(undefined);
    setAssigneeId(undefined);
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) {
      setError("No current user.");
      return;
    }
    if (!title.trim() || !statusId) {
      setError("Title and status are required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload: Partial<TaskRow> = {
      title: title.trim(),
      description: description.trim() || null,
      status_id: statusId!,
      assignee: assigneeId || null,
      created_by: uid,
      deadline: deadlineDate || null, // date only
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

  const userOptions = useMemo(
    () =>
      users
        .slice()
        .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""))
        .map((u) => ({ value: u.id, label: u.email ?? u.id })),
    [users]
  );

  const statusOptions = useMemo(
    () => statuses.map((s) => ({ value: s.id, label: s.name })),
    [statuses]
  );

  // --- Date helpers for date-only strings ("YYYY-MM-DD") ---
  const todayString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const isOverdue = (dateStr: string | null) => {
    if (!dateStr) return false;
    return dateStr < todayString();
  };

  const isDueToday = (dateStr: string | null) => {
    if (!dateStr) return false;
    return dateStr === todayString();
  };

  // --- Apply filters (client-side) ---
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // assignee filter
      if (assigneeFilter === "unassigned" && t.assignee) return false;
      if (assigneeFilter !== "all" && assigneeFilter !== "unassigned") {
        if (t.assignee !== assigneeFilter) return false;
      }

      // deadline filter
      if (deadlineFilter === "today" && !isDueToday(t.deadline)) return false;
      if (deadlineFilter === "overdue" && !isOverdue(t.deadline)) return false;

      // status filter
      if (statusFilter !== "all" && t.status_id !== statusFilter) return false;

      return true;
    });
  }, [tasks, assigneeFilter, deadlineFilter, statusFilter]);

  const clearFilters = () => {
    setAssigneeFilter("all");
    setDeadlineFilter("all");
    setStatusFilter("all");
  };

  // --- Sign out ---
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-10">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Admin — Manage Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Create tasks, assign to users, delete tasks, and filter what you see.
          </p>
        </div>
        <Button variant="destructive" onClick={handleSignOut}>
          Sign Out
        </Button>
      </header>

      {/* Create form */}
      <section className="rounded-2xl border p-4 space-y-4">
        <h2 className="text-lg font-medium">Create a new task</h2>

        <form onSubmit={createTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Implement login"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              className="border rounded-md h-10 px-3"
              value={statusId ?? ""}
              onChange={(e) => setStatusId(e.target.value ? Number(e.target.value) : undefined)}
              required
            >
              <option value="">Select status</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="border rounded-md w-full min-h-[90px] p-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assign to</Label>
            <select
              id="assignee"
              className="border rounded-md h-10 px-3"
              value={assigneeId ?? ""}
              onChange={(e) => setAssigneeId(e.target.value || undefined)}
            >
              <option value="">Unassigned</option>
              {userOptions.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (date only)</Label>
            <Input id="deadline" type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={saving || !uid}>
              {saving ? "Creating…" : "Create task"}
            </Button>
          </div>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </section>

      {/* Filters */}
      <section className="rounded-2xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Filters</h2>
          <Button variant="secondary" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Assignee filter */}
          <div className="space-y-1">
            <Label htmlFor="f-assignee">Assignee</Label>
            <select
              id="f-assignee"
              className="border rounded-md h-10 px-3 w-full"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="unassigned">Unassigned</option>
              {userOptions.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          {/* Deadline filter */}
          <div className="space-y-1">
            <Label htmlFor="f-deadline">Deadline</Label>
            <select
              id="f-deadline"
              className="border rounded-md h-10 px-3 w-full"
              value={deadlineFilter}
              onChange={(e) => setDeadlineFilter(e.target.value as "all" | "today" | "overdue")}
            >
              <option value="all">All</option>
              <option value="today">Due Today</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="space-y-1">
            <Label htmlFor="f-status">Status</Label>
            <select
              id="f-status"
              className="border rounded-md h-10 px-3 w-full"
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
        <h2 className="text-lg font-medium">All tasks</h2>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-sm text-muted-foreground">No tasks match your filters.</div>
        ) : (
          <ul className="divide-y rounded-2xl border">
            {filteredTasks.map((t) => (
              <li key={t.id} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-medium">{t.title}</div>
                  {t.description && <div className="text-sm text-muted-foreground">{t.description}</div>}
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}