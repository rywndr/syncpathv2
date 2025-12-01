import { TaskNode } from "@/lib/gantt/types";

/**
 * Export format types
 */
export type ExportFormat = "png" | "pdf";

/**
 * Task data prepared for export
 */
export interface ExportTaskData {
    number: string;
    name: string;
    type: "task" | "group" | "milestone";
    startDate: string;
    endDate: string;
    cost: number;
    duration: number;
    depth: number;
}

/**
 * Export options
 */
export interface ExportOptions {
    projectName?: string;
    includeTaskList?: boolean;
    includeGanttChart?: boolean;
}

/**
 * PNG export options
 */
export interface PngExportOptions extends ExportOptions {
    scale?: number;
}

/**
 * PDF export options
 */
export interface PdfExportOptions extends ExportOptions {
    orientation?: "portrait" | "landscape";
    pageSize?: "a4" | "letter";
}

/**
 * Export result
 */
export interface ExportResult {
    success: boolean;
    filename?: string;
    error?: string;
}

/**
 * Interface for export strategies
 */
export interface ExportStrategy {
    export(
        ganttSvg: SVGElement | null,
        taskNodes: TaskNode[],
        options: ExportOptions,
    ): Promise<ExportResult>;
}

/**
 * Color constants for task types (matching gantt defaults)
 */
export const TASK_TYPE_COLORS: Record<string, string> = {
    task: "#65c16f",
    milestone: "#d33daf",
    group: "#3db9d3",
};
