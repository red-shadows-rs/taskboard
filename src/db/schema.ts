// TaskBoard - Database Schema
// https://github.com/red-shadows-rs/taskboard

import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    role: text("role", { enum: ["leader", "client", "member"] })
      .notNull()
      .default("member"),
    order: integer("order"),
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)],
);

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    titleEn: text("title_en").notNull(),
    titleAr: text("title_ar").notNull(),
    startDate: text("start_date").notNull(),
    endDate: text("end_date"),
    status: text("status", {
      enum: ["planning", "active", "completed", "on_hold"],
    })
      .notNull()
      .default("planning"),
    teamMembers: text("team_members").notNull().default("[]"),
    color: text("color"),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    order: integer("order"),
  },
  (t) => [index("projects_status_idx").on(t.status)],
);

export const sections = sqliteTable(
  "sections",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    titleEn: text("title_en").notNull(),
    titleAr: text("title_ar").notNull(),
    order: integer("order"),
  },
  (t) => [index("sections_project_idx").on(t.projectId)],
);

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    sectionId: text("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    titleEn: text("title_en").notNull(),
    titleAr: text("title_ar").notNull(),
    descriptionEn: text("description_en").notNull(),
    descriptionAr: text("description_ar").notNull(),
    status: text("status", {
      enum: ["todo", "in_progress", "in_review", "done"],
    })
      .notNull()
      .default("todo"),
    assignedTo: text("assigned_to").notNull().default("[]"),
    dueDate: text("due_date").notNull(),
    priority: text("priority", {
      enum: ["low", "medium", "high", "urgent"],
    })
      .notNull()
      .default("low"),
    tags: text("tags").notNull().default("[]"),
    order: integer("order"),
    attachments: text("attachments").notNull().default("[]"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    completedAt: text("completed_at"),
    assigneePrices: text("assignee_prices").notNull().default("[]"),
  },
  (t) => [
    index("tasks_section_idx").on(t.sectionId),
    index("tasks_status_idx").on(t.status),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;
export type SectionRow = typeof sections.$inferSelect;
export type NewSectionRow = typeof sections.$inferInsert;
export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;
