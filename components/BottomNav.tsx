"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const items = [
  { href: "/", label: "Topics", icon: "🏠" },
  { href: "/today", label: "Today", icon: "📅" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="sticky bottom-0 border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/" || pathname.startsWith("/topics")
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 text-xs ${
                active ? "text-neutral-900 font-medium" : "text-neutral-400"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex flex-col items-center gap-0.5 px-4 py-1 text-xs text-neutral-400"
        >
          <span className="text-lg leading-none">👤</span>
          {session?.user?.name ?? "Sign out"}
        </button>
      </div>
    </nav>
  );
}
