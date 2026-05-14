import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { requireAuth } from "@/app/api/auth/utilsAuth";
import { getProjects, createProject } from "@/app/api/shared/databaseShared";
import { projectSchema } from "@/app/api/shared/validatorsShared";

import type { NextRequest } from "next/server";

export async function GET() {
  try {
    const user = await requireAuth();
    const allProjects = await getProjects();

    let projects = allProjects;
    if (user.role !== "leader") {
      projects = allProjects.filter((project) =>
        project.teamMembers.includes(user.id),
      );
    }

    return NextResponse.json({ projects });
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

    if (user.role !== "leader") {
      return NextResponse.json(
        { error: "Forbidden: Only leaders can create projects" },
        { status: 403 },
      );
    }

    const body = await request.json();

    const result = projectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    const allProjects = await getProjects();
    const maxOrder = allProjects.reduce(
      (max, p) => Math.max(max, p.order || 0),
      -1,
    );
    const newOrder = maxOrder + 1;

    const project = await createProject({
      id: uuidv4(),
      title: result.data.title,
      startDate: result.data.startDate || "",
      endDate: result.data.endDate || "",
      status: result.data.status,
      teamMembers: result.data.teamMembers || [],
      color: result.data.color || "",
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: result.data.order ?? newOrder,
    });

    return NextResponse.json({ project }, { status: 201 });
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
