// ─────────────────────────────────────────────
// Taskboard - Demo Exit Route Handler
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("taskboard_session");
  response.cookies.delete("taskboard_demo");
  return response;
}
