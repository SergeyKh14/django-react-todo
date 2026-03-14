import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { invitationService } from "@/services/invitationService";
import type { BoardInvitation, BoardMemberRole } from "@/types/board";

interface UseBoardInvitationsArgs {
  boardId?: string;
  enabled?: boolean;
}

export function useBoardInvitations({
  boardId,
  enabled = true,
}: UseBoardInvitationsArgs) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: boardId
      ? queryKeys.boards.boardInvitations(boardId)
      : ["boards", "detail", "unknown", "invitations"],
    queryFn: () => invitationService.getBoardInvitations(boardId!),
    enabled: !!boardId && enabled,
  });

  const createInvitation = useMutation({
    mutationFn: (payload: { email: string; role: BoardMemberRole }) =>
      invitationService.createInvitation(boardId!, payload),
    onSuccess: () => {
      if (!boardId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.boards.boardInvitations(boardId),
      });
    },
  });

  return {
    invitations: (listQuery.data ?? []) as BoardInvitation[],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    createInvitation,
  };
}

export function useMyInvitations() {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: queryKeys.boards.myInvitations(),
    queryFn: () => invitationService.getMyInvitations(),
  });

  const respond = useMutation({
    mutationFn: ({
      boardId,
      invitationId,
      action,
    }: {
      boardId: string;
      invitationId: string;
      action: "accept" | "decline";
    }) => invitationService.respond(boardId, invitationId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boards.myInvitations(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.boards.lists(),
      });
    },
  });

  const data = listQuery.data;

  return {
    invitations: data?.results ?? [],
    count: data?.count ?? 0,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
    respond,
  };
}
