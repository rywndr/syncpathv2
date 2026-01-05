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
    Share2,
    Copy,
    User,
} from "lucide-react";
import { toast } from "sonner";

import { Project } from "@/lib/db/schemas/project-schema";
import { deleteProject } from "@/lib/actions/project-actions";

import { ShareDialog } from "@/components/workspace/share-dialog";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
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
    DropdownMenuSeparator,
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

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const router = useRouter();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCopyLink = () => {
        const url = `${window.location.origin}/projects/${project.id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
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
                        <CardTitle className="line-clamp-1 text-base">
                            <Link
                                href={`/projects/${project.id}`}
                                className="hover:underline focus:outline-none"
                            >
                                {project.name}
                            </Link>
                        </CardTitle>
                        <CardDescription className="flex flex-col gap-1">
                            <span className="flex items-center gap-1">
                                <Calendar className="size-3" />
                                Created{" "}
                                {format(
                                    new Date(project.createdAt),
                                    "MMM d, yyyy",
                                )}
                            </span>
                            {project.owner && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <User className="size-3" />
                                    Owner: {project.owner}
                                </span>
                            )}
                        </CardDescription>
                    </div>
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
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/projects/${project.id}`}
                                    target="_blank"
                                    className="cursor-pointer"
                                >
                                    <ExternalLink className="mr-2 size-4" />
                                    Open in New Tab
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleCopyLink}>
                                <Copy className="mr-2 size-4" />
                                Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsShareOpen(true)}
                            >
                                <Share2 className="mr-2 size-4" />
                                Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setIsEditOpen(true)}
                            >
                                <Pencil className="mr-2 size-4" />
                                Edit
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
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="h-2 w-full rounded-full bg-muted/20" />

                        {(project.startDate || project.endDate) && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {project.startDate && (
                                    <span>
                                        Start:{" "}
                                        {format(
                                            new Date(project.startDate),
                                            "MMM d",
                                        )}
                                    </span>
                                )}
                                {project.startDate && project.endDate && (
                                    <span>-</span>
                                )}
                                {project.endDate && (
                                    <span>
                                        End:{" "}
                                        {format(
                                            new Date(project.endDate),
                                            "MMM d",
                                        )}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
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

            <ShareDialog
                projectId={project.id}
                initialIsShared={project.isShared}
                initialPermission={project.sharePermission || "view"}
                open={isShareOpen}
                onOpenChange={setIsShareOpen}
            />

            <EditProjectDialog
                project={project}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        </>
    );
}
