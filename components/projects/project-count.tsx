import { FolderKanban } from "lucide-react";

import { getProjectCount } from "@/lib/data/projects";

interface ProjectCountProps {
    userId: string;
}

export async function ProjectCount({ userId }: ProjectCountProps) {
    const count = await getProjectCount(userId);

    return (
        <div className="flex items-center gap-2 text-muted-foreground">
            <FolderKanban className="size-5" />
            <span className="text-sm font-medium">
                {count} {count === 1 ? "project" : "projects"}
            </span>
        </div>
    );
}
