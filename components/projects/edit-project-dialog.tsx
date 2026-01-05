"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Project } from "@/lib/db/schemas/project-schema";
import { updateProject } from "@/lib/actions/project-actions";
import { ProjectForm } from "@/components/projects/project-form";

interface EditProjectDialogProps {
    project: Project;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({
    project,
    open,
    onOpenChange,
}: EditProjectDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (values: {
        name: string;
        startDate?: Date | null;
        endDate?: Date | null;
    }) => {
        setIsLoading(true);
        try {
            const result = await updateProject(project.id, values);

            if (result.success) {
                toast.success("Project updated successfully!");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update project");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                    <DialogDescription>
                        Update the details for your project.
                    </DialogDescription>
                </DialogHeader>
                <ProjectForm
                    defaultValues={{
                        name: project.name,
                        startDate: project.startDate,
                        endDate: project.endDate,
                    }}
                    onSubmit={handleSubmit}
                    onCancel={() => onOpenChange(false)}
                    isLoading={isLoading}
                    submitLabel="Save Changes"
                />
            </DialogContent>
        </Dialog>
    );
}
