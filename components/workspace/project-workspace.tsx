"use client";

import { useEffect, useRef, useState } from "react";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useWorkspaceStore } from "@/lib/store/workspace-store";
import { Task } from "@/lib/db/schema";
import { ViewMode, GANTT_LAYOUT } from "@/lib/gantt";
import { WorkspaceHeader } from "./workspace-header";
import { TaskList } from "./task-list";
import { GanttView } from "./gantt-view";

interface ProjectWorkspaceProps {
    projectId: string;
    projectName?: string;
    initialTasks: Task[];
    isShared?: boolean;
    sharePermission?: "view" | "edit";
    isReadOnly?: boolean;
    isOwner?: boolean;
}

const VIEW_MODE_OPTIONS: { mode: ViewMode; label: string }[] = [
    { mode: "day", label: "Day" },
    { mode: "week", label: "Week" },
    { mode: "month", label: "Month" },
];

export function ProjectWorkspace({
    projectId,
    projectName = "Project",
    initialTasks,
    isShared = false,
    sharePermission = "view",
    isReadOnly = false,
    isOwner = false,
}: ProjectWorkspaceProps) {
    const { initWorkspace, showLinks, showDelay } = useWorkspaceStore();
    const [viewMode, setViewMode] = useState<ViewMode>("day");
    const taskListRef = useRef<HTMLDivElement>(null);
    const ganttRef = useRef<HTMLDivElement>(null);
    const ganttContainerRef = useRef<HTMLDivElement>(null);
    const isScrolling = useRef(false);

    // Initialize store with data from server
    useEffect(() => {
        initWorkspace(projectId, initialTasks);
    }, [projectId, initialTasks, initWorkspace]);

    // Scroll Sync Handlers
    // flag to prevent infinite loops when updating scroll positions
    const handleTaskListScroll = (scrollTop: number) => {
        if (isScrolling.current) return;

        if (
            ganttRef.current &&
            Math.abs(ganttRef.current.scrollTop - scrollTop) > 1
        ) {
            isScrolling.current = true;
            ganttRef.current.scrollTop = scrollTop;

            // Reset flag after scroll event has likely propagated
            setTimeout(() => {
                isScrolling.current = false;
            }, 50);
        }
    };

    const handleGanttScroll = (scrollTop: number) => {
        if (isScrolling.current) return;

        if (
            taskListRef.current &&
            Math.abs(taskListRef.current.scrollTop - scrollTop) > 1
        ) {
            isScrolling.current = true;
            taskListRef.current.scrollTop = scrollTop;

            setTimeout(() => {
                isScrolling.current = false;
            }, 50);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
            <WorkspaceHeader
                ganttContainerRef={ganttContainerRef}
                projectName={projectName}
                isShared={isShared}
                sharePermission={sharePermission}
                isOwner={isOwner}
                isReadOnly={isReadOnly}
                projectId={projectId}
            />

            {/* Toolbar  */}
            <div
                className="flex shrink-0 items-center gap-4 border-b bg-muted/30 px-4"
                style={{ height: GANTT_LAYOUT.TOOLBAR_HEIGHT }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                        View:
                    </span>
                    {VIEW_MODE_OPTIONS.map(({ mode, label }) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                                viewMode === mode
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {isReadOnly && (
                    <div className="ml-auto flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        View Only
                    </div>
                )}
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                        <TaskList
                            scrollRef={taskListRef}
                            onScroll={handleTaskListScroll}
                            isReadOnly={isReadOnly}
                        />
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel defaultSize={50} minSize={25}>
                        <div ref={ganttContainerRef} className="h-full w-full">
                            <GanttView
                                viewMode={viewMode}
                                showLinks={showLinks}
                                showDelay={showDelay}
                                scrollRef={ganttRef}
                                onScroll={handleGanttScroll}
                            />
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
