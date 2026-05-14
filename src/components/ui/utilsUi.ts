import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "done":
      return "text-green-700 bg-green-50 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    case "in_progress":
      return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    case "in_review":
      return "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
    case "todo":
      return "text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
  }
}

export function getRoleColor(role: string): string {
  switch (role) {
    case "leader":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30";
    case "client":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30";
    case "member":
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800";
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800";
    case "high":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800";
    case "low":
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700";
  }
}
