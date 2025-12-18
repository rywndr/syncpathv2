import { Task } from "@/lib/db/schema";

export interface TaskListProps {
    onScroll?: (scrollTop: number) => void;
    scrollRef?: React.RefObject<HTMLDivElement | null>;
    isReadOnly?: boolean;
}

export interface TaskListHeaderProps {
    gridTemplate: string;
}

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
    isReadOnly?: boolean;
}

export type DropPosition = "before" | "after" | "inside";

export interface DragState {
    draggedTaskId: string | null;
    dragOverTaskId: string | null;
    dropPosition: DropPosition | null;
}

export interface DependenciesDialogProps {
    task: Task;
    allTasks: Task[];
    onUpdate: (updates: Partial<Task>) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
