import { useCallback, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";

import type { RootState } from "@/store";
import { queryKeys } from "@/lib/query/keys";
import { createBoardTasksSocket } from "@/lib/ws/boardTasksSocket";
import type { Task, TaskCreatePayload } from "@/types/task";

interface UseBoardTasksSocketOptions {
  boardId?: string;
}

/**
 * Opens a reconnecting WebSocket for a board and keeps React Query cache in sync.
 *
 * For now it expects messages shaped like:
 *   { type: "tasks.updated", tasks: Task[] }
 *
 * Backend will be wired to emit these events later.
 */
export function useBoardTasksSocket({ boardId }: UseBoardTasksSocketOptions) {
  const token = useSelector((state: RootState) => state.auth.token);
  const queryClient = useQueryClient();
  const socketRef = useRef<ReturnType<typeof createBoardTasksSocket> | null>(
    null,
  );

  const send = useCallback((payload: unknown) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
  }, []);

  useEffect(() => {
    if (!boardId || !token) return;

    const socket = createBoardTasksSocket(boardId, token);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as
          | {
              type: "tasks.updated";
              event?: "task_created" | "task_updated" | "task_deleted";
              task?: Task | { id: string };
            }
          | Record<string, unknown>;

        if (!data || data.type !== "tasks.updated") return;

        queryClient.setQueryData<Task[] | undefined>(
          queryKeys.tasks.byBoard(boardId),
          (prev) => {
            const current = prev ?? [];
            const evt = (data as { event?: string }).event as
              | "task_created"
              | "task_updated"
              | "task_deleted"
              | undefined;
            const task = (data as { task?: Task | { id: string } }).task;

            if (!evt || !task) {
              return current;
            }

            if (evt === "task_created") {
              return [...current, task as Task];
            }

            if (evt === "task_updated") {
              return current.map((t) =>
                t.id === (task as Task).id ? (task as Task) : t,
              );
            }

            if (evt === "task_deleted") {
              return current.filter((t) => t.id !== task.id);
            }

            return current;
          },
        );
      } catch {
        // Ignore malformed messages for now
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [boardId, token, queryClient]);

  const sendTaskUpdate = useCallback(
    (payload: {
      id: string;
      patch: Partial<Pick<Task, "status" | "order">>;
    }) => {
      send({
        action: "task.update",
        id: payload.id,
        patch: payload.patch,
      });
    },
    [send],
  );

  const createTask = useCallback(
    (data: TaskCreatePayload) => {
      send({
        action: "task.create",
        data,
      });
    },
    [send],
  );

  const deleteTask = useCallback(
    (id: string) => {
      send({
        action: "task.delete",
        id,
      });
    },
    [send],
  );

  return { sendTaskUpdate, createTask, deleteTask };
}
