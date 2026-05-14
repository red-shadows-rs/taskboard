import * as React from "react";

import { cn } from "@/components/ui/utilsUi";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, onBlur, ...props }, ref) => {
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (
      type !== "file" &&
      type !== "password" &&
      e.target.value !== e.target.value.trim()
    ) {
      e.target.value = e.target.value.trim();
    }
    onBlur?.(e);
  };

  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      onBlur={handleBlur}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
