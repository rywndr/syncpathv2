import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { task } from "@/lib/db/schema";
import { getSession } from "@/lib/auth-server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> },
) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { projectId } = await params;

        if (!projectId) {
            return NextResponse.json(
                { error: "Project ID is required" },
                { status: 400 },
            );
        }

        const tasks = await db
            .select()
            .from(task)
            .where(eq(task.projectId, projectId));

        return NextResponse.json(tasks, {
            headers: {
                "Cache-Control": "no-store, max-age=0",
            },
        });
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
