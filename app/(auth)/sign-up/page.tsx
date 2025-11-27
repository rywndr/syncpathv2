import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import {
    AuthCard,
    AuthDivider,
    AuthLayout,
    SignUpForm,
    SocialLoginButtons,
} from "@/components/auth";

async function SessionCheck() {
    const session = await getSession();

    if (session) {
        redirect("/dashboard");
    }

    return null;
}

export default function SignUpPage() {
    return (
        <AuthLayout>
            <Suspense fallback={null}>
                <SessionCheck />
            </Suspense>

            <AuthCard
                title="Create an account"
                description="Enter your details to get started"
                footerText="Already have an account?"
                footerLinkText="Sign in"
                footerLinkHref="/login"
            >
                <div className="grid gap-6">
                    <Suspense fallback={null}>
                        <SignUpForm />
                    </Suspense>
                    <AuthDivider />
                    <SocialLoginButtons />
                </div>
            </AuthCard>
        </AuthLayout>
    );
}
