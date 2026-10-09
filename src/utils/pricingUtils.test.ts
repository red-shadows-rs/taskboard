import { describe, expect, it } from "vitest";

import {
  calculateColumnTotal,
  calculateGrandTotal,
  calculateProjectTotal,
  formatPrice,
  formatPricePlain,
} from "@/utils/pricingUtils";

import type { Section, Task } from "@/types";

const section: Section = {
  id: "s1",
  projectId: "p1",
  title: { en: "Section", ar: "قسم" },
};

const otherSection: Section = {
  id: "s2",
  projectId: "p2",
  title: { en: "Other", ar: "آخر" },
};

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: "t",
    sectionId: "s1",
    title: { en: "Task", ar: "مهمة" },
    description: { en: "d", ar: "و" },
    status: "todo",
    assignedTo: [],
    dueDate: "",
    priority: "low",
    tags: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("pricingUtils", () => {
  it("sums assignee prices per task", () => {
    const task = makeTask({
      assigneePrices: [
        { userId: "u1", price: 10 },
        { userId: "u2", price: 5 },
      ],
    });
    expect(calculateGrandTotal([task])).toBe(15);
  });

  it("only counts tasks of the given project", () => {
    const tasks = [
      makeTask({
        id: "t1",
        sectionId: "s1",
        assigneePrices: [{ userId: "u1", price: 20 }],
      }),
      makeTask({
        id: "t2",
        sectionId: "s2",
        assigneePrices: [{ userId: "u1", price: 7 }],
      }),
    ];
    expect(calculateProjectTotal("p1", [section, otherSection], tasks)).toBe(
      20,
    );
  });

  it("sums a column by status", () => {
    const tasks = [
      makeTask({
        id: "t1",
        status: "done",
        assigneePrices: [{ userId: "u1", price: 3 }],
      }),
      makeTask({
        id: "t2",
        status: "done",
        assigneePrices: [{ userId: "u1", price: 4 }],
      }),
      makeTask({
        id: "t3",
        status: "todo",
        assigneePrices: [{ userId: "u1", price: 9 }],
      }),
    ];
    expect(calculateColumnTotal(tasks, "done")).toBe(7);
  });

  it("formats prices as USD", () => {
    expect(formatPrice(10)).toBe("$10.00");
  });

  it("formats plain prices with separators", () => {
    expect(formatPricePlain(1234)).toBe("1,234");
  });
});
