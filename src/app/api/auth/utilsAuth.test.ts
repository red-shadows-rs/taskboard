// ─────────────────────────────────────────────
// Taskboard - Authentication Utility Tests
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { beforeAll, describe, expect, it } from "vitest";

describe("Authentication Utilities", () => {
  beforeAll(() => {
    process.env.SESSION_SECRET =
      "test-session-secret-key-that-is-at-least-32-chars-long";
  });

  it("hashes password and verifies it accurately", async () => {
    const { hashPassword, verifyPassword } = await import("./utilsAuth");

    const plain = "SuperSecret123!";
    const hashed = await hashPassword(plain);

    expect(hashed).not.toBe(plain);
    expect(hashed.startsWith("$2")).toBe(true);

    const matches = await verifyPassword(plain, hashed);
    expect(matches).toBe(true);

    const wrongMatches = await verifyPassword("WrongPassword456!", hashed);
    expect(wrongMatches).toBe(false);
  });

  it("signs session data and verifies valid signatures", async () => {
    const { signSession, verifySession } = await import("./utilsAuth");

    const data = JSON.stringify({ id: "user-123", email: "user@example.com" });
    const signed = signSession(data);

    expect(signed).toContain(".");
    const verified = verifySession(signed);
    expect(verified).toBe(data);
  });

  it("rejects tampered or malformed session signatures", async () => {
    const { signSession, verifySession } = await import("./utilsAuth");

    const data = JSON.stringify({ id: "user-123", role: "member" });
    const signed = signSession(data);

    const tampered = signed.replace("member", "leader");
    expect(verifySession(tampered)).toBeNull();

    expect(verifySession("invalid-no-dot")).toBeNull();
    expect(verifySession("deadbeef.tampered")).toBeNull();
  });
});
