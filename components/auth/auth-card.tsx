import Link from "next/link";
import { AppBrand } from "@/components/layout";

interface AuthCardProps {
    title: string;
    description: string;
    children: React.ReactNode;
    footerText: string;
    footerLinkText: string;
    footerLinkHref: string;
}

export function AuthCard({
    title,
    description,
    children,
    footerText,
    footerLinkText,
    footerLinkHref,
}: AuthCardProps) {
    return (
        <div className="w-full max-w-md space-y-8">
            <div className="flex flex-col items-center text-center">
                <AppBrand />
                <h1 className="mt-6 text-2xl font-bold tracking-tight">
                    {title}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {description}
                </p>
            </div>

            <div>{children}</div>

            <p className="text-center text-sm text-muted-foreground">
                {footerText}{" "}
                <Link
                    href={footerLinkHref}
                    className="font-medium text-blue-600 hover:text-blue-500 underline-offset-4 hover:underline"
                >
                    {footerLinkText}
                </Link>
            </p>
        </div>
    );
}
