import { NextResponse } from "next/server";

import { requireAuth } from "@/app/api/auth/utilsAuth";
import { reorderUsers } from "@/app/api/shared/databaseShared";
import { userReorderSchema } from "@/app/api/shared/validatorsShared";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    if (user.role !== "leader") {
      return NextResponse.json(
        { error: "Forbidden: Only leaders can reorder users" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const result = userReorderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    await reorderUsers(result.data.updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    const status =
      error instanceof Error && error.message === "Unauthorized"
        ? 401
        : error instanceof Error && error.message.includes("Forbidden")
          ? 403
          : 500;
    return NextResponse.json({ error: "Internal server error" }, { status });
  }
}
