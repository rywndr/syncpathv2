"use client";

import { Users, Link2 } from "lucide-react";
import { GANTT_LAYOUT } from "@/lib/gantt";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { TaskListHeaderProps } from "./types";

export function TaskListHeader({ gridTemplate }: TaskListHeaderProps) {
    return (
        <TooltipProvider delayDuration={300}>
            <div
                className="shrink-0 border-b bg-muted/40 px-2"
                style={{ height: GANTT_LAYOUT.TIMELINE_HEADER_HEIGHT }}
            >
                <div
                    className="grid h-full items-end gap-1 pb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide"
                    style={{ gridTemplateColumns: gridTemplate }}
                >
                    {/* Drag Handle */}
                    <div></div>

                    {/* Row Num */}
                    <div className="text-center">#</div>

                    {/* Name */}
                    <div className="truncate px-1">Name</div>

                    {/* Type */}
                    <div className="truncate px-1">Type</div>

                    {/* Status */}
                    <div className="truncate px-1">Status</div>

                    {/* Start Date */}
                    <div className="truncate px-1">Start</div>

                    {/* End Date */}
                    <div className="truncate px-1">End</div>

                    {/* Percentage */}
                    <div className="truncate px-1 text-center">%</div>

                    {/* Duration */}
                    {/* TODO: calc start and end date based on duration too*/}
                    <div className="truncate px-1 text-center">Days</div>

                    {/* Cost */}
                    {/*TODO: auto calc cost for groups based on it's childrens */}
                    <div className="truncate px-1">Cost (IDR)</div>

                    {/* Parent */}
                    <div className="truncate px-1">Parent</div>

                    {/* Assignee Icon */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex justify-center">
                                <Users className="size-3" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>Assignee</TooltipContent>
                    </Tooltip>

                    {/* Dependencies */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex justify-center">
                                <Link2 className="size-3" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>Dependencies</TooltipContent>
                    </Tooltip>

                    {/* Delete Column */}
                    <div></div>
                </div>
            </div>
        </TooltipProvider>
    );
}
