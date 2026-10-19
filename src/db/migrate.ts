// ─────────────────────────────────────────────
// TaskBoard - Database Migration Runner
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { getMainInstance, getDemoInstance } from "@/db";

function run(): void {
  getMainInstance();
  getDemoInstance();
  process.stdout.write("Database migration and initialization complete.\n");
}

run();
