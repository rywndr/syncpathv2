import Link from "next/link";
import { AppBrand } from "./app-brand";
import { NavLink } from "./nav-link";
import { UserDropdown } from "./user-dropdown";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FolderKanban } from "lucide-react";

interface NavbarProps {
    user?: {
        name: string;
        email: string;
        image?: string | null;
    } | null;
}

export function Navbar({ user }: NavbarProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg shadow-md">
            <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <AppBrand href={user ? "/dashboard" : "/"} />
                    {user && (
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
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {user ? (
                        <UserDropdown user={user} />
                    ) : (
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
                    )}
                </div>
            </div>
        </header>
    );
}
