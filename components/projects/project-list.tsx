import { FolderSearch } from "lucide-react";

import { getProjects } from "@/lib/data/projects";
import { ProjectCard } from "./project-card";

interface ProjectListProps {
    userId: string;
}

export async function ProjectList({ userId }: ProjectListProps) {
    const projects = await getProjects(userId);

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
