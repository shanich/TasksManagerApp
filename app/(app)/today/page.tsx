import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hasAnyActiveReminder, formatReminderSummary } from "@/lib/reminder";

export default async function TodayPage() {
  const tasks = await prisma.task.findMany({
    where: { done: false, reminder: { active: true } },
    include: { assignee: true, reminder: true, topic: true },
    orderBy: { createdAt: "asc" },
  });

  const now = new Date();
  const due = tasks.filter((t) => hasAnyActiveReminder(t.reminder, t.done, now));

  return (
    <div className="flex flex-col">
      <header className="border-b border-neutral-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold">📅 Today</h1>
      </header>

      <ul className="divide-y divide-neutral-200 bg-white">
        {due.map((task) => (
          <li key={task.id}>
            <Link
              href={`/tasks/${task.id}`}
              className="flex items-start justify-between gap-3 px-4 py-3 active:bg-neutral-50"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-neutral-900">
                  {task.title}
                </div>
                <div className="text-xs text-neutral-500">{task.topic.name}</div>
              </div>
              <div className="shrink-0 text-right text-xs text-neutral-500">
                <div>{formatReminderSummary(task.reminder)}</div>
                {task.assignee && <div>{task.assignee.name}</div>}
                {!task.assignee && <div>both</div>}
              </div>
            </Link>
          </li>
        ))}
        {due.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-neutral-400">
            Nothing due today 🎉
          </li>
        )}
      </ul>
    </div>
  );
}
