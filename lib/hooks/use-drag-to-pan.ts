import { useEffect, useRef, useCallback, RefObject } from "react";

interface DragState {
    isDragging: boolean;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
}

/**
 * Hook to enable drag-to-pan functionality on a scrollable element.
 * Hold mouse button and drag to scroll the container.
 *
 * @param containerRef - Ref to the scrollable container element
 * @param enabled - Whether drag-to-pan is enabled (default: true)
 */
export function useDragToPan<T extends HTMLElement>(
    containerRef: RefObject<T | null>,
    enabled: boolean = true,
) {
    const dragState = useRef<DragState>({
        isDragging: false,
        startX: 0,
        startY: 0,
        scrollLeft: 0,
        scrollTop: 0,
    });

    const handleMouseDown = useCallback(
        (e: MouseEvent) => {
            const container = containerRef.current;
            if (!container || !enabled) return;

            // Only trigger on left mouse button
            if (e.button !== 0) return;

            // Don't interfere with interactive elements
            const target = e.target as HTMLElement;
            if (
                target.closest("button") ||
                target.closest("input") ||
                target.closest("a")
            ) {
                return;
            }

            dragState.current = {
                isDragging: true,
                startX: e.pageX - container.offsetLeft,
                startY: e.pageY - container.offsetTop,
                scrollLeft: container.scrollLeft,
                scrollTop: container.scrollTop,
            };

            container.style.cursor = "grabbing";
            container.style.userSelect = "none";
        },
        [containerRef, enabled],
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            const container = containerRef.current;
            if (!container || !dragState.current.isDragging) return;

            e.preventDefault();

            const x = e.pageX - container.offsetLeft;
            const y = e.pageY - container.offsetTop;
            const walkX = x - dragState.current.startX;
            const walkY = y - dragState.current.startY;

            container.scrollLeft = dragState.current.scrollLeft - walkX;
            container.scrollTop = dragState.current.scrollTop - walkY;
        },
        [containerRef],
    );

    const handleMouseUp = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        dragState.current.isDragging = false;
        container.style.cursor = "";
        container.style.userSelect = "";
    }, [containerRef]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !enabled) return;

        container.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mouseleave", handleMouseUp);

        return () => {
            container.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("mouseleave", handleMouseUp);
        };
    }, [
        containerRef,
        enabled,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
    ]);
}
