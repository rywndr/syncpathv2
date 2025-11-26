"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
}

export function NavLink({ href, children, icon }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                    ? "bg-gray-100 text-blue-800"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
        >
            {icon}
            {children}
        </Link>
    );
}
