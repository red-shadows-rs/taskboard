// ─────────────────────────────────────────────
// TaskBoard - Demo Banner Layout Component
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/languageContext";
import { Button } from "@/components/ui/buttonUi";

export function DemoBanner() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const response = await fetch("/api/demo/reset", { method: "POST" });
      if (response.ok) {
        toast.success(t("common.demo.resetSuccess"));
        router.refresh();
      } else {
        toast.error("Failed to reset demo data");
      }
    } catch {
      toast.error("Failed to reset demo data");
    } finally {
      setIsResetting(false);
    }
  };

  const handleExit = async () => {
    try {
      await fetch("/api/demo/exit", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <div className="relative z-40 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-2 text-xs text-foreground sm:px-6 shadow-sm">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {t("common.demo.badge")}
        </span>
        <span className="truncate text-muted-foreground sm:inline">
          {t("common.demo.description")}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isResetting}
          onClick={handleReset}
          className="h-7 gap-1.5 border-border bg-background px-2.5 text-xs font-medium text-foreground hover:bg-muted"
        >
          <RotateCcw
            className={`h-3.5 w-3.5 ${isResetting ? "animate-spin" : ""}`}
          />
          <span>
            {isResetting
              ? t("common.demo.resetting")
              : t("common.demo.resetButton")}
          </span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleExit}
          className="h-7 gap-1.5 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{t("common.demo.exitButton")}</span>
        </Button>
      </div>
    </div>
  );
}
