import { Suspense } from "react";
import Link from "next/link";
import { AppBrand } from "./app-brand";
import { NavLink } from "./nav-link";
import { UserDropdown } from "./user-dropdown";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutDashboard, FolderKanban } from "lucide-react";
import { getSession } from "@/lib/auth-server";

function UserDropdownLoading() {
    return <Skeleton className="h-8 w-8 rounded-full" />;
}

async function UserSection() {
    const session = await getSession();
    const user = session?.user;

    if (user) {
        return <UserDropdown user={user} />;
    }

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground"
            >
                <Link href="/login">Log in</Link>
            </Button>
            <Button
                size="sm"
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 transition-all hover:shadow-lg hover:shadow-blue-600/30"
            >
                <Link href="/sign-up">Sign up</Link>
            </Button>
        </>
    );
}

async function NavLinks() {
    const session = await getSession();

    if (!session?.user) {
        return null;
    }

    return (
        <nav className="hidden items-center gap-1 md:flex">
            <NavLink
                href="/dashboard"
                icon={<LayoutDashboard className="size-4" />}
            >
                Dashboard
            </NavLink>
            <NavLink
                href="/projects"
                icon={<FolderKanban className="size-4" />}
            >
                Projects
            </NavLink>
        </nav>
    );
}

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg shadow-md">
            <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <AppBrand />
                    <Suspense fallback={null}>
                        <NavLinks />
                    </Suspense>
                </div>
                <div className="flex items-center gap-3">
                    <Suspense fallback={<UserDropdownLoading />}>
                        <UserSection />
                    </Suspense>
                </div>
            </div>
        </header>
    );
}
