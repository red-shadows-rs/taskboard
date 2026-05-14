"use client";

import { create } from "zustand";

import type { AppState } from "@/types";

export const useStore = create<AppState>((set, get) => ({
  user: null,
  sections: [],
  users: [],
  projects: [],
  tasks: [],
  filteredSections: [],
  filteredProjects: [],
  filteredTasks: [],
  searchQuery: "",
  statusFilter: "all",
  viewMode: "kanban",

  setUser: (user) => set({ user }),

  setSections: (sections) => {
    set({ sections });
    get().filterSections();
  },

  setUsers: (users) => set({ users }),

  setProjects: (projects) => {
    set({ projects });
    get().filterProjects();
  },

  setTasks: (tasks) => {
    set({ tasks });
    get().filterTasks();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterSections();
    get().filterProjects();
    get().filterTasks();
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().filterSections();
    get().filterProjects();
    get().filterTasks();
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  addSection: (section) => {
    const currentSections = get().sections;
    const sections = Array.isArray(currentSections)
      ? [...currentSections, section]
      : [section];
    set({ sections });
    get().filterSections();
  },

  updateSection: (id, updates) => {
    const currentSections = get().sections;
    if (!Array.isArray(currentSections)) {
      return;
    }
    const sections = currentSections.map((section) =>
      section.id === id ? { ...section, ...updates } : section,
    );
    set({ sections });
    get().filterSections();
  },

  deleteSection: (id) => {
    const currentSections = get().sections;
    if (!Array.isArray(currentSections)) {
      return;
    }
    const sections = currentSections.filter((section) => section.id !== id);
    set({ sections });
    get().filterSections();
  },

  addProject: (project) => {
    const currentProjects = get().projects;
    const projects = Array.isArray(currentProjects)
      ? [...currentProjects, project]
      : [project];
    set({ projects });
    get().filterProjects();
  },

  updateProject: (id, updates) => {
    const currentProjects = get().projects;
    if (!Array.isArray(currentProjects)) {
      return;
    }
    const projects = currentProjects.map((project) =>
      project.id === id ? { ...project, ...updates } : project,
    );
    set({ projects });
    get().filterProjects();
  },

  deleteProject: (id) => {
    const currentProjects = get().projects;
    if (!Array.isArray(currentProjects)) {
      return;
    }
    const projects = currentProjects.filter((project) => project.id !== id);
    set({ projects });
    get().filterProjects();
  },

  addTask: (task) => {
    const currentTasks = get().tasks;
    const tasks = Array.isArray(currentTasks)
      ? [...currentTasks, task]
      : [task];
    set({ tasks });
    get().filterTasks();
  },

  updateTask: (id, updates) => {
    const currentTasks = get().tasks;
    if (!Array.isArray(currentTasks)) {
      return;
    }
    const tasks = currentTasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task,
    );
    set({ tasks });
    get().filterTasks();
  },

  deleteTask: (id) => {
    const currentTasks = get().tasks;
    if (!Array.isArray(currentTasks)) {
      return;
    }
    const tasks = currentTasks.filter((task) => task.id !== id);
    set({ tasks });
    get().filterTasks();
  },

  filterSections: () => {
    const { sections, searchQuery } = get();

    if (!Array.isArray(sections)) {
      set({ filteredSections: [] });
      return;
    }

    let filtered = [...sections];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (section) =>
          section.title.en.toLowerCase().includes(query) ||
          section.title.ar.toLowerCase().includes(query),
      );
    }

    set({ filteredSections: filtered });
  },

  filterProjects: () => {
    const { projects, searchQuery, statusFilter } = get();

    if (!Array.isArray(projects)) {
      set({ filteredProjects: [] });
      return;
    }

    let filtered = [...projects];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.en.toLowerCase().includes(query) ||
          project.title.ar.toLowerCase().includes(query),
      );
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    set({ filteredProjects: filtered });
  },

  filterTasks: () => {
    const { tasks, searchQuery, statusFilter } = get();

    if (!Array.isArray(tasks)) {
      set({ filteredTasks: [] });
      return;
    }

    let filtered = [...tasks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.en.toLowerCase().includes(query) ||
          task.title.ar.toLowerCase().includes(query) ||
          task.description.en.toLowerCase().includes(query) ||
          task.description.ar.toLowerCase().includes(query) ||
          task.tags.some((tag: string) => tag.toLowerCase().includes(query)),
      );
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    set({ filteredTasks: filtered });
  },
}));
