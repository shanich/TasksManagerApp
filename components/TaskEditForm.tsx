"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TaskDTO } from "@/lib/types";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function TaskEditForm({
  task,
  topicName,
  users,
}: {
  task: TaskDTO;
  topicName: string;
  users: { id: string; name: string }[];
}) {
  const router = useRouter();

  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes ?? "");
  const [assigneeId, setAssigneeId] = useState<string | null>(
    task.assignee?.id ?? null
  );

  const [emailEnabled, setEmailEnabled] = useState(
    task.reminder?.emailEnabled ?? false
  );
  const [emailTime, setEmailTime] = useState(task.reminder?.emailTime ?? "20:00");
  const initialDays = task.reminder?.emailDaysOfWeek
    ?.split(",")
    .map(Number)
    .filter((n) => !Number.isNaN(n));
  const [everyDay, setEveryDay] = useState(!initialDays || initialDays.length === 0);
  const [days, setDays] = useState<number[]>(initialDays ?? []);

  const [telegramEnabled, setTelegramEnabled] = useState(
    task.reminder?.telegramEnabled ?? false
  );
  const [telegramHours, setTelegramHours] = useState(
    task.reminder?.telegramIntervalHours ?? 3
  );

  const [saving, setSaving] = useState(false);

  function toggleDay(d: number) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  }

  async function patch(body: Record<string, unknown>) {
    return fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  function reminderPayload() {
    return {
      emailEnabled,
      emailTime: emailEnabled ? emailTime : null,
      emailDaysOfWeek: emailEnabled && !everyDay ? days : null,
      telegramEnabled,
      telegramIntervalHours: telegramEnabled ? telegramHours : null,
    };
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await patch({
      title,
      notes: notes || null,
      assigneeId,
      reminder: reminderPayload(),
    });
    setSaving(false);
    router.push(`/topics/${task.topicId}`);
    router.refresh();
  }

  async function handleMarkDone() {
    setSaving(true);
    await patch({ done: !task.done });
    setSaving(false);
    router.push(`/topics/${task.topicId}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${task.title}"?`)) return;
    setSaving(true);
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    router.push(`/topics/${task.topicId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5 p-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-700">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
        <p className="text-xs text-neutral-400">{topicName}</p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-700">Assign</label>
        <div className="flex flex-wrap gap-3">
          {users.map((u) => (
            <label key={u.id} className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="assignee"
                checked={assigneeId === u.id}
                onChange={() => setAssigneeId(u.id)}
              />
              {u.name}
            </label>
          ))}
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="assignee"
              checked={assigneeId === null}
              onChange={() => setAssigneeId(null)}
            />
            Both
          </label>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-neutral-200 p-3">
        <p className="text-sm font-medium text-neutral-700">Reminder</p>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
            />
            📧 Daily email
          </label>
          {emailEnabled && (
            <div className="ml-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Time</span>
                <input
                  type="time"
                  value={emailTime}
                  onChange={(e) => setEmailTime(e.target.value)}
                  className="rounded-lg border border-neutral-300 px-2 py-1 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={everyDay}
                    onChange={(e) => setEveryDay(e.target.checked)}
                  />
                  Every day
                </label>
                {!everyDay && (
                  <div className="flex gap-1">
                    {DAY_LABELS.map((label, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => toggleDay(i)}
                        className={`h-6 w-6 rounded-full text-[10px] ${
                          days.includes(i)
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={telegramEnabled}
              onChange={(e) => setTelegramEnabled(e.target.checked)}
            />
            📱 Telegram, recurring
          </label>
          {telegramEnabled && (
            <div className="ml-6 flex items-center gap-2 text-xs text-neutral-500">
              Every
              <input
                type="number"
                min={1}
                max={24}
                value={telegramHours}
                onChange={(e) => setTelegramHours(Number(e.target.value))}
                className="w-14 rounded-lg border border-neutral-300 px-2 py-1 text-sm text-neutral-900"
              />
              hours
            </div>
          )}
        </div>

        {(emailEnabled || telegramEnabled) && (
          <p className="text-xs text-neutral-400">
            → keeps reminding until done
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-700">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleMarkDone}
          disabled={saving}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          {task.done ? "Mark as Not Done" : "Mark as Done"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 disabled:opacity-50"
        >
          Delete
        </button>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
