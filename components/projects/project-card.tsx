"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    MoreVertical,
    Pencil,
    Trash2,
    ExternalLink,
    Calendar,
} from "lucide-react";
import { toast } from "sonner";

import { Project } from "@/lib/db/schema";
import { updateProject, deleteProject } from "@/lib/actions/project-actions";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(project.name);

    const handleUpdate = async () => {
        if (name.trim() === project.name) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        try {
            const result = await updateProject(project.id, name);
            if (result.success) {
                toast.success("Project updated successfully");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update project");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const result = await deleteProject(project.id);
            if (result.success) {
                toast.success("Project deleted successfully");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete project");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
            setIsDeleteOpen(false);
        }
    };

    return (
        <>
            <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex-1 space-y-1">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isLoading}
                                    className="h-8"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleUpdate();
                                        if (e.key === "Escape") {
                                            setIsEditing(false);
                                            setName(project.name);
                                        }
                                    }}
                                />
                                <Button
                                    size="sm"
                                    onClick={handleUpdate}
                                    disabled={isLoading}
                                >
                                    Save
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setName(project.name);
                                    }}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <CardTitle className="line-clamp-1 text-base">
                                <Link
                                    href={`/projects/${project.id}`}
                                    className="hover:underline focus:outline-none"
                                >
                                    {project.name}
                                </Link>
                            </CardTitle>
                        )}
                        <CardDescription className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            Created{" "}
                            {format(new Date(project.createdAt), "MMM d, yyyy")}
                        </CardDescription>
                    </div>
                    {!isEditing && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="-mr-2 h-8 w-8 text-muted-foreground"
                                >
                                    <MoreVertical className="size-4" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Pencil className="mr-2 size-4" />
                                    Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setIsDeleteOpen(true)}
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </CardHeader>
                <CardContent>
                    {/* Placeholder other things l8r */}
                    <div className="h-2 w-full rounded-full bg-muted/20" />
                </CardContent>
                <CardFooter>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                    >
                        <Link href={`/projects/${project.id}`}>
                            Open Project
                            <ExternalLink className="ml-2 size-3" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the project <strong>{project.name}</strong>{" "}
                            and all of its tasks.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={isLoading}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isLoading ? "Deleting..." : "Delete Project"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
