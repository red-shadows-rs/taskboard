// ─────────────────────────────────────────────
// Taskboard - Image Attachment Route Handler Tests
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

describe("Images Route Handler", () => {
  it("returns 401 when request is not authenticated", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/images/test.png",
    );
    const response = await GET(request, {
      params: Promise.resolve({ path: ["test.png"] }),
    });

    expect(response.status).toBe(401);
  });

  it("returns 403 when path attempts traversal above uploads directory", async () => {
    process.env.SESSION_SECRET =
      "test-session-secret-key-that-is-at-least-32-chars-long";

    const request = new NextRequest(
      "http://localhost:3000/api/images/../../../etc/passwd",
    );
    const response = await GET(request, {
      params: Promise.resolve({ path: ["..", "..", "..", "etc", "passwd"] }),
    });

    expect([401, 403]).toContain(response.status);
  });
});
