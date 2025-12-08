"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import { useWorkspaceStore } from "@/lib/store/workspace-store";
import { buildTaskHierarchy, flattenTaskHierarchy } from "@/lib/gantt";
import { GRID_TEMPLATE, INITIAL_DRAG_STATE } from "@/lib/utils/task-constants";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TaskListHeader } from "./task-list-header";
import { TaskRow } from "./task-row";
import { TaskListProps, DragState, DropPosition } from "./types";

export function TaskList({ onScroll, scrollRef }: TaskListProps) {
    const {
        tasks,
        updateTask,
        removeTask,
        collapsedGroups,
        toggleGroupCollapse,
        reorderTasks,
        siblingOrder,
    } = useWorkspaceStore();

    const localScrollRef = useRef<HTMLDivElement>(null);
    const ref = scrollRef || localScrollRef;

    // Drag and drop state
    const [dragState, setDragState] = useState<DragState>(INITIAL_DRAG_STATE);

    // Handle scroll events for and sync /w Gantt view
    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            if (onScroll) {
                onScroll(e.currentTarget.scrollTop);
            }
        },
        [onScroll],
    );

    // Build hierarchy and flatten for display (shared functions from gantt types)
    const hierarchy = useMemo(
        () => buildTaskHierarchy(tasks, siblingOrder),
        [tasks, siblingOrder],
    );

    const flatTasks = useMemo(
        () => flattenTaskHierarchy(hierarchy, collapsedGroups),
        [hierarchy, collapsedGroups],
    );

    // Get groups for parent selection
    const groupTasks = useMemo(
        () => tasks.filter((t) => t.type === "group"),
        [tasks],
    );

    // Check if  group has children
    // TODO: if grpup has children u delete the children also
    const hasChildren = useCallback(
        (taskId: string) => {
            return tasks.some((t) => t.parentId === taskId);
        },
        [tasks],
    );

    // Drag handlers
    const handleDragStart = useCallback(
        (e: React.DragEvent, taskId: string) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", taskId);
            setDragState({
                draggedTaskId: taskId,
                dragOverTaskId: null,
                dropPosition: null,
            });
        },
        [],
    );

    const handleDragEnd = useCallback(() => {
        setDragState(INITIAL_DRAG_STATE);
    }, []);

    const handleDragOver = useCallback(
        (e: React.DragEvent, taskId: string, taskType: string) => {
            e.preventDefault();
            e.stopPropagation();

            if (dragState.draggedTaskId === taskId) return;

            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const height = rect.height;

            let position: DropPosition;

            if (taskType === "group") {
                // For groups, divide into three zones
                if (y < height * 0.25) {
                    position = "before";
                } else if (y > height * 0.75) {
                    position = "after";
                } else {
                    position = "inside";
                }
            } else {
                // For regular tasks, divide into two zones
                position = y < height / 2 ? "before" : "after";
            }

            setDragState((prev) => ({
                ...prev,
                dragOverTaskId: taskId,
                dropPosition: position,
            }));
        },
        [dragState.draggedTaskId],
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        // Only clear if leaving task list entirely
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (!relatedTarget?.closest("[data-task-row]")) {
            setDragState((prev) => ({
                ...prev,
                dragOverTaskId: null,
                dropPosition: null,
            }));
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, targetTaskId: string) => {
            e.preventDefault();
            e.stopPropagation();

            const draggedTaskId = e.dataTransfer.getData("text/plain");

            if (
                draggedTaskId &&
                draggedTaskId !== targetTaskId &&
                dragState.dropPosition
            ) {
                reorderTasks(
                    draggedTaskId,
                    targetTaskId,
                    dragState.dropPosition,
                );
            }

            setDragState(INITIAL_DRAG_STATE);
        },
        [dragState.dropPosition, reorderTasks],
    );

    return (
        <TooltipProvider delayDuration={300}>
            <div className="h-full w-full border-r bg-background">
                <div
                    ref={ref}
                    onScroll={handleScroll}
                    className="h-full w-full overflow-auto"
                >
                    <div className="min-w-[700px]">
                        {/* Header */}
                        <TaskListHeader gridTemplate={GRID_TEMPLATE} />

                        {/* Task rows */}
                        {flatTasks.map((node) => (
                            <TaskRow
                                key={node.task.id}
                                task={node.task}
                                allTasks={tasks}
                                groupTasks={groupTasks}
                                number={node.number}
                                depth={node.depth}
                                isCollapsed={collapsedGroups.has(node.task.id)}
                                hasChildren={hasChildren(node.task.id)}
                                onToggleCollapse={() =>
                                    toggleGroupCollapse(node.task.id)
                                }
                                onUpdate={(updates) =>
                                    updateTask(node.task.id, updates)
                                }
                                onDelete={() => removeTask(node.task.id)}
                                // Drag and drop props
                                isDragging={
                                    dragState.draggedTaskId === node.task.id
                                }
                                isDragOver={
                                    dragState.dragOverTaskId === node.task.id
                                }
                                dropPosition={
                                    dragState.dragOverTaskId === node.task.id
                                        ? dragState.dropPosition
                                        : null
                                }
                                onDragStart={(e) =>
                                    handleDragStart(e, node.task.id)
                                }
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) =>
                                    handleDragOver(
                                        e,
                                        node.task.id,
                                        node.task.type,
                                    )
                                }
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, node.task.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
