// ─────────────────────────────────────────────
// Taskboard - Health Check Route Handler Tests
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("Health Check API", () => {
  it("returns status ok with uptime and timestamp", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(typeof body.uptime).toBe("number");
    expect(typeof body.timestamp).toBe("string");
    expect(new Date(body.timestamp).getTime()).not.toBeNaN();
  });
});
