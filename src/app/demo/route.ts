// ─────────────────────────────────────────────
// Taskboard - Live Demo Route Handler
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { NextResponse } from "next/server";
import { signSession } from "@/app/api/auth/utilsAuth";
import { getDemoInstance, seedDemoData } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const demo = getDemoInstance();
  seedDemoData(demo);

  const demoUser = demo.db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "demo@red-shadows-rs.com"))
    .get();

  if (!demoUser) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const sessionData = JSON.stringify({
    id: demoUser.id,
    email: demoUser.email,
    name: demoUser.name,
    role: demoUser.role,
  });

  const signedSession = signSession(sessionData);

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const baseUrl = host ? `${proto}://${host}` : request.url;

  const targetUrl = new URL("/tasks", baseUrl);
  const response = NextResponse.redirect(targetUrl, 303);

  response.cookies.set("taskboard_session", signedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  response.cookies.set("taskboard_demo", "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
