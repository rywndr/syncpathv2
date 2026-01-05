"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerFieldProps {
    label: string;
    value: Date | null | undefined;
    onChange: (date: Date | null) => void;
    isLoading?: boolean;
    className?: string;
}

export function DatePickerField({
    label,
    value,
    onChange,
    isLoading,
    className,
}: DatePickerFieldProps) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Label>{label}</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !value && "text-muted-foreground",
                        )}
                        disabled={isLoading}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? (
                            format(value, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value || undefined}
                        onSelect={(date) => onChange(date || null)}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
