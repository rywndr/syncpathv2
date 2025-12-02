import { Calendar, Zap, Users, BarChart3, LucideIcon } from "lucide-react";

interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
}

const features: Feature[] = [
    {
        icon: Calendar,
        title: "Visual Gantt Chart",
        description:
            "See all your tasks and project timelines in an interactive and easy-to-understand Gantt view.",
    },
    {
        icon: Zap,
        title: "Real-time Updates",
        description:
            "Changes sync instantly without refreshing. Team collaboration has never been smoother.",
    },
    {
        icon: Users,
        title: "Task Management",
        description:
            "Manage tasks - create, edit, and set dependencies between tasks with drag & drop.",
    },
    {
        icon: BarChart3,
        title: "Progress Tracking",
        description:
            "Monitor the progress of every task and project in real-time with clear visuals.",
    },
];

function FeatureCard({ feature }: { feature: Feature }) {
    const Icon = feature.icon;

    return (
        <div className="group relative rounded-2xl border bg-card p-6 transition-all hover:border-blue-500/50 hover:shadow-lg">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Icon className="size-6" />
            </div>
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
            </p>
        </div>
    );
}

export function FeaturesSection() {
    return (
        <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Everything you need to{" "}
                        <span className="text-blue-600">manage projects</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                        Complete features to help your team work more
                        efficiently and stay organized.
                    </p>
                </div>

                <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => (
                        <FeatureCard key={feature.title} feature={feature} />
                    ))}
                </div>
            </div>
        </section>
    );
}
