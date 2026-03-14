import { z } from "zod";

import { TaskPriority, TaskStatus } from "@/types/task";

const taskStatusEnum = z.enum([
  TaskStatus.Todo,
  TaskStatus.InProgress,
  TaskStatus.Done,
]);
const taskPriorityEnum = z.enum([
  TaskPriority.Low,
  TaskPriority.Medium,
  TaskPriority.High,
]);

export const taskCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .transform((s) => s.trim()),
  description: z
    .string()
    .optional()
    .transform((s) => s?.trim() || undefined),
  status: taskStatusEnum,
  priority: taskPriorityEnum,
  due_date: z
    .string()
    .optional()
    .transform((s) => s?.trim() || undefined),
  assigned_to: z
    .string()
    .optional()
    .transform((s) => s?.trim() || undefined),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
