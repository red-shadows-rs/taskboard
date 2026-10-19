// ─────────────────────────────────────────────
// Taskboard - Vitest Configuration
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
    env: {
      SESSION_SECRET: "test-session-secret-key-that-is-at-least-32-chars-long",
    },
  },
});
