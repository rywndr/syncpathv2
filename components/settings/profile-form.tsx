"use client";

import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { nameSchema, validateField } from "@/lib/validations/settings";

interface ProfileFormProps {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
    };
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter();

    const form = useForm({
        defaultValues: {
            name: user.name,
        },
        onSubmit: async ({ value }) => {
            // Validate with Zod
            const nameError = validateField(nameSchema, value.name);
            if (nameError) {
                toast.error(nameError);
                return;
            }

            if (value.name.trim() === user.name) {
                toast.info("No changes to save");
                return;
            }

            try {
                const { error } = await authClient.updateUser({
                    name: value.name.trim(),
                });

                if (error) {
                    toast.error(error.message || "Failed to update profile");
                    return;
                }

                toast.success("Profile updated successfully");
                router.refresh();
            } catch {
                toast.error("An unexpected error occurred");
            }
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                    Update your profile information. Your email address is used
                    for authentication and cannot be changed here.
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
                        name="name"
                        validators={{
                            onBlur: ({ value }) =>
                                validateField(nameSchema, value),
                        }}
                    >
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Name</Label>
                                <Input
                                    id={field.name}
                                    type="text"
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    placeholder="Enter your name"
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

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={user.email}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            Email address cannot be changed
                        </p>
                    </div>

                    <Button type="submit" disabled={form.state.isSubmitting}>
                        {form.state.isSubmitting && (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                        Save Changes
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
