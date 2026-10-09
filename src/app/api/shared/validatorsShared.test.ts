import { describe, expect, it } from "vitest";

import {
  loginSchema,
  projectSchema,
  taskSchema,
} from "@/app/api/shared/validatorsShared";

describe("validatorsShared", () => {
  it("accepts a valid login payload", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "nope",
      password: "secret1",
    });
    expect(result.success).toBe(false);
  });

  it("requires both title languages on a project", () => {
    const result = projectSchema.safeParse({ title: { en: "A", ar: "" } });
    expect(result.success).toBe(false);
  });

  it("accepts a valid attachment path", () => {
    const result = taskSchema.safeParse({
      sectionId: "s1",
      title: { en: "T", ar: "ت" },
      description: { en: "D", ar: "و" },
      status: "todo",
      priority: "low",
      attachments: ["images/p/s/file.webp"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a path traversal attachment", () => {
    const result = taskSchema.safeParse({
      sectionId: "s1",
      title: { en: "T", ar: "ت" },
      description: { en: "D", ar: "و" },
      status: "todo",
      priority: "low",
      attachments: ["../../etc/passwd"],
    });
    expect(result.success).toBe(false);
  });
});
