import {
  getProjectById,
  getProjects,
  getSectionById,
} from "@/app/api/shared/databaseShared";

import type { Project, Section, Task, User } from "@/types";

export function isLeader(user: User): boolean {
  return user.role === "leader";
}

export function canAccessProject(user: User, project: Project | null): boolean {
  if (!project) return false;
  if (isLeader(user)) return true;
  return project.teamMembers.includes(user.id);
}

export async function canAccessSection(
  user: User,
  section: Section | null,
): Promise<boolean> {
  if (!section) return false;
  return canAccessProject(user, await getProjectById(section.projectId));
}

export async function canAccessTask(
  user: User,
  task: Task | null,
): Promise<boolean> {
  if (!task) return false;
  return canAccessSection(user, await getSectionById(task.sectionId));
}

export async function getAccessibleProjectIds(
  user: User,
): Promise<Set<string> | null> {
  if (isLeader(user)) return null;
  const projects = await getProjects();
  return new Set(
    projects
      .filter((project) => project.teamMembers.includes(user.id))
      .map((project) => project.id),
  );
}

export async function canAccessTaskSection(
  user: User,
  sectionId: string,
): Promise<boolean> {
  return canAccessSection(user, await getSectionById(sectionId));
}
