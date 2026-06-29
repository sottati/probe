import { NextResponse } from "next/server";

export async function GET() {
  const storeMode = process.env.PROBE_STORE === "postgres" ? "postgres" : "local-json";

  return NextResponse.json({
    storeMode,
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    clerkConfigured: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY),
    openRouterConfigured: Boolean(process.env.OPENROUTER_API_KEY),
    eveMounted: true,
  });
}
