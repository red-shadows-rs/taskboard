// TaskBoard - Database Shared Operations
// https://github.com/red-shadows-rs/taskboard

import { asc, eq } from "drizzle-orm";
import { getDemoInstance, getInstance } from "@/db";
import * as schema from "@/db/schema";
import type {
  Section,
  User,
  Project,
  Task,
  UserRole,
  ProjectStatus,
  Priority,
  TaskStatus,
} from "@/types";

async function getActiveDb() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    if (cookieStore.get("taskboard_demo")?.value === "1") {
      return getDemoInstance().db;
    }
  } catch {}
  return getInstance().db;
}

function toUser(row: schema.UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role as UserRole,
    order: row.order ?? undefined,
  };
}

function toProject(row: schema.ProjectRow): Project {
  let teamMembers: string[] = [];
  try {
    teamMembers = JSON.parse(row.teamMembers || "[]");
  } catch {}
  return {
    id: row.id,
    title: {
      en: row.titleEn,
      ar: row.titleAr,
    },
    startDate: row.startDate,
    endDate: row.endDate ?? undefined,
    status: row.status as ProjectStatus,
    teamMembers,
    color: row.color ?? undefined,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    order: row.order ?? undefined,
  };
}

function toSection(row: schema.SectionRow): Section {
  return {
    id: row.id,
    projectId: row.projectId,
    title: {
      en: row.titleEn,
      ar: row.titleAr,
    },
    order: row.order ?? undefined,
  };
}

function toTask(row: schema.TaskRow): Task {
  let assignedTo: string[] = [];
  let tags: string[] = [];
  let attachments: string[] = [];
  let assigneePrices: { userId: string; price: number }[] = [];
  try {
    assignedTo = JSON.parse(row.assignedTo || "[]");
  } catch {}
  try {
    tags = JSON.parse(row.tags || "[]");
  } catch {}
  try {
    attachments = JSON.parse(row.attachments || "[]");
  } catch {}
  try {
    assigneePrices = JSON.parse(row.assigneePrices || "[]");
  } catch {}

  return {
    id: row.id,
    sectionId: row.sectionId,
    title: {
      en: row.titleEn,
      ar: row.titleAr,
    },
    description: {
      en: row.descriptionEn,
      ar: row.descriptionAr,
    },
    status: row.status as TaskStatus,
    assignedTo,
    dueDate: row.dueDate,
    priority: row.priority as Priority,
    tags,
    order: row.order ?? undefined,
    attachments,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    completedAt: row.completedAt ?? undefined,
    assigneePrices,
  };
}

function calculateProjectEndDate(
  projectId: string,
  sectionsList: Section[],
  tasksList: Task[],
): string | undefined {
  try {
    const projectSections = sectionsList.filter(
      (s) => s.projectId === projectId,
    );
    if (projectSections.length === 0) return undefined;

    const sectionIds = projectSections.map((s) => s.id);
    const validTasks = tasksList.filter(
      (t) => t.sectionId && sectionIds.includes(t.sectionId) && t.dueDate,
    );

    if (validTasks.length === 0) return undefined;

    const latestDate = validTasks
      .map((t) => {
        const date = new Date(t.dueDate as string);
        if (isNaN(date.getTime())) return null;
        return date;
      })
      .filter((d): d is Date => d !== null)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    if (!latestDate || isNaN(latestDate.getTime())) return undefined;

    return latestDate.toISOString();
  } catch {
    return undefined;
  }
}

export async function getSections(): Promise<Section[]> {
  const db = await getActiveDb();
  const rows = db
    .select()
    .from(schema.sections)
    .orderBy(asc(schema.sections.order))
    .all();
  return rows.map(toSection);
}

export async function getSectionById(id: string): Promise<Section | null> {
  const db = await getActiveDb();
  const row = db
    .select()
    .from(schema.sections)
    .where(eq(schema.sections.id, id))
    .get();
  return row ? toSection(row) : null;
}

export async function createSection(section: Section): Promise<Section> {
  const db = await getActiveDb();
  db.insert(schema.sections)
    .values({
      id: section.id,
      projectId: section.projectId,
      titleEn: section.title.en,
      titleAr: section.title.ar,
      order: section.order ?? null,
    })
    .run();

  try {
    const allSections = await getSections();
    const allTasks = await getTasks();
    const projectEndDate = calculateProjectEndDate(
      section.projectId,
      allSections,
      allTasks,
    );
    if (projectEndDate) {
      await updateProject(section.projectId, {
        endDate: projectEndDate,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch {}

  return section;
}

export async function updateSection(
  id: string,
  updates: Partial<Section>,
): Promise<Section | null> {
  const db = await getActiveDb();
  const values: Partial<schema.NewSectionRow> = {};
  if (updates.projectId !== undefined) values.projectId = updates.projectId;
  if (updates.title?.en !== undefined) values.titleEn = updates.title.en;
  if (updates.title?.ar !== undefined) values.titleAr = updates.title.ar;
  if (updates.order !== undefined) values.order = updates.order;

  db.update(schema.sections)
    .set(values)
    .where(eq(schema.sections.id, id))
    .run();

  return getSectionById(id);
}

export async function deleteSection(id: string): Promise<boolean> {
  const db = await getActiveDb();
  const existing = await getSectionById(id);
  if (!existing) return false;

  db.delete(schema.tasks).where(eq(schema.tasks.sectionId, id)).run();
  db.delete(schema.sections).where(eq(schema.sections.id, id)).run();

  try {
    const allSections = await getSections();
    const allTasks = await getTasks();
    const projectEndDate = calculateProjectEndDate(
      existing.projectId,
      allSections,
      allTasks,
    );
    await updateProject(existing.projectId, {
      endDate: projectEndDate,
      updatedAt: new Date().toISOString(),
    });
  } catch {}

  return true;
}

export async function getUsers(): Promise<User[]> {
  const db = await getActiveDb();
  const rows = db
    .select()
    .from(schema.users)
    .orderBy(asc(schema.users.order))
    .all();
  return rows.map(toUser);
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getActiveDb();
  const row = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .get();
  return row ? toUser(row) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getActiveDb();
  const row = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
    .get();
  return row ? toUser(row) : null;
}

export async function createUser(user: User): Promise<User> {
  const db = await getActiveDb();
  db.insert(schema.users)
    .values({
      id: user.id,
      name: user.name,
      email: user.email.toLowerCase(),
      password: user.password,
      role: user.role,
      order: user.order ?? null,
    })
    .run();
  return user;
}

export async function updateUser(
  id: string,
  updates: Partial<User>,
): Promise<User | null> {
  const db = await getActiveDb();
  const values: Partial<schema.NewUserRow> = {};
  if (updates.name !== undefined) values.name = updates.name;
  if (updates.email !== undefined) values.email = updates.email.toLowerCase();
  if (updates.password !== undefined) values.password = updates.password;
  if (updates.role !== undefined) values.role = updates.role;
  if (updates.order !== undefined) values.order = updates.order;

  db.update(schema.users).set(values).where(eq(schema.users.id, id)).run();

  return getUserById(id);
}

export async function deleteUser(id: string): Promise<boolean> {
  const db = await getActiveDb();
  const res = db.delete(schema.users).where(eq(schema.users.id, id)).run();
  return res.changes > 0;
}

export async function getProjects(): Promise<Project[]> {
  const db = await getActiveDb();
  const rows = db
    .select()
    .from(schema.projects)
    .orderBy(asc(schema.projects.order))
    .all();
  return rows.map(toProject);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const db = await getActiveDb();
  const row = db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, id))
    .get();
  return row ? toProject(row) : null;
}

export async function createProject(project: Project): Promise<Project> {
  const db = await getActiveDb();
  db.insert(schema.projects)
    .values({
      id: project.id,
      titleEn: project.title.en,
      titleAr: project.title.ar,
      startDate: project.startDate,
      endDate: project.endDate ?? null,
      status: project.status,
      teamMembers: JSON.stringify(project.teamMembers || []),
      color: project.color ?? null,
      createdBy: project.createdBy,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      order: project.order ?? null,
    })
    .run();
  return project;
}

export async function updateProject(
  id: string,
  updates: Partial<Project>,
): Promise<Project | null> {
  const db = await getActiveDb();
  const values: Partial<schema.NewProjectRow> = {};
  if (updates.title?.en !== undefined) values.titleEn = updates.title.en;
  if (updates.title?.ar !== undefined) values.titleAr = updates.title.ar;
  if (updates.startDate !== undefined) values.startDate = updates.startDate;
  if (updates.endDate !== undefined) values.endDate = updates.endDate;
  if (updates.status !== undefined) values.status = updates.status;
  if (updates.teamMembers !== undefined)
    values.teamMembers = JSON.stringify(updates.teamMembers);
  if (updates.color !== undefined) values.color = updates.color;
  if (updates.updatedAt !== undefined) values.updatedAt = updates.updatedAt;
  if (updates.order !== undefined) values.order = updates.order;

  db.update(schema.projects)
    .set(values)
    .where(eq(schema.projects.id, id))
    .run();

  return getProjectById(id);
}

export async function deleteProject(id: string): Promise<boolean> {
  const db = await getActiveDb();
  const existing = await getProjectById(id);
  if (!existing) return false;

  const projectSections = await getSectionsByProjectId(id);
  for (const s of projectSections) {
    db.delete(schema.tasks).where(eq(schema.tasks.sectionId, s.id)).run();
  }
  db.delete(schema.sections).where(eq(schema.sections.projectId, id)).run();
  const res = db
    .delete(schema.projects)
    .where(eq(schema.projects.id, id))
    .run();

  return res.changes > 0;
}

export async function getTasks(): Promise<Task[]> {
  const db = await getActiveDb();
  const rows = db
    .select()
    .from(schema.tasks)
    .orderBy(asc(schema.tasks.order))
    .all();
  return rows.map(toTask);
}

export async function getTaskById(id: string): Promise<Task | null> {
  const db = await getActiveDb();
  const row = db
    .select()
    .from(schema.tasks)
    .where(eq(schema.tasks.id, id))
    .get();
  return row ? toTask(row) : null;
}

export async function getTasksBySectionId(sectionId: string): Promise<Task[]> {
  const db = await getActiveDb();
  const rows = db
    .select()
    .from(schema.tasks)
    .where(eq(schema.tasks.sectionId, sectionId))
    .orderBy(asc(schema.tasks.order))
    .all();
  return rows.map(toTask);
}

export async function getSectionsByProjectId(
  projectId: string,
): Promise<Section[]> {
  const db = await getActiveDb();
  const rows = db
    .select()
    .from(schema.sections)
    .where(eq(schema.sections.projectId, projectId))
    .orderBy(asc(schema.sections.order))
    .all();
  return rows.map(toSection);
}

export async function createTask(task: Task): Promise<Task> {
  const db = await getActiveDb();
  db.insert(schema.tasks)
    .values({
      id: task.id,
      sectionId: task.sectionId,
      titleEn: task.title.en,
      titleAr: task.title.ar,
      descriptionEn: task.description.en,
      descriptionAr: task.description.ar,
      status: task.status,
      assignedTo: JSON.stringify(task.assignedTo || []),
      dueDate: task.dueDate,
      priority: task.priority,
      tags: JSON.stringify(task.tags || []),
      order: task.order ?? null,
      attachments: JSON.stringify(task.attachments || []),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt ?? null,
      assigneePrices: JSON.stringify(task.assigneePrices || []),
    })
    .run();
  return task;
}

export async function updateTask(
  id: string,
  updates: Partial<Task>,
): Promise<Task | null> {
  const db = await getActiveDb();
  const values: Partial<schema.NewTaskRow> = {};
  if (updates.sectionId !== undefined) values.sectionId = updates.sectionId;
  if (updates.title?.en !== undefined) values.titleEn = updates.title.en;
  if (updates.title?.ar !== undefined) values.titleAr = updates.title.ar;
  if (updates.description?.en !== undefined)
    values.descriptionEn = updates.description.en;
  if (updates.description?.ar !== undefined)
    values.descriptionAr = updates.description.ar;
  if (updates.status !== undefined) values.status = updates.status;
  if (updates.assignedTo !== undefined)
    values.assignedTo = JSON.stringify(updates.assignedTo);
  if (updates.dueDate !== undefined) values.dueDate = updates.dueDate;
  if (updates.priority !== undefined) values.priority = updates.priority;
  if (updates.tags !== undefined) values.tags = JSON.stringify(updates.tags);
  if (updates.order !== undefined) values.order = updates.order;
  if (updates.attachments !== undefined)
    values.attachments = JSON.stringify(updates.attachments);
  if (updates.completedAt !== undefined)
    values.completedAt = updates.completedAt;
  if (updates.assigneePrices !== undefined) {
    values.assigneePrices = JSON.stringify(updates.assigneePrices);
  }
  values.updatedAt = new Date().toISOString();

  db.update(schema.tasks).set(values).where(eq(schema.tasks.id, id)).run();

  return getTaskById(id);
}

export async function deleteTask(id: string): Promise<boolean> {
  const db = await getActiveDb();
  const res = db.delete(schema.tasks).where(eq(schema.tasks.id, id)).run();
  return res.changes > 0;
}

export async function reorderSections(
  updates: { id: string; order: number }[],
): Promise<void> {
  const db = await getActiveDb();
  db.transaction((tx) => {
    for (const update of updates) {
      tx.update(schema.sections)
        .set({ order: update.order })
        .where(eq(schema.sections.id, update.id))
        .run();
    }
  });
}

export async function reorderTasks(
  updates: { id: string; order: number; sectionId?: string }[],
): Promise<void> {
  const db = await getActiveDb();
  db.transaction((tx) => {
    for (const update of updates) {
      const setValues: { order: number; sectionId?: string } = {
        order: update.order,
      };
      if (update.sectionId) {
        setValues.sectionId = update.sectionId;
      }
      tx.update(schema.tasks)
        .set(setValues)
        .where(eq(schema.tasks.id, update.id))
        .run();
    }
  });
}

export async function reorderUsers(
  updates: { id: string; order: number; role?: string }[],
): Promise<void> {
  const db = await getActiveDb();
  db.transaction((tx) => {
    for (const update of updates) {
      const setValues: { order: number; role?: UserRole } = {
        order: update.order,
      };
      if (update.role) {
        setValues.role = update.role as UserRole;
      }
      tx.update(schema.users)
        .set(setValues)
        .where(eq(schema.users.id, update.id))
        .run();
    }
  });
}
