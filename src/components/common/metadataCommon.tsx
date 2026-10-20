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
    } else if (pathname === "/tasks") {
      titleKey = "tasks.meta.title";
    } else if (pathname === "/analytics") {
      titleKey = "analytics.meta.title";
    } else if (pathname === "/team") {
      titleKey = "team.meta.title";
    } else if (pathname === "/profile") {
      titleKey = "profile.meta.title";
    } else if (pathname?.startsWith("/projects")) {
      titleKey = "projects.meta.title";
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
