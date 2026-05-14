"use client";

import { LayoutDashboard } from "lucide-react";

import { cn } from "@/components/ui/utilsUi";

interface LoadingProps {
  fullScreen?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Loading({
  fullScreen = false,
  className,
  size = "md",
}: LoadingProps) {
  const sizes = {
    sm: { icon: "h-4 w-4" },
    md: { icon: "h-12 w-12" },
    lg: { icon: "h-16 w-16" },
  };

  const { icon } = sizes[size];

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <div className="relative">
        <LayoutDashboard className={`${icon} text-primary animate-pulse`} />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
}
