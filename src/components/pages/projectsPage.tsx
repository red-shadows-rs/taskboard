"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

import { ProjectCard, ProjectForm } from "@/components/common/projectsCommon";
import { PageTitle } from "@/components/common/titleCommon";
import { Button } from "@/components/ui/buttonUi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialogUi";
import { Input } from "@/components/ui/inputUi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/selectUi";
import { useLanguage } from "@/contexts/languageContext";
import { useStore } from "@/contexts/storeContext";
import { cn } from "@/components/ui/utilsUi";

import type { User, Project } from "@/types";
import type { ProjectInput } from "@/app/api/shared/validatorsShared";

interface SortableProjectWrapperProps {
  project: Project;
  currentUser: User;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onView: (projectId: string) => void;
  isDragDisabled?: boolean;
}

function SortableProjectWrapper({
  project,
  currentUser,
  onEdit,
  onDelete,
  onView,
  isDragDisabled,
}: SortableProjectWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
    disabled: isDragDisabled,
    data: {
      type: "Project",
      project,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none",
    cursor: isDragDisabled ? "default" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "h-full transition-all duration-200",
        isDragging && "scale-105 shadow-2xl z-50",
        !isDragDisabled && "hover:shadow-lg",
      )}
    >
      <ProjectCard
        project={project}
        currentUser={currentUser}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        dragListeners={listeners as unknown as Record<string, unknown>}
        dragAttributes={attributes as unknown as Record<string, unknown>}
        isDragDisabled={isDragDisabled}
      />
    </div>
  );
}

interface ProjectsPageProps {
  user: User;
}

export function ProjectsPage({ user }: ProjectsPageProps) {
  const { t, language } = useLanguage();
  const {
    projects,
    users,
    setProjects,
    setUsers,
    addProject,
    updateProject,
    deleteProject,
    filteredProjects,
    setSearchQuery,
    setStatusFilter,
  } = useStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [statusFilter, setLocalStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => {
      window.removeEventListener("resize", checkIsDesktop);
    };
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        const loadedProjects = data.projects || [];
        loadedProjects.sort(
          (a: Project, b: Project) => (a.order || 0) - (b.order || 0),
        );
        setProjects(loadedProjects);
      }
    } catch (_error) {
      toast.error(t("dashboard.projects.messages.error.fetchFailed"));
    }
  }, [setProjects, t]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (_error) {
      toast.error(t("dashboard.team.messages.error.fetchFailed"));
    }
  }, [setUsers, t]);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, [fetchProjects, fetchUsers]);

  useEffect(() => {
    setSearchQuery(searchTerm);
  }, [searchTerm, setSearchQuery]);

  useEffect(() => {
    setStatusFilter(statusFilter === "all" ? "all" : statusFilter);
  }, [statusFilter, setStatusFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (!isDesktop) return;
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!isDesktop) return;
    setActiveDragId(null);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newProjects = arrayMove(projects, oldIndex, newIndex).map(
        (p, idx) => ({
          ...p,
          order: idx,
        }),
      );
      setProjects(newProjects);

      try {
        await Promise.all(
          newProjects.map((p) =>
            fetch(`/api/projects/${p.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order: p.order }),
            }),
          ),
        );
      } catch (_error) {
        toast.error(t("common.apiErrors.failedToUpdateProjectOrder"));
      }
    }
  };

  const handleCreateProject = async (projectData: ProjectInput) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const data = await response.json();
        addProject(data.project);
        setIsCreateDialogOpen(false);
        toast.success(t("dashboard.projects.messages.success.created"));
      } else {
        toast.error(t("dashboard.projects.messages.error.createFailed"));
      }
    } catch (_error) {
      toast.error(t("dashboard.projects.messages.error.createFailed"));
    }
  };

  const handleUpdateProject = async (projectData: ProjectInput) => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const data = await response.json();
        updateProject(selectedProject.id, data.project);
        setIsEditDialogOpen(false);
        setSelectedProject(null);
        toast.success(t("dashboard.projects.messages.success.updated"));
      } else {
        toast.error(t("dashboard.projects.messages.error.updateFailed"));
      }
    } catch (_error) {
      toast.error(t("dashboard.projects.messages.error.updateFailed"));
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        deleteProject(projectId);
        toast.success(t("dashboard.projects.messages.success.deleted"));
      } else {
        toast.error(t("dashboard.projects.messages.error.deleteFailed"));
      }
    } catch (_error) {
      toast.error(t("dashboard.projects.messages.error.deleteFailed"));
    }
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleViewProject = (projectId: string) => {
    window.location.href = `/dashboard/projects/${projectId}`;
  };

  const displayedProjects =
    searchTerm || (statusFilter && statusFilter !== "all")
      ? filteredProjects
      : projects;

  const isDragEnabled = isDesktop && !searchTerm && statusFilter === "all";

  if (isDragEnabled) {
    displayedProjects.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  if (!mounted) return null;

  return (
    <>
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-8 py-8">
        <PageTitle title="projects" />

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
            <div className="relative flex-1">
              <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t("dashboard.projects.filters.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ltr:pl-10 rtl:pr-10"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={setLocalStatusFilter}
              dir={language === "ar" ? "rtl" : "ltr"}
            >
              <SelectTrigger
                className="w-full sm:w-[200px]"
                suppressHydrationWarning
              >
                <SelectValue placeholder={t("dashboard.filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("dashboard.filters.allStatuses")}
                </SelectItem>
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
          </div>

          {user.role === "leader" && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("dashboard.projects.list.createButton")}
            </Button>
          )}
        </div>

        {displayedProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t("dashboard.projects.list.noProjects")}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={isDragEnabled ? sensors : undefined}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayedProjects.map((p) => p.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProjects.map((project) => (
                  <SortableProjectWrapper
                    key={project.id}
                    project={project}
                    currentUser={user}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                    onView={handleViewProject}
                    isDragDisabled={!isDragEnabled}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeDragId ? (
                <div className="opacity-90 rotate-2 scale-105 cursor-grabbing shadow-2xl">
                  {(() => {
                    const project = projects.find((p) => p.id === activeDragId);
                    if (!project) return null;
                    return (
                      <ProjectCard
                        project={project}
                        currentUser={user}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteProject}
                        onView={handleViewProject}
                        isOverlay={true}
                      />
                    );
                  })()}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent
          className="max-w-2xl"
          onPointerDownOutside={(e: Event) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.projects.modals.create.title")}
            </DialogTitle>
            <DialogDescription>
              {t("dashboard.projects.modals.create.description")}
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            users={users}
            onSubmit={handleCreateProject}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent
          className="max-w-2xl"
          onPointerDownOutside={(e: Event) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.projects.modals.edit.title")}
            </DialogTitle>
            <DialogDescription>
              {t("dashboard.projects.modals.edit.description")}
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <ProjectForm
              project={selectedProject}
              users={users}
              onSubmit={handleUpdateProject}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedProject(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
