import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "@/components/common/tasksCommon";
import { Task, User } from "@/types";
import { cn } from "@/components/ui/utilsUi";

interface SortableTaskProps {
  task: Task;
  users: User[];
  currentUser: User;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: string) => void;
  onClick?: (task: Task) => void;
  isDragDisabled?: boolean;
}

export function SortableTask({
  task,
  users,
  currentUser,
  onEdit,
  onDelete,
  onStatusChange,
  onClick,
  isDragDisabled,
}: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isDragDisabled,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragDisabled ? "default" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isDragDisabled ? {} : listeners)}
      className={cn(
        "relative transition-all duration-200 group/card",
        isDragging && "scale-105 shadow-2xl z-50",
        !isDragDisabled && "hover:shadow-lg",
      )}
    >
      <TaskCard
        task={task}
        users={users}
        currentUser={currentUser}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onClick={onClick}
        isDragDisabled={isDragDisabled || isDragging}
        isListView={false}
      />
    </div>
  );
}
