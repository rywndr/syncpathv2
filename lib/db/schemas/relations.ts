import { relations } from "drizzle-orm";
import { user, session, account } from "./auth-schema";
import { project, task } from "./project-schema";

// User relations (combines auth and project relations)
export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    projects: many(project),
}));

// Session relations
export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

// Account relations
export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

// Project relations
export const projectRelations = relations(project, ({ one, many }) => ({
    user: one(user, {
        fields: [project.userId],
        references: [user.id],
    }),
    tasks: many(task),
}));

// Task relations
export const taskRelations = relations(task, ({ one, many }) => ({
    project: one(project, {
        fields: [task.projectId],
        references: [project.id],
    }),
    parent: one(task, {
        fields: [task.parentId],
        references: [task.id],
        relationName: "taskHierarchy",
    }),
    children: many(task, {
        relationName: "taskHierarchy",
    }),
}));
