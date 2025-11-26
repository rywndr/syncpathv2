import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import {
    AuthCard,
    AuthDivider,
    AuthLayout,
    LoginForm,
    SocialLoginButtons,
} from "@/components/auth";

async function SessionCheck() {
    const session = await getSession();

    if (session) {
        redirect("/dashboard");
    }

    return null;
}

export default function LoginPage() {
    return (
        <AuthLayout>
            <Suspense fallback={null}>
                <SessionCheck />
            </Suspense>

            <AuthCard
                title="Welcome back"
                description="Sign in to your account to continue"
                footerText="Don't have an account?"
                footerLinkText="Sign up"
                footerLinkHref="/sign-up"
            >
                <div className="grid gap-6">
                    <Suspense fallback={null}>
                        <LoginForm />
                    </Suspense>
                    <AuthDivider />
                    <SocialLoginButtons />
                </div>
            </AuthCard>
        </AuthLayout>
    );
}
