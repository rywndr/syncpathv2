"use client";

import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, RefreshCw, LogOut } from "lucide-react";
import { SessionItem } from "./session-item";
import { Skeleton } from "@/components/ui/skeleton";

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

export function SessionList({ currentSessionToken }: { currentSessionToken?: string }) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRevokingAll, setIsRevokingAll] = useState(false);

    const fetchSessions = useCallback(async () => {
        setIsLoading(true);

        try {
            const { data, error } = await authClient.listSessions();

            if (error) {
                toast.error(error.message || "Failed to load sessions");
                return;
            }

            if (data) {
                setSessions(data as Session[]);
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    async function handleRevokeOtherSessions() {
        setIsRevokingAll(true);

        try {
            const { error } = await authClient.revokeOtherSessions();

            if (error) {
                toast.error(error.message || "Failed to revoke sessions");
                return;
            }

            toast.success("All other sessions have been revoked");
            fetchSessions();
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsRevokingAll(false);
        }
    }

    const otherSessionsCount = sessions.filter(
        (s) => s.token !== currentSessionToken
    ).length;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle>Active Sessions</CardTitle>
                        <CardDescription>
                            Manage your active sessions across all devices. You
                            can revoke access to any session you no longer
                            recognize.
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchSessions}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`size-4 ${isLoading ? "animate-spin" : ""}`}
                        />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <SessionListSkeleton />
                ) : sessions.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">
                        No active sessions found
                    </p>
                ) : (
                    <>
                        <div className="space-y-3">
                            {sessions.map((session) => (
                                <SessionItem
                                    key={session.id}
                                    session={session}
                                    isCurrentSession={
                                        session.token === currentSessionToken
                                    }
                                    onRevoked={fetchSessions}
                                />
                            ))}
                        </div>

                        {otherSessionsCount > 0 && (
                            <div className="border-t pt-4">
                                <Button
                                    variant="destructive"
                                    onClick={handleRevokeOtherSessions}
                                    disabled={isRevokingAll}
                                    className="w-full"
                                >
                                    {isRevokingAll ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <LogOut className="mr-2 size-4" />
                                    )}
                                    Revoke All Other Sessions ({otherSessionsCount})
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function SessionListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                    <div className="flex items-start gap-4">
                        <Skeleton className="size-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                    <Skeleton className="h-8 w-16" />
                </div>
            ))}
        </div>
    );
}
