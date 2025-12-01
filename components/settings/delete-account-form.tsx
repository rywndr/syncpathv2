"use client";

import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { validateField } from "@/lib/validations/settings";

const CONFIRMATION_TEXT = "DELETE MY ACCOUNT";

const confirmationSchema = z
    .string()
    .refine((val) => val === CONFIRMATION_TEXT, {
        message: "Please type the confirmation text exactly",
    });

export function DeleteAccountForm() {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm({
        defaultValues: {
            password: "",
            confirmationText: "",
        },
        onSubmit: async ({ value }) => {
            // Validate confirmation text
            const confirmError = validateField(
                confirmationSchema,
                value.confirmationText,
            );
            if (confirmError) {
                toast.error(confirmError);
                return;
            }

            try {
                const { error } = await authClient.deleteUser({
                    password: value.password || undefined,
                });

                if (error) {
                    toast.error(error.message || "Failed to delete account");
                    return;
                }

                toast.success("Your account has been deleted");
                setIsDialogOpen(false);
                router.push("/");
                router.refresh();
            } catch {
                toast.error("An unexpected error occurred");
            }
        },
    });

    const isConfirmationValid =
        form.state.values.confirmationText === CONFIRMATION_TEXT;

    function handleDialogClose(open: boolean) {
        if (!open) {
            form.reset();
        }
        setIsDialogOpen(open);
    }

    return (
        <Card className="border-destructive/50">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <AlertTriangle className="size-5 text-destructive" />
                    <CardTitle className="text-destructive">
                        Delete Account
                    </CardTitle>
                </div>
                <CardDescription>
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                    <p className="font-medium">
                        Warning: This action is irreversible
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-destructive/90">
                        <li>All your projects will be permanently deleted</li>
                        <li>All your tasks and data will be removed</li>
                        <li>Your account cannot be recovered</li>
                    </ul>
                </div>

                <AlertDialog
                    open={isDialogOpen}
                    onOpenChange={handleDialogClose}
                >
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                            Delete My Account
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="size-5 text-destructive" />
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove all
                                your data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                form.handleSubmit();
                            }}
                            className="space-y-4 py-4"
                        >
                            <form.Field name="password">
                                {(field) => (
                                    <div className="space-y-2">
                                        <Label htmlFor={field.name}>
                                            Password (optional for OAuth
                                            accounts)
                                        </Label>
                                        <PasswordInput
                                            id={field.name}
                                            value={field.state.value}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter your password"
                                            disabled={form.state.isSubmitting}
                                        />
                                    </div>
                                )}
                            </form.Field>

                            <form.Field
                                name="confirmationText"
                                validators={{
                                    onBlur: ({ value }) =>
                                        validateField(
                                            confirmationSchema,
                                            value,
                                        ),
                                }}
                            >
                                {(field) => (
                                    <div className="space-y-2">
                                        <Label htmlFor={field.name}>
                                            Type{" "}
                                            <span className="font-mono font-semibold text-destructive">
                                                {CONFIRMATION_TEXT}
                                            </span>{" "}
                                            to confirm
                                        </Label>
                                        <Input
                                            id={field.name}
                                            type="text"
                                            value={field.state.value}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.value,
                                                )
                                            }
                                            onBlur={field.handleBlur}
                                            placeholder={CONFIRMATION_TEXT}
                                            disabled={form.state.isSubmitting}
                                            aria-invalid={
                                                field.state.meta.errors.length >
                                                0
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

                            <AlertDialogFooter>
                                <AlertDialogCancel
                                    type="button"
                                    disabled={form.state.isSubmitting}
                                >
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    type="submit"
                                    disabled={
                                        !isConfirmationValid ||
                                        form.state.isSubmitting
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {form.state.isSubmitting ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : null}
                                    Delete Account
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </form>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
