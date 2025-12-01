import {
    Plus,
    Download,
    Upload,
    Settings,
    Link2,
    AlertTriangle,
} from "lucide-react";
import { useWorkspaceStore } from "@/lib/store/workspace-store";
import { Task } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toggle } from "@/components/ui/toggle";

export function WorkspaceHeader() {
    const {
        addTask,
        projectId,
        showLinks,
        showDelay,
        setShowLinks,
        setShowDelay,
    } = useWorkspaceStore();

    const handleAddTask = () => {
        if (!projectId) return;

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
                    {/* Legend */}
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className="size-2.5 rounded-sm"
                                    style={{ backgroundColor: "#65c16f" }}
                                />
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Task</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className="size-2.5 rounded-sm rotate-45"
                                    style={{ backgroundColor: "#d33daf" }}
                                />
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                Milestone
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className="size-2.5 rounded-sm"
                                    style={{ backgroundColor: "#3db9d3" }}
                                />
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Group</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className="size-2.5 rounded-sm"
                                    style={{ backgroundColor: "#ffa011" }}
                                />
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                Dependency Link
                            </TooltipContent>
                        </Tooltip>

                        {showDelay && (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className="size-2.5 rounded-sm"
                                            style={{
                                                backgroundColor: "#faad14",
                                            }}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        Warning (near due)
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className="size-2.5 rounded-sm"
                                            style={{
                                                backgroundColor: "#f5222d",
                                            }}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        Danger (overdue)
                                    </TooltipContent>
                                </Tooltip>
                            </>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-4 w-px bg-border" />

                    {/* Toggle controls */}
                    <div className="flex items-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Toggle
                                    size="sm"
                                    pressed={showLinks}
                                    onPressedChange={setShowLinks}
                                    className="h-8 px-2 data-[state=on]:bg-accent"
                                >
                                    <Link2 className="size-4 mr-1" />
                                    <span className="text-xs">Links</span>
                                </Toggle>
                            </TooltipTrigger>
                            <TooltipContent>
                                Show dependency links
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Toggle
                                    size="sm"
                                    pressed={showDelay}
                                    onPressedChange={setShowDelay}
                                    className="h-8 px-2 data-[state=on]:bg-accent"
                                >
                                    <AlertTriangle className="size-4 mr-1" />
                                    <span className="text-xs">Delay</span>
                                </Toggle>
                            </TooltipTrigger>
                            <TooltipContent>
                                Show warning/danger for overdue tasks
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                onClick={handleAddTask}
                                className="h-8 w-8 p-0"
                            >
                                <Plus className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add new task</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                            >
                                <Upload className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Import tasks</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                            >
                                <Download className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Export project</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                            >
                                <Settings className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Settings</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
}
