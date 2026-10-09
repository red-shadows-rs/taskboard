import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

import { requireAuth } from "@/app/api/auth/utilsAuth";
import {
  getTaskById,
  updateTask,
  deleteTask,
} from "@/app/api/shared/databaseShared";
import {
  canAccessTask,
  canAccessTaskSection,
} from "@/app/api/shared/accessShared";
import { taskSchema } from "@/app/api/shared/validatorsShared";
import {
  resolveAttachmentPath,
  UPLOADS_DIR,
} from "@/app/api/shared/storageShared";

import type { Task } from "@/types";
import type { NextRequest } from "next/server";

function isPathInside(target: string, base: string): boolean {
  const resolvedTarget = path.resolve(target);
  const resolvedBase = path.resolve(base);
  const relative = path.relative(resolvedBase, resolvedTarget);
  return (
    !relative.startsWith("..") &&
    !path.isAbsolute(relative) &&
    resolvedTarget.startsWith(resolvedBase + path.sep)
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const task = await getTaskById(id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!(await canAccessTask(user, task))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ task });
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const existingTask = await getTaskById(id);
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!(await canAccessTask(user, existingTask))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (user.role === "member" && !existingTask.assignedTo.includes(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const result = taskSchema.partial().safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    const updates: Partial<Task> = { ...result.data };

    if (user.role !== "leader") {
      delete updates.assigneePrices;
      delete updates.sectionId;
    } else if (
      updates.sectionId &&
      updates.sectionId !== existingTask.sectionId
    ) {
      if (!(await canAccessTaskSection(user, updates.sectionId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (updates.attachments) {
      const oldAttachments = existingTask.attachments || [];
      const newAttachments = updates.attachments;
      const removedAttachments = oldAttachments.filter(
        (attachment) => !newAttachments.includes(attachment),
      );

      if (removedAttachments.length > 0) {
        for (const attachment of removedAttachments) {
          const imageFullPath = resolveAttachmentPath(attachment);
          if (!isPathInside(imageFullPath, UPLOADS_DIR)) continue;
          try {
            await fs.unlink(imageFullPath);
          } catch (_error) {}
        }
      }
    }

    const task = await updateTask(id, updates);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const task = await getTaskById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!(await canAccessTask(user, task))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (user.role === "member") {
      return NextResponse.json(
        { error: "Forbidden: members cannot delete tasks" },
        { status: 403 },
      );
    }

    if (task.attachments && task.attachments.length > 0) {
      for (const attachment of task.attachments) {
        const imageFullPath = resolveAttachmentPath(attachment);
        if (!isPathInside(imageFullPath, UPLOADS_DIR)) continue;
        try {
          await fs.unlink(imageFullPath);
        } catch (_error) {}
      }

      try {
        const firstImagePath = task.attachments[0];
        if (firstImagePath) {
          const taskDir = path.dirname(resolveAttachmentPath(firstImagePath));
          if (!isPathInside(taskDir, UPLOADS_DIR))
            throw new Error("Invalid path");
          const files = await fs.readdir(taskDir);
          if (files.length === 0) {
            await fs.rmdir(taskDir);
          }
        }
      } catch (_error) {}
    }

    const success = await deleteTask(id);

    if (!success) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

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
