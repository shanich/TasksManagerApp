import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AddTopicForm from "@/components/AddTopicForm";

export default async function TopicsPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { tasks: { where: { done: false } } } } },
  });

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold">🏠 Our Tasks</h1>
        <AddTopicForm />
      </header>

      <ul className="divide-y divide-neutral-200 bg-white">
        {topics.map((topic) => (
          <li key={topic.id}>
            <Link
              href={`/topics/${topic.id}`}
              className="flex items-center justify-between px-4 py-3 active:bg-neutral-50"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                📁 {topic.name}
              </span>
              <span className="text-xs text-neutral-500">
                {topic._count.tasks} open
              </span>
            </Link>
          </li>
        ))}
        {topics.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-neutral-400">
            No topics yet — add one to get started.
          </li>
        )}
      </ul>
    </div>
  );
}
