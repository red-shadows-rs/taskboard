"use client";

import { useEffect } from "react";

import { useLanguage } from "@/contexts/languageContext";

interface PageTitleProps {
  title:
    | "base"
    | "dashboard"
    | "tasks"
    | "analytics"
    | "team"
    | "profile"
    | "login"
    | "projects"
    | string;
}

export function PageTitle({ title }: PageTitleProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const titleMap: Record<string, string> = {
      dashboard: "dashboard.meta.title",
      tasks: "dashboard.tasks.meta.title",
      projects: "dashboard.projects.meta.title",
      team: "dashboard.team.meta.title",
      profile: "profile.meta.title",
      login: "auth.meta.title",
      analytics: "dashboard.analytics.meta.title",
      error: "common.errorPage.title",
      notFound: "common.notFound.title",
    };

    const key = titleMap[title];
    document.title = key ? t(key) : t("common.appName");
  }, [t, title]);

  return null;
}
