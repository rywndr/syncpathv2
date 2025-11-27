import { Task } from "@/lib/db/schema";

/**
 * Drag and drop pos types
 */
export type DropPosition = "before" | "after" | "inside";

/**
 * Drag state for task list
 */
export interface DragState {
    draggedTaskId: string | null;
    dragOverTaskId: string | null;
    dropPosition: DropPosition | null;
}

/**
 * Props for main TaskList component
 */
export interface TaskListProps {
    onScroll?: (scrollTop: number) => void;
    scrollRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Props for TaskRow component
 */
export interface TaskRowProps {
    task: Task;
    allTasks: Task[];
    groupTasks: Task[];
    number: string;
    depth: number;
    isCollapsed: boolean;
    hasChildren: boolean;
    onToggleCollapse: () => void;
    onUpdate: (updates: Partial<Task>) => void;
    onDelete: () => void;
    // Drag and drop props
    isDragging: boolean;
    isDragOver: boolean;
    dropPosition: DropPosition | null;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
}

/**
 * Props for TaskListHeader component
 */
export interface TaskListHeaderProps {
    gridTemplate: string;
}

/**
 * Props for DependenciesDialog component
 */
export interface DependenciesDialogProps {
    task: Task;
    allTasks: Task[];
    onUpdate: (updates: Partial<Task>) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
