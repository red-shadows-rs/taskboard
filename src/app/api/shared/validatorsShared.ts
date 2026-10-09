import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const projectSchema = z.object({
  title: z.object({
    en: z.string().min(1, "English title is required"),
    ar: z.string().min(1, "Arabic title is required"),
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
    en: z.string().min(1, "English title is required"),
    ar: z.string().min(1, "Arabic title is required"),
  }),
  order: z.number().optional(),
});

export const userCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["leader", "member", "client"]),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  currentPassword: z.string().optional(),
  role: z.enum(["leader", "member", "client"]).optional(),
  order: z.number().optional(),
});

export const userReorderSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
      role: z.enum(["leader", "member", "client"]).optional(),
    }),
  ),
});

export const sectionReorderSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    }),
  ),
});

export const taskReorderSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
      sectionId: z.string().optional(),
    }),
  ),
});

export const taskSchema = z.object({
  sectionId: z.string(),
  title: z.object({
    en: z.string().min(1, "Title is required"),
    ar: z.string().min(1, "Title is required"),
  }),
  description: z.object({
    en: z.string().min(1, "Description is required"),
    ar: z.string().min(1, "Description is required"),
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
