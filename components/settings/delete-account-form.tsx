"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
    AlertDialog,
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

const CONFIRMATION_TEXT = "DELETE MY ACCOUNT";

export function DeleteAccountForm() {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isConfirmationValid = confirmationText === CONFIRMATION_TEXT;

    async function handleDelete() {
        if (!isConfirmationValid) {
            toast.error("Please type the confirmation text exactly");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await authClient.deleteUser({});

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
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleDialogClose(open: boolean) {
        if (!open) {
            setConfirmationText("");
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

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="confirmationText">
                                    Type{" "}
                                    <span className="font-mono font-semibold text-destructive">
                                        {CONFIRMATION_TEXT}
                                    </span>{" "}
                                    to confirm
                                </Label>
                                <Input
                                    id="confirmationText"
                                    type="text"
                                    value={confirmationText}
                                    onChange={(e) =>
                                        setConfirmationText(e.target.value)
                                    }
                                    placeholder={CONFIRMATION_TEXT}
                                    disabled={isSubmitting}
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel
                                type="button"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={!isConfirmationValid || isSubmitting}
                                onClick={handleDelete}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : null}
                                Delete Account
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
