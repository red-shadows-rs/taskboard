// ─────────────────────────────────────────────
// TaskBoard - Drizzle Configuration
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/taskboard.sqlite",
  },
});
