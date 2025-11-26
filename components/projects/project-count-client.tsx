"use client";

import { useEffect, useState } from "react";
import { FolderKanban } from "lucide-react";
import { useProjectStore } from "@/lib/store/project-store";

interface ProjectCountClientProps {
    initialCount: number;
}

export function ProjectCountClient({ initialCount }: ProjectCountClientProps) {
    const { refreshTrigger } = useProjectStore();
    const [count, setCount] = useState(initialCount);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                // Fetch the latest list to get the count
                const response = await fetch("/api/projects", {
                    cache: "no-store",
                });
                if (response.ok) {
                    const data = await response.json();
                    setCount(data.length);
                }
            } catch (error) {
                console.error("Failed to update project count", error);
            }
        };

        // Only fetch if we've had a trigger (initial render uses prop)
        if (refreshTrigger > 0) {
            fetchCount();
        }
    }, [refreshTrigger]);

    return (
        <div className="flex items-center gap-2 text-muted-foreground">
            <FolderKanban className="size-5" />
            <span className="text-sm font-medium">
                {count} {count === 1 ? "project" : "projects"}
            </span>
        </div>
    );
}
