"use client";

import { useState, useEffect } from "react";
import { updateProject } from "@/lib/actions/project-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProjectTitleProps {
    projectId: string;
    initialName: string;
    isReadOnly?: boolean;
}

export function ProjectTitle({
    projectId,
    initialName,
    isReadOnly = false,
}: ProjectTitleProps) {
    const [name, setName] = useState(initialName);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    const handleBlur = async () => {
        if (isReadOnly) return;

        let finalName = name.trim();
        if (!finalName) {
            finalName = "Untitled Project";
        }

        if (finalName === initialName) {
            setName(initialName);
            return;
        }

        setIsLoading(true);
        try {
            const result = await updateProject(projectId, finalName);
            if (!result.success) {
                setName(initialName);
                toast.error(result.error || "Failed to update project name");
            } else {
                setName(finalName);
            }
        } catch {
            setName(initialName);
            toast.error("Failed to update project name");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.currentTarget.blur();
        } else if (e.key === "Escape") {
            setName(initialName);
            e.currentTarget.blur();
        }
    };

    return (
        <div
            className={cn(
                "relative inline-grid items-center max-w-[200px] md:max-w-[300px] lg:max-w-[400px]",
                isReadOnly && "opacity-50",
            )}
        >
            {/* Span to dictate width based on content */}
            <span
                className="col-start-1 row-start-1 min-w-0 invisible whitespace-pre px-2 border border-transparent text-sm font-semibold overflow-hidden text-ellipsis"
                aria-hidden="true"
            >
                {name || "Untitled Project"}
            </span>

            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                disabled={isReadOnly || isLoading}
                className={cn(
                    "col-start-1 row-start-1 w-0 min-w-full h-8 px-2 rounded text-sm font-semibold bg-transparent border border-transparent transition-colors truncate",
                    "focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background focus:border-input",
                    !isReadOnly &&
                        "hover:bg-muted/50 hover:border-border cursor-text",
                    isReadOnly && "cursor-default",
                )}
                placeholder="Untitled Project"
            />
        </div>
    );
}
