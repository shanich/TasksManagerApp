import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

type ReminderInput = {
  emailEnabled?: boolean;
  emailTime?: string | null;
  emailDaysOfWeek?: number[] | null;
  telegramEnabled?: boolean;
  telegramIntervalHours?: number | null;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const { taskId } = await params;
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignee: true, reminder: true, topic: true },
  });

  if (!task) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(task);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const { taskId } = await params;
  const body = await request.json();

  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    include: { reminder: true },
  });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const taskData: {
    title?: string;
    notes?: string | null;
    assigneeId?: string | null;
    done?: boolean;
  } = {};

  if (typeof body.title === "string") taskData.title = body.title.trim();
  if (body.notes === null || typeof body.notes === "string") {
    taskData.notes = body.notes;
  }
  if (body.assigneeId === null || typeof body.assigneeId === "string") {
    taskData.assigneeId = body.assigneeId;
  }
  if (typeof body.done === "boolean") taskData.done = body.done;

  const reminderInput: ReminderInput | undefined = body.reminder;

  const task = await prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id: taskId },
      data: taskData,
    });

    // Marking done stops reminders; reopening reactivates an existing reminder.
    if (typeof taskData.done === "boolean" && existing.reminder) {
      await tx.reminder.update({
        where: { taskId },
        data: { active: !taskData.done },
      });
    }

    if (reminderInput) {
      const willBeDone = taskData.done ?? existing.done;
      await tx.reminder.upsert({
        where: { taskId },
        create: {
          taskId,
          active: !willBeDone,
          emailEnabled: reminderInput.emailEnabled ?? false,
          emailTime: reminderInput.emailTime ?? null,
          emailDaysOfWeek: reminderInput.emailDaysOfWeek?.length
            ? reminderInput.emailDaysOfWeek.join(",")
            : null,
          telegramEnabled: reminderInput.telegramEnabled ?? false,
          telegramIntervalHours: reminderInput.telegramIntervalHours ?? null,
        },
        update: {
          emailEnabled: reminderInput.emailEnabled ?? false,
          emailTime: reminderInput.emailTime ?? null,
          emailDaysOfWeek: reminderInput.emailDaysOfWeek?.length
            ? reminderInput.emailDaysOfWeek.join(",")
            : null,
          telegramEnabled: reminderInput.telegramEnabled ?? false,
          telegramIntervalHours: reminderInput.telegramIntervalHours ?? null,
        },
      });
    }

    return tx.task.findUniqueOrThrow({
      where: { id: taskId },
      include: { assignee: true, reminder: true, topic: true },
    });
  });

  return Response.json(task);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const { taskId } = await params;
  await prisma.task.delete({ where: { id: taskId } });
  return new Response(null, { status: 204 });
}
