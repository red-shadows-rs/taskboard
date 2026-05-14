import { promises as fs } from "fs";
import path from "path";

import type { Section, User, Project, Task, UserRole } from "@/types";

const dataDir = path.join(process.cwd(), "databases");

function calculateProjectEndDate(
  projectId: string,
  sections: Section[],
  tasks: Task[],
): string | undefined {
  try {
    const projectSections = sections.filter((s) => s.projectId === projectId);
    if (projectSections.length === 0) return undefined;

    const sectionIds = projectSections.map((s) => s.id);
    const validTasks = tasks.filter(
      (t) => t.sectionId && sectionIds.includes(t.sectionId) && t.dueDate,
    );

    if (validTasks.length === 0) return undefined;

    const latestDate = validTasks
      .map((t) => {
        const date = new Date(t.dueDate as string);
        if (isNaN(date.getTime())) return null;
        return date;
      })
      .filter((d): d is Date => d !== null)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    if (!latestDate || isNaN(latestDate.getTime())) return undefined;

    return latestDate.toISOString();
  } catch (_error) {
    return undefined;
  }
}

async function readJSON<T>(filename: string, retries = 3): Promise<T[]> {
  try {
    const filePath = path.join(dataDir, filename);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === "ENOENT") {
      return [];
    }
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return readJSON<T>(filename, retries - 1);
    }
    throw error;
  }
}

async function writeJSON<T>(filename: string, data: T[]): Promise<void> {
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getSections(): Promise<Section[]> {
  return readJSON<Section>("sectionsDatabase.json");
}

export async function getSectionById(id: string): Promise<Section | null> {
  const sections = await getSections();
  return sections.find((section) => section.id === id) || null;
}

export async function createSection(section: Section): Promise<Section> {
  const sections = await getSections();
  sections.push(section);
  await writeJSON("sectionsDatabase.json", sections);

  try {
    const allSections = await getSections();
    const allTasks = await getTasks();
    const projectEndDate = calculateProjectEndDate(
      section.projectId,
      allSections,
      allTasks,
    );
    if (projectEndDate) {
      await updateProject(section.projectId, {
        endDate: projectEndDate,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (_error) {}

  return section;
}

export async function updateSection(
  id: string,
  updates: Partial<Section>,
): Promise<Section | null> {
  const sections = await getSections();
  const index = sections.findIndex((section) => section.id === id);

  if (index === -1) return null;

  sections[index] = {
    ...sections[index],
    ...updates,
  };
  await writeJSON("sectionsDatabase.json", sections);

  return sections[index];
}

export async function deleteSection(id: string): Promise<boolean> {
  const sections = await getSections();
  const filtered = sections.filter((section) => section.id !== id);

  if (filtered.length === sections.length) return false;

  await writeJSON("sectionsDatabase.json", filtered);

  const tasks = await getTasks();
  const filteredTasks = tasks.filter((task) => task.sectionId !== id);
  if (filteredTasks.length !== tasks.length) {
    await writeJSON("tasksDatabase.json", filteredTasks);
  }

  return true;
}

export async function getUsers(): Promise<User[]> {
  return readJSON<User>("usersDatabase.json");
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((user) => user.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((user) => user.email === email) || null;
}

export async function createUser(user: User): Promise<User> {
  const users = await getUsers();
  users.push(user);
  await writeJSON("usersDatabase.json", users);
  return user;
}

export async function updateUser(
  id: string,
  updates: Partial<User>,
): Promise<User | null> {
  const users = await getUsers();
  const index = users.findIndex((user) => user.id === id);

  if (index === -1) return null;

  users[index] = { ...users[index], ...updates };
  await writeJSON("usersDatabase.json", users);
  return users[index];
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await getUsers();
  const filtered = users.filter((user) => user.id !== id);

  if (filtered.length === users.length) return false;

  await writeJSON("usersDatabase.json", filtered);
  return true;
}

export async function getProjects(): Promise<Project[]> {
  return readJSON<Project>("projectsDatabase.json");
}

export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((project) => project.id === id) || null;
}

export async function createProject(project: Project): Promise<Project> {
  const projects = await getProjects();
  projects.push(project);
  await writeJSON("projectsDatabase.json", projects);
  return project;
}

export async function updateProject(
  id: string,
  updates: Partial<Project>,
): Promise<Project | null> {
  const projects = await getProjects();
  const index = projects.findIndex((project) => project.id === id);

  if (index === -1) return null;

  projects[index] = { ...projects[index], ...updates };
  await writeJSON("projectsDatabase.json", projects);
  return projects[index];
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getProjects();
  const filtered = projects.filter((project) => project.id !== id);

  if (filtered.length === projects.length) return false;

  await writeJSON("projectsDatabase.json", filtered);

  const sections = await getSections();
  const projectSections = sections.filter(
    (section) => section.projectId === id,
  );

  if (projectSections.length > 0) {
    const filteredSections = sections.filter(
      (section) => section.projectId !== id,
    );
    await writeJSON("sectionsDatabase.json", filteredSections);

    const tasks = await getTasks();
    const sectionIds = projectSections.map((s) => s.id);
    const filteredTasks = tasks.filter(
      (task) => !sectionIds.includes(task.sectionId),
    );
    if (filteredTasks.length !== tasks.length) {
      await writeJSON("tasksDatabase.json", filteredTasks);
    }
  }

  return true;
}

export async function getTasks(): Promise<Task[]> {
  return readJSON<Task>("tasksDatabase.json");
}

export async function getTaskById(id: string): Promise<Task | null> {
  const tasks = await getTasks();
  return tasks.find((task) => task.id === id) || null;
}

export async function getTasksBySectionId(sectionId: string): Promise<Task[]> {
  const tasks = await getTasks();
  return tasks.filter((task) => task.sectionId === sectionId);
}

export async function getSectionsByProjectId(
  projectId: string,
): Promise<Section[]> {
  const sections = await getSections();
  return sections.filter((section) => section.projectId === projectId);
}

export async function getProjectWithDetails(projectId: string): Promise<{
  project: Project;
  sections: Array<{ section: Section; tasks: Task[] }>;
} | null> {
  const project = await getProjectById(projectId);
  if (!project) return null;

  const sections = await getSectionsByProjectId(projectId);
  const allTasks = await getTasks();

  const sectionsWithTasks = sections.map((section) => ({
    section,
    tasks: allTasks.filter((t) => t.sectionId === section.id),
  }));

  return {
    project,
    sections: sectionsWithTasks,
  };
}

export async function createTask(task: Task): Promise<Task> {
  const tasks = await getTasks();
  tasks.push(task);
  await writeJSON("tasksDatabase.json", tasks);

  return task;
}

export async function updateTask(
  id: string,
  updates: Partial<Task>,
): Promise<Task | null> {
  const tasks = await getTasks();
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) return null;

  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await writeJSON("tasksDatabase.json", tasks);

  return tasks[index];
}

export async function deleteTask(id: string): Promise<boolean> {
  const tasks = await getTasks();
  const filtered = tasks.filter((task) => task.id !== id);

  if (filtered.length === tasks.length) return false;

  await writeJSON("tasksDatabase.json", filtered);
  return true;
}

export async function reorderSections(
  updates: { id: string; order: number }[],
): Promise<void> {
  const sections = await getSections();
  let changed = false;

  updates.forEach((update) => {
    const section = sections.find((s) => s.id === update.id);
    if (section) {
      section.order = update.order;
      changed = true;
    }
  });

  if (changed) {
    await writeJSON("sectionsDatabase.json", sections);
  }
}

export async function reorderTasks(
  updates: { id: string; order: number; sectionId?: string }[],
): Promise<void> {
  const tasks = await getTasks();
  let changed = false;

  updates.forEach((update) => {
    const task = tasks.find((t) => t.id === update.id);
    if (task) {
      task.order = update.order;
      if (update.sectionId) {
        task.sectionId = update.sectionId;
      }
      changed = true;
    }
  });

  if (changed) {
    await writeJSON("tasksDatabase.json", tasks);
  }
}

export async function reorderUsers(
  updates: { id: string; order: number; role?: string }[],
): Promise<void> {
  const users = await getUsers();
  let changed = false;

  updates.forEach((update) => {
    const user = users.find((u) => u.id === update.id);
    if (user) {
      user.order = update.order;
      if (update.role) {
        user.role = update.role as UserRole;
      }
      changed = true;
    }
  });

  if (changed) {
    await writeJSON("usersDatabase.json", users);
  }
}
