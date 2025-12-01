"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Task } from "@/lib/db/schema";
import { GANTT_LAYOUT } from "@/lib/gantt";
import { formatRupiah, parseRupiah } from "@/lib/utils/currency";
import {
    GRID_TEMPLATE,
    STATUS_COLORS,
    STATUS_OPTIONS,
    TYPE_ICONS,
    TYPE_OPTIONS,
    TaskStatus,
    TaskType,
} from "@/lib/utils/task-constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Trash2,
    Link2,
    Users,
    ChevronRight,
    ChevronDown,
    FolderTree,
    GripVertical,
} from "lucide-react";
import { DependenciesDialog } from "./dependencies-dialog";
import { TaskRowProps, DropPosition } from "./types";

/**
 * Calc task duration in days from start and end dates
 */
function calculateDuration(task: Task): number {
    if (task.startDate && task.endDate) {
        return Math.max(
            1,
            Math.ceil(
                (new Date(task.endDate).getTime() -
                    new Date(task.startDate).getTime()) /
                    (1000 * 60 * 60 * 24),
            ),
        );
    }
    return task.duration || 0;
}

/**
 * Recursively calculate total cost for a group from all descendants
 */
function calculateGroupCost(groupId: string, allTasks: Task[]): number {
    let total = 0;
    const children = allTasks.filter((t) => t.parentId === groupId);

    for (const child of children) {
        if (child.type === "group") {
            // Recursively get cost from nested groups
            total += calculateGroupCost(child.id, allTasks);
        } else {
            total += child.cost || 0;
        }
    }

    return total;
}

/**
 * Get CSS class for drop indicator based on pos
 */
function getDropIndicatorClass(
    isDragOver: boolean,
    dropPosition: DropPosition | null,
): string {
    if (!isDragOver || !dropPosition) return "";

    switch (dropPosition) {
        case "before":
            return "before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary";
        case "after":
            return "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary";
        case "inside":
            return "ring-2 ring-inset ring-primary bg-primary/10";
        default:
            return "";
    }
}

export function TaskRow({
    task,
    allTasks,
    groupTasks,
    number,
    depth,
    isCollapsed,
    hasChildren,
    onToggleCollapse,
    onUpdate,
    onDelete,
    isDragging,
    isDragOver,
    dropPosition,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
}: TaskRowProps) {
    const [costInput, setCostInput] = useState(formatRupiah(task.cost || 0));
    const [depDialogOpen, setDepDialogOpen] = useState(false);

    // Calc duration
    const duration = calculateDuration(task);

    // Calculate cost for groups (sum of children costs)
    const displayCost = useMemo(() => {
        if (task.type === "group") {
            return calculateGroupCost(task.id, allTasks);
        }
        return task.cost || 0;
    }, [task.type, task.id, task.cost, allTasks]);

    // Get parent task name
    const parentTask = task.parentId
        ? groupTasks.find((t) => t.id === task.parentId)
        : null;

    // Available parent groups (exclude self for groups)
    const availableParents = groupTasks.filter((t) => t.id !== task.id);

    // Indentation based on depth (reduced for responsiveness)
    const indentPadding = depth * 12;

    // Cost handlers
    const handleCostBlur = () => {
        const numericValue = parseRupiah(costInput);
        onUpdate({ cost: numericValue });
        setCostInput(formatRupiah(numericValue));
    };

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCostInput(e.target.value);
    };

    return (
        <TooltipProvider delayDuration={300}>
            <div
                data-task-row
                draggable
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`group relative grid items-center gap-0.5 border-b px-1 text-xs transition-colors ${
                    task.type === "group" ? "bg-muted/20 font-medium" : ""
                } ${isDragging ? "opacity-50" : ""} ${
                    isDragOver
                        ? getDropIndicatorClass(isDragOver, dropPosition)
                        : "hover:bg-muted/50"
                }`}
                style={{
                    height: GANTT_LAYOUT.ROW_HEIGHT,
                    gridTemplateColumns: GRID_TEMPLATE,
                }}
            >
                {/* Drag Handle */}
                <div className="flex justify-center cursor-grab active:cursor-grabbing">
                    <GripVertical className="size-3 text-muted-foreground/50 hover:text-muted-foreground" />
                </div>

                {/* Row number based hierarchy */}
                <div className="text-center text-[10px] text-muted-foreground font-mono">
                    {number}
                </div>

                {/* Name with collapse toggle for groups */}
                <div
                    className="min-w-0 px-1 flex items-center gap-1"
                    style={{ paddingLeft: indentPadding + 4 }}
                >
                    {task.type === "group" && hasChildren && (
                        <button
                            onClick={onToggleCollapse}
                            className="p-0.5 hover:bg-muted rounded shrink-0"
                        >
                            {isCollapsed ? (
                                <ChevronRight className="size-3" />
                            ) : (
                                <ChevronDown className="size-3" />
                            )}
                        </button>
                    )}
                    {task.type === "group" && !hasChildren && (
                        <span className="w-4 shrink-0" />
                    )}
                    <Input
                        value={task.name}
                        onChange={(e) => onUpdate({ name: e.target.value })}
                        className="h-7 w-full border-transparent bg-transparent px-1 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-background/50 truncate"
                        title={task.name}
                    />
                </div>

                {/* Type */}
                <div className="min-w-0 px-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-7 w-full justify-start gap-1 px-1 text-xs font-normal hover:bg-background/50"
                            >
                                <span>
                                    {TYPE_ICONS[task.type as TaskType] || "○"}
                                </span>
                                <span className="truncate capitalize">
                                    {task.type}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="min-w-[100px]"
                        >
                            {TYPE_OPTIONS.map((option) => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onClick={() =>
                                        onUpdate({ type: option.value })
                                    }
                                >
                                    {option.icon} {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Status */}
                <div className="min-w-0 px-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={`h-7 w-full justify-start px-1 text-xs font-normal hover:bg-background/50 ${
                                    STATUS_COLORS[task.status as TaskStatus] ||
                                    ""
                                }`}
                            >
                                <span className="truncate capitalize">
                                    {task.status === "in-progress"
                                        ? "Active"
                                        : task.status}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="min-w-[120px]"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onClick={() =>
                                        onUpdate({ status: option.value })
                                    }
                                >
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Start Date */}
                <div className="min-w-0 px-1">
                    <Input
                        type="date"
                        value={
                            task.startDate
                                ? format(task.startDate, "yyyy-MM-dd")
                                : ""
                        }
                        onChange={(e) =>
                            onUpdate({
                                startDate: e.target.value
                                    ? new Date(e.target.value)
                                    : null,
                            })
                        }
                        className="h-7 w-full border-transparent bg-transparent px-1 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-background/50"
                    />
                </div>

                {/* End Date */}
                <div className="min-w-0 px-1">
                    <Input
                        type="date"
                        value={
                            task.endDate
                                ? format(task.endDate, "yyyy-MM-dd")
                                : ""
                        }
                        onChange={(e) =>
                            onUpdate({
                                endDate: e.target.value
                                    ? new Date(e.target.value)
                                    : null,
                            })
                        }
                        className="h-7 w-full border-transparent bg-transparent px-1 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-background/50"
                    />
                </div>

                {/* Percentage */}
                <div className="min-w-0 px-0">
                    <Input
                        type="number"
                        min={0}
                        max={100}
                        value={task.percentage || 0}
                        onChange={(e) =>
                            onUpdate({
                                percentage: parseInt(e.target.value) || 0,
                            })
                        }
                        className="h-7 w-full border-transparent bg-transparent px-0 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-background/50 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>

                {/* Duration (calculated, read-only) */}
                {/* TODO: make duration not read-only to be able to calc start and end date based on it*/}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="min-w-0 px-0 text-center text-muted-foreground cursor-default text-[11px]">
                            {duration}d
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>Duration: {duration} days</TooltipContent>
                </Tooltip>

                {/* Cost */}
                <div className="min-w-0 px-0">
                    {task.type === "group" ? (
                        // Groups show calculated cost (read-only)
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="h-7 flex items-center justify-end px-0 text-[11px] text-muted-foreground cursor-default truncate">
                                    {formatRupiah(displayCost)}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                Total from children: {formatRupiah(displayCost)}
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        // Non-groups have editable cost
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Input
                                    value={costInput}
                                    onChange={handleCostChange}
                                    onBlur={handleCostBlur}
                                    className="h-7 w-full border-transparent bg-transparent px-0 text-[11px] shadow-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-background/50 text-right"
                                    placeholder="Rp 0"
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                {formatRupiah(task.cost || 0)}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>

                {/* Parent Selection (only for non-group tasks) */}
                <div className="min-w-0 px-0">
                    {task.type !== "group" ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-7 w-full justify-start gap-1 px-1 text-[11px] font-normal hover:bg-background/50"
                                >
                                    <FolderTree className="size-3 shrink-0 text-muted-foreground" />
                                    <span className="truncate">
                                        {parentTask?.name || "None"}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="max-h-[200px] overflow-y-auto min-w-[150px]"
                            >
                                <DropdownMenuItem
                                    onClick={() => onUpdate({ parentId: null })}
                                >
                                    <span className="text-muted-foreground">
                                        None
                                    </span>
                                </DropdownMenuItem>
                                {availableParents.length > 0 && (
                                    <DropdownMenuSeparator />
                                )}
                                {availableParents.map((group) => (
                                    <DropdownMenuItem
                                        key={group.id}
                                        onClick={() =>
                                            onUpdate({ parentId: group.id })
                                        }
                                    >
                                        <span className="truncate">
                                            {group.name}
                                        </span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <span className="text-[10px] text-muted-foreground px-1">
                            —
                        </span>
                    )}
                </div>

                {/* Assignee */}
                <div className="flex justify-center">
                    <DropdownMenu>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-6 w-6 ${
                                            task.assignee
                                                ? "text-primary"
                                                : "text-muted-foreground/50"
                                        }`}
                                    >
                                        <Users className="size-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                {task.assignee || "Unassigned"}
                            </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end" className="w-48">
                            <div className="p-2">
                                <Input
                                    placeholder="Assignee name..."
                                    value={task.assignee || ""}
                                    onChange={(e) =>
                                        onUpdate({ assignee: e.target.value })
                                    }
                                    className="h-8 text-xs"
                                />
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Dependencies */}
                <div className="flex justify-center">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-6 w-6 ${
                                    (task.dependencies?.length || 0) > 0
                                        ? "text-primary"
                                        : "text-muted-foreground/50"
                                }`}
                                onClick={() => setDepDialogOpen(true)}
                            >
                                <Link2 className="size-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {task.dependencies?.length || 0} dependencies
                        </TooltipContent>
                    </Tooltip>
                    <DependenciesDialog
                        task={task}
                        allTasks={allTasks}
                        onUpdate={onUpdate}
                        open={depDialogOpen}
                        onOpenChange={setDepDialogOpen}
                    />
                </div>

                {/* Delete */}
                <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={onDelete}
                            >
                                <Trash2 className="size-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Task</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
}
