import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Get current session on the server side
 */
export async function getSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    return session;
}

/**
 * Get current user from session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
    const session = await getSession();
    return session?.user ?? null;
}

/**
 * Check if current user is authenticated
 */
export async function isAuthenticated() {
    const session = await getSession();
    return !!session;
}
