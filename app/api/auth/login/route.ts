import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const next = String(form.get("next") ?? "/dashboard");
  const response = NextResponse.redirect(new URL(next.startsWith("/") ? next : "/", request.url));
  response.cookies.set("probe_session", "demo", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
