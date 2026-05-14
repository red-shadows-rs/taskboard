import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { requireAuth } from "@/app/api/auth/utilsAuth";
import {
  getSections,
  createSection,
  getSectionsByProjectId,
} from "@/app/api/shared/databaseShared";
import { sectionSchema } from "@/app/api/shared/validatorsShared";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const allSections = await getSections();

    let sections = allSections;

    if (projectId) {
      sections = allSections.filter((s) => s.projectId === projectId);
    }

    return NextResponse.json({ sections });
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

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role !== "leader" && user.role !== "client") {
      return NextResponse.json(
        { error: "Forbidden: Only leaders and clients can create sections" },
        { status: 403 },
      );
    }

    const body = await request.json();

    const result = sectionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    const projectSections = await getSectionsByProjectId(result.data.projectId);
    const maxOrder = projectSections.reduce(
      (max, s) => Math.max(max, s.order || 0),
      -1,
    );
    const newOrder = maxOrder + 1;

    const section = await createSection({
      id: uuidv4(),
      ...result.data,
      order: result.data.order ?? newOrder,
    });

    return NextResponse.json({ section }, { status: 201 });
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
