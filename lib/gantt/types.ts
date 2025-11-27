import { Task, TaskDependency } from "@/lib/db/schemas/project-schema";
import type { GanttItem, GanttLink } from "gantt";

// ============================================================================
// Shared Layout Constants (for row synchronization between TaskList and GanttView)
// ============================================================================

export const GANTT_LAYOUT = {
    /**
     * Height of the gantt chart's timeline header in pixels.
     * The gantt package uses offsetY to position bars below its internal header.
     * Default is 60px (two rows: year/month + day numbers).
     */
    TIMELINE_HEADER_HEIGHT: 60,
    /** Height of each task row in pixels */
    ROW_HEIGHT: 40,
    /** Height of the bar within each row in pixels */
    BAR_HEIGHT: 16,
    /** Height of the toolbar above the gantt/tasklist area */
    TOOLBAR_HEIGHT: 40,
} as const;

// ============================================================================
// View Mode Type
// ============================================================================

export type ViewMode = "day" | "week" | "month";

// ============================================================================
// Hierarchical Task Node (shared between TaskList and GanttView)
// ============================================================================

export interface TaskNode {
    task: Task;
    number: string;
    depth: number;
    children: TaskNode[];
}

/**
 * Sibling order map type - maps parentId (or 'root') to ordered array of task IDs
 */
export type SiblingOrderMap = Map<string, string[]>;

/**
 * Build hierarchical task structure with numbering.
 * This is used by both TaskList and GanttView to ensure consistent ordering.
 *
 * @param tasks - Array of all tasks
 * @param siblingOrder - Optional map of parentId to ordered child IDs for custom ordering
 */
export function buildTaskHierarchy(
    tasks: Task[],
    siblingOrder?: SiblingOrderMap,
): TaskNode[] {
    const taskMap = new Map<string, Task>();
    const childrenMap = new Map<string, Task[]>();

    // Build task lookup map
    tasks.forEach((task) => {
        taskMap.set(task.id, task);
    });

    // Build children map
    tasks.forEach((task) => {
        const parentKey = task.parentId || "root";
        if (!childrenMap.has(parentKey)) {
            childrenMap.set(parentKey, []);
        }
        childrenMap.get(parentKey)!.push(task);
    });

    // Sort children based on siblingOrder if provided
    if (siblingOrder) {
        childrenMap.forEach((children, parentKey) => {
            const order = siblingOrder.get(parentKey);
            if (order) {
                // Sort by position in the order array
                children.sort((a, b) => {
                    const aIndex = order.indexOf(a.id);
                    const bIndex = order.indexOf(b.id);
                    // Tasks not in order array go to the end
                    const aPos = aIndex === -1 ? Infinity : aIndex;
                    const bPos = bIndex === -1 ? Infinity : bIndex;
                    return aPos - bPos;
                });
            }
        });
    }

    // Recursively build tree with numbering
    function buildNode(
        task: Task,
        parentNumber: string,
        index: number,
        depth: number,
    ): TaskNode {
        const number = parentNumber
            ? `${parentNumber}.${index + 1}`
            : `${index + 1}`;

        const childTasks = childrenMap.get(task.id) || [];
        const children = childTasks.map((child, i) =>
            buildNode(child, number, i, depth + 1),
        );

        return { task, number, depth, children };
    }

    // Get root tasks and build tree
    const rootTasks = childrenMap.get("root") || [];
    return rootTasks.map((task, i) => buildNode(task, "", i, 0));
}

/**
 * Flatten tree for display, respecting collapsed state.
 * Returns tasks in the exact order they should appear in both TaskList and GanttView.
 */
export function flattenTaskHierarchy(
    nodes: TaskNode[],
    collapsedGroups: Set<string>,
): TaskNode[] {
    const result: TaskNode[] = [];

    function traverse(node: TaskNode) {
        result.push(node);
        // Only show children if this is a group that is NOT collapsed
        if (
            node.task.type === "group" &&
            !collapsedGroups.has(node.task.id) &&
            node.children.length > 0
        ) {
            node.children.forEach(traverse);
        }
    }

    nodes.forEach(traverse);
    return result;
}

// ============================================================================
// ID Mapping utilities
// ============================================================================

/**
 * Bidirectional mapping between string IDs (from our schema)
 * and numeric IDs (required by the gantt package).
 *
 * IMPORTANT: The mapping must be created from the flattened hierarchy
 * to ensure consistent ordering with the TaskList.
 */
export interface IdMapping {
    stringToNum: Map<string, number>;
    numToString: Map<number, string>;
}

/**
 * Create ID mapping from flattened task nodes.
 * This ensures the numeric IDs match the visual row order.
 */
export function createIdMapping(flatNodes: TaskNode[]): IdMapping {
    const stringToNum = new Map<string, number>();
    const numToString = new Map<number, string>();

    flatNodes.forEach((node, index) => {
        const numId = index + 1; // Start from 1 to avoid 0 which could be falsy
        stringToNum.set(node.task.id, numId);
        numToString.set(numId, node.task.id);
    });

    return { stringToNum, numToString };
}

/**
 * Legacy function - create mapping from raw tasks array.
 * @deprecated Use createIdMapping with flattened nodes instead.
 */
export function createIdMappingFromTasks(tasks: Task[]): IdMapping {
    const stringToNum = new Map<string, number>();
    const numToString = new Map<number, string>();

    tasks.forEach((task, index) => {
        const numId = index + 1;
        stringToNum.set(task.id, numId);
        numToString.set(numId, task.id);
    });

    return { stringToNum, numToString };
}

// ============================================================================
// Task to GanttItem transformation
// ============================================================================

/**
 * Transform flattened task nodes to GanttItems.
 * The order of items matches the visual row order in TaskList.
 */
export function transformTasksToGanttItems(
    flatNodes: TaskNode[],
    idMapping: IdMapping,
): GanttItem[] {
    const { stringToNum } = idMapping;

    // Create a set of visible task IDs for dependency filtering
    const visibleTaskIds = new Set(flatNodes.map((node) => node.task.id));

    return flatNodes.map((node): GanttItem => {
        const task = node.task;
        const numId = stringToNum.get(task.id);

        if (numId === undefined) {
            throw new Error(`Task ID ${task.id} not found in mapping`);
        }

        // Transform dependencies to links (only include visible dependencies)
        const links: GanttLink[] = (task.dependencies || [])
            .map((dep: TaskDependency) => {
                const targetNumId = stringToNum.get(dep.taskId);
                // Only include links to tasks that exist and are visible
                if (
                    targetNumId !== undefined &&
                    visibleTaskIds.has(dep.taskId)
                ) {
                    return {
                        target: targetNumId,
                        type: dep.type,
                    };
                }
                return null;
            })
            .filter((link): link is GanttLink => link !== null);

        // Handle parent mapping (only if parent is visible)
        let parentNumId: number | undefined;
        if (task.parentId && visibleTaskIds.has(task.parentId)) {
            parentNumId = stringToNum.get(task.parentId);
        }

        // Check valid date
        const startDate = task.startDate
            ? new Date(task.startDate)
            : new Date();
        const endDate = task.endDate ? new Date(task.endDate) : new Date();

        // Ensure end date is AFTER start date
        const validEndDate = endDate >= startDate ? endDate : startDate;

        return {
            id: numId,
            parent: parentNumId,
            text: "", // Empty text - task names are shown in TaskList
            start: startDate,
            end: validEndDate,
            percent: (task.percentage || 0) / 100, // Convert 0-100 to 0-1
            links,
            type: task.type,
        };
    });
}

// Chart styling
export interface GanttThemeStyles {
    bgColor: string;
    lineColor: string;
    redLineColor: string;
    groupBack: string;
    groupFront: string;
    taskBack: string;
    taskFront: string;
    milestone: string;
    warning: string;
    danger: string;
    link: string;
    textColor: string;
    lightTextColor: string;
    lineWidth: string;
    thickLineWidth: string;
    fontSize: string;
    smallFontSize: string;
    fontFamily: string;
}

export function getGanttStyles() {
    return {
        bgColor: "hsl(0 0% 100%)", // background
        lineColor: "hsl(240 5.9% 90%)", // border
        redLineColor: "#ef4444", // red-500
        groupBack: "#94a3b8", // slate-400
        groupFront: "#64748b", // slate-500
        taskBack: "#3b82f6", // blue-500
        taskFront: "#2563eb", // blue-600
        milestone: "#a855f7", // purple-500
        warning: "#f59e0b", // amber-500
        danger: "#ef4444", // red-500
        link: "#f97316", // orange-500
        textColor: "hsl(240 10% 3.9%)", // foreground
        lightTextColor: "hsl(240 3.8% 46.1%)", // muted-foreground
        lineWidth: "1px",
        thickLineWidth: "1.4px",
        fontSize: "14px",
        smallFontSize: "12px",
        fontFamily: "inherit",
    };
}
