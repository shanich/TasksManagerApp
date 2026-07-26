"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TaskDTO } from "@/lib/types";
import { formatReminderSummary, isEmailOverdue } from "@/lib/reminder";

export default function TaskListItem({ task }: { task: TaskDTO }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const summary = formatReminderSummary(task.reminder);
  const overdue = isEmailOverdue(task.reminder, task.done, new Date());

  async function toggleDone() {
    setBusy(true);
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    });
    setBusy(false);
    router.refresh();
  }

  async function handleDelete() {
    setMenuOpen(false);
    if (!confirm(`Delete "${task.title}"?`)) return;
    setBusy(true);
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <button
        onClick={toggleDone}
        disabled={busy}
        aria-label={task.done ? "Mark as not done" : "Mark as done"}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
          task.done
            ? "border-neutral-900 bg-neutral-900 text-white"
            : "border-neutral-300"
        }`}
      >
        {task.done ? "✓" : ""}
      </button>

      <Link href={`/tasks/${task.id}`} className="min-w-0 flex-1">
        <div
          className={`text-sm font-medium ${
            task.done ? "text-neutral-400 line-through" : "text-neutral-900"
          }`}
        >
          {task.title}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
          {task.assignee && (
            <span className="text-neutral-500">{task.assignee.name}</span>
          )}
          {task.done ? (
            <span className="text-neutral-400">(done)</span>
          ) : (
            summary && (
              <span className={overdue ? "font-medium text-red-600" : "text-neutral-500"}>
                {summary}
              </span>
            )
          )}
        </div>
      </Link>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="px-2 py-1 text-neutral-400"
          aria-label="Task menu"
        >
          ⋮
        </button>
        {menuOpen && (
          <div className="absolute right-0 z-10 mt-1 w-32 rounded-lg border border-neutral-200 bg-white py-1 text-sm shadow-md">
            <Link
              href={`/tasks/${task.id}`}
              className="block px-3 py-1.5 hover:bg-neutral-50"
              onClick={() => setMenuOpen(false)}
            >
              Edit
            </Link>
            <button
              onClick={toggleDone}
              className="block w-full px-3 py-1.5 text-left hover:bg-neutral-50"
            >
              {task.done ? "Mark not done" : "Mark done"}
            </button>
            <button
              onClick={handleDelete}
              className="block w-full px-3 py-1.5 text-left text-red-600 hover:bg-neutral-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
