// app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AppSidebarShell from "@/components/appSidebar";
import BackgroundWrapper from "@/components/backgroundWrapper";

// --- Types ---
type StatusRow = { id: number; name: string };
type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null; // "YYYY-MM-DD" or null
  status_id: number;
  assignee: string | null;
  created_by: string | null;
};

type FilterKey = "all" | number;

export default function DashboardPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [statuses, setStatuses] = useState<StatusRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Filters
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  // status_id -> status name
  const statusMap = useMemo(
    () => Object.fromEntries(statuses.map((s) => [s.id, s.name])),
    [statuses]
  );
  // dropdown options
  const statusOptions = useMemo(
    () => statuses.map((s) => ({ value: s.id, label: s.name })),
    [statuses]
  );
  // counts per status (for chips)
  const statusCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const t of tasks) counts[t.status_id] = (counts[t.status_id] ?? 0) + 1;
    return counts;
  }, [tasks]);

  const displayName = userEmail ? userEmail.split("@")[0] : "";

  // 1) current user
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUid(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? null);
    })();
  }, []);

  // 2) load statuses + my tasks
  useEffect(() => {
    if (!uid) return;
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

      // tasks assigned to me (no joins)
      const { data: tsk, error: tErr } = await supabase
        .from("tasks")
        .select(
          "id, title, description, deadline, created_by, status_id, assignee"
        )
        .eq("assignee", uid)
        .order("created_at", { ascending: false });

      if (tErr) setError(tErr.message);
      else setTasks((tsk ?? []) as TaskRow[]);

      setLoading(false);
    })();
  }, [uid]);

  // Derived: tasks after filter
  const filteredTasks = useMemo(() => {
    if (activeFilter === "all") return tasks;
    return tasks.filter((t) => t.status_id === activeFilter);
  }, [tasks, activeFilter]);

  async function updateTaskStatus(taskId: string, newStatusId: number) {
    setError("");
    setSavingId(taskId);

    // optimistic update
    const prev = tasks;
    setTasks((curr) =>
      curr.map((t) => (t.id === taskId ? { ...t, status_id: newStatusId } : t))
    );

    const { error: upErr } = await supabase
      .from("tasks")
      .update({ status_id: newStatusId })
      .eq("id", taskId);

    setSavingId(null);

    if (upErr) {
      setTasks(prev); // rollback
      setError(upErr.message);
    }
  }

  if (!uid) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="text-center space-y-2">
          <p className="text-lg">Please log in to view your tasks.</p>
        </div>
      </main>
    );
  }

  return (
    <BackgroundWrapper image="/coffee_book.jpg">
    <AppSidebarShell>
      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-4xl font-semibold text-white">Your tasks, {displayName}</h1>
        </header>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Filter bar */}
        <section className="flex flex-wrap items-center gap-4 text-white">
          <FilterChip
            label={`All (${tasks.length})`}
            active={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
          />
          {statuses.map((s) => (
            <FilterChip
              key={s.id}
              label={`${s.name} (${statusCounts[s.id] ?? 0})`}
              active={activeFilter === s.id}
              onClick={() => setActiveFilter(s.id)}
            />
          ))}
        </section>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-lg md:text-xl text-muted-foreground text-white">
            No tasks here!
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
                      <div className="text-sm text-muted-foreground">
                        {t.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Current status:{" "}
                      <span className="font-medium">
                        {statusMap[t.status_id] ?? "—"}
                      </span>
                      {t.deadline ? (
                        <>
                          {" • "}
                          Due:{" "}
                          <span className="font-medium">
                            {new Date(t.deadline + "T00:00:00").toLocaleDateString()}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* Status dropdown (styled like in Admin) */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Status</label>
                    <select
                      className="rounded-md h-9 px-2 bg-white border border-gray-300"
                      value={t.status_id}
                      onChange={(e) => updateTaskStatus(t.id, Number(e.target.value))}
                      disabled={savingId === t.id}
                      aria-label="Change status"
                    >
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppSidebarShell>
    </BackgroundWrapper>
  );
}

/** Small filter chip button */
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-5 py-2 text-sm",
        active ? "bg-black text-white border-black" : "hover:bg-white hover:text-black hover:border-white"
      ].join(" ")}
    >
      {label}
    </button>
  );
}