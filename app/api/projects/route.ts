import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { project } from "@/lib/db/schema";
import { getSession } from "@/lib/auth-server";

export async function GET() {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const projects = await db
            .select()
            .from(project)
            .where(eq(project.userId, session.user.id))
            .orderBy(desc(project.updatedAt));

        return NextResponse.json(projects, {
            headers: {
                "Cache-Control": "no-store, max-age=0",
            },
        });
    } catch (error) {
        console.error("Failed to fetch projects:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
