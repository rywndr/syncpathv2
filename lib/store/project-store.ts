import { create } from "zustand";

interface ProjectStore {
    refreshTrigger: number;
    refreshProjects: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
    refreshTrigger: 0,
    refreshProjects: () =>
        set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
