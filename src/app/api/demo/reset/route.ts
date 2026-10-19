// ─────────────────────────────────────────────
// Taskboard - Demo Reset Route Handler
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { NextResponse } from "next/server";
import { resetDemoDatabase } from "@/db";

export async function POST(): Promise<NextResponse> {
  try {
    resetDemoDatabase();
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reset demo";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
