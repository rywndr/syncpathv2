"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { useWorkspaceStore } from "@/lib/store/workspace-store";
import {
    ViewMode,
    buildTaskHierarchy,
    flattenTaskHierarchy,
    createIdMapping,
    transformTasksToGanttItems,
    GANTT_LAYOUT,
} from "@/lib/gantt";
import { useDragToPan } from "@/lib/hooks";
import type { GanttOptions } from "gantt";

interface GanttViewProps {
    viewMode: ViewMode;
    showLinks: boolean;
    showDelay: boolean;
    onScroll?: (scrollTop: number) => void;
    scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export function GanttView({
    viewMode,
    showLinks,
    showDelay,
    onScroll,
    scrollRef,
}: GanttViewProps) {
    const { tasks, collapsedGroups, siblingOrder } = useWorkspaceStore();
    const [isClient, setIsClient] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // Enable drag-to-pan
    useDragToPan(containerRef);

    const ganttInstanceRef = useRef<InstanceType<
        typeof import("gantt").SVGGantt
    > | null>(null);

    // Build hierarchy and flatten with same logic as TaskList
    // Use siblingOrder for consistent ordering between TaskList and GanttView
    const hierarchy = useMemo(
        () => buildTaskHierarchy(tasks, siblingOrder),
        [tasks, siblingOrder],
    );
    const flatNodes = useMemo(
        () => flattenTaskHierarchy(hierarchy, collapsedGroups),
        [hierarchy, collapsedGroups],
    );

    // Create ID mapping from flattened nodes (ensure correct row order on gantt chart)
    const idMapping = useMemo(() => createIdMapping(flatNodes), [flatNodes]);

    // Transform to gantt items using the correct order
    const ganttItems = useMemo(
        () => transformTasksToGanttItems(flatNodes, idMapping),
        [flatNodes, idMapping],
    );

    // Set isClient on mount
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Initialize and update gantt chart with dynamic import
    useEffect(() => {
        if (!isClient || !containerRef.current || ganttItems.length === 0) {
            // Clear container if no items
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
            ganttInstanceRef.current = null;
            return;
        }

        // Gantt unused empty whitespace that replaces gantt package's
        // built-in task list fix
        const fixGanttLayout = () => {
            if (!containerRef.current) return;
            const svg = containerRef.current.querySelector("svg");
            if (!svg) return;

            // Find first vertical line which usually separates grid and timeline
            const lines = Array.from(svg.querySelectorAll("line"));
            let minX = Infinity;

            // Filter for vertical lines
            for (const line of lines) {
                const x1 = parseFloat(line.getAttribute("x1") || "0");
                const x2 = parseFloat(line.getAttribute("x2") || "0");
                // Check if vertical and not at the very edge (0)
                if (Math.abs(x1 - x2) < 0.1 && x1 > 5) {
                    if (x1 < minX) {
                        minX = x1;
                    }
                }
            }

            // Fallback to text elements if no lines found
            if (minX === Infinity) {
                const texts = Array.from(svg.querySelectorAll("text"));
                for (const text of texts) {
                    const x = parseFloat(text.getAttribute("x") || "0");
                    if (x < minX) minX = x;
                }
                // Adjust for potential padding
                if (minX !== Infinity) minX = Math.max(0, minX - 10);
            }

            if (minX !== Infinity && minX > 0) {
                svg.style.marginLeft = `-${minX}px`;
            }
        };

        const initGantt = async () => {
            const { SVGGantt } = await import("gantt");

            if (!containerRef.current) return;

            const options: GanttOptions = {
                viewMode,
                offsetY: GANTT_LAYOUT.TIMELINE_HEADER_HEIGHT,
                rowHeight: GANTT_LAYOUT.ROW_HEIGHT,
                barHeight: GANTT_LAYOUT.BAR_HEIGHT,
                showLinks,
                showDelay,
                // @ts-expect-error: gridWidth is not in types but supported by library to hide built-in grid
                gridWidth: 0,
            };

            // If gantt instance exists, update it; otherwise create new one
            if (ganttInstanceRef.current) {
                ganttInstanceRef.current.setData(ganttItems);
                ganttInstanceRef.current.setOptions(options);
            } else {
                // Clear container before creating new instance
                containerRef.current.innerHTML = "";
                ganttInstanceRef.current = new SVGGantt(
                    containerRef.current,
                    ganttItems,
                    options,
                );
            }

            // Fix layout after render
            fixGanttLayout();
        };

        initGantt();
    }, [isClient, ganttItems, viewMode, showLinks, showDelay]);

    // Handle scroll sync
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScrollEvent = () => {
            if (onScroll) {
                onScroll(container.scrollTop);
            }
        };

        container.addEventListener("scroll", handleScrollEvent);

        // Allow parent to control scroll via ref
        // TPDO: use RefObject instaed as MutableRefObject is deprecated
        if (scrollRef) {
            const ref =
                scrollRef as React.MutableRefObject<HTMLDivElement | null>;
            ref.current = container;
        }

        return () => {
            container.removeEventListener("scroll", handleScrollEvent);
        };
    }, [onScroll, scrollRef]);

    // Cleanup
    useEffect(() => {
        return () => {
            ganttInstanceRef.current = null;
        };
    }, []);

    if (tasks.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground bg-background">
                No tasks to display
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-background">
            <div ref={containerRef} className="h-full w-full overflow-auto" />
        </div>
    );
}
