import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddTaskForm from "@/components/AddTaskForm";
import TaskListItem from "@/components/TaskListItem";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
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

  if (!topic) notFound();

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-neutral-500">
            ←
          </Link>
          <h1 className="text-lg font-semibold">{topic.name}</h1>
        </div>
        <AddTaskForm topicId={topic.id} />
      </header>

      <ul className="divide-y divide-neutral-200 bg-white">
        {topic.tasks.map((task) => (
          <TaskListItem key={task.id} task={task} />
        ))}
        {topic.tasks.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-neutral-400">
            No tasks yet — add one to get started.
          </li>
        )}
      </ul>
    </div>
  );
}
