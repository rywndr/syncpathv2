import { TaskNode } from "@/lib/gantt/types";
import { ExportStrategy, ExportResult, PdfExportOptions } from "./types";
import {
    svgToDataUrl,
    generateExportFilename,
    prepareTasksForExport,
    formatExportCost,
    getTaskTypeColor,
} from "./utils";

/**
 * PDF Export
 */
export class PdfExporter implements ExportStrategy {
    async export(
        ganttSvg: SVGElement | null,
        taskNodes: TaskNode[],
        options: PdfExportOptions,
    ): Promise<ExportResult> {
        try {
            // Dynamic import to avoid SSR issues
            const { jsPDF } = await import("jspdf");

            const projectName = options.projectName || "Project";
            const orientation = options.orientation || "landscape";

            // Create PDF document
            const pdf = new jsPDF({
                orientation,
                unit: "mm",
                format: "a4",
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - margin * 2;

            // ==================== PAGE 1: Task List ====================
            this.renderTaskListPage(
                pdf,
                taskNodes,
                projectName,
                pageWidth,
                margin,
                contentWidth,
            );

            // ==================== PAGE 2: Gantt Chart ====================
            if (ganttSvg) {
                pdf.addPage();
                await this.renderGanttChartPage(
                    pdf,
                    ganttSvg,
                    pageWidth,
                    pageHeight,
                    margin,
                    contentWidth,
                );
            }

            // Save the PDF
            const filename = generateExportFilename(projectName, "pdf");
            pdf.save(filename);

            return {
                success: true,
                filename,
            };
        } catch (error) {
            console.error("PDF export failed:", error);
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "PDF export failed",
            };
        }
    }

    /**
     * Render task list page
     */
    private renderTaskListPage(
        pdf: import("jspdf").jsPDF,
        taskNodes: TaskNode[],
        projectName: string,
        pageWidth: number,
        margin: number,
        contentWidth: number,
    ): void {
        let yPos = margin;

        // Title
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text("Tasks", margin, yPos);
        yPos += 10;

        // Subtitle with project name
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        pdf.text(projectName, margin, yPos);
        pdf.setTextColor(0, 0, 0);
        yPos += 12;

        // Prepare task data
        const tasks = prepareTasksForExport(taskNodes, taskNodes);

        // Table header
        const columns = [
            { key: "number", label: "Outline\nnumber", width: 20 },
            { key: "type", label: "", width: 8 },
            { key: "name", label: "Name", width: contentWidth * 0.35 },
            { key: "startDate", label: "Begin date", width: 25 },
            { key: "endDate", label: "End date", width: 25 },
            { key: "cost", label: "Cost", width: 30 },
            { key: "duration", label: "Duration", width: 20 },
        ];

        // Draw header background
        const headerHeight = 12;
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPos, contentWidth, headerHeight, "F");

        // Draw header text
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");

        let xPos = margin + 2;
        for (const col of columns) {
            if (col.key !== "type") {
                pdf.text(col.label, xPos, yPos + 8, {
                    maxWidth: col.width - 4,
                });
            }
            xPos += col.width;
        }

        yPos += headerHeight;

        // Draw header line
        pdf.setDrawColor(100, 100, 100);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPos, margin + contentWidth, yPos);

        // Add spacing after header line
        yPos += 6;

        // Draw rows
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);

        const rowHeight = 8;
        const pageHeight = pdf.internal.pageSize.getHeight();

        for (const task of tasks) {
            // Check if we need a new page
            if (yPos + rowHeight > pageHeight - margin) {
                pdf.addPage();
                yPos = margin;
            }

            xPos = margin + 2;

            // Outline number
            pdf.text(task.number, xPos, yPos);
            xPos += columns[0].width;

            // Type indicator (colored circle)
            const color = getTaskTypeColor(task.type);
            const rgb = this.hexToRgb(color);
            pdf.setFillColor(rgb.r, rgb.g, rgb.b);

            if (task.type === "milestone") {
                // Draw diamond for milestone
                const cx = xPos + 2;
                const cy = yPos - 2;
                const size = 2;
                pdf.triangle(cx, cy - size, cx + size, cy, cx, cy + size, "F");
                pdf.triangle(cx, cy - size, cx - size, cy, cx, cy + size, "F");
            } else {
                // Draw circle for task/group
                pdf.circle(xPos + 2, yPos - 2, 2, "F");
            }
            xPos += columns[1].width;

            // Name with indentation based on depth
            const indent = task.depth * 4;
            const nameMaxWidth = columns[2].width - indent - 4;
            const displayName = this.truncateText(pdf, task.name, nameMaxWidth);
            pdf.text(displayName, xPos + indent, yPos);
            xPos += columns[2].width;

            // Start date
            pdf.text(task.startDate, xPos, yPos);
            xPos += columns[3].width;

            // End date
            pdf.text(task.endDate, xPos, yPos);
            xPos += columns[4].width;

            // Cost (right-aligned)
            const costStr = formatExportCost(task.cost);
            const costWidth = pdf.getTextWidth(costStr);
            pdf.text(costStr, xPos + columns[5].width - costWidth - 4, yPos);
            xPos += columns[5].width;

            // Duration
            pdf.text(String(task.duration), xPos, yPos);

            yPos += rowHeight;
        }
    }

    /**
     * Render the Gantt chart page
     */
    private async renderGanttChartPage(
        pdf: import("jspdf").jsPDF,
        ganttSvg: SVGElement,
        pageWidth: number,
        pageHeight: number,
        margin: number,
        contentWidth: number,
    ): Promise<void> {
        let yPos = margin;

        // Title
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text("Gantt Chart", margin, yPos);
        yPos += 12;

        try {
            // Convert SVG to JPEG data URL with compression (0.8 quality)
            // Scale 2 but JPEG compression keeps size down
            const dataUrl = await svgToDataUrl(ganttSvg, 2, "image/jpeg", 0.8);

            // Calculate dimensions to fit the page
            const svgBbox = ganttSvg.getBoundingClientRect();
            const aspectRatio = svgBbox.width / svgBbox.height;

            let imgWidth = contentWidth;
            let imgHeight = imgWidth / aspectRatio;

            // Checks
            const availableHeight = pageHeight - yPos - margin;
            if (imgHeight > availableHeight) {
                imgHeight = availableHeight;
                imgWidth = imgHeight * aspectRatio;
            }

            // Add the image
            pdf.addImage(dataUrl, "JPEG", margin, yPos, imgWidth, imgHeight);
        } catch (error) {
            console.error("Failed to add Gantt chart image:", error);
            pdf.setFontSize(12);
            pdf.setTextColor(150, 150, 150);
            pdf.text("Failed to render Gantt chart", margin, yPos + 20);
        }
    }

    /**
     * Convert hex color to RGB
     */
    private hexToRgb(hex: string): { r: number; g: number; b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16),
              }
            : { r: 0, g: 0, b: 0 };
    }

    /**
     * Truncate text to fit within a given width
     */
    private truncateText(
        pdf: import("jspdf").jsPDF,
        text: string,
        maxWidth: number,
    ): string {
        if (pdf.getTextWidth(text) <= maxWidth) {
            return text;
        }

        let truncated = text;
        while (
            truncated.length > 0 &&
            pdf.getTextWidth(truncated + "...") > maxWidth
        ) {
            truncated = truncated.slice(0, -1);
        }

        return truncated + "...";
    }
}

export function createPdfExporter(): ExportStrategy {
    return new PdfExporter();
}
