import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const { topicId } = await params;
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      tasks: {
        orderBy: [{ done: "asc" }, { createdAt: "asc" }],
        include: { assignee: true, reminder: true },
      },
    },
  });

  if (!topic) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(topic);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const { topicId } = await params;
  await prisma.topic.delete({ where: { id: topicId } });
  return new Response(null, { status: 204 });
}
