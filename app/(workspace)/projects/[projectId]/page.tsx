import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";

import { db } from "@/lib/db";
import { project, task } from "@/lib/db/schema";
import { getSession } from "@/lib/auth-server";
import { ProjectWorkspace } from "@/components/workspace/project-workspace";

async function ProjectWorkspaceLoader({
    params,
}: {
    params: Promise<{ projectId: string }>;
}) {
    const { projectId } = await params;
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const existingProject = await db
        .select()
        .from(project)
        .where(eq(project.id, projectId))
        .limit(1);

    if (!existingProject[0]) {
        notFound();
    }

    if (existingProject[0].userId !== session.user.id) {
        redirect("/projects");
    }

    const tasks = await db
        .select()
        .from(task)
        .where(eq(task.projectId, projectId))
        .orderBy(asc(task.createdAt));

    return (
        <ProjectWorkspace
            projectId={projectId}
            projectName={existingProject[0].name}
            initialTasks={tasks}
        />
    );
}

function WorkspaceLoadingFallback() {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">
                    Loading workspace...
                </p>
            </div>
        </div>
    );
}

export default function ProjectWorkspacePage({
    params,
}: {
    params: Promise<{ projectId: string }>;
}) {
    return (
        <Suspense fallback={<WorkspaceLoadingFallback />}>
            <ProjectWorkspaceLoader params={params} />
        </Suspense>
    );
}
