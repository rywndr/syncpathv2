import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import {
    AuthCard,
    AuthDivider,
    AuthLayout,
    LoginForm,
    SocialLoginButtons,
} from "@/components/auth";

export default async function LoginPage() {
    const session = await getSession();

    if (session) {
        redirect("/dashboard");
    }

    return (
        <AuthLayout>
            <AuthCard
                title="Welcome back"
                description="Sign in to your account to continue"
                footerText="Don't have an account?"
                footerLinkText="Sign up"
                footerLinkHref="/sign-up"
            >
                <div className="grid gap-6">
                    <LoginForm />
                    <AuthDivider />
                    <SocialLoginButtons />
                </div>
            </AuthCard>
        </AuthLayout>
    );
}
