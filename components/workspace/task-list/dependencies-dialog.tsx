"use client";

import { TaskDependency } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { X } from "lucide-react";
import { DEPENDENCY_TYPES } from "@/lib/utils/task-constants";
import { DependenciesDialogProps } from "./types";

export function DependenciesDialog({
    task,
    allTasks,
    onUpdate,
    open,
    onOpenChange,
}: DependenciesDialogProps) {
    // Get available tasks for dependencies (exclude self)
    const availableTasksForDeps = allTasks.filter((t) => t.id !== task.id);

    // Add a dependency
    const addDependency = (taskId: string, type: TaskDependency["type"]) => {
        const currentDeps = task.dependencies || [];
        if (currentDeps.some((d) => d.taskId === taskId)) return;
        const newDeps = [...currentDeps, { taskId, type }];
        onUpdate({ dependencies: newDeps });
    };

    // Remove a dependency
    const removeDependency = (taskId: string) => {
        const currentDeps = task.dependencies || [];
        const newDeps = currentDeps.filter((d) => d.taskId !== taskId);
        onUpdate({ dependencies: newDeps });
    };

    // Update dependency type
    const updateDependencyType = (
        taskId: string,
        type: TaskDependency["type"],
    ) => {
        const currentDeps = task.dependencies || [];
        const newDeps = currentDeps.map((d) =>
            d.taskId === taskId ? { ...d, type } : d,
        );
        onUpdate({ dependencies: newDeps });
    };

    // Tasks that haven't been added as dependencies yet
    const availableToAdd = availableTasksForDeps.filter(
        (t) => !task.dependencies?.some((d) => d.taskId === t.id),
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-sm">
                        Dependencies for &quot;{task.name}&quot;
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Current dependencies */}
                    {(task.dependencies?.length || 0) > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">
                                Current Dependencies
                            </p>
                            <div className="space-y-1">
                                {task.dependencies?.map((dep) => {
                                    const depTask = allTasks.find(
                                        (t) => t.id === dep.taskId,
                                    );
                                    if (!depTask) return null;
                                    return (
                                        <div
                                            key={dep.taskId}
                                            className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-xs"
                                        >
                                            <span className="flex-1 truncate">
                                                {depTask.name}
                                            </span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-6 px-2 text-xs"
                                                    >
                                                        {dep.type}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {DEPENDENCY_TYPES.map(
                                                        (type) => (
                                                            <DropdownMenuItem
                                                                key={type.value}
                                                                onClick={() =>
                                                                    updateDependencyType(
                                                                        dep.taskId,
                                                                        type.value,
                                                                    )
                                                                }
                                                            >
                                                                <span className="font-medium">
                                                                    {type.label}
                                                                </span>
                                                                <span className="ml-2 text-muted-foreground">
                                                                    {
                                                                        type.description
                                                                    }
                                                                </span>
                                                            </DropdownMenuItem>
                                                        ),
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    removeDependency(dep.taskId)
                                                }
                                            >
                                                <X className="size-3" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Add new dependency with dropdown */}
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">
                            Add Dependency
                        </p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-xs"
                                >
                                    Select a task...
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[300px] max-h-[250px] overflow-y-auto">
                                <DropdownMenuLabel className="text-xs">
                                    Available Tasks
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {availableToAdd.map((availTask) => (
                                    <DropdownMenuSub key={availTask.id}>
                                        <DropdownMenuSubTrigger className="text-xs">
                                            <span className="truncate">
                                                {availTask.name}
                                            </span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuLabel className="text-xs">
                                                Dependency Type
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {DEPENDENCY_TYPES.map((type) => (
                                                <DropdownMenuItem
                                                    key={type.value}
                                                    onClick={() =>
                                                        addDependency(
                                                            availTask.id,
                                                            type.value,
                                                        )
                                                    }
                                                    className="text-xs"
                                                >
                                                    <span className="font-medium">
                                                        {type.label}
                                                    </span>
                                                    <span className="ml-2 text-muted-foreground">
                                                        {type.description}
                                                    </span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                ))}
                                {availableToAdd.length === 0 && (
                                    <div className="p-2 text-xs text-muted-foreground text-center">
                                        No more tasks available
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
