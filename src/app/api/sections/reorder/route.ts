import { NextResponse } from "next/server";
import { requireAuth } from "@/app/api/auth/utilsAuth";
import { reorderSections } from "@/app/api/shared/databaseShared";

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Invalid updates format" },
        { status: 400 },
      );
    }

    await reorderSections(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    const status =
      error instanceof Error && error.message === "Unauthorized"
        ? 401
        : error instanceof Error && error.message.includes("Forbidden")
          ? 403
          : 500;
    return NextResponse.json(
      { error: "Internal server error" },
      { status },
    );
  }
}
