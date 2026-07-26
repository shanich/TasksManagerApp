"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddTopicForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    setName("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
      >
        + Topic
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Groceries"
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
