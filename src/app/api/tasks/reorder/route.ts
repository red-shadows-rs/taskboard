import { NextResponse } from "next/server";

import { requireAuth } from "@/app/api/auth/utilsAuth";
import { reorderTasks, getTaskById } from "@/app/api/shared/databaseShared";
import {
  canAccessTask,
  canAccessTaskSection,
} from "@/app/api/shared/accessShared";
import { taskReorderSchema } from "@/app/api/shared/validatorsShared";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    if (user.role === "member") {
      return NextResponse.json(
        { error: "Forbidden: Only leaders and clients can reorder tasks" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const result = taskReorderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    for (const update of result.data.updates) {
      const task = await getTaskById(update.id);
      if (!(await canAccessTask(user, task))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (
        update.sectionId &&
        !(await canAccessTaskSection(user, update.sectionId))
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    await reorderTasks(result.data.updates);

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
