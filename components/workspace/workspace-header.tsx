import { Plus, Download, Upload, Settings } from "lucide-react";
import { useWorkspaceStore } from "@/lib/store/workspace-store";
import { Task } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function WorkspaceHeader() {
    const { addTask, projectId } = useWorkspaceStore();

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
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="size-2.5 rounded-sm bg-blue-500" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Task</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="size-2.5 rounded-sm bg-purple-500 rotate-45" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Milestone</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="size-2.5 rounded-sm bg-slate-500" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Group</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="size-2.5 rounded-sm bg-orange-500" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            Dependency Link
                        </TooltipContent>
                    </Tooltip>
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
