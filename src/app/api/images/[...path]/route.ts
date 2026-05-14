import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/app/api/auth/utilsAuth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    await requireAuth();
    const { path: pathArray } = await params;

    const baseDir = path.resolve(process.cwd(), "public", "images");
    const filePath = path.resolve(baseDir, ...pathArray);

    if (!filePath.startsWith(baseDir + path.sep)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
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
  } catch (_error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
