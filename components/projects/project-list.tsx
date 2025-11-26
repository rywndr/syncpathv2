"use client";

import { useEffect, useState, useCallback } from "react";
import { FolderSearch } from "lucide-react";
import { toast } from "sonner";

import { Project } from "@/lib/db/schema";
import { ProjectCard } from "./project-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectStore } from "@/lib/store/project-store";

export function ProjectList() {
    const { refreshTrigger } = useProjectStore();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchProjects = useCallback(async () => {
        try {
            const response = await fetch("/api/projects", {
                cache: "no-store",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch projects");
            }
            const data = await response.json();
            setProjects(data);
            setError(false);
        } catch (err) {
            console.error(err);
            setError(true);
            toast.error("Failed to load projects");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects, refreshTrigger]);

    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex flex-col gap-6 rounded-xl border p-6 shadow-sm"
                    >
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-12 text-center text-destructive">
                <p>Failed to load projects. Please try refreshing the page.</p>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center animate-in fade-in-50">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <FolderSearch className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                    No projects found
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    You haven&apos;t created any projects yet. Click the
                    &quot;New Project&quot; button to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in-50">
            {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </div>
    );
}
