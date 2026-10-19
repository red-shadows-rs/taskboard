// ─────────────────────────────────────────────
// Taskboard - Database Schema Unit Tests
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { openDb } from "@/db";
import { projects, sections, tasks, users } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("Database Schema", () => {
  it("enforces unique email index on users table", () => {
    const { db } = openDb(":memory:");

    db.insert(users)
      .values({
        id: "user-1",
        name: "Test User 1",
        email: "test@example.com",
        password: "hashed_password",
        role: "member",
      })
      .run();

    expect(() =>
      db
        .insert(users)
        .values({
          id: "user-2",
          name: "Test User 2",
          email: "test@example.com",
          password: "hashed_password_2",
          role: "member",
        })
        .run(),
    ).toThrow();
  });

  it("applies default values for user, project, and task", () => {
    const { db } = openDb(":memory:");

    const user = db
      .insert(users)
      .values({
        id: "u-default",
        name: "Default User",
        email: "default@example.com",
        password: "hash",
      })
      .returning()
      .get();

    expect(user.role).toBe("member");

    const project = db
      .insert(projects)
      .values({
        id: "p-default",
        titleEn: "Project EN",
        titleAr: "مشروع عربي",
        startDate: "2026-01-01",
        createdBy: user.id,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      })
      .returning()
      .get();

    expect(project.status).toBe("planning");
    expect(project.teamMembers).toBe("[]");

    const section = db
      .insert(sections)
      .values({
        id: "s-default",
        projectId: project.id,
        titleEn: "Section EN",
        titleAr: "قسم عربي",
      })
      .returning()
      .get();

    const task = db
      .insert(tasks)
      .values({
        id: "t-default",
        sectionId: section.id,
        titleEn: "Task EN",
        titleAr: "مهمة عربي",
        descriptionEn: "Desc EN",
        descriptionAr: "وصف عربي",
        dueDate: "2026-02-01",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      })
      .returning()
      .get();

    expect(task.status).toBe("todo");
    expect(task.priority).toBe("low");
    expect(task.assignedTo).toBe("[]");
    expect(task.tags).toBe("[]");
    expect(task.attachments).toBe("[]");
  });

  it("enforces foreign key constraint on sections -> projects", () => {
    const { db } = openDb(":memory:");

    expect(() =>
      db
        .insert(sections)
        .values({
          id: "s-orphan",
          projectId: "non-existent-project",
          titleEn: "Orphan",
          titleAr: "يتيم",
        })
        .run(),
    ).toThrow();
  });

  it("cascades delete from projects to sections and tasks", () => {
    const { db } = openDb(":memory:");

    db.insert(projects)
      .values({
        id: "p-cascade",
        titleEn: "Cascade Project",
        titleAr: "مشروع متتالي",
        startDate: "2026-01-01",
        createdBy: "creator-1",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      })
      .run();

    db.insert(sections)
      .values({
        id: "s-cascade",
        projectId: "p-cascade",
        titleEn: "Cascade Section",
        titleAr: "قسم متتالي",
      })
      .run();

    db.insert(tasks)
      .values({
        id: "t-cascade",
        sectionId: "s-cascade",
        titleEn: "Cascade Task",
        titleAr: "مهمة متتالية",
        descriptionEn: "Desc",
        descriptionAr: "وصف",
        dueDate: "2026-02-01",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      })
      .run();

    db.delete(projects).where(eq(projects.id, "p-cascade")).run();

    const remainingSections = db
      .select()
      .from(sections)
      .where(eq(sections.id, "s-cascade"))
      .all();
    const remainingTasks = db
      .select()
      .from(tasks)
      .where(eq(tasks.id, "t-cascade"))
      .all();

    expect(remainingSections).toHaveLength(0);
    expect(remainingTasks).toHaveLength(0);
  });
});
