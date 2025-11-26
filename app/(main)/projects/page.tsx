import { Suspense } from "react";
import { redirect } from "next/navigation";
import { eq, count } from "drizzle-orm";

import { db } from "@/lib/db";
import { project } from "@/lib/db/schema";
import { getSession } from "@/lib/auth-server";
import {
    NewProjectDialog,
    ProjectCountClient,
    ProjectList,
} from "@/components/projects";
import { Skeleton } from "@/components/ui/skeleton";

function ProjectCountLoading() {
    return (
        <div className="flex items-center gap-2">
            <Skeleton className="size-5" />
            <Skeleton className="h-4 w-20" />
        </div>
    );
}

async function ProjectCountWithAuth() {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const result = await db
        .select({ count: count() })
        .from(project)
        .where(eq(project.userId, session.user.id));

    const initialCount = result[0]?.count ?? 0;

    return <ProjectCountClient initialCount={initialCount} />;
}

async function AuthCheck() {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    return null;
}

export default function ProjectsPage() {
    return (
        <div className="mx-auto max-w-7xl space-y-8 p-8">
            <Suspense fallback={null}>
                <AuthCheck />
            </Suspense>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                        Projects
                    </h1>
                    <Suspense fallback={<ProjectCountLoading />}>
                        <ProjectCountWithAuth />
                    </Suspense>
                </div>

                <Suspense fallback={<Skeleton className="h-10 w-32" />}>
                    <NewProjectDialog />
                </Suspense>
            </div>

            <ProjectList />
        </div>
    );
}
