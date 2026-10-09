import { NextResponse } from "next/server";

import { requireAuth } from "@/app/api/auth/utilsAuth";
import {
  getSectionById,
  updateSection,
  deleteSection,
} from "@/app/api/shared/databaseShared";
import { canAccessSection } from "@/app/api/shared/accessShared";
import { sectionSchema } from "@/app/api/shared/validatorsShared";

import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const section = await getSectionById(id);

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    if (!(await canAccessSection(user, section))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ section });
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

    const existingSection = await getSectionById(id);
    if (!existingSection) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    if (!(await canAccessSection(user, existingSection))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (user.role !== "leader" && user.role !== "client") {
      return NextResponse.json(
        {
          error: "Forbidden: Only leaders and clients can update sections",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const result = sectionSchema.partial().safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    const updates = { ...result.data };
    if (user.role !== "leader") {
      delete updates.projectId;
    }

    const section = await updateSection(id, updates);
    return NextResponse.json({ section });
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

    if (user.role !== "leader") {
      return NextResponse.json(
        { error: "Forbidden: Only leaders can delete sections" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const success = await deleteSection(id);

    if (!success) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
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
