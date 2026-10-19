// ─────────────────────────────────────────────
// Taskboard - Security Proxy Middleware
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function proxy(request: NextRequest) {
  if (MUTATING_METHODS.has(request.method)) {
    const origin = request.headers.get("origin");

    if (origin) {
      const host = request.headers.get("host");

      try {
        if (!host || new URL(origin).host !== host) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
