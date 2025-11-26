import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth-server";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
    const session = await getSession();

    if (session) {
        redirect("/dashboard");
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 p-4">
            <div className="text-center">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Welcome to Sync
                    <span className="text-blue-600">path</span>
                </h1>
                <p className="text-muted-foreground mt-4 text-xl">
                    Sign in to access your dashboard and manage your projects.
                </p>
            </div>

            <div className="flex gap-4">
                <Button
                    asChild
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 transition-all hover:shadow-lg hover:shadow-blue-600/30"
                >
                    <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/sign-up">Create account</Link>
                </Button>
            </div>
        </div>
    );
}
