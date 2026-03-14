import { z } from "zod";

import { BoardMemberRole } from "@/types/board";

const roleEnum = z.enum([BoardMemberRole.Member, BoardMemberRole.Admin]);

export const inviteUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email")
    .transform((s) => s.trim().toLowerCase()),
  role: roleEnum,
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
