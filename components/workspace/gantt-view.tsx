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
