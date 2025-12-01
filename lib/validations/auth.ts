import { z } from "zod";

/**
 * Email validation schema
 */
export const emailSchema = z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address");

/**
 * Password validation schema for login
 */
export const passwordSchema = z.string().min(1, "Password is required");

/**
 * Password validation schema for registration
 */
export const newPasswordSchema = z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters");

/**
 * Name validation schema
 */
export const nameSchema = z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters");

/**
 * Login form schema
 */
export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Sign up form schema
 */
export const signUpSchema = z
    .object({
        name: nameSchema,
        email: emailSchema,
        password: newPasswordSchema,
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

/**
 * Helper function to validate a single field with a Zod schema
 */
export function validateField<T>(
    schema: z.ZodType<T>,
    value: unknown,
): string | undefined {
    const result = schema.safeParse(value);
    if (!result.success) {
        return result.error.issues[0]?.message;
    }
    return undefined;
}
