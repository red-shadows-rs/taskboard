// TaskBoard - Production Data Migration Script
// https://github.com/red-shadows-rs/taskboard

import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../src/db/schema";

const rootDir = process.cwd();
const dataDir = path.join(rootDir, "data");
const dbPath = path.join(dataDir, "taskboard.sqlite");
const legacyDir = path.join(rootDir, "remote_data", "databases");
const remoteImagesDir = path.join(rootDir, "remote_data", "images");
const uploadsImagesDir = path.join(rootDir, "uploads", "images");

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsImagesDir, { recursive: true });

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}
for (const ext of ["-wal", "-shm", "-journal"]) {
  if (fs.existsSync(dbPath + ext)) {
    fs.unlinkSync(dbPath + ext);
  }
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const migrationSqlPath = path.join(
  rootDir,
  "drizzle",
  "0000_neat_ironclad.sql",
);
const migrationSql = fs.readFileSync(migrationSqlPath, "utf-8");
sqlite.exec(migrationSql);

const db = drizzle(sqlite, { schema });

const usersFile = path.join(legacyDir, "usersDatabase.json");
const projectsFile = path.join(legacyDir, "projectsDatabase.json");
const sectionsFile = path.join(legacyDir, "sectionsDatabase.json");
const tasksFile = path.join(legacyDir, "tasksDatabase.json");

const usersData = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
const projectsData = JSON.parse(fs.readFileSync(projectsFile, "utf-8"));
const sectionsData = JSON.parse(fs.readFileSync(sectionsFile, "utf-8"));
const tasksData = JSON.parse(fs.readFileSync(tasksFile, "utf-8"));

db.transaction((tx) => {
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

function copyRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyRecursive(remoteImagesDir, uploadsImagesDir);

const userCount = sqlite
  .prepare("SELECT count(*) as count FROM users")
  .get() as { count: number };
const projectCount = sqlite
  .prepare("SELECT count(*) as count FROM projects")
  .get() as { count: number };
const sectionCount = sqlite
  .prepare("SELECT count(*) as count FROM sections")
  .get() as { count: number };
const taskCount = sqlite
  .prepare("SELECT count(*) as count FROM tasks")
  .get() as { count: number };

console.log("Migration successful!");
console.log(`Users: ${userCount.count}`);
console.log(`Projects: ${projectCount.count}`);
console.log(`Sections: ${sectionCount.count}`);
console.log(`Tasks: ${taskCount.count}`);

sqlite.close();
