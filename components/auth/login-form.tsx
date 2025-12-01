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
    passwordSchema,
    validateField,
} from "@/lib/validations/auth";

export function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            setIsLoading(true);
            try {
                const { error } = await authClient.signIn.email({
                    email: value.email,
                    password: value.password,
                });

                if (error) {
                    toast.error(error.message || "Invalid email or password");
                    setIsLoading(false);
                    return;
                }

                toast.success("Welcome back! You have successfully logged in.");
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
                    onBlur: ({ value }) => validateField(passwordSchema, value),
                }}
            >
                {(field) => (
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor={field.name}>Password</Label>
                            <Link
                                href="#"
                                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <PasswordInput
                            id={field.name}
                            placeholder="••••••••"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            disabled={isLoading}
                            autoComplete="current-password"
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
                        Signing in...
                    </>
                ) : (
                    "Sign in"
                )}
            </Button>
        </form>
    );
}
