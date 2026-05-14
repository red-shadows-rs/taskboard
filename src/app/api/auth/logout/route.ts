import { NextResponse } from "next/server";

import { logout } from "@/app/api/auth/utilsAuth";

export async function POST() {
  try {
    await logout();
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
