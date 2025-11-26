"use server";

import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { project } from "@/lib/db/schema";
import { getSession } from "@/lib/auth-server";

function generateId() {
    return crypto.randomUUID();
}

export async function createProject(name: string) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const trimmedName = name.trim();

        if (!trimmedName) {
            return { success: false, error: "Project name is required" };
        }

        if (trimmedName.length < 3) {
            return {
                success: false,
                error: "Project name must be at least 3 characters",
            };
        }

        if (trimmedName.length > 100) {
            return {
                success: false,
                error: "Project name must be less than 100 characters",
            };
        }

        const newProject = await db
            .insert(project)
            .values({
                id: generateId(),
                name: trimmedName,
                userId: session.user.id,
            })
            .returning();

        revalidateTag("projects", "max");
        revalidateTag(`projects-${session.user.id}`, "max");

        return { success: true, project: newProject[0] };
    } catch (error) {
        console.error("Failed to create project:", error);
        return { success: false, error: "Failed to create project" };
    }
}

export async function updateProject(projectId: string, name: string) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const trimmedName = name.trim();

        if (!trimmedName) {
            return { success: false, error: "Project name is required" };
        }

        if (trimmedName.length < 3) {
            return {
                success: false,
                error: "Project name must be at least 3 characters",
            };
        }

        if (trimmedName.length > 100) {
            return {
                success: false,
                error: "Project name must be less than 100 characters",
            };
        }

        // Verify ownership
        const existingProject = await db
            .select()
            .from(project)
            .where(eq(project.id, projectId))
            .limit(1);

        if (!existingProject[0]) {
            return { success: false, error: "Project not found" };
        }

        if (existingProject[0].userId !== session.user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const updatedProject = await db
            .update(project)
            .set({
                name: trimmedName,
                updatedAt: new Date(),
            })
            .where(eq(project.id, projectId))
            .returning();

        revalidateTag("projects", "max");
        revalidateTag(`projects-${session.user.id}`, "max");
        revalidateTag(`project-${projectId}`, "max");

        return { success: true, project: updatedProject[0] };
    } catch (error) {
        console.error("Failed to update project:", error);
        return { success: false, error: "Failed to update project" };
    }
}

export async function deleteProject(projectId: string) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify ownership
        const existingProject = await db
            .select()
            .from(project)
            .where(eq(project.id, projectId))
            .limit(1);

        if (!existingProject[0]) {
            return { success: false, error: "Project not found" };
        }

        if (existingProject[0].userId !== session.user.id) {
            return { success: false, error: "Unauthorized" };
        }

        await db.delete(project).where(eq(project.id, projectId));

        revalidateTag("projects", "max");
        revalidateTag(`projects-${session.user.id}`, "max");

        return { success: true };
    } catch (error) {
        console.error("Failed to delete project:", error);
        return { success: false, error: "Failed to delete project" };
    }
}
