import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { SettingsTabs } from "@/components/settings";
import { Skeleton } from "@/components/ui/skeleton";

function SettingsLoading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
}

async function UserSettingsWithAuth() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return (
        <SettingsTabs
            user={session.user}
            currentSessionToken={session.session.token}
        />
    );
}

export default function UserProfilePage() {
    return (
        <div className="mx-auto max-w-3xl space-y-8 p-8">
            <div className="space-y-1">
                <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                    Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            <Suspense fallback={<SettingsLoading />}>
                <UserSettingsWithAuth />
            </Suspense>
        </div>
    );
}
