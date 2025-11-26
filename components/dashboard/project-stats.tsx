import { cacheLife } from "next/cache";
import { FolderKanban } from "lucide-react";
import { eq, count } from "drizzle-orm";

import { db } from "@/lib/db";
import { project } from "@/lib/db/schema";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface ProjectStatsProps {
    userId: string;
}

async function getProjectCount(userId: string) {
    "use cache";
    cacheLife("minutes");

    const result = await db
        .select({ count: count() })
        .from(project)
        .where(eq(project.userId, userId));

    return result[0]?.count ?? 0;
}

export async function ProjectStats({ userId }: ProjectStatsProps) {
    const projectCount = await getProjectCount(userId);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                        Total Projects
                    </CardTitle>
                    <CardDescription>Your active projects</CardDescription>
                </div>
                <div className="bg-primary/10 text-primary rounded-md p-2">
                    <FolderKanban className="size-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{projectCount}</div>
            </CardContent>
        </Card>
    );
}
