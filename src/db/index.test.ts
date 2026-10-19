// ─────────────────────────────────────────────
// Taskboard - Database Manager Unit Tests
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { openDb, seedDemoData } from "@/db";
import { users, projects, sections, tasks } from "@/db/schema";
import { count } from "drizzle-orm";

describe("Database Manager", () => {
  it("initializes an in-memory database with correct PRAGMAs", () => {
    const { sqlite } = openDb(":memory:");

    const fk = sqlite.pragma("foreign_keys", { simple: true });
    expect(fk).toBe(1);

    const busyTimeout = sqlite.pragma("busy_timeout", { simple: true });
    expect(busyTimeout).toBe(5000);
  });

  it("seeds demo dataset correctly into fresh database", () => {
    const instance = openDb(":memory:");

    seedDemoData(instance);

    const userCount =
      instance.db.select({ count: count() }).from(users).get()?.count ?? 0;
    const projectCount =
      instance.db.select({ count: count() }).from(projects).get()?.count ?? 0;
    const sectionCount =
      instance.db.select({ count: count() }).from(sections).get()?.count ?? 0;
    const taskCount =
      instance.db.select({ count: count() }).from(tasks).get()?.count ?? 0;

    expect(userCount).toBeGreaterThan(0);
    expect(projectCount).toBeGreaterThan(0);
    expect(sectionCount).toBeGreaterThan(0);
    expect(taskCount).toBeGreaterThan(0);
  });

  it("is idempotent when seedDemoData is called multiple times", () => {
    const instance = openDb(":memory:");

    seedDemoData(instance);
    const initialCount =
      instance.db.select({ count: count() }).from(users).get()?.count ?? 0;

    seedDemoData(instance);
    const secondCount =
      instance.db.select({ count: count() }).from(users).get()?.count ?? 0;

    expect(secondCount).toBe(initialCount);
  });
});
