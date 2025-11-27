"use client";

import { Plus, MoreHorizontal, Settings, Download, Upload } from "lucide-react";
import { useWorkspaceStore } from "@/lib/store/workspace-store";
import { Task } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        <div className="flex h-12 items-center justify-between border-b bg-background px-4">
            {/* TODO: Revised the topbar style, look kinda goofy*/}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <div className="size-2.5 rounded-sm bg-blue-500" />
                        <span>Task</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="size-2.5 rotate-45 bg-emerald-500" />
                        <span>Milestone</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="size-2.5 rounded-sm bg-amber-500" />
                        <span>Group</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="size-2.5 rounded-sm bg-destructive" />
                        <span>Critical</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleAddTask}
                >
                    <Plus className="mr-2 size-3.5" />
                    Add Task
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">More actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Upload className="mr-2 size-4" />
                            Import Tasks
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Download className="mr-2 size-4" />
                            Export Project
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Settings className="mr-2 size-4" />
                            Project Settings
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
