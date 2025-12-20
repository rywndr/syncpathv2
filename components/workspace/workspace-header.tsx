"use client";

import { useState } from "react";
import { Plus, Download, Settings, Share2 } from "lucide-react";
import { useWorkspaceStore } from "@/lib/store/workspace-store";
import { Task } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ExportDialog } from "./export-dialog";
import { ShareDialog } from "./share-dialog";
import { ProjectTitle } from "./project-title";
import { buildTaskHierarchy } from "@/lib/gantt/types";

interface WorkspaceHeaderProps {
    ganttContainerRef: React.RefObject<HTMLDivElement | null>;
    projectName?: string;
    isShared?: boolean;
    sharePermission?: "view" | "edit";
    isOwner?: boolean;
    isReadOnly?: boolean;
    projectId?: string;
}

export function WorkspaceHeader({
    ganttContainerRef,
    projectName = "Project",
    isShared = false,
    sharePermission = "view",
    isOwner = false,
    isReadOnly = false,
    projectId: propProjectId,
}: WorkspaceHeaderProps) {
    const {
        addTask,
        projectId: storeProjectId,
        tasks,
        siblingOrder,
        showLinks,
        showDelay,
        setShowLinks,
        setShowDelay,
    } = useWorkspaceStore();

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    const projectId = propProjectId || storeProjectId;

    // Build task hierarchy for export
    const taskNodes = buildTaskHierarchy(tasks, siblingOrder);

    const handleAddTask = () => {
        if (!projectId || isReadOnly) return;

        const newTask: Task = {
            id: crypto.randomUUID(),
            projectId,
            name: "New Task",
            type: "task",
            status: "pending",
            startDate: new Date(),
            endDate: new Date(),
            duration: 1,
            percentage: 0,
            assignee: null,
            parentId: null,
            cost: 0,
            dependencies: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        addTask(newTask);
    };

    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex h-12 items-center justify-between border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
                <div className="flex items-center gap-4">
                    {projectId && (
                        <>
                            <ProjectTitle
                                projectId={projectId}
                                initialName={projectName}
                                isReadOnly={!isOwner}
                            />
                            <div className="hidden lg:block h-4 w-px bg-border" />
                        </>
                    )}

                    {/* Task Types Legend */}
                    <div className="hidden lg:flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide mr-1">
                            Types
                        </span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50">
                                    <div
                                        className="size-2.5 rounded-sm"
                                        style={{ backgroundColor: "#65c16f" }}
                                    />
                                    <span className="text-[10px] text-muted-foreground">
                                        Task
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                Regular task
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50">
                                    <div
                                        className="size-2.5 rounded-sm rotate-45"
                                        style={{ backgroundColor: "#d33daf" }}
                                    />
                                    <span className="text-[10px] text-muted-foreground">
                                        Milestone
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                Key milestone
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50">
                                    <div
                                        className="size-2.5 rounded-sm"
                                        style={{ backgroundColor: "#3db9d3" }}
                                    />
                                    <span className="text-[10px] text-muted-foreground">
                                        Group
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                Task group / summary
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Divider */}
                    <div className="hidden lg:block h-4 w-px bg-border" />

                    {/* Status Legend */}
                    <div className="hidden lg:flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide mr-1">
                            Status
                        </span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50">
                                    <div
                                        className="size-2.5 rounded-sm"
                                        style={{ backgroundColor: "#ffa011" }}
                                    />
                                    <span className="text-[10px] text-muted-foreground">
                                        Link
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                Dependency link between tasks
                            </TooltipContent>
                        </Tooltip>

                        {showDelay && (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50">
                                            <div
                                                className="size-2.5 rounded-sm"
                                                style={{
                                                    backgroundColor: "#faad14",
                                                }}
                                            />
                                            <span className="text-[10px] text-muted-foreground">
                                                Warning
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        Task is near due date
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50">
                                            <div
                                                className="size-2.5 rounded-sm"
                                                style={{
                                                    backgroundColor: "#f5222d",
                                                }}
                                            />
                                            <span className="text-[10px] text-muted-foreground">
                                                Overdue
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        Task is past due date
                                    </TooltipContent>
                                </Tooltip>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={handleAddTask}
                        disabled={isReadOnly}
                        className="h-8 gap-2"
                    >
                        <Plus className="size-4" />
                        <span className="hidden sm:inline">Add Task</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2"
                        onClick={() => setExportOpen(true)}
                    >
                        <Download className="size-4" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>

                    {isOwner && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() => setShareOpen(true)}
                        >
                            <Share2 className="size-4" />
                            <span className="hidden sm:inline">Share</span>
                        </Button>
                    )}

                    {/* Share Dialog */}
                    {projectId && isOwner && (
                        <ShareDialog
                            projectId={projectId}
                            initialIsShared={isShared}
                            initialPermission={sharePermission}
                            open={shareOpen}
                            onOpenChange={setShareOpen}
                        />
                    )}

                    {/* Export Dialog */}
                    <ExportDialog
                        open={exportOpen}
                        onOpenChange={setExportOpen}
                        taskNodes={taskNodes}
                        projectName={projectName}
                        ganttContainerRef={ganttContainerRef}
                    />

                    {/* Settings Dialog */}
                    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                            >
                                <Settings className="size-4" />
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle>Gantt Settings</DialogTitle>
                                <DialogDescription>
                                    Configure the display options for the Gantt
                                    chart.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {/* Display Options */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-foreground">
                                        Display Options
                                    </h4>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="show-links"
                                                className="text-sm font-normal"
                                            >
                                                Show Dependency Links
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Display connection lines between
                                                dependent tasks
                                            </p>
                                        </div>
                                        <Switch
                                            id="show-links"
                                            checked={showLinks}
                                            onCheckedChange={setShowLinks}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="show-delay"
                                                className="text-sm font-normal"
                                            >
                                                Show Delay Indicators
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Highlight tasks that are near
                                                due or overdue
                                            </p>
                                        </div>
                                        <Switch
                                            id="show-delay"
                                            checked={showDelay}
                                            onCheckedChange={setShowDelay}
                                        />
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </TooltipProvider>
    );
}
