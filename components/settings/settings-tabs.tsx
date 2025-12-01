"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "./profile-form";
import { SecurityForm } from "./security-form";
import { SessionList } from "./session-list";
import { DeleteAccountForm } from "./delete-account-form";
import { User, Shield, Monitor, Trash2 } from "lucide-react";

interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
}

interface SettingsTabsProps {
    user: User;
    currentSessionToken?: string;
}

export function SettingsTabs({ user, currentSessionToken }: SettingsTabsProps) {
    return (
        <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile" className="gap-2">
                    <User className="size-4" />
                    <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                    <Shield className="size-4" />
                    <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="sessions" className="gap-2">
                    <Monitor className="size-4" />
                    <span className="hidden sm:inline">Sessions</span>
                </TabsTrigger>
                <TabsTrigger value="danger" className="gap-2">
                    <Trash2 className="size-4" />
                    <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
                <ProfileForm user={user} />
            </TabsContent>

            <TabsContent value="security" className="mt-6">
                <SecurityForm />
            </TabsContent>

            <TabsContent value="sessions" className="mt-6">
                <SessionList currentSessionToken={currentSessionToken} />
            </TabsContent>

            <TabsContent value="danger" className="mt-6">
                <DeleteAccountForm />
            </TabsContent>
        </Tabs>
    );
}
