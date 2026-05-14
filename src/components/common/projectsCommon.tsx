"use client";

import {
  Folder,
  Calendar as CalendarIcon,
  Users,
  Pencil,
  Trash2,
  User as UserIcon,
  Ban,
  Save,
  Plus,
  GripVertical,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badgeUi";
import { Button } from "@/components/ui/buttonUi";
import { Calendar } from "@/components/ui/calendarUi";

import { Card, CardContent, CardHeader } from "@/components/ui/cardUi";

import { Input } from "@/components/ui/inputUi";
import { Label } from "@/components/ui/labelUi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/selectUi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popoverUi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alertDialogUi";
import { useLanguage } from "@/contexts/languageContext";
import { useStore } from "@/contexts/storeContext";
import { calculateProjectTotal, formatPrice } from "@/utils/pricingUtils";

import type { Project, User } from "@/types";
import type { ProjectInput } from "@/app/api/shared/validatorsShared";

interface ProjectCardProps {
  project: Project;
  currentUser?: User;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onView: (projectId: string) => void;
  dragListeners?: Record<string, unknown>;
  dragAttributes?: Record<string, unknown>;
  isDragDisabled?: boolean;
  isOverlay?: boolean;
}

export function ProjectCard({
  project,
  currentUser,
  onEdit,
  onDelete,
  onView,
  dragListeners,
  dragAttributes,
  isDragDisabled,
  isOverlay: _isOverlay,
}: ProjectCardProps) {
  const { t, language } = useLanguage();
  const { tasks, sections } = useStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const teamMembersCount = project.teamMembers?.length || 0;
  const projectTotal = calculateProjectTotal(project.id, sections, tasks);

  return (
    <>
      <Card
        className={`hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border hover:border-primary/50 group cursor-pointer relative ${_isOverlay ? "!border-0 ring-2 ring-primary shadow-2xl" : ""}`}
        onClick={() => onView(project.id)}
      >
        <CardHeader className="pb-3 pl-3 pr-3 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              {!isDragDisabled && dragListeners && (
                <div
                  className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground p-1 -ml-1"
                  {...dragListeners}
                  {...dragAttributes}
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="h-5 w-5" />
                </div>
              )}

              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${project.color}15` }}
              >
                <Folder className="h-5 w-5" style={{ color: project.color }} />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="font-semibold text-base truncate">
                  {language === "ar" ? project.title.ar : project.title.en}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="px-2.5 py-0.5 text-xs font-semibold border"
                    style={{
                      backgroundColor: `${project.color}10`,
                      color: project.color,
                      borderColor: `${project.color}20`,
                    }}
                  >
                    {t(`dashboard.projects.status.${project.status}`)}
                  </Badge>
                </div>
              </div>
            </div>

            {currentUser && currentUser.role === "leader" && (
              <div className="flex items-center gap-1 -mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(project);
                  }}
                  aria-label={t("common.button.edit")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  aria-label={t("common.button.delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t mt-auto">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>
                {teamMembersCount} {t("dashboard.projects.form.labels.members")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                {formatPrice(projectTotal, language)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          onPointerDownOutside={(e: Event) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dashboard.projects.modals.delete.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.projects.modals.delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 pt-4">
            <AlertDialogAction asChild className="flex-1">
              <Button
                variant="destructive"
                onClick={() => onDelete(project.id)}
                className="bg-red-600 hover:bg-red-700 flex-1"
              >
                <Trash2 className="h-4 w-4" />
                {t("common.button.delete")}
              </Button>
            </AlertDialogAction>
            <AlertDialogCancel asChild>
              <Button variant="outline">
                <Ban className="h-4 w-4" />
                {t("common.button.cancel")}
              </Button>
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface ProjectFormProps {
  project?: Project;
  users: User[];
  onSubmit: (data: ProjectInput) => void;
  onCancel: () => void;
}

const projectFormSchema = z.object({
  title: z.object({
    en: z.string().min(3),
    ar: z.string().min(3),
  }),

  status: z.enum(["planning", "active", "completed", "on_hold"]),
  startDate: z.string(),
  endDate: z.string().optional(),
  color: z.string(),
  teamMembers: z.array(z.string()),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

export function ProjectForm({
  project,
  users,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const { t } = useLanguage();
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    project?.teamMembers || [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: project?.title || { en: "", ar: "" },

      status: project?.status,
      startDate: project?.startDate || "",
      endDate: project?.endDate || "",
      color: project?.color || "#3b82f6",
      teamMembers: project?.teamMembers || [],
    },
  });

  const selectedColor = watch("color");

  const colors = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
    "#6366f1",
    "#ef4444",
  ];

  const handleMemberToggle = (memberId: string) => {
    const newMembers = selectedMembers.includes(memberId)
      ? selectedMembers.filter((id) => id !== memberId)
      : [...selectedMembers, memberId];
    setSelectedMembers(newMembers);
    setValue("teamMembers", newMembers);
  };

  const onFormSubmit = (data: ProjectFormData) => {
    onSubmit({ ...data, teamMembers: selectedMembers });
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="flex flex-col flex-1 min-h-0"
    >
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain space-y-4 px-1 -mx-1">
        <div className="space-y-1">
          <Label htmlFor="title-en">
            {t("dashboard.projects.form.fields.titleEn")}
          </Label>
          <Input id="title-en" {...register("title.en")} dir="ltr" />
          {errors.title?.en && (
            <p className="text-sm text-red-600">
              {t("dashboard.projects.validation.titleMinEn")}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="title-ar">
            {t("dashboard.projects.form.fields.titleAr")}
          </Label>
          <Input id="title-ar" {...register("title.ar")} dir="rtl" />
          {errors.title?.ar && (
            <p className="text-sm text-red-600">
              {t("dashboard.projects.validation.titleMinAr")}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="status">
              {t("dashboard.projects.form.fields.status")}
            </Label>
            <Select
              value={watch("status") || undefined}
              onValueChange={(value: string) =>
                setValue(
                  "status",
                  value as "planning" | "active" | "completed" | "on_hold",
                )
              }
            >
              <SelectTrigger
                className={!watch("status") ? "text-muted-foreground" : ""}
              >
                <SelectValue
                  placeholder={t(
                    "dashboard.projects.placeholders.selectStatus",
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">
                  {t("dashboard.projects.status.planning")}
                </SelectItem>
                <SelectItem value="active">
                  {t("dashboard.projects.status.active")}
                </SelectItem>
                <SelectItem value="completed">
                  {t("dashboard.projects.status.completed")}
                </SelectItem>
                <SelectItem value="on_hold">
                  {t("dashboard.projects.status.on_hold")}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-600 mt-1">
                {t("common.validation.required")}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>{t("dashboard.projects.form.labels.selectColor")}</Label>
            <div className="flex gap-3 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    selectedColor === color ? "scale-125 ring-2" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {errors.color && (
              <p className="text-sm text-red-600 mt-1">
                {t("common.validation.required")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 flex flex-col">
            <Label htmlFor="startDate">
              {t("dashboard.projects.form.fields.startDate")}
            </Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal flex-1 ${
                      !watch("startDate") && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch("startDate") ? (
                      format(new Date(watch("startDate")!), "MM/dd/yyyy")
                    ) : (
                      <span>
                        {t("dashboard.projects.placeholders.selectStartDate")}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      watch("startDate")
                        ? new Date(watch("startDate")!)
                        : undefined
                    }
                    onSelect={(date) =>
                      setValue(
                        "startDate",
                        date ? format(date, "yyyy-MM-dd") : "",
                      )
                    }
                  />
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setValue("startDate", "")}
                disabled={!watch("startDate")}
                title={t("common.button.clear")}
              >
                <span className="sr-only">Clear</span>
                <span aria-hidden="true">✕</span>
              </Button>
            </div>
            {errors.startDate && (
              <p className="text-sm text-red-600 mt-1">
                {t("common.validation.required")}
              </p>
            )}
          </div>

          <div className="space-y-1 flex flex-col">
            <Label htmlFor="endDate">
              {t("dashboard.projects.form.fields.endDate")}
            </Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal flex-1 ${
                      !watch("endDate") && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch("endDate") ? (
                      format(new Date(watch("endDate")!), "MM/dd/yyyy")
                    ) : (
                      <span>
                        {t("dashboard.projects.placeholders.selectEndDate")}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      watch("endDate") ? new Date(watch("endDate")!) : undefined
                    }
                    onSelect={(date) =>
                      setValue(
                        "endDate",
                        date ? format(date, "yyyy-MM-dd") : "",
                      )
                    }
                  />
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setValue("endDate", "")}
                disabled={!watch("endDate")}
                title={t("common.button.clear")}
              >
                <span className="sr-only">Clear</span>
                <span aria-hidden="true">✕</span>
              </Button>
            </div>
            {errors.endDate && (
              <p className="text-sm text-red-600 mt-1">
                {t("common.validation.required")}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label>{t("dashboard.projects.form.fields.teamMembers")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-start h-auto min-h-[40px] px-3 py-2"
              >
                {selectedMembers.length === 0 ? (
                  <span className="text-muted-foreground font-normal">
                    {t("dashboard.team.placeholders.selectMembers")}
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {users
                      .filter((u) => selectedMembers.includes(u.id))
                      .map((user) => (
                        <Badge
                          key={user.id}
                          variant="secondary"
                          className={`text-xs ${
                            user.role === "leader"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                              : user.role === "client"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-300 dark:border-blue-800"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-400 border-slate-300 dark:border-slate-800"
                          }`}
                        >
                          {user.name}
                        </Badge>
                      ))}
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
            >
              <div className="max-h-80 overflow-auto p-2">
                {users.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {t("dashboard.team.list.noMembers")}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {users.map((user) => {
                      const getIconColor = (role: string) => {
                        switch (role) {
                          case "leader":
                            return "text-emerald-600 dark:text-emerald-400";
                          case "client":
                            return "text-blue-600 dark:text-blue-400";
                          case "member":
                            return "text-slate-600 dark:text-slate-400";
                          default:
                            return "text-gray-600 dark:text-gray-400";
                        }
                      };

                      return (
                        <div
                          key={user.id}
                          onClick={() => handleMemberToggle(user.id)}
                          className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors hover:bg-muted ${
                            selectedMembers.includes(user.id) ? "bg-muted" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <UserIcon
                              className={`h-5 w-5 ${getIconColor(user.role)} shrink-0`}
                            />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-medium text-sm truncate">
                                {user.name}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {t(`common.role.${user.role}`)}
                              </span>
                            </div>
                          </div>
                          {selectedMembers.includes(user.id) && (
                            <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          {errors.teamMembers && (
            <p className="text-sm text-red-600 mt-1">
              {t("common.validation.required")}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 pt-4 shrink-0">
        <Button type="submit" className="flex-1">
          {project ? (
            <Save className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {project ? t("common.button.update") : t("common.button.create")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <Ban className="h-4 w-4" />
          {t("common.button.cancel")}
        </Button>
      </div>
    </form>
  );
}
