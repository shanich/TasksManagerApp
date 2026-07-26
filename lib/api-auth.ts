import { auth } from "@/auth";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, unauthorized: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, unauthorized: null };
}
