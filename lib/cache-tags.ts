// Constants for consistent revalidation across app
export const CACHE_TAGS = {
    PROJECTS: "projects",
    PROJECT_COUNT: "project-count",
    PROJECT_LIST: "project-list",
    userProjects: (userId: string) => `user-projects-${userId}`,
    project: (projectId: string) => `project-${projectId}`,
} as const;
