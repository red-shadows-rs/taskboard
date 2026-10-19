import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/app/api/auth/utilsAuth";
import { UPLOADS_DIR } from "@/app/api/shared/storageShared";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    await requireAuth();
    const { path: pathArray } = await params;

    const baseDir = path.resolve(UPLOADS_DIR);
    const filePath = path.resolve(baseDir, ...pathArray);

    if (!filePath.startsWith(baseDir + path.sep)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    let realPath: string;
    let realBaseDir: string;
    try {
      realPath = await fs.realpath(filePath);
      realBaseDir = await fs.realpath(baseDir);
    } catch {
      if (pathArray[0] !== "images") {
        const candidate = path.resolve(baseDir, "images", ...pathArray);
        try {
          realPath = await fs.realpath(candidate);
          realBaseDir = await fs.realpath(baseDir);
        } catch {
          return new NextResponse("File not found", { status: 404 });
        }
      } else {
        return new NextResponse("File not found", { status: 404 });
      }
    }

    if (!realPath.startsWith(realBaseDir + path.sep)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const fileBuffer = await fs.readFile(realPath);
    const ext = path.extname(realPath).toLowerCase();
    let contentType = "application/octet-stream";

    switch (ext) {
      case ".png":
        contentType = "image/png";
        break;
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".svg":
        contentType = "image/svg+xml";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
