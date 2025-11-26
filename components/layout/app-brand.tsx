import Link from "next/link";

interface AppBrandProps {
    href?: string;
}

export function AppBrand({ href = "/" }: AppBrandProps) {
    return (
        <Link href={href} className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight">
                Sync<span className="text-blue-600">path</span>
            </span>
        </Link>
    );
}
