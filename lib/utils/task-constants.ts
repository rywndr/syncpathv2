import { TaskDependency } from "@/lib/db/schema";

// Grid layout config

/**
 * Column config for task list grid
 * order in: drag-handle, row#, name, type, status, start, end, %, days, cost, parent, assignee, deps, delete
 */
export const GRID_TEMPLATE =
    "20px 28px minmax(80px, 2fr) minmax(80px, 0.4fr) minmax(85px, 0.4fr) minmax(80px, 0.3fr) minmax(80px, 0.3fr) 40px 40px minmax(60px, 0.9fr) minmax(60px, 0.9fr) 26px 26px 26px";

// Dependency types
export interface DependencyTypeOption {
    value: TaskDependency["type"];
    label: string;
    description: string;
}

export const DEPENDENCY_TYPES: DependencyTypeOption[] = [
    { value: "FS", label: "FS", description: "Finish-Start" },
    { value: "FF", label: "FF", description: "Finish-Finish" },
    { value: "SS", label: "SS", description: "Start-Start" },
    { value: "SF", label: "SF", description: "Start-Finish" },
];

// Status config
export type TaskStatus = "pending" | "in-progress" | "completed" | "blocked";

export const STATUS_COLORS: Record<TaskStatus, string> = {
    pending: "text-yellow-600 dark:text-yellow-500",
    "in-progress": "text-blue-600 dark:text-blue-500",
    completed: "text-green-600 dark:text-green-500",
    blocked: "text-red-600 dark:text-red-500",
};

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "blocked", label: "Blocked" },
];

// Task type
export type TaskType = "task" | "milestone" | "group";

export const TYPE_ICONS: Record<TaskType, string> = {
    task: "○",
    milestone: "◆",
    group: "▸",
};

export const TYPE_OPTIONS: { value: TaskType; label: string; icon: string }[] =
    [
        { value: "task", label: "Task", icon: "○" },
        { value: "milestone", label: "Milestone", icon: "◆" },
        { value: "group", label: "Group", icon: "▸" },
    ];

// Drag n drop types
export type DropPosition = "before" | "after" | "inside";

export interface DragState {
    draggedTaskId: string | null;
    dragOverTaskId: string | null;
    dropPosition: DropPosition | null;
}

export const INITIAL_DRAG_STATE: DragState = {
    draggedTaskId: null,
    dragOverTaskId: null,
    dropPosition: null,
};
