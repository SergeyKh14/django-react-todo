/** Task status; matches backend Task.Status. */
export const TaskStatus = {
  Todo: "todo",
  InProgress: "in_progress",
  Done: "done",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

/** Task priority; matches backend Task.Priority. */
export const TaskPriority = {
  Low: "low",
  Medium: "medium",
  High: "high",
} as const;

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

/** Column ids for the task board (same as TaskStatus). */
export const TASK_COLUMNS: readonly TaskStatus[] = [
  TaskStatus.Todo,
  TaskStatus.InProgress,
  TaskStatus.Done,
] as const;

/** Payload for creating a task (WebSocket / form). */
export interface TaskCreatePayload {
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  assigned_to?: string | null;
}

/** Task summary for the current user (GET /api/boards/task-summary/). */
export interface TaskSummary {
  completed: number;
  pending: number;
}

/** Task as used in the board (from API or local state). */
export interface Task {
  id: string;
  board_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  order: number;
  priority?: TaskPriority;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by_email?: string | null;
  assigned_to_email?: string | null;
}
