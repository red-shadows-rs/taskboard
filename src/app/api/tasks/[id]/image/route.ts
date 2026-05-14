import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

import { requireAuth } from "@/app/api/auth/utilsAuth";
import {
  getTaskById,
  updateTask,
  getSectionById,
} from "@/app/api/shared/databaseShared";
import { checkRateLimit } from "@/app/api/shared/rateLimitShared";

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const rateLimit = checkRateLimit(request, "upload", 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please try again later." },
        { status: 429 },
      );
    }

    await requireAuth();
    const { id: taskId } = await params;

    const task = await getTaskById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const MAX_FILES = 10;

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 },
      );
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
          { status: 400 },
        );
      }
      if (!allowedMimeTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, GIF, WebP, SVG` },
          { status: 400 },
        );
      }
    }

    const section = await getSectionById(task.sectionId);
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const publicDir = path.join(process.cwd(), "public");
    const imagesDir = path.join(
      publicDir,
      "images",
      section.projectId,
      task.sectionId,
    );

    await fs.mkdir(imagesDir, { recursive: true });

    const currentAttachments = task.attachments || [];

    const newAttachments: string[] = [];

    for (const file of files) {
      const fileUuid = uuidv4();
      const isImage = file.type.startsWith("image/");
      const extension = isImage ? "webp" : (file.name.split(".").pop() || "bin");
      const filename = `${fileUuid}.${extension}`;

      const relativePath = path
        .join("images", section.projectId, task.sectionId, filename)
        .replace(/\\/g, "/");
      const fullPath = path.join(imagesDir, filename);

      const fileBuffer = Buffer.from(new Uint8Array(await file.arrayBuffer()));
      let buffer: Buffer = fileBuffer;

      if (isImage) {
        buffer = await sharp(fileBuffer)
          .webp({ quality: 90, effort: 6 })
          .toBuffer();
      }

      await fs.writeFile(fullPath, buffer);
      newAttachments.push(relativePath);
    }

    const updatedAttachments = [...currentAttachments, ...newAttachments];

    const updatedTask = await updateTask(taskId, {
      attachments: updatedAttachments,
    });

    return NextResponse.json({ task: updatedTask });
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
