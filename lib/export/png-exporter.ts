import { TaskNode } from "@/lib/gantt/types";
import { ExportStrategy, ExportResult, PngExportOptions } from "./types";
import { svgToDataUrl, downloadFile, generateExportFilename } from "./utils";

/**
 * PNG Export
 */
export class PngExporter implements ExportStrategy {
    async export(
        ganttSvg: SVGElement | null,
        _taskNodes: TaskNode[],
        options: PngExportOptions,
    ): Promise<ExportResult> {
        try {
            if (!ganttSvg) {
                return {
                    success: false,
                    error: "No Gantt chart found to export",
                };
            }

            const scale = options.scale || 2;
            const projectName = options.projectName || "project";

            // Convert SVG to PNG data URL
            const dataUrl = await svgToDataUrl(ganttSvg, scale);

            // Generate filename and download
            const filename = generateExportFilename(projectName, "png");
            downloadFile(dataUrl, filename, "image/png");

            return {
                success: true,
                filename,
            };
        } catch (error) {
            console.error("PNG export failed:", error);
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "PNG export failed",
            };
        }
    }
}

/**
 * Factory function to create PNG exporter
 */
export function createPngExporter(): ExportStrategy {
    return new PngExporter();
}
