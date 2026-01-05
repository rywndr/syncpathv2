"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerField } from "@/components/ui/date-picker-field";

interface ProjectFormValues {
    name: string;
    startDate?: Date | null;
    endDate?: Date | null;
}

interface ProjectFormProps {
    defaultValues?: Partial<ProjectFormValues>;
    onSubmit: (values: ProjectFormValues) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    submitLabel?: string;
}

export function ProjectForm({
    defaultValues,
    onSubmit,
    onCancel,
    isLoading,
    submitLabel = "Save",
}: ProjectFormProps) {
    const form = useForm({
        defaultValues: {
            name: defaultValues?.name || "",
            startDate: defaultValues?.startDate || null,
            endDate: defaultValues?.endDate || null,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value);
        },
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="space-y-4"
        >
            <form.Field
                name="name"
                validators={{
                    onChange: ({ value }) => {
                        if (!value.trim()) return "Name is required";
                        if (value.length < 3)
                            return "Name must be at least 3 characters";
                        if (value.length > 100)
                            return "Name must be less than 100 characters";
                        return undefined;
                    },
                }}
            >
                {(field) => (
                    <div className="grid gap-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            disabled={isLoading}
                            placeholder="Untitled Project"
                        />
                        {field.state.meta.errors.length > 0 && (
                            <p className="text-sm text-destructive">
                                {field.state.meta.errors.join(", ")}
                            </p>
                        )}
                    </div>
                )}
            </form.Field>

            <div className="grid grid-cols-2 gap-4">
                <form.Field name="startDate">
                    {(field) => (
                        <DatePickerField
                            label="Start Date"
                            value={field.state.value}
                            onChange={(date) => field.handleChange(date)}
                            isLoading={isLoading}
                        />
                    )}
                </form.Field>

                <form.Field name="endDate">
                    {(field) => (
                        <DatePickerField
                            label="End Date"
                            value={field.state.value}
                            onChange={(date) => field.handleChange(date)}
                            isLoading={isLoading}
                        />
                    )}
                </form.Field>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                        <svg
                            className="mr-2 size-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    )}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
