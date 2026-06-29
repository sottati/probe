import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent } from "next/server";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PREFIXES = ["/login", "/api/auth/", "/r/", "/api/respond/", "/eve/", "/_next/", "/favicon.ico"];
const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/api/auth(.*)",
  "/r(.*)",
  "/api/respond(.*)",
  "/eve(.*)",
]);
const hasClerkConfig = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

const clerkProxy = clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return NextResponse.next();
  await auth.protect();
  return NextResponse.next();
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  if (hasClerkConfig) return clerkProxy(request, event);

  const { pathname } = request.nextUrl;
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.get("probe_session")?.value === "demo";
  if (hasSession) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
