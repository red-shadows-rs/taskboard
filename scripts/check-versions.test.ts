// ─────────────────────────────────────────────
// Taskboard - Version Consistency Verification Tests
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

describe("Version Consistency Script", () => {
  it("passes check-versions.sh with exit code 0", () => {
    const scriptPath = join(process.cwd(), "scripts", "check-versions.sh");
    const output = execFileSync("bash", [scriptPath], {
      encoding: "utf-8",
    });

    expect(output).toContain("check-versions: all version locations agree");
  });
});
