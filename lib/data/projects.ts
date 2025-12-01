import { cacheLife, cacheTag } from "next/cache";
import { eq, count, desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { project } from "@/lib/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";

/**
 * Get project count for a user
 */
export async function getProjectCount(userId: string) {
    "use cache";
    cacheLife("hours");
    cacheTag(CACHE_TAGS.PROJECT_COUNT, CACHE_TAGS.userProjects(userId));

    const result = await db
        .select({ count: count() })
        .from(project)
        .where(eq(project.userId, userId));

    return result[0]?.count ?? 0;
}

/**
 * Get all projects for a user
 */
export async function getProjects(userId: string) {
    "use cache";
    cacheLife("hours");
    cacheTag(CACHE_TAGS.PROJECT_LIST, CACHE_TAGS.userProjects(userId));

    const projects = await db
        .select()
        .from(project)
        .where(eq(project.userId, userId))
        .orderBy(desc(project.updatedAt));

    return projects;
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string) {
    "use cache";
    cacheLife("hours");
    cacheTag(CACHE_TAGS.project(projectId));

    const result = await db
        .select()
        .from(project)
        .where(eq(project.id, projectId))
        .limit(1);

    return result[0] ?? null;
}
