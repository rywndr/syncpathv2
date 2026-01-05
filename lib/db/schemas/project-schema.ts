import {
    pgTable,
    text,
    timestamp,
    integer,
    jsonb,
    index,
    pgEnum,
    boolean,
} from "drizzle-orm/pg-core";

// Enums
export const taskTypeEnum = pgEnum("task_type", ["task", "group", "milestone"]);
export const taskStatusEnum = pgEnum("task_status", [
    "pending",
    "in-progress",
    "completed",
    "blocked",
]);
export const dependencyTypeEnum = pgEnum("dependency_type", [
    "FS", // Finish-Start
    "FF", // Finish-Finish
    "SS", // Start-Start
    "SF", // Start-Finish
]);
export const sharePermissionEnum = pgEnum("share_permission", ["view", "edit"]);

// Types for the dependency JSON structure
export type TaskDependency = {
    taskId: string;
    type: "FS" | "FF" | "SS" | "SF";
};

// Project table
export const project = pgTable(
    "project",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        userId: text("user_id").notNull(),
        owner: text("owner"),
        startDate: timestamp("start_date"),
        endDate: timestamp("end_date"),
        isShared: boolean("is_shared").default(false).notNull(),
        sharePermission:
            sharePermissionEnum("share_permission").default("view"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("project_userId_idx").on(table.userId),
        index("project_createdAt_idx").on(table.createdAt),
        index("project_isShared_idx").on(table.isShared),
    ],
);

// Task table
export const task = pgTable(
    "task",
    {
        id: text("id").primaryKey(),
        projectId: text("project_id")
            .notNull()
            .references(() => project.id, { onDelete: "cascade" }),
        parentId: text("parent_id"), // Self-referencing for task nesting
        type: taskTypeEnum("type").notNull().default("task"),
        name: text("name").notNull(),
        startDate: timestamp("start_date"),
        endDate: timestamp("end_date"),
        duration: integer("duration"), // Duration in days, auto-calculated from start/end
        assignee: text("assignee"), // Could be a user reference (a maybe) or just a name
        percentage: integer("percentage").default(0).notNull(), // 0-100
        status: taskStatusEnum("status").notNull().default("pending"),
        cost: integer("cost").default(0), // Cost in Rupiah (stored as integer)
        dependencies: jsonb("dependencies")
            .$type<TaskDependency[]>()
            .default([]),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("task_projectId_idx").on(table.projectId),
        index("task_parentId_idx").on(table.parentId),
        index("task_status_idx").on(table.status),
        index("task_type_idx").on(table.type),
    ],
);

// Type exports for use in application code
export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;
export type Task = typeof task.$inferSelect;
export type NewTask = typeof task.$inferInsert;
