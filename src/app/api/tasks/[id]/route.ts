import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

import { requireAuth } from "@/app/api/auth/utilsAuth";
import {
  getTaskById,
  updateTask,
  deleteTask,
} from "@/app/api/shared/databaseShared";
import { taskSchema } from "@/app/api/shared/validatorsShared";

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
    await requireAuth();
    const { id } = await params;
    const task = await getTaskById(id);

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
    return NextResponse.json(
      { error: "Internal server error" },
      { status },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    if (user.role !== "leader") {
      delete body.assigneePrices;
    }

    const result = taskSchema.partial().safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    if (result.data.attachments) {
      const oldTask = await getTaskById(id);
      if (oldTask && oldTask.attachments) {
        const oldAttachments = oldTask.attachments;
        const newAttachments = result.data.attachments;
        const removedAttachments = oldAttachments.filter(
          (path) => !newAttachments.includes(path),
        );

        if (removedAttachments.length > 0) {
          const publicDir = path.join(process.cwd(), "public");
          for (const attachment of removedAttachments) {
            const imageFullPath = path.join(publicDir, attachment);
            if (!isPathInside(imageFullPath, publicDir)) continue;
            try {
              await fs.unlink(imageFullPath);
            } catch (_error) {}
          }
        }
      }
    }

    const task = await updateTask(id, result.data);

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
    return NextResponse.json(
      { error: "Internal server error" },
      { status },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const task = await getTaskById(id);
    if (task && task.attachments && task.attachments.length > 0) {
      const publicDir = path.join(process.cwd(), "public");

      for (const attachment of task.attachments) {
        const imageFullPath = path.join(publicDir, attachment);
        if (!isPathInside(imageFullPath, publicDir)) continue;
        try {
          await fs.unlink(imageFullPath);
        } catch (_error) {}
      }

      try {
        const firstImagePath = task.attachments[0];
        if (firstImagePath) {
          const taskDir = path.dirname(path.join(publicDir, firstImagePath));
          if (!isPathInside(taskDir, publicDir)) throw new Error("Invalid path");
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status },
    );
  }
}
