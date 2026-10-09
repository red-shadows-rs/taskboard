import { NextResponse } from "next/server";

import { requireAuth } from "@/app/api/auth/utilsAuth";
import {
  reorderSections,
  getSectionById,
} from "@/app/api/shared/databaseShared";
import { canAccessSection } from "@/app/api/shared/accessShared";
import { sectionReorderSchema } from "@/app/api/shared/validatorsShared";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    if (user.role === "member") {
      return NextResponse.json(
        { error: "Forbidden: Only leaders and clients can reorder sections" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const result = sectionReorderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    for (const update of result.data.updates) {
      const section = await getSectionById(update.id);
      if (!(await canAccessSection(user, section))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    await reorderSections(result.data.updates);

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
