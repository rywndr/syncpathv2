import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { WelcomeAlert } from "@/components/dashboard";

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-8">
            <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight">
                Dashboard
            </h1>

            <WelcomeAlert userName={session.user.name} />
        </div>
    );
}
