import { headers } from "next/headers";
import { redirect } from "next/navigation";
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

/**
 * Server-side auth guard for protected routes
 * Redirects to login page if user is not authenticated
 * @param redirectTo - The path to redirect to if not authenticated (default: "/login")
 * @returns The session object if authenticated
 */
export async function requireAuth(redirectTo: string = "/login") {
    const session = await getSession();

    if (!session) {
        redirect(redirectTo);
    }

    return session;
}
