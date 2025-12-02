import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { HeroSection, FeaturesSection, CtaSection } from "@/components/landing";

async function AuthRedirect() {
    const session = await getSession();

    if (session) {
        redirect("/dashboard");
    }

    return null;
}

export default function HomePage() {
    return (
        <>
            <Suspense fallback={null}>
                <AuthRedirect />
            </Suspense>

            <div className="flex flex-col">
                <HeroSection />
                <FeaturesSection />
                <CtaSection />
            </div>
        </>
    );
}
