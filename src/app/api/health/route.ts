// ─────────────────────────────────────────────
// TaskBoard - Health Check Route Handler
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getMainInstance } from "@/db";

export async function GET(): Promise<NextResponse> {
  try {
    const main = getMainInstance();
    main.sqlite.prepare("SELECT 1").get();
    return NextResponse.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database error";
    return NextResponse.json(
      { status: "error", error: message },
      { status: 503 },
    );
  }
}
