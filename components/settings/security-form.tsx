"use client";

import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
    changePasswordSchema,
    validateField,
    passwordSchema,
} from "@/lib/validations/settings";
import { z } from "zod";

export function SecurityForm() {
    const router = useRouter();

    const form = useForm({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        onSubmit: async ({ value }) => {
            const result = changePasswordSchema.safeParse(value);
            if (!result.success) {
                const firstError = result.error.issues[0];
                toast.error(firstError?.message || "Validation failed");
                return;
            }

            try {
                const { error } = await authClient.changePassword({
                    currentPassword: value.currentPassword,
                    newPassword: value.newPassword,
                    revokeOtherSessions: true,
                });

                if (error) {
                    toast.error(error.message || "Failed to change password");
                    return;
                }

                toast.success("Password changed successfully");
                form.reset();
                router.refresh();
            } catch {
                toast.error("An unexpected error occurred");
            }
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                    Update your password to keep your account secure. After
                    changing your password, all other sessions will be logged
                    out.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    <form.Field
                        name="currentPassword"
                        validators={{
                            onBlur: ({ value }) =>
                                validateField(
                                    z
                                        .string()
                                        .min(1, "Current password is required"),
                                    value,
                                ),
                        }}
                    >
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>
                                    Current Password
                                </Label>
                                <PasswordInput
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    placeholder="Enter current password"
                                    disabled={form.state.isSubmitting}
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
                        name="newPassword"
                        validators={{
                            onBlur: ({ value, fieldApi }) => {
                                const baseError = validateField(
                                    passwordSchema,
                                    value,
                                );
                                if (baseError) return baseError;

                                const currentPassword =
                                    fieldApi.form.getFieldValue(
                                        "currentPassword",
                                    );
                                if (value === currentPassword) {
                                    return "New password must be different from current password";
                                }
                                return undefined;
                            },
                        }}
                    >
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>New Password</Label>
                                <PasswordInput
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    placeholder="Enter new password"
                                    disabled={form.state.isSubmitting}
                                    aria-invalid={
                                        field.state.meta.errors.length > 0
                                            ? "true"
                                            : undefined
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Password must be at least 8 characters
                                </p>
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
                                if (!value)
                                    return "Please confirm your new password";
                                const newPassword =
                                    fieldApi.form.getFieldValue("newPassword");
                                if (value !== newPassword) {
                                    return "Passwords do not match";
                                }
                                return undefined;
                            },
                        }}
                    >
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>
                                    Confirm New Password
                                </Label>
                                <PasswordInput
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    placeholder="Confirm new password"
                                    disabled={form.state.isSubmitting}
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

                    <Button type="submit" disabled={form.state.isSubmitting}>
                        {form.state.isSubmitting && (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                        Change Password
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
