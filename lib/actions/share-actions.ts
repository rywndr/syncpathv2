"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { project } from "@/lib/db/schema";
import { getSession } from "@/lib/auth-server";

export async function updateProjectSharing(
    projectId: string,
    isShared: boolean,
    sharePermission: "view" | "edit" = "view",
) {
    const session = await getSession();

    if (!session) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const existingProject = await db
        .select()
        .from(project)
        .where(eq(project.id, projectId))
        .limit(1);

    if (!existingProject[0]) {
        throw new Error("Project not found");
    }

    if (existingProject[0].userId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    await db
        .update(project)
        .set({
            isShared,
            sharePermission,
            updatedAt: new Date(),
        })
        .where(eq(project.id, projectId));

    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/projects");
}
