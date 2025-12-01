"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
    emailSchema,
    nameSchema,
    newPasswordSchema,
    validateField,
} from "@/lib/validations/auth";

export function SignUpForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        onSubmit: async ({ value }) => {
            if (value.password !== value.confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }

            setIsLoading(true);
            try {
                const { error } = await authClient.signUp.email({
                    email: value.email,
                    password: value.password,
                    name: value.name,
                });

                if (error) {
                    toast.error(
                        error.message ||
                            "An account with this email already exists",
                    );
                    setIsLoading(false);
                    return;
                }

                toast.success(
                    "Account created successfully! Welcome to the platform.",
                );
                router.push("/dashboard");
                router.refresh();
            } catch {
                toast.error("An unexpected error occurred. Please try again.");
                setIsLoading(false);
            }
        },
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="grid gap-4"
        >
            <form.Field
                name="name"
                validators={{
                    onBlur: ({ value }) => validateField(nameSchema, value),
                }}
            >
                {(field) => (
                    <div className="grid gap-2">
                        <Label htmlFor={field.name}>Name</Label>
                        <Input
                            id={field.name}
                            type="text"
                            placeholder="John Doe"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            disabled={isLoading}
                            autoComplete="name"
                            aria-invalid={
                                field.state.meta.errors.length > 0
                                    ? "true"
                                    : undefined
                            }
                        />
                        {field.state.meta.errors.length > 0 && (
                            <p className="text-sm text-destructive">
                                {field.state.meta.errors[0]}
                            </p>
                        )}
                    </div>
                )}
            </form.Field>

            <form.Field
                name="email"
                validators={{
                    onBlur: ({ value }) => validateField(emailSchema, value),
                }}
            >
                {(field) => (
                    <div className="grid gap-2">
                        <Label htmlFor={field.name}>Email</Label>
                        <Input
                            id={field.name}
                            type="email"
                            placeholder="e@domain.com"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            disabled={isLoading}
                            autoComplete="email"
                            aria-invalid={
                                field.state.meta.errors.length > 0
                                    ? "true"
                                    : undefined
                            }
                        />
                        {field.state.meta.errors.length > 0 && (
                            <p className="text-sm text-destructive">
                                {field.state.meta.errors[0]}
                            </p>
                        )}
                    </div>
                )}
            </form.Field>

            <form.Field
                name="password"
                validators={{
                    onBlur: ({ value }) =>
                        validateField(newPasswordSchema, value),
                }}
            >
                {(field) => (
                    <div className="grid gap-2">
                        <Label htmlFor={field.name}>Password</Label>
                        <PasswordInput
                            id={field.name}
                            placeholder="••••••••"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            disabled={isLoading}
                            autoComplete="new-password"
                            aria-invalid={
                                field.state.meta.errors.length > 0
                                    ? "true"
                                    : undefined
                            }
                        />
                        {field.state.meta.errors.length > 0 && (
                            <p className="text-sm text-destructive">
                                {field.state.meta.errors[0]}
                            </p>
                        )}
                    </div>
                )}
            </form.Field>

            <form.Field
                name="confirmPassword"
                validators={{
                    onBlur: ({ value, fieldApi }) => {
                        if (!value) return "Please confirm your password";
                        const password =
                            fieldApi.form.getFieldValue("password");
                        if (value !== password) return "Passwords do not match";
                        return undefined;
                    },
                }}
            >
                {(field) => (
                    <div className="grid gap-2">
                        <Label htmlFor={field.name}>Confirm Password</Label>
                        <PasswordInput
                            id={field.name}
                            placeholder="••••••••"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            disabled={isLoading}
                            autoComplete="new-password"
                            aria-invalid={
                                field.state.meta.errors.length > 0
                                    ? "true"
                                    : undefined
                            }
                        />
                        {field.state.meta.errors.length > 0 && (
                            <p className="text-sm text-destructive">
                                {field.state.meta.errors[0]}
                            </p>
                        )}
                    </div>
                )}
            </form.Field>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin" />
                        Creating account...
                    </>
                ) : (
                    "Create account"
                )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                By creating an account, you agree to our{" "}
                <Link
                    href="#"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                    href="#"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    Privacy Policy
                </Link>
                .
            </p>
        </form>
    );
}
