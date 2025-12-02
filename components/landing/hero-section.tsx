import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { WorkspacePreview } from "./workspace-preview";
import { AppBrand } from "@/components/layout/app-brand";

const benefits = ["Completely free", "Fast setup", "Export to PDF & PNG"];

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-linear-to-b from-blue-50/50 to-background dark:from-blue-950/20">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                <div className="text-center">
                    <h1 className="flex flex-col items-center gap-2 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                        <span>Manage Your Projects with</span>
                        <span className="text-5xl sm:text-6xl lg:text-7xl">
                            <AppBrand href="/" />
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                        A project management platform with interactive Gantt
                        charts. Visualize timelines, manage tasks, and track
                        your team&apos;s progress.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button
                            asChild
                            size="lg"
                            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30"
                        >
                            <Link href="/sign-up">
                                Get Started
                                <ArrowRight className="ml-2 size-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="h-12 px-8"
                        >
                            <Link href="/login">
                                Already have an account? Sign in
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        {benefits.map((benefit) => (
                            <span
                                key={benefit}
                                className="flex items-center gap-1"
                            >
                                <CheckCircle className="size-4 text-green-500" />
                                {benefit}
                            </span>
                        ))}
                    </div>
                </div>

                <WorkspacePreview />
            </div>
        </section>
    );
}
