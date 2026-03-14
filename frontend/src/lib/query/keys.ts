/**
 * Centralized query keys for React Query.
 * Use for invalidations and consistent cache keys.
 */
export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  boards: {
    all: ["boards"] as const,
    lists: () => [...queryKeys.boards.all, "list"] as const,
    list: (params?: { page?: number; page_size?: number }) =>
      [...queryKeys.boards.lists(), params] as const,
    details: () => [...queryKeys.boards.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.boards.details(), id] as const,
    myInvitations: (params?: { page?: number; page_size?: number }) =>
      [...queryKeys.boards.all, "invitations", params] as const,
    boardInvitations: (boardId: string) =>
      [...queryKeys.boards.all, "detail", boardId, "invitations"] as const,
  },
  tasks: {
    byBoard: (boardId: string) => ["tasks", "board", boardId] as const,
    summary: () => ["tasks", "summary"] as const,
  },
} as const;
