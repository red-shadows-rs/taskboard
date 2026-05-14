import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { requireAuth } from "@/app/api/auth/utilsAuth";
import {
  getTasks,
  createTask,
  getSectionById,
  getTasksBySectionId,
  getSectionsByProjectId,
} from "@/app/api/shared/databaseShared";
import { taskSchema } from "@/app/api/shared/validatorsShared";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const sectionId =
      searchParams.get("sectionId") || searchParams.get("taskId");

    const allTasks = await getTasks();

    let tasks = allTasks;

    const projectId = searchParams.get("projectId");

    if (sectionId) {
      tasks = allTasks.filter((t) => t.sectionId === sectionId);
    }

    if (user.role === "member") {
      tasks = tasks.filter((task) => task.assignedTo.includes(user.id));
    } else if (user.role === "leader") {
      if (!sectionId && !projectId) {
        tasks = tasks.filter((task) => task.assignedTo.includes(user.id));
      }
    }

    return NextResponse.json({ tasks });
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

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    if (body.projectId) {
      const allTasks = await getTasks();
      const projectSections = await getSectionsByProjectId(body.projectId);
      const sectionIds = projectSections.map((s) => s.id);

      let tasks = allTasks.filter((t) => sectionIds.includes(t.sectionId));

      if (user.role === "member") {
        tasks = tasks.filter((task) => task.assignedTo.includes(user.id));
      } else if (user.role === "leader") {
        tasks = tasks.filter((task) => task.assignedTo.includes(user.id));
      }

      return NextResponse.json({ tasks });
    }

    if (user.role === "member") {
      return NextResponse.json(
        { error: "Forbidden: Only leaders and clients can create tasks" },
        { status: 403 },
      );
    }

    const result = taskSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    const section = await getSectionById(result.data.sectionId);
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const sectionTasks = await getTasksBySectionId(result.data.sectionId);
    const maxOrder = sectionTasks.reduce(
      (max, t) => Math.max(max, t.order || 0),
      -1,
    );
    const newOrder = maxOrder + 1;

    const task = await createTask({
      id: uuidv4(),
      sectionId: result.data.sectionId,
      title: result.data.title,
      description: result.data.description,
      status: result.data.status,
      assignedTo: result.data.assignedTo || [],
      dueDate: result.data.dueDate || "",
      priority: result.data.priority,
      tags: result.data.tags || [],
      createdAt: result.data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: result.data.order ?? newOrder,
      assigneePrices:
        user.role === "leader" ? (result.data.assigneePrices ?? []) : [],
    });

    return NextResponse.json({ task }, { status: 201 });
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
