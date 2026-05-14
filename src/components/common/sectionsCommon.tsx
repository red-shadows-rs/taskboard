"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, Folder, Save, Plus, Ban } from "lucide-react";
import { memo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badgeUi";
import { Button } from "@/components/ui/buttonUi";
import { Card, CardContent, CardHeader } from "@/components/ui/cardUi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialogUi";
import { Input } from "@/components/ui/inputUi";
import { Label } from "@/components/ui/labelUi";
import { useLanguage } from "@/contexts/languageContext";

import type { Section, User, Project } from "@/types";
import type { SectionInput } from "@/app/api/shared/validatorsShared";
import type { MouseEvent } from "react";

interface SectionDetailsDialogProps {
  section: Section;
  projects: Project[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SectionDetailsDialog({
  section,
  projects,
  open,
  onOpenChange,
}: SectionDetailsDialogProps) {
  const { t, language } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e: Event) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {language === "ar" ? section.title.ar : section.title.en}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("dashboard.tasks.card.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            {projects.find((p) => p.id === section.projectId) && (
              <div className="space-y-1.5 col-span-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                  <Folder className="h-3.5 w-3.5" />
                  {t("dashboard.projects.card.title")}
                </h4>
                <Badge
                  variant="outline"
                  className="text-sm py-1 px-3 w-fit border-primary/20 text-primary"
                >
                  {language === "ar"
                    ? projects.find((p) => p.id === section.projectId)?.title.ar
                    : projects.find((p) => p.id === section.projectId)?.title
                        .en}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SectionCardProps {
  section: Section;
  isDragDisabled?: boolean;
  onClick?: (section: Section) => void;
  currentUser?: User;
  onEdit?: (section: Section) => void;
  hideEditDelete?: boolean;
  isOverlay?: boolean;
  projects?: Project[];
}

const SectionCard = memo(function SectionCard({
  section,
  isDragDisabled = false,
  onClick,
  currentUser,
  onEdit,
  hideEditDelete = false,
  isOverlay = false,
  projects,
}: SectionCardProps) {
  const { t, language } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragDisabled ? "default" : isDragging ? "grabbing" : "grab",
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const showButtons =
    (!hideEditDelete || isMobile) && !isDragging && !isOverlay;

  const handleClick = (_e: MouseEvent) => {
    if (isDragging) return;
    if (onClick) {
      onClick(section);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(!isDragDisabled && listeners)}
      className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-2 hover:border-primary/50 group"
      onClick={handleClick}
      suppressHydrationWarning
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm line-clamp-2 flex-1">
            {language === "ar" ? section.title.ar : section.title.en}
          </h3>
          {currentUser && showButtons && (
            <div className="flex items-center gap-1">
              {(currentUser.role === "leader" ||
                currentUser.role === "client") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      currentUser.role === "leader" ||
                      currentUser.role === "client"
                    ) {
                      onEdit?.(section);
                    }
                  }}
                  aria-label={t("common.button.edit")}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {projects && projects.find((p) => p.id === section.projectId) && (
          <div className="mb-3">
            <Badge
              variant="outline"
              className="text-xs font-medium border-primary/20 text-primary"
            >
              {language === "ar"
                ? projects.find((p) => p.id === section.projectId)?.title.ar
                : projects.find((p) => p.id === section.projectId)?.title.en}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export { SectionCard };

interface SectionFormProps {
  section?: Section;
  onSubmit: (data: SectionInput) => void;
  onCancel: () => void;
}

export function SectionForm({ section, onSubmit, onCancel }: SectionFormProps) {
  const { t } = useLanguage();

  const sectionFormSchema = z.object({
    projectId: z.string(),
    title: z.object({
      en: z.string().min(3, t("dashboard.projects.validation.titleMinEn")),
      ar: z.string().min(3, t("dashboard.projects.validation.titleMinAr")),
    }),
    order: z.number().optional(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SectionInput>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: section
      ? {
          title: section.title,
          projectId: section.projectId,
        }
      : {
          projectId: "",
          title: { en: "", ar: "" },
        },
  });

  const handleFormSubmit = (data: SectionInput) => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col flex-1 min-h-0"
    >
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain space-y-4 px-1 -mx-1 py-4">
        <div className="space-y-1">
          <Label htmlFor="title-en">
            {t("dashboard.projects.form.fields.titleEn")}
          </Label>
          <Input id="title-en" dir="ltr" {...register("title.en")} />
          {errors.title?.en && (
            <p className="text-sm text-red-600 mt-1">
              {t("dashboard.projects.validation.titleMinEn")}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="title-ar">
            {t("dashboard.projects.form.fields.titleAr")}
          </Label>
          <Input id="title-ar" dir="rtl" {...register("title.ar")} />
          {errors.title?.ar && (
            <p className="text-sm text-red-600 mt-1">
              {t("dashboard.projects.validation.titleMinAr")}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 pt-4 shrink-0">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {section ? (
            <Save className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {section ? t("common.button.update") : t("common.button.create")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <Ban className="h-4 w-4" />
          {t("common.button.cancel")}
        </Button>
      </div>
    </form>
  );
}
