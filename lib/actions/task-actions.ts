"use server";

import { revalidateTag } from "next/cache";
import { eq, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { task, Task, NewTask } from "@/lib/db/schema";
import { getSession } from "@/lib/auth-server";

export async function getTasks(projectId: string) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const tasks = await db
            .select()
            .from(task)
            .where(eq(task.projectId, projectId));

        return { success: true, tasks };
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
        return { success: false, error: "Failed to fetch tasks" };
    }
}

export async function batchUpdateTasks(
    projectId: string,
    updates: Partial<Task>[],
) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        // Process updates in a transaction
        await db.transaction(async (tx) => {
            for (const update of updates) {
                if (!update.id) continue;

                // Destructure to separate id and other fields
                // We exclude projectId to prevent moving tasks between projects via this action
                const { id, projectId: _, ...valuesToUpdate } = update;
                void _; // Suppress unused variable warning

                if (Object.keys(valuesToUpdate).length === 0) continue;

                await tx
                    .update(task)
                    .set({
                        ...valuesToUpdate,
                        updatedAt: new Date(),
                    })
                    .where(and(eq(task.id, id), eq(task.projectId, projectId)));
            }
        });

        revalidateTag(`project-${projectId}-tasks`, "max");

        return { success: true };
    } catch (error) {
        console.error("Failed to batch update tasks:", error);
        return { success: false, error: "Failed to update tasks" };
    }
}

export async function createTask(projectId: string, data: Partial<NewTask>) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        // Ensure we don't allow overriding projectId or id via spread
        const { id: _, projectId: __, ...taskData } = data;
        void _; // Suppress unused variable warning
        void __; // Suppress unused variable warning

        const newTask = await db
            .insert(task)
            .values({
                id: data.id || crypto.randomUUID(),
                projectId,
                name: data.name || "New Task",
                type: data.type || "task",
                status: data.status || "pending",
                startDate: data.startDate || new Date(),
                endDate: data.endDate || new Date(),
                percentage: data.percentage || 0,
                ...taskData,
            })
            .returning();

        revalidateTag(`project-${projectId}-tasks`, "max");
        return { success: true, task: newTask[0] };
    } catch (error) {
        console.error("Failed to create task:", error);
        return { success: false, error: "Failed to create task" };
    }
}

export async function deleteTask(taskId: string, projectId: string) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        await db
            .delete(task)
            .where(and(eq(task.id, taskId), eq(task.projectId, projectId)));

        revalidateTag(`project-${projectId}-tasks`, "max");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete task:", error);
        return { success: false, error: "Failed to delete task" };
    }
}
