import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { WelcomeAlert, ProjectStats } from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

function ProjectStatsLoading() {
    return <Skeleton className="h-32 w-full" />;
}

async function ProjectStatsWithAuth() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return <ProjectStats userId={session.user.id} />;
}

async function WelcomeAlertWithAuth() {
    const session = await getSession();

    if (!session) {
        return null;
    }

    return <WelcomeAlert userName={session.user.name} />;
}

export default function DashboardPage() {
    return (
        <div className="mx-auto max-w-7xl space-y-8 p-8">
            <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                Dashboard
            </h1>

            <Suspense fallback={<Skeleton className="h-20 w-full" />}>
                <WelcomeAlertWithAuth />
            </Suspense>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<ProjectStatsLoading />}>
                    <ProjectStatsWithAuth />
                </Suspense>
            </div>
        </div>
    );
}
