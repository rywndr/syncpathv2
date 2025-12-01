import { format } from "date-fns";
import { TaskNode } from "@/lib/gantt/types";
import { ExportTaskData, TASK_TYPE_COLORS } from "./types";

/**
 * Calculate duration in days between two dates
 */
export function calculateDuration(
    startDate: Date | string | null,
    endDate: Date | string | null,
): number {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    return Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    );
}

/**
 * Format date for display
 */
export function formatExportDate(date: Date | string | null): string {
    if (!date) return "-";
    return format(new Date(date), "M/d/yy");
}

/**
 * Format cost as Indonesian Rupiah
 */
export function formatExportCost(cost: number): string {
    return new Intl.NumberFormat("id-ID").format(cost);
}

/**
 * Calculate total cost for a group from all descendants
 */
export function calculateGroupCost(
    groupId: string,
    allNodes: TaskNode[],
): number {
    let total = 0;

    // Flatten all nodes to find children
    const findChildren = (nodes: TaskNode[]): TaskNode[] => {
        const result: TaskNode[] = [];
        for (const node of nodes) {
            result.push(node);
            if (node.children.length > 0) {
                result.push(...findChildren(node.children));
            }
        }
        return result;
    };

    const allFlatNodes = findChildren(allNodes);
    const directChildren = allFlatNodes.filter(
        (n) => n.task.parentId === groupId,
    );

    for (const child of directChildren) {
        if (child.task.type === "group") {
            total += calculateGroupCost(child.task.id, allNodes);
        } else {
            total += child.task.cost || 0;
        }
    }

    return total;
}

/**
 * Transform TaskNodes to ExportTaskData array
 */
export function prepareTasksForExport(
    nodes: TaskNode[],
    allNodes: TaskNode[],
): ExportTaskData[] {
    const result: ExportTaskData[] = [];

    const traverse = (node: TaskNode) => {
        const cost =
            node.task.type === "group"
                ? calculateGroupCost(node.task.id, allNodes)
                : node.task.cost || 0;

        result.push({
            number: node.number,
            name: node.task.name,
            type: node.task.type,
            startDate: formatExportDate(node.task.startDate),
            endDate: formatExportDate(node.task.endDate),
            cost,
            duration: calculateDuration(
                node.task.startDate,
                node.task.endDate,
            ),
            depth: node.depth,
        });

        // Include children
        for (const child of node.children) {
            traverse(child);
        }
    };

    for (const node of nodes) {
        traverse(node);
    }

    return result;
}

/**
 * Get color for task type
 */
export function getTaskTypeColor(type: string): string {
    return TASK_TYPE_COLORS[type] || TASK_TYPE_COLORS.task;
}

/**
 * Generate filename with timestamp
 */
export function generateExportFilename(
    projectName: string,
    format: "png" | "pdf",
): string {
    const timestamp = new Date().toISOString().split("T")[0];
    const safeName = projectName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    return `${safeName}_gantt_${timestamp}.${format}`;
}

/**
 * Convert SVG element to data URL
 */
export async function svgToDataUrl(
    svgElement: SVGElement,
    scale: number = 2,
): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            // Clone the SVG to avoid modifying the original
            const clonedSvg = svgElement.cloneNode(true) as SVGElement;

            // Get dimensions
            const bbox = svgElement.getBoundingClientRect();
            const width = bbox.width;
            const height = bbox.height;

            // Set explicit dimensions on the cloned SVG
            clonedSvg.setAttribute("width", String(width));
            clonedSvg.setAttribute("height", String(height));

            // Serialize to string
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(clonedSvg);

            // Create a blob
            const blob = new Blob([svgString], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);

            // Create an image to draw on canvas
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = width * scale;
                canvas.height = height * scale;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Failed to get canvas context"));
                    return;
                }

                // Fill with white background
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Scale and draw
                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0);

                // Cleanup
                URL.revokeObjectURL(url);

                // Convert to data URL
                resolve(canvas.toDataURL("image/png"));
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Failed to load SVG as image"));
            };

            img.src = url;
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Download a file from data URL or blob
 */
export function downloadFile(
    data: string | Blob,
    filename: string,
    mimeType?: string,
): void {
    const blob =
        data instanceof Blob
            ? data
            : dataUrlToBlob(data, mimeType || "image/png");

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Convert data URL to Blob
 */
function dataUrlToBlob(dataUrl: string, mimeType: string): Blob {
    const byteString = atob(dataUrl.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeType });
}
