"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateProjectSharing } from "@/lib/actions/share-actions";

interface ShareDialogProps {
    projectId: string;
    initialIsShared: boolean;
    initialPermission: "view" | "edit";
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ShareDialog({
    projectId,
    initialIsShared,
    initialPermission,
    open,
    onOpenChange,
}: ShareDialogProps) {
    const [isShared, setIsShared] = useState(initialIsShared);
    const [permission, setPermission] = useState<"view" | "edit">(
        initialPermission,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setIsShared(initialIsShared);
            setPermission(initialPermission);
        }
    }, [open, initialIsShared, initialPermission]);

    const handleShareToggle = async (checked: boolean) => {
        setIsShared(checked);
        setIsLoading(true);
        try {
            await updateProjectSharing(projectId, checked, permission);
            toast.success(
                checked ? "Project is now public" : "Project is now private",
            );
        } catch {
            toast.error("Failed to update sharing settings");
            setIsShared(!checked); // Revert on error
        } finally {
            setIsLoading(false);
        }
    };

    const handlePermissionChange = async (value: "view" | "edit") => {
        setPermission(value);
        if (isShared) {
            setIsLoading(true);
            try {
                await updateProjectSharing(projectId, isShared, value);
                toast.success("Permissions updated");
            } catch {
                toast.error("Failed to update permissions");
                setPermission(permission); // Revert on error
            } finally {
                setIsLoading(false);
            }
        }
    };

    const copyLink = () => {
        const url = `${window.location.origin}/projects/${projectId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Link copied to clipboard");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Project</DialogTitle>
                    <DialogDescription>
                        Share your project with others via a public link.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-col space-y-1">
                            <Label
                                htmlFor="share-toggle"
                                className="font-medium"
                            >
                                Public Access
                            </Label>
                            <span className="text-xs text-muted-foreground">
                                {isShared
                                    ? "Anyone with the link can access"
                                    : "Only you can access"}
                            </span>
                        </div>
                        <Switch
                            id="share-toggle"
                            checked={isShared}
                            onCheckedChange={handleShareToggle}
                            disabled={isLoading}
                        />
                    </div>

                    {isShared && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center space-x-2">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="link" className="sr-only">
                                        Link
                                    </Label>
                                    <Input
                                        id="link"
                                        defaultValue={`${
                                            typeof window !== "undefined"
                                                ? window.location.origin
                                                : ""
                                        }/projects/${projectId}`}
                                        readOnly
                                        className="h-9"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="px-3"
                                    onClick={copyLink}
                                >
                                    <span className="sr-only">Copy</span>
                                    {copied ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    {permission === "view" ? (
                                        <Globe className="h-4 w-4" />
                                    ) : (
                                        <Lock className="h-4 w-4" />
                                    )}
                                    <span>Visitor permissions</span>
                                </div>
                                <Select
                                    value={permission}
                                    onValueChange={(val) =>
                                        handlePermissionChange(
                                            val as "view" | "edit",
                                        )
                                    }
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-[110px] h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="view">
                                            Can view
                                        </SelectItem>
                                        <SelectItem value="edit">
                                            Can edit
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
