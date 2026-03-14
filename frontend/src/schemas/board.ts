import { z } from "zod";

export const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required").transform((s) => s.trim()),
  description: z.string().default("").transform((s) => (s?.trim() ?? "")),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
