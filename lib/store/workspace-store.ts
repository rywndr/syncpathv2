import { create } from "zustand";
import { toast } from "sonner";
import { Task } from "@/lib/db/schema";
import {
    batchUpdateTasks,
    createTask,
    deleteTask,
} from "@/lib/actions/task-actions";

interface WorkspaceStore {
    tasks: Task[];
    projectId: string | null;
    isLoading: boolean;
    collapsedGroups: Set<string>;
    // Map of parentId (or 'root' for top-level) to ordered array of task IDs
    siblingOrder: Map<string, string[]>;
    // Display options
    showLinks: boolean;
    showDelay: boolean;

    // Actions
    initWorkspace: (projectId: string, tasks: Task[]) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    addTask: (task: Task) => Promise<void>;
    removeTask: (taskId: string) => Promise<void>;
    toggleGroupCollapse: (taskId: string) => void;
    isGroupCollapsed: (taskId: string) => boolean;
    reorderTasks: (
        draggedTaskId: string,
        targetTaskId: string,
        position: "before" | "after" | "inside",
    ) => void;
    getSiblingOrder: (parentId: string | null) => string[];
    setShowLinks: (show: boolean) => void;
    setShowDelay: (show: boolean) => void;
}

// Module-level variables for debouncing to avoid state pollution
let saveTimeout: NodeJS.Timeout | null = null;
const pendingUpdates = new Map<string, Partial<Task>>();
const SAVE_DELAY = 2000;

/**
 * Build initial sibling order map from tasks array.
 * Groups tasks by parentId and preserves their array order.
 */
function buildSiblingOrderMap(tasks: Task[]): Map<string, string[]> {
    const orderMap = new Map<string, string[]>();

    // Group tasks by parent
    tasks.forEach((task) => {
        const parentKey = task.parentId || "root";
        if (!orderMap.has(parentKey)) {
            orderMap.set(parentKey, []);
        }
        orderMap.get(parentKey)!.push(task.id);
    });

    return orderMap;
}

/**
 * Insert a task ID at a specific position relative to a target in the order array.
 */
function insertAtPosition(
    order: string[],
    taskId: string,
    targetId: string,
    position: "before" | "after",
): string[] {
    // Remove taskId if it exists
    const filtered = order.filter((id) => id !== taskId);
    const targetIndex = filtered.indexOf(targetId);

    if (targetIndex === -1) {
        // Target not found, append at end
        return [...filtered, taskId];
    }

    const insertIndex = position === "before" ? targetIndex : targetIndex + 1;
    const result = [...filtered];
    result.splice(insertIndex, 0, taskId);
    return result;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
    tasks: [],
    projectId: null,
    isLoading: false,
    collapsedGroups: new Set<string>(),
    siblingOrder: new Map<string, string[]>(),
    showLinks: true,
    showDelay: true,

    initWorkspace: (projectId, tasks) => {
        // Ensure dates are proper Date objects (handling Next.js serialization)
        const parsedTasks = tasks.map((t) => ({
            ...t,
            startDate: t.startDate ? new Date(t.startDate) : null,
            endDate: t.endDate ? new Date(t.endDate) : null,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
        }));

        // Build initial sibling order from the tasks array
        const siblingOrder = buildSiblingOrderMap(parsedTasks);

        set({
            projectId,
            tasks: parsedTasks,
            collapsedGroups: new Set<string>(),
            siblingOrder,
        });
    },

    toggleGroupCollapse: (taskId) => {
        set((state) => {
            const next = new Set(state.collapsedGroups);
            if (next.has(taskId)) {
                next.delete(taskId);
            } else {
                next.add(taskId);
            }
            return { collapsedGroups: next };
        });
    },

    isGroupCollapsed: (taskId) => {
        return get().collapsedGroups.has(taskId);
    },

    getSiblingOrder: (parentId) => {
        const { siblingOrder, tasks } = get();
        const key = parentId || "root";
        const order = siblingOrder.get(key);

        if (order) {
            return order;
        }

        // Fallback: return tasks with this parent in their original order
        return tasks.filter((t) => t.parentId === parentId).map((t) => t.id);
    },

    addTask: async (task) => {
        const { projectId } = get();
        if (!projectId) return;

        // Optimistic update
        set((state) => {
            // Add task to sibling order
            const parentKey = task.parentId || "root";
            const newSiblingOrder = new Map(state.siblingOrder);
            const currentOrder = newSiblingOrder.get(parentKey) || [];
            newSiblingOrder.set(parentKey, [...currentOrder, task.id]);

            return {
                tasks: [...state.tasks, task],
                siblingOrder: newSiblingOrder,
            };
        });

        try {
            const result = await createTask(projectId, task);
            if (!result.success) {
                // Revert
                set((state) => {
                    const parentKey = task.parentId || "root";
                    const newSiblingOrder = new Map(state.siblingOrder);
                    const currentOrder = newSiblingOrder.get(parentKey) || [];
                    newSiblingOrder.set(
                        parentKey,
                        currentOrder.filter((id) => id !== task.id),
                    );

                    return {
                        tasks: state.tasks.filter((t) => t.id !== task.id),
                        siblingOrder: newSiblingOrder,
                    };
                });
                toast.error("Failed to create task");
            }
        } catch (error) {
            console.error("Failed to create task:", error);
            // Revert
            set((state) => {
                const parentKey = task.parentId || "root";
                const newSiblingOrder = new Map(state.siblingOrder);
                const currentOrder = newSiblingOrder.get(parentKey) || [];
                newSiblingOrder.set(
                    parentKey,
                    currentOrder.filter((id) => id !== task.id),
                );

                return {
                    tasks: state.tasks.filter((t) => t.id !== task.id),
                    siblingOrder: newSiblingOrder,
                };
            });
            toast.error("Failed to create task");
        }
    },

    removeTask: async (taskId) => {
        const { projectId, tasks } = get();
        if (!projectId) return;

        const taskToRemove = tasks.find((t) => t.id === taskId);
        if (!taskToRemove) return;

        // Optimistic update
        set((state) => {
            const parentKey = taskToRemove.parentId || "root";
            const newSiblingOrder = new Map(state.siblingOrder);
            const currentOrder = newSiblingOrder.get(parentKey) || [];
            newSiblingOrder.set(
                parentKey,
                currentOrder.filter((id) => id !== taskId),
            );

            return {
                tasks: state.tasks.filter((t) => t.id !== taskId),
                siblingOrder: newSiblingOrder,
            };
        });

        try {
            const result = await deleteTask(taskId, projectId);
            if (!result.success) {
                // Revert
                set((state) => {
                    const parentKey = taskToRemove.parentId || "root";
                    const newSiblingOrder = new Map(state.siblingOrder);
                    const currentOrder = newSiblingOrder.get(parentKey) || [];
                    newSiblingOrder.set(parentKey, [...currentOrder, taskId]);

                    return {
                        tasks: [...state.tasks, taskToRemove],
                        siblingOrder: newSiblingOrder,
                    };
                });
                toast.error("Failed to delete task");
            }
        } catch (error) {
            console.error("Failed to delete task:", error);
            // Revert
            set((state) => {
                const parentKey = taskToRemove.parentId || "root";
                const newSiblingOrder = new Map(state.siblingOrder);
                const currentOrder = newSiblingOrder.get(parentKey) || [];
                newSiblingOrder.set(parentKey, [...currentOrder, taskId]);

                return {
                    tasks: [...state.tasks, taskToRemove],
                    siblingOrder: newSiblingOrder,
                };
            });
            toast.error("Failed to delete task");
        }
    },

    updateTask: (taskId, updates) => {
        const { tasks, projectId, siblingOrder } = get();
        if (!projectId) return;

        const oldTask = tasks.find((t) => t.id === taskId);
        if (!oldTask) return;

        // Handle parentId changes - update sibling order
        let newSiblingOrder = siblingOrder;
        if (
            updates.parentId !== undefined &&
            updates.parentId !== oldTask.parentId
        ) {
            newSiblingOrder = new Map(siblingOrder);
            const oldParentKey = oldTask.parentId || "root";
            const newParentKey = updates.parentId || "root";

            // Remove from old parent's order
            const oldOrder = newSiblingOrder.get(oldParentKey) || [];
            newSiblingOrder.set(
                oldParentKey,
                oldOrder.filter((id) => id !== taskId),
            );

            // Add to new parent's order
            const newOrder = newSiblingOrder.get(newParentKey) || [];
            newSiblingOrder.set(newParentKey, [...newOrder, taskId]);
        }

        // 1. Optimistic Update
        set({
            tasks: tasks.map((t) =>
                t.id === taskId ? { ...t, ...updates } : t,
            ),
            siblingOrder: newSiblingOrder,
        });

        // 2. Queue update
        const currentPending = pendingUpdates.get(taskId) || {};
        pendingUpdates.set(taskId, { ...currentPending, ...updates });

        // 3. Debounced Save
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }

        saveTimeout = setTimeout(async () => {
            const updatesList = Array.from(pendingUpdates.entries()).map(
                ([id, data]) => ({
                    id,
                    projectId,
                    ...data,
                }),
            );

            // Clear pending queue immediately so new updates can accumulate
            pendingUpdates.clear();
            saveTimeout = null;

            if (updatesList.length > 0) {
                try {
                    const result = await batchUpdateTasks(
                        projectId,
                        updatesList,
                    );
                    if (!result.success) {
                        toast.error("Failed to save changes");
                        // In a real app, we might want to revert the optimistic updates here
                    }
                } catch (error) {
                    console.error("Auto-save error:", error);
                    toast.error("Failed to save changes");
                }
            }
        }, SAVE_DELAY);
    },

    reorderTasks: (draggedTaskId, targetTaskId, position) => {
        const { tasks, projectId, updateTask, siblingOrder } = get();
        if (!projectId) return;

        const draggedTask = tasks.find((t) => t.id === draggedTaskId);
        const targetTask = tasks.find((t) => t.id === targetTaskId);

        if (!draggedTask || !targetTask) return;

        // Prevent dropping a task on itself
        if (draggedTaskId === targetTaskId) return;

        // Prevent dropping a task inside itself or its descendants
        const isDescendant = (
            parentId: string | null,
            childId: string,
        ): boolean => {
            if (!parentId) return false;
            if (parentId === childId) return true;
            const parent = tasks.find((t) => t.id === parentId);
            return parent ? isDescendant(parent.parentId, childId) : false;
        };

        if (
            position === "inside" &&
            isDescendant(targetTaskId, draggedTaskId)
        ) {
            toast.error("Cannot move a task inside its own descendant");
            return;
        }

        let newParentId: string | null;
        const newSiblingOrder = new Map(siblingOrder);

        if (position === "inside") {
            // Moving inside a group - the target becomes the parent
            if (targetTask.type !== "group") {
                toast.error("Can only move tasks inside groups");
                return;
            }
            newParentId = targetTaskId;

            // Remove from old parent
            const oldParentKey = draggedTask.parentId || "root";
            const oldOrder = newSiblingOrder.get(oldParentKey) || [];
            newSiblingOrder.set(
                oldParentKey,
                oldOrder.filter((id) => id !== draggedTaskId),
            );

            // Add to new parent (at the end)
            const newParentKey = newParentId;
            const newOrder = newSiblingOrder.get(newParentKey) || [];
            newSiblingOrder.set(newParentKey, [...newOrder, draggedTaskId]);

            // Update parent if changed
            if (draggedTask.parentId !== newParentId) {
                set({ siblingOrder: newSiblingOrder });
                updateTask(draggedTaskId, { parentId: newParentId });
            } else {
                set({ siblingOrder: newSiblingOrder });
            }
        } else {
            // Moving before/after - inherit the target's parent
            newParentId = targetTask.parentId;

            const oldParentKey = draggedTask.parentId || "root";
            const newParentKey = newParentId || "root";

            if (oldParentKey === newParentKey) {
                // Same parent - just reorder within siblings
                const currentOrder = newSiblingOrder.get(oldParentKey) || [];
                const reorderedOrder = insertAtPosition(
                    currentOrder,
                    draggedTaskId,
                    targetTaskId,
                    position,
                );
                newSiblingOrder.set(oldParentKey, reorderedOrder);
                set({ siblingOrder: newSiblingOrder });
            } else {
                // Different parent - remove from old, insert in new
                const oldOrder = newSiblingOrder.get(oldParentKey) || [];
                newSiblingOrder.set(
                    oldParentKey,
                    oldOrder.filter((id) => id !== draggedTaskId),
                );

                const newOrder = newSiblingOrder.get(newParentKey) || [];
                const reorderedOrder = insertAtPosition(
                    newOrder,
                    draggedTaskId,
                    targetTaskId,
                    position,
                );
                newSiblingOrder.set(newParentKey, reorderedOrder);

                set({ siblingOrder: newSiblingOrder });
                updateTask(draggedTaskId, { parentId: newParentId });
            }
        }
    },

    setShowLinks: (show: boolean) => {
        set({ showLinks: show });
    },

    setShowDelay: (show: boolean) => {
        set({ showDelay: show });
    },
}));
