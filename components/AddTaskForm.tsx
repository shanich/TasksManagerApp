"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddTaskForm({ topicId }: { topicId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, title }),
    });
    setSaving(false);
    setTitle("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
      >
        + Task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Buy dog food"
        className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-500"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm text-neutral-500"
      >
        Cancel
      </button>
    </form>
  );
}
