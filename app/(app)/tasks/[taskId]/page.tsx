import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TaskEditForm from "@/components/TaskEditForm";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;

  const [task, users] = await Promise.all([
    prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: true, reminder: true, topic: true },
    }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!task) notFound();

  return (
    <div className="flex flex-col">
      <header className="flex items-center gap-2 border-b border-neutral-200 bg-white px-4 py-3">
        <Link href={`/topics/${task.topicId}`} className="text-neutral-500">
          ←
        </Link>
        <h1 className="truncate text-lg font-semibold">{task.title}</h1>
      </header>

      <TaskEditForm task={task} topicName={task.topic.name} users={users} />
    </div>
  );
}
