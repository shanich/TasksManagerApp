import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function POST(request: Request) {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const topicId = typeof body?.topicId === "string" ? body.topicId : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";

  if (!topicId || !title) {
    return Response.json(
      { error: "topicId and title are required" },
      { status: 400 }
    );
  }

  const task = await prisma.task.create({
    data: { topicId, title },
    include: { assignee: true, reminder: true },
  });

  return Response.json(task, { status: 201 });
}
