import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import { requireAuth } from "@/app/api/auth/utilsAuth";

export const dynamic = "force-dynamic";

const LOCALES_DIR = path.join(process.cwd(), "public", "locales");

function getLocaleDirectories(dir: string, baseDir: string = ""): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let directories: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = baseDir ? path.join(baseDir, entry.name) : entry.name;

    if (entry.isDirectory()) {
      const hasLocaleFile =
        fs.existsSync(path.join(fullPath, "enLocale.json")) ||
        fs.existsSync(path.join(fullPath, "arLocale.json"));

      if (hasLocaleFile) {
        directories.push(relativePath.replace(/\\/g, "/"));
      }

      directories = directories.concat(
        getLocaleDirectories(fullPath, relativePath),
      );
    }
  }
  return directories;
}

export async function GET() {
  try {
    await requireAuth();

    const paths = getLocaleDirectories(LOCALES_DIR);
    return NextResponse.json(paths);
  } catch (error) {
    const unauthorized =
      error instanceof Error && error.message === "Unauthorized";

    return NextResponse.json(
      { error: unauthorized ? "Unauthorized" : "Failed to scan locales" },
      { status: unauthorized ? 401 : 500 },
    );
  }
}
