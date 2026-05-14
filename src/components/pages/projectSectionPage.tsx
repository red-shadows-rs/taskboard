"use client";

import {
  useSortable,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import {
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  GripVertical,
  FileDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { SortableTask } from "@/components/common/sortableCommon";
import { Badge } from "@/components/ui/badgeUi";
import { Button } from "@/components/ui/buttonUi";
import { cn } from "@/components/ui/utilsUi";
import { useLanguage } from "@/contexts/languageContext";
import { exportSectionPDF } from "@/utils/pdfUtil";
import toast from "react-hot-toast";

import type { Section, Task, User, Project } from "@/types";

interface ProjectSectionProps {
  section: Section;
  tasks: Task[];
  users: User[];
  currentUser: User;
  project?: Project | null;
  expandedSections: Set<string>;
  toggleSection: (sectionId: string) => void;

  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  onAddTask: (section: Section) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: string) => void;
  onTaskClick: (task: Task) => void;
  isDragDisabled?: boolean;
  isOverlay?: boolean;
}

export function ProjectSection({
  section,
  tasks,
  users,
  currentUser,
  project,
  expandedSections,
  toggleSection,

  onEditSection,
  onDeleteSection,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onTaskStatusChange,
  onTaskClick,
  isDragDisabled,
  isOverlay,
}: ProjectSectionProps) {
  const { t, language } = useLanguage();
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: section.id,
    data: {
      type: "Section",
      section,
    },
  });
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
    data: {
      type: "Section",
      section,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isLeaderOrClient =
    currentUser.role === "leader" || currentUser.role === "client";

  const handleExportSection = async () => {
    try {
      await exportSectionPDF({
        section,
        tasks,
        users,
        project: project || null,
        language,
        translations: t,
      });
      toast.success(t("dashboard.tasks.messages.success.reportGenerated"));
    } catch (_error) {
      toast.error(
        t("dashboard.tasks.messages.error.exportFailed") ||
          "Failed to export PDF",
      );
    }
  };

  return (
    <motion.div
      initial={isOverlay ? false : { opacity: 0, y: 10 }}
      animate={isOverlay ? false : { opacity: 1, y: 0 }}
      className="group"
      ref={(node) => {
        setNodeRef(node);
        setDroppableRef(node);
      }}
      style={style}
    >
      <div
        className={cn(
          "rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-300",
          isDragging ? "shadow-2xl z-50" : "hover:shadow-md",
          isOver && "ring-2 ring-primary/50 bg-primary/5",
        )}
      >
        <div
          className="p-3 flex items-center justify-between cursor-pointer bg-muted/10 hover:bg-muted/30 transition-colors"
          onClick={() => toggleSection(section.id)}
        >
          <div className="flex items-center gap-3">
            {!isDragDisabled && (
              <div
                className="cursor-move text-muted-foreground/50 hover:text-muted-foreground mr-2"
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-5 w-5" />
              </div>
            )}
            <div
              className={cn(
                "transition-transform duration-300",
                expandedSections.has(section.id) ? "rotate-90" : "",
              )}
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">
              {language === "ar" ? section.title.ar : section.title.en}
            </h3>
            <Badge variant="outline" className="text-xs">
              {tasks.length} {t("dashboard.tasks.header.title")}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleExportSection();
              }}
              title={t("dashboard.projects.card.actions.export")}
            >
              <FileDown className="h-4 w-4" />
            </Button>
            {isLeaderOrClient && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSection(section);
                  }}
                  title={t("dashboard.tasks.list.editSection")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSection(section);
                  }}
                  className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                  title={t("common.button.delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {!isOverlay && expandedSections.has(section.id) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <div className="p-3 pt-0 border-t bg-background/50">
                <div className="py-3 flex justify-between items-center">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {" "}
                    {t("dashboard.tasks.list.actionItems")}{" "}
                  </h4>
                  {isLeaderOrClient && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddTask(section);
                      }}
                      className="gap-2 h-9"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t("dashboard.tasks.list.createButton")}
                    </Button>
                  )}
                </div>

                <div className="space-y-3 min-h-[50px]">
                  <SortableContext
                    items={tasks.map((t) => t.id)}
                    strategy={rectSortingStrategy}
                  >
                    {tasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic py-2 pl-4 border-l-2">
                        {t("dashboard.tasks.list.noTasks")}
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {tasks.map((task) => (
                          <SortableTask
                            key={task.id}
                            task={task}
                            users={users}
                            currentUser={currentUser}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                            onStatusChange={onTaskStatusChange}
                            onClick={onTaskClick}
                            isDragDisabled={isDragDisabled}
                          />
                        ))}
                      </div>
                    )}
                  </SortableContext>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
