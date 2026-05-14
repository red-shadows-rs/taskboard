import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const projectSchema = z.object({
  title: z.object({
    en: z.string().min(3, "English title must be at least 3 characters"),
    ar: z.string().min(3, "Arabic title must be at least 3 characters"),
  }),

  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  status: z
    .enum(["planning", "active", "completed", "on_hold"])
    .default("planning"),
  teamMembers: z.array(z.string()).default([]),
  color: z.string().optional(),
  order: z.number().optional(),
});

export const sectionSchema = z.object({
  projectId: z.string(),
  title: z.object({
    en: z.string().min(3, "English title must be at least 3 characters"),
    ar: z.string().min(3, "Arabic title must be at least 3 characters"),
  }),
  order: z.number().optional(),
});

export const userCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["leader", "member", "client"]),
});

export const taskSchema = z.object({
  sectionId: z.string(),
  title: z.object({
    en: z.string().min(3, "Title must be at least 3 characters"),
    ar: z.string().min(3, "Title must be at least 3 characters"),
  }),
  description: z.object({
    en: z.string().min(10, "Description must be at least 10 characters"),
    ar: z.string().min(10, "Description must be at least 10 characters"),
  }),
  status: z.enum(["todo", "in_progress", "in_review", "done"]),
  assignedTo: z.array(z.string()).default([]),
  dueDate: z.string().optional().or(z.literal("")),
  createdAt: z.string().optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  tags: z.array(z.string()).default([]),
  order: z.number().optional(),
  attachments: z
    .array(
      z
        .string()
        .regex(
          /^images\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.(webp|png|jpg|jpeg|gif|svg|bin)$/,
          "Invalid attachment path",
        ),
    )
    .default([]),
  assigneePrices: z
    .array(z.object({ userId: z.string(), price: z.number().min(0) }))
    .default([]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type SectionInput = z.infer<typeof sectionSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
