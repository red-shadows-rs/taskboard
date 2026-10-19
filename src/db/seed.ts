// ─────────────────────────────────────────────
// Taskboard - Database Seeder
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { getMainInstance, getDemoInstance, seedDemoData } from "@/db";

function seed(): void {
  const main = getMainInstance();
  const demo = getDemoInstance();
  seedDemoData(main);
  seedDemoData(demo);
  process.stdout.write("Database seeded successfully.\n");
}

seed();
