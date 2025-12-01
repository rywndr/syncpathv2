"use client";

import { useState } from "react";
import { FileImage, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ExportService } from "@/lib/export";
import { TaskNode } from "@/lib/gantt/types";

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskNodes: TaskNode[];
    projectName?: string;
    ganttContainerRef: React.RefObject<HTMLDivElement | null>;
}

type ExportFormat = "png" | "pdf";

export function ExportDialog({
    open,
    onOpenChange,
    taskNodes,
    projectName = "Project",
    ganttContainerRef,
}: ExportDialogProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(
        null,
    );

    const getGanttSvg = (): SVGElement | null => {
        if (!ganttContainerRef.current) return null;
        return ganttContainerRef.current.querySelector("svg");
    };

    const handleExport = async (format: ExportFormat) => {
        setIsExporting(true);
        setExportingFormat(format);

        try {
            const ganttSvg = getGanttSvg();

            if (!ganttSvg && format === "png") {
                toast.error("No Gantt chart found to export");
                return;
            }

            const result = await ExportService.export(
                format,
                ganttSvg,
                taskNodes,
                { projectName },
            );

            if (result.success) {
                toast.success(
                    `Exported successfully as ${result.filename || format.toUpperCase()}`,
                );
                onOpenChange(false);
            } else {
                toast.error(result.error || "Export failed");
            }
        } catch (error) {
            console.error("Export error:", error);
            toast.error("An error occurred during export");
        } finally {
            setIsExporting(false);
            setExportingFormat(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Export Project</DialogTitle>
                    <DialogDescription>
                        Choose an export format for your Gantt chart and task
                        list.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* PNG Export Option */}
                    <button
                        onClick={() => handleExport("png")}
                        disabled={isExporting}
                        className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                            {isExporting && exportingFormat === "png" ? (
                                <Loader2 className="size-5 animate-spin" />
                            ) : (
                                <FileImage className="size-5" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium">
                                Export as PNG
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Export the Gantt chart as a high-resolution PNG
                                image. Best for sharing or embedding in
                                presentations.
                            </p>
                        </div>
                    </button>

                    {/* PDF Export Option */}
                    <button
                        onClick={() => handleExport("pdf")}
                        disabled={isExporting}
                        className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                            {isExporting && exportingFormat === "pdf" ? (
                                <Loader2 className="size-5 animate-spin" />
                            ) : (
                                <FileText className="size-5" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium">
                                Export as PDF
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Export a 2-page PDF with a task list table on
                                the first page and the Gantt chart on the
                                second. Ideal for printing or documentation.
                            </p>
                        </div>
                    </button>
                </div>

                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isExporting}
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
