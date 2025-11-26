import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import {
    AuthCard,
    AuthDivider,
    AuthLayout,
    SignUpForm,
    SocialLoginButtons,
} from "@/components/auth";

export default async function SignUpPage() {
    const session = await getSession();

    if (session) {
        redirect("/dashboard");
    }

    return (
        <AuthLayout>
            <AuthCard
                title="Create an account"
                description="Enter your details to get started"
                footerText="Already have an account?"
                footerLinkText="Sign in"
                footerLinkHref="/login"
            >
                <div className="grid gap-6">
                    <SignUpForm />
                    <AuthDivider />
                    <SocialLoginButtons />
                </div>
            </AuthCard>
        </AuthLayout>
    );
}
