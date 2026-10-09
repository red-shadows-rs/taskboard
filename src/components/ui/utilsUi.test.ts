import { describe, expect, it } from "vitest";

import {
  cn,
  getPriorityColor,
  getRoleColor,
  getStatusColor,
} from "@/components/ui/utilsUi";

describe("utilsUi", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("maps status to a color class", () => {
    expect(getStatusColor("done")).toContain("text-green-700");
  });

  it("maps role to a color class", () => {
    expect(getRoleColor("leader")).toContain("bg-emerald-100");
  });

  it("maps priority to a color class", () => {
    expect(getPriorityColor("urgent")).toContain("bg-red-100");
  });
});
