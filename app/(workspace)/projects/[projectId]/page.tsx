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

    const existingProject = await db
        .select()
        .from(project)
        .where(eq(project.id, projectId))
        .limit(1);

    if (!existingProject[0]) {
        notFound();
    }

    const projectData = existingProject[0];
    const isOwner = session?.user?.id === projectData.userId;
    const isShared = projectData.isShared;

    // Access control logic
    if (!isOwner) {
        // If not owner and not shared, redirect to login or projects
        if (!isShared) {
            if (!session) {
                redirect("/login");
            } else {
                redirect("/projects");
            }
        }
        // If shared, allow access (public view)
    }

    const tasks = await db
        .select()
        .from(task)
        .where(eq(task.projectId, projectId))
        .orderBy(asc(task.createdAt));

    // Determine read-only status
    // Owner always has edit access
    // Visitors have edit access only if shared with 'edit' permission
    const isReadOnly =
        !isOwner &&
        (!isShared || (projectData.sharePermission || "view") === "view");

    return (
        <ProjectWorkspace
            projectId={projectId}
            projectName={projectData.name}
            initialTasks={tasks}
            isShared={projectData.isShared}
            sharePermission={projectData.sharePermission || "view"}
            isReadOnly={isReadOnly}
            isOwner={isOwner}
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
