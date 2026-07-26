import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Providers from "@/components/Providers";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <Providers>
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-1 flex-col bg-neutral-50">
        <div className="flex-1">{children}</div>
        <BottomNav />
      </div>
    </Providers>
  );
}
