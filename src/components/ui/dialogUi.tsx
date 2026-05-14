import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/components/ui/utilsUi";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    onPointerDownOutside?: (event: Event) => void;
  }
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] sm:w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out rounded-lg sm:rounded-lg",
        "max-h-[calc(100dvh-4rem)] sm:max-h-[85vh] overflow-hidden flex flex-col",
        className,
      )}
      onPointerDownOutside={(e) => {
        e.preventDefault();
        props.onPointerDownOutside?.(e);
      }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute ltr:right-4 rtl:left-4 top-4 sm:top-6 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10 bg-background">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 ltr:text-left rtl:text-right ltr:pr-10 rtl:pl-10 shrink-0",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 rtl:sm:flex-row-reverse shrink-0",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain -mx-4 sm:-mx-6 px-4 sm:px-6 -mb-4 sm:-mb-6 pb-4 sm:pb-6",
      className,
    )}
    {...props}
  />
);
DialogBody.displayName = "DialogBody";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-tight tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogBody,
  DialogTitle,
  DialogDescription,
};
