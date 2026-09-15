import { z } from "zod";

/**
 * Auth schemas — NG-101
 * Reusable, validated before business logic per NG-006.
 */

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(50).optional(),
    email: z.string().trim().toLowerCase().email("Invalid email").max(254),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .max(128)
      .regex(/[A-Z]/, "Need 1 uppercase")
      .regex(/[0-9]/, "Need 1 number"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(1, "Required"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
