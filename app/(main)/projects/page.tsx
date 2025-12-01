import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth-server";
import {
    NewProjectDialog,
    ProjectCount,
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

function ProjectListLoading() {
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

async function ProjectCountWithAuth() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return <ProjectCount userId={session.user.id} />;
}

async function ProjectListWithAuth() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return <ProjectList userId={session.user.id} />;
}

async function AuthCheck() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
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

            <Suspense fallback={<ProjectListLoading />}>
                <ProjectListWithAuth />
            </Suspense>
        </div>
    );
}
