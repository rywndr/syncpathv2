import { Navbar, Footer } from "@/components/layout";
import { getSession } from "@/lib/auth-server";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar user={session?.user ?? null} />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
