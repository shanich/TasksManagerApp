import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { tasks: { where: { done: false } } } },
    },
  });

  return Response.json(
    topics.map((t) => ({
      id: t.id,
      name: t.name,
      openCount: t._count.tasks,
    }))
  );
}

export async function POST(request: Request) {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const topic = await prisma.topic.create({ data: { name } });
  return Response.json(topic, { status: 201 });
}
