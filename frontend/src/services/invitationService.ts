import { api } from "./api";
import type {
  BoardInvitation,
  CreateInvitationPayload,
  MyInvitationsResponse,
} from "@/types/board";

export const invitationService = {
  /** List current user's pending invitations (paginated). GET /api/boards/invitations/ */
  getMyInvitations: async (params?: { page?: number; page_size?: number }) => {
    const { data } = await api.get<MyInvitationsResponse>(
      "/boards/invitations/",
      {
        params,
      },
    );
    return data;
  },

  /** List pending invitations for a board (owner/admin). GET /api/boards/:boardId/invitations/ */
  getBoardInvitations: async (boardId: string): Promise<BoardInvitation[]> => {
    const { data } = await api.get<BoardInvitation[] | MyInvitationsResponse>(
      `/boards/${boardId}/invitations/`,
    );
    return Array.isArray(data) ? data : data.results;
  },

  /** Send an invitation (owner/admin). POST /api/boards/:boardId/invitations/ */
  createInvitation: async (
    boardId: string,
    payload: CreateInvitationPayload,
  ): Promise<BoardInvitation> => {
    const { data } = await api.post<BoardInvitation>(
      `/boards/${boardId}/invitations/`,
      payload,
    );
    return data;
  },

  /** Accept or decline an invitation. POST .../invitations/:id/accept/ or .../decline/ */
  respond: async (
    boardId: string,
    invitationId: string,
    action: "accept" | "decline",
  ): Promise<void> => {
    await api.post(`/boards/${boardId}/invitations/${invitationId}/${action}/`);
  },
};
