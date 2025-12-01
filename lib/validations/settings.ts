import { z } from "zod";

/**
 * Name validation schema
 */
export const nameSchema = z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters");

/**
 * Password validation schema
 */
export const passwordSchema = z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters");

/**
 * Update profile form schema
 */
export const updateProfileSchema = z.object({
    name: nameSchema,
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

/**
 * Change password form schema
 */
export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: passwordSchema,
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"],
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

/**
 * Delete account confirmation schema
 */
export const deleteAccountSchema = z.object({
    password: z.string().optional(),
    confirmationText: z.string().refine((val) => val === "DELETE MY ACCOUNT", {
        message: "Please type the confirmation text exactly",
    }),
});

export type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

/**
 * Helper function to validate a single field
 */
export function validateField<T>(
    schema: z.ZodType<T>,
    value: unknown,
): string | undefined {
    const result = schema.safeParse(value);
    if (!result.success) {
        // Zod 4 uses `issues` instead of `errors`
        return result.error.issues[0]?.message;
    }
    return undefined;
}
