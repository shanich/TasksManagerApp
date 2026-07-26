import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { hasAnyActiveReminder } from "@/lib/reminder";

export async function GET() {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const tasks = await prisma.task.findMany({
    where: { done: false, reminder: { active: true } },
    include: { assignee: true, reminder: true, topic: true },
  });

  const now = new Date();
  const due = tasks.filter((t) => hasAnyActiveReminder(t.reminder, t.done, now));

  return Response.json(due);
}
