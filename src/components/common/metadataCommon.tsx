"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useLanguage } from "@/contexts/languageContext";

export function DynamicMetadata() {
  const { t, language } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    let titleKey = "common.appName";

    if (pathname === "/login") {
      titleKey = "auth.meta.title";
    } else if (pathname === "/dashboard") {
      titleKey = "dashboard.meta.title";
    } else if (pathname === "/dashboard/analytics") {
      titleKey = "dashboard.analytics.meta.title";
    } else if (pathname === "/dashboard/tasks") {
      titleKey = "dashboard.tasks.meta.title";
    } else if (pathname === "/dashboard/team") {
      titleKey = "dashboard.team.meta.title";
    } else if (pathname === "/profile") {
      titleKey = "profile.meta.title";
    } else if (pathname === "/dashboard/projects") {
      titleKey = "dashboard.projects.meta.title";
    }

    document.title = t(titleKey);

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", t("common.appDescription"));
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = t("common.appDescription");
      document.head.appendChild(meta);
    }
  }, [t, pathname, language]);

  return null;
}
