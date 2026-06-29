import { cookies } from "next/headers";

export async function isAuthenticated(): Promise<boolean> {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (hasClerk) {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return Boolean(userId);
  }

  const cookieStore = await cookies();
  return cookieStore.get("probe_session")?.value === "demo";
}
