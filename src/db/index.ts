// TaskBoard - Database Manager
// https://github.com/red-shadows-rs/taskboard

import { AsyncLocalStorage } from "node:async_hooks";
import { existsSync, mkdirSync, readFileSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";
import { count } from "drizzle-orm";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/db/schema";
import {
  DEMO_PROJECTS,
  DEMO_SECTIONS,
  DEMO_TASKS,
  DEMO_USERS,
} from "@/db/demoSeed";

export type DbInstance = {
  sqlite: Database.Database;
  db: BetterSQLite3Database<typeof schema>;
};

const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), "data");
const MAIN_DB_PATH =
  process.env.DATABASE_PATH || join(DATA_DIR, "taskboard.sqlite");
const DEMO_DB_PATH = join(DATA_DIR, "taskboard-demo.sqlite");

export function openDb(dbPath: string): DbInstance {
  if (dbPath !== ":memory:") {
    mkdirSync(dirname(dbPath), { recursive: true, mode: 0o755 });
  }
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("synchronous = NORMAL");
  const db = drizzle(sqlite, { schema });

  const migrationsFolder = join(process.cwd(), "drizzle");
  if (existsSync(join(migrationsFolder, "meta", "_journal.json"))) {
    try {
      migrate(db, { migrationsFolder });
    } catch (_error) {
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'member' NOT NULL,
          "order" INTEGER
        );
        CREATE UNIQUE INDEX IF NOT EXISTS users_email_uq ON users (email);
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY NOT NULL,
          title_en TEXT NOT NULL,
          title_ar TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT,
          status TEXT DEFAULT 'planning' NOT NULL,
          team_members TEXT DEFAULT '[]' NOT NULL,
          color TEXT,
          created_by TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          "order" INTEGER
        );
        CREATE INDEX IF NOT EXISTS projects_status_idx ON projects (status);
        CREATE TABLE IF NOT EXISTS sections (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          title_en TEXT NOT NULL,
          title_ar TEXT NOT NULL,
          "order" INTEGER
        );
        CREATE INDEX IF NOT EXISTS sections_project_idx ON sections (project_id);
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY NOT NULL,
          section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
          title_en TEXT NOT NULL,
          title_ar TEXT NOT NULL,
          description_en TEXT NOT NULL,
          description_ar TEXT NOT NULL,
          status TEXT DEFAULT 'todo' NOT NULL,
          assigned_to TEXT DEFAULT '[]' NOT NULL,
          due_date TEXT NOT NULL,
          priority TEXT DEFAULT 'low' NOT NULL,
          tags TEXT DEFAULT '[]' NOT NULL,
          "order" INTEGER,
          attachments TEXT DEFAULT '[]' NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          completed_at TEXT,
          assignee_prices TEXT DEFAULT '[]' NOT NULL
        );
        CREATE INDEX IF NOT EXISTS tasks_section_idx ON tasks (section_id);
        CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks (status);
      `);
    }
  }

  return { sqlite, db };
}

let mainInstance: DbInstance | null = null;
let demoInstance: DbInstance | null = null;

const dbStorage = new AsyncLocalStorage<DbInstance>();

function migrateLegacyJson(target: DbInstance): void {
  const legacyDir = join(process.cwd(), "databases");
  const usersFile = join(legacyDir, "usersDatabase.json");
  const projectsFile = join(legacyDir, "projectsDatabase.json");
  const sectionsFile = join(legacyDir, "sectionsDatabase.json");
  const tasksFile = join(legacyDir, "tasksDatabase.json");

  if (!existsSync(usersFile)) return;

  try {
    const existingUsers =
      target.db.select({ value: count() }).from(schema.users).get()?.value ?? 0;
    if (existingUsers > 0) return;

    const read = <T>(filePath: string): T[] => {
      if (!existsSync(filePath)) return [];
      try {
        const raw = readFileSync(filePath, "utf-8").trim();
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    };

    const usersData = read<{
      id: string;
      name: string;
      email: string;
      password: string;
      role: "leader" | "client" | "member";
      order?: number;
    }>(usersFile);

    const projectsData = read<{
      id: string;
      title: { en: string; ar: string };
      startDate: string;
      endDate?: string;
      status: "planning" | "active" | "completed" | "on_hold";
      teamMembers: string[];
      color?: string;
      createdBy: string;
      createdAt: string;
      updatedAt: string;
      order?: number;
    }>(projectsFile);

    const sectionsData = read<{
      id: string;
      projectId: string;
      title: { en: string; ar: string };
      order?: number;
    }>(sectionsFile);

    const tasksData = read<{
      id: string;
      sectionId: string;
      title: { en: string; ar: string };
      description: { en: string; ar: string };
      status: "todo" | "in_progress" | "in_review" | "done";
      assignedTo: string[];
      dueDate: string;
      priority: "low" | "medium" | "high" | "urgent";
      tags: string[];
      order?: number;
      attachments?: string[];
      createdAt: string;
      updatedAt: string;
      completedAt?: string;
      assigneePrices?: { userId: string; price: number }[];
    }>(tasksFile);

    target.db.transaction((tx) => {
      for (const u of usersData) {
        tx.insert(schema.users)
          .values({
            id: u.id,
            name: u.name,
            email: u.email,
            password: u.password,
            role: u.role,
            order: u.order ?? null,
          })
          .run();
      }

      for (const p of projectsData) {
        tx.insert(schema.projects)
          .values({
            id: p.id,
            titleEn: p.title?.en || "Untitled Project",
            titleAr: p.title?.ar || "مشروع بدون عنوان",
            startDate: p.startDate,
            endDate: p.endDate ?? null,
            status: p.status || "planning",
            teamMembers: JSON.stringify(p.teamMembers || []),
            color: p.color ?? null,
            createdBy: p.createdBy,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            order: p.order ?? null,
          })
          .run();
      }

      const existingProjectIds = new Set(
        projectsData.map((p: { id: string }) => p.id),
      );
      const fallbackUserId = usersData[0]?.id || "system";
      for (const s of sectionsData) {
        if (!existingProjectIds.has(s.projectId)) {
          existingProjectIds.add(s.projectId);
          tx.insert(schema.projects)
            .values({
              id: s.projectId,
              titleEn: "Archived Project (Recovered)",
              titleAr: "مشروع مؤرشف (مسترد)",
              startDate: new Date().toISOString(),
              endDate: null,
              status: "completed",
              teamMembers: "[]",
              color: "#6b7280",
              createdBy: fallbackUserId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              order: 999,
            })
            .run();
        }
      }

      for (const s of sectionsData) {
        tx.insert(schema.sections)
          .values({
            id: s.id,
            projectId: s.projectId,
            titleEn: s.title?.en || "Untitled Section",
            titleAr: s.title?.ar || "قسم بدون عنوان",
            order: s.order ?? null,
          })
          .run();
      }

      for (const t of tasksData) {
        tx.insert(schema.tasks)
          .values({
            id: t.id,
            sectionId: t.sectionId,
            titleEn: t.title?.en || "Untitled Task",
            titleAr: t.title?.ar || "مهمة بدون عنوان",
            descriptionEn: t.description?.en || "",
            descriptionAr: t.description?.ar || "",
            status: t.status || "todo",
            assignedTo: JSON.stringify(t.assignedTo || []),
            dueDate: t.dueDate,
            priority: t.priority || "low",
            tags: JSON.stringify(t.tags || []),
            order: t.order ?? null,
            attachments: JSON.stringify(t.attachments || []),
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            completedAt: t.completedAt ?? null,
            assigneePrices: JSON.stringify(t.assigneePrices || []),
          })
          .run();
      }
    });

    const archiveDir = join(legacyDir, "archive");
    mkdirSync(archiveDir, { recursive: true });
    for (const file of [usersFile, projectsFile, sectionsFile, tasksFile]) {
      if (existsSync(file)) {
        const dest = join(archiveDir, file.slice(legacyDir.length + 1));
        renameSync(file, dest);
      }
    }
  } catch (_err) {}
}

export function seedDemoData(target: DbInstance): void {
  const existingUsers =
    target.db.select({ value: count() }).from(schema.users).get()?.value ?? 0;
  if (existingUsers > 0) return;

  target.db.transaction((tx) => {
    for (const u of DEMO_USERS) {
      tx.insert(schema.users).values(u).run();
    }
    for (const p of DEMO_PROJECTS) {
      tx.insert(schema.projects).values(p).run();
    }
    for (const s of DEMO_SECTIONS) {
      tx.insert(schema.sections).values(s).run();
    }
    for (const t of DEMO_TASKS) {
      tx.insert(schema.tasks).values(t).run();
    }
  });
}

export function resetDemoDatabase(): void {
  const instance = getDemoInstance();
  instance.db.transaction((tx) => {
    tx.delete(schema.tasks).run();
    tx.delete(schema.sections).run();
    tx.delete(schema.projects).run();
    tx.delete(schema.users).run();
  });
  seedDemoData(instance);
}

export function getMainInstance(): DbInstance {
  if (mainInstance === null) {
    mkdirSync(DATA_DIR, { recursive: true, mode: 0o755 });
    mainInstance = openDb(MAIN_DB_PATH);
    migrateLegacyJson(mainInstance);
  }
  return mainInstance;
}

export function getDemoInstance(): DbInstance {
  if (demoInstance === null) {
    mkdirSync(DATA_DIR, { recursive: true, mode: 0o755 });
    demoInstance = openDb(DEMO_DB_PATH);
    seedDemoData(demoInstance);
  }
  return demoInstance;
}

export function withDbInstance<T>(isDemo: boolean, fn: () => T): T {
  const instance = isDemo ? getDemoInstance() : getMainInstance();
  return dbStorage.run(instance, fn);
}

export function getInstance(): DbInstance {
  const scoped = dbStorage.getStore();
  if (scoped) return scoped;
  return getMainInstance();
}

export const sqlite = new Proxy({} as Database.Database, {
  get(_target, property) {
    const target = getInstance().sqlite;
    const value = Reflect.get(target, property);
    return typeof value === "function" ? value.bind(target) : value;
  },
});

export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_target, property) {
    const target = getInstance().db;
    const value = Reflect.get(target, property);
    return typeof value === "function" ? value.bind(target) : value;
  },
});
