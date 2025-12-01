"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Loader2,
    Monitor,
    Smartphone,
    Tablet,
    Globe,
    MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Session {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface SessionItemProps {
    session: Session;
    isCurrentSession: boolean;
    onRevoked: () => void;
}

/**
 * Parse user agent to extract device and browser information
 */
function parseUserAgent(userAgent: string | null | undefined) {
    if (!userAgent) {
        return { device: "Unknown Device", browser: "Unknown Browser" };
    }

    const ua = userAgent.toLowerCase();

    // Detect device type
    let device = "Desktop";
    if (ua.includes("mobile") || ua.includes("android")) {
        device = "Mobile";
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
        device = "Tablet";
    }

    // Detect browser
    let browser = "Unknown Browser";
    if (ua.includes("firefox")) {
        browser = "Firefox";
    } else if (ua.includes("edg")) {
        browser = "Edge";
    } else if (ua.includes("chrome")) {
        browser = "Chrome";
    } else if (ua.includes("safari")) {
        browser = "Safari";
    } else if (ua.includes("opera") || ua.includes("opr")) {
        browser = "Opera";
    }

    // Detect OS
    let os = "Unknown OS";
    if (ua.includes("windows")) {
        os = "Windows";
    } else if (ua.includes("mac")) {
        os = "macOS";
    } else if (ua.includes("linux")) {
        os = "Linux";
    } else if (ua.includes("android")) {
        os = "Android";
    } else if (ua.includes("iphone") || ua.includes("ipad")) {
        os = "iOS";
    }

    return { device, browser, os };
}

/**
 * Get device icon based on device type
 */
function DeviceIcon({ device }: { device: string }) {
    switch (device) {
        case "Mobile":
            return <Smartphone className="size-5" />;
        case "Tablet":
            return <Tablet className="size-5" />;
        default:
            return <Monitor className="size-5" />;
    }
}

/**
 * Format date to relative time or date string
 */
function formatDate(date: Date) {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    return new Date(date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function SessionItem({
    session,
    isCurrentSession,
    onRevoked,
}: SessionItemProps) {
    const [isRevoking, setIsRevoking] = useState(false);
    const { device, browser, os } = parseUserAgent(session.userAgent);

    async function handleRevoke() {
        setIsRevoking(true);

        try {
            const { error } = await authClient.revokeSession({
                token: session.token,
            });

            if (error) {
                toast.error(error.message || "Failed to revoke session");
                return;
            }

            toast.success("Session revoked successfully");
            onRevoked();
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsRevoking(false);
        }
    }

    return (
        <div
            className={cn(
                "flex items-center justify-between gap-4 rounded-lg border p-4",
                isCurrentSession && "border-primary/50 bg-primary/5"
            )}
        >
            <div className="flex items-start gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <DeviceIcon device={device} />
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">
                            {browser} on {os}
                        </span>
                        {isCurrentSession && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                                Current
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Monitor className="size-3" />
                            {device}
                        </span>

                        {session.ipAddress && (
                            <span className="flex items-center gap-1">
                                <Globe className="size-3" />
                                {session.ipAddress}
                            </span>
                        )}

                        <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {formatDate(session.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            {!isCurrentSession && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRevoke}
                    disabled={isRevoking}
                    className="shrink-0"
                >
                    {isRevoking ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : null}
                    Revoke
                </Button>
            )}
        </div>
    );
}
