"use client";

import { useState, useRef, useEffect } from "react";
import {
    ChevronRight,
    ChevronDown,
    GripVertical,
    Trash2,
    Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { GRID_TEMPLATE } from "@/lib/utils/task-constants";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { DependenciesDialog } from "./dependencies-dialog";
import { TaskRowProps } from "./types";

export function TaskRow({
    task,
    allTasks,
    groupTasks,
    number,
    depth,
    isCollapsed,
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
    isReadOnly = false,
}: TaskRowProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameValue, setNameValue] = useState(task.name);
    const [dependenciesOpen, setDependenciesOpen] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [isEditingName]);

    const handleNameSubmit = () => {
        if (nameValue.trim() !== task.name) {
            onUpdate({ name: nameValue.trim() });
        }
        setIsEditingName(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleNameSubmit();
        } else if (e.key === "Escape") {
            setNameValue(task.name);
            setIsEditingName(false);
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate styles for drag indicators
    const dragStyle = isDragOver
        ? dropPosition === "before"
            ? "border-t-2 border-t-primary"
            : dropPosition === "after"
              ? "border-b-2 border-b-primary"
              : "bg-primary/10"
        : "";

    return (
        <div
            data-task-row
            draggable={!isReadOnly}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
                "group/row relative border-b bg-background hover:bg-muted/30 transition-colors",
                isDragging && "opacity-50",
                dragStyle,
            )}
        >
            <div
                className="grid h-9 items-center gap-0.5 text-xs"
                style={{ gridTemplateColumns: GRID_TEMPLATE }}
            >
                {/* Drag Handle */}
                <div className="flex justify-center">
                    {!isReadOnly && (
                        <GripVertical className="size-3 text-muted-foreground/50 cursor-grab active:cursor-grabbing opacity-0 group-hover/row:opacity-100 transition-opacity" />
                    )}
                </div>

                {/* Row Num */}
                <div className="text-center text-muted-foreground font-mono text-[10px]">
                    {number}
                </div>

                {/* Name */}
                <div
                    className="flex items-center gap-1 px-0.5 min-w-0"
                    style={{ paddingLeft: `${depth * 16 + 4}px` }}
                >
                    {task.type === "group" && (
                        <button
                            onClick={onToggleCollapse}
                            className="p-0.5 hover:bg-muted rounded-sm shrink-0"
                        >
                            {isCollapsed ? (
                                <ChevronRight className="size-3" />
                            ) : (
                                <ChevronDown className="size-3" />
                            )}
                        </button>
                    )}
                    {isEditingName && !isReadOnly ? (
                        <input
                            ref={nameInputRef}
                            value={nameValue}
                            onChange={(e) => setNameValue(e.target.value)}
                            onBlur={handleNameSubmit}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-background border rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-primary h-6"
                        />
                    ) : (
                        <span
                            className={cn(
                                "truncate cursor-pointer py-0.5 px-1 rounded hover:bg-muted/50 w-full",
                                task.type === "group" && "font-semibold",
                            )}
                            onClick={() =>
                                !isReadOnly && setIsEditingName(true)
                            }
                        >
                            {task.name}
                        </span>
                    )}
                </div>

                {/* Type */}
                <div className="px-0.5">
                    <select
                        value={task.type}
                        onChange={(e) =>
                            onUpdate({
                                type: e.target.value as
                                    | "task"
                                    | "milestone"
                                    | "group",
                            })
                        }
                        disabled={isReadOnly}
                        className="w-full bg-transparent border-none text-xs outline-none cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 disabled:cursor-default disabled:hover:bg-transparent"
                    >
                        <option value="task">Task</option>
                        <option value="milestone">Milestone</option>
                        <option value="group">Group</option>
                    </select>
                </div>

                {/* Status */}
                <div className="px-0.5">
                    <select
                        value={task.status}
                        onChange={(e) => {
                            const newStatus = e.target.value as
                                | "pending"
                                | "in-progress"
                                | "completed"
                                | "blocked";
                            if (newStatus === "completed") {
                                onUpdate({
                                    status: newStatus,
                                    percentage: 100,
                                });
                            } else {
                                onUpdate({ status: newStatus });
                            }
                        }}
                        disabled={isReadOnly}
                        className={cn(
                            "w-full bg-transparent border-none text-xs outline-none cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 disabled:cursor-default disabled:hover:bg-transparent",
                            task.status === "completed" && "text-green-600",
                            task.status === "in-progress" && "text-blue-600",
                            task.status === "blocked" && "text-red-600",
                        )}
                    >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>

                {/* Start Date */}
                <div className="px-0.5">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                disabled={isReadOnly}
                                className={cn(
                                    "w-full text-left hover:bg-muted/50 rounded px-1 py-0.5 flex items-center gap-1 truncate disabled:cursor-default disabled:hover:bg-transparent",
                                    !task.startDate && "text-muted-foreground",
                                )}
                            >
                                <span className="truncate">
                                    {task.startDate
                                        ? format(task.startDate, "dd/MM/yy")
                                        : "-"}
                                </span>
                                {!isReadOnly && (
                                    <CalendarIcon className="size-3 opacity-50 shrink-0 ml-auto" />
                                )}
                            </button>
                        </PopoverTrigger>
                        {!isReadOnly && (
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={task.startDate || undefined}
                                    onSelect={(date) =>
                                        onUpdate({ startDate: date })
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        )}
                    </Popover>
                </div>

                {/* End Date */}
                <div className="px-0.5">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                disabled={isReadOnly}
                                className={cn(
                                    "w-full text-left hover:bg-muted/50 rounded px-1 py-0.5 flex items-center gap-1 truncate disabled:cursor-default disabled:hover:bg-transparent",
                                    !task.endDate && "text-muted-foreground",
                                )}
                            >
                                <span className="truncate">
                                    {task.endDate
                                        ? format(task.endDate, "dd/MM/yy")
                                        : "-"}
                                </span>
                                {!isReadOnly && (
                                    <CalendarIcon className="size-3 opacity-50 shrink-0 ml-auto" />
                                )}
                            </button>
                        </PopoverTrigger>
                        {!isReadOnly && (
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={task.endDate || undefined}
                                    onSelect={(date) =>
                                        onUpdate({ endDate: date })
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        )}
                    </Popover>
                </div>

                {/* Percentage */}
                <div className="px-0 text-center">
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={task.percentage}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 0 && val <= 100) {
                                onUpdate({ percentage: val });
                            }
                        }}
                        disabled={isReadOnly}
                        className="w-full bg-transparent text-center outline-none hover:bg-muted/50 rounded py-0.5 disabled:cursor-default disabled:hover:bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>

                {/* Duration */}
                <div className="px-0 text-center text-muted-foreground">
                    {task.duration}d
                </div>

                {/* Cost */}
                <div className="px-0.5 text-right">
                    {task.type === "group" ? (
                        <span className="text-muted-foreground w-full block px-1 py-0.5">
                            {formatCurrency(task.cost || 0)}
                        </span>
                    ) : (
                        <input
                            type="text"
                            value={
                                task.cost
                                    ? `Rp ${task.cost.toLocaleString("id-ID")}`
                                    : "Rp 0"
                            }
                            onChange={(e) => {
                                // Remove non-numeric chars
                                const val = parseInt(
                                    e.target.value.replace(/\D/g, ""),
                                );
                                if (!isNaN(val)) {
                                    onUpdate({ cost: val });
                                } else if (
                                    e.target.value === "" ||
                                    e.target.value === "Rp "
                                ) {
                                    onUpdate({ cost: 0 });
                                }
                            }}
                            disabled={isReadOnly}
                            className="w-full bg-transparent text-right outline-none hover:bg-muted/50 rounded px-1 py-0.5 disabled:cursor-default disabled:hover:bg-transparent"
                        />
                    )}
                </div>

                {/* Parent */}
                <div className="px-0.5">
                    <select
                        value={task.parentId || ""}
                        onChange={(e) =>
                            onUpdate({ parentId: e.target.value || null })
                        }
                        disabled={isReadOnly}
                        className="w-full bg-transparent border-none text-xs outline-none cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 truncate disabled:cursor-default disabled:hover:bg-transparent"
                    >
                        <option value="">—</option>
                        {groupTasks.map((group) => {
                            // Prevent circular dependency: can't set parent to itself or its own children
                            if (group.id === task.id) return null;
                            return (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Assignee */}
                <div className="flex justify-center">
                    <div className="size-5 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                        {/* Placeholder for assignee avatar */}
                        {task.assignee ? task.assignee[0].toUpperCase() : "?"}
                    </div>
                </div>

                {/* Dependencies */}
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 h-6 w-6"
                        onClick={() => setDependenciesOpen(true)}
                        disabled={isReadOnly}
                    >
                        <span className="text-[10px] font-mono">
                            {task.dependencies?.length || 0}
                        </span>
                    </Button>
                </div>

                {/* Delete */}
                <div className="flex justify-center">
                    {!isReadOnly && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover/row:opacity-100 transition-opacity"
                            onClick={onDelete}
                        >
                            <Trash2 className="size-3" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Dependencies Dialog */}
            <DependenciesDialog
                task={task}
                allTasks={allTasks}
                onUpdate={onUpdate}
                open={dependenciesOpen}
                onOpenChange={setDependenciesOpen}
            />
        </div>
    );
}
