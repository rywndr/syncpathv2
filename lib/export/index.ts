import { TaskNode } from "@/lib/gantt/types";
import { ExportFormat, ExportResult, ExportOptions } from "./types";
import { createPngExporter } from "./png-exporter";
import { createPdfExporter } from "./pdf-exporter";

/**
 * Export Service
 * Uses Strategy Pattern to delegate to appropriate exporter based on format
 */
export class ExportService {
    /**
     * Export the Gantt chart and/or task list in the specified format
     */
    static async export(
        format: ExportFormat,
        ganttSvg: SVGElement | null,
        taskNodes: TaskNode[],
        options: ExportOptions = {},
    ): Promise<ExportResult> {
        const exporter =
            format === "png" ? createPngExporter() : createPdfExporter();

        return exporter.export(ganttSvg, taskNodes, options);
    }

    /**
     * Export as PNG
     */
    static async exportPng(
        ganttSvg: SVGElement | null,
        taskNodes: TaskNode[],
        options: ExportOptions = {},
    ): Promise<ExportResult> {
        return this.export("png", ganttSvg, taskNodes, options);
    }

    /**
     * Export as PDF
     */
    static async exportPdf(
        ganttSvg: SVGElement | null,
        taskNodes: TaskNode[],
        options: ExportOptions = {},
    ): Promise<ExportResult> {
        return this.export("pdf", ganttSvg, taskNodes, options);
    }
}

// Re-export types and utilities
export * from "./types";
export * from "./utils";
export { createPngExporter } from "./png-exporter";
export { createPdfExporter } from "./pdf-exporter";
