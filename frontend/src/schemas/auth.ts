import { z } from "zod";

/** Password rules for registration: min 8 chars, uppercase, lowercase, number, special char. */
export const PASSWORD_REQUIREMENTS = [
  { id: "minLength", label: "At least 8 characters", test: (s: string) => s.length >= 8 },
  { id: "uppercase", label: "One uppercase letter", test: (s: string) => /[A-Z]/.test(s) },
  { id: "lowercase", label: "One lowercase letter", test: (s: string) => /[a-z]/.test(s) },
  { id: "number", label: "One number", test: (s: string) => /[0-9]/.test(s) },
  { id: "special", label: "One special character", test: (s: string) => /[^a-zA-Z0-9]/.test(s) },
] as const;

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "One uppercase letter")
  .regex(/[a-z]/, "One lowercase letter")
  .regex(/[0-9]/, "One number")
  .regex(/[^a-zA-Z0-9]/, "One special character");

export const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
