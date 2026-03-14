/** Board membership role. */
export const BoardMemberRole = {
  Admin: "admin",
  Member: "member",
} as const;

export type BoardMemberRole =
  (typeof BoardMemberRole)[keyof typeof BoardMemberRole];

/** Member on a board (owner or accepted membership). From board detail API. */
export interface BoardMember {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "owner" | BoardMemberRole;
  joined_at: string;
}

/** Board as returned from API (list and detail). */
export interface Board {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  /** Present on detail response; used to show/hide edit/delete. */
  owner_id?: string;
  /** Present on detail; true if current user can list/create invitations (owner or admin). */
  can_manage_invitations?: boolean;
  /** Present on detail; owner first, then accepted members. */
  members?: BoardMember[];
}

/** Paginated list response from boards API. */
export interface BoardListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Board[];
}

/** Board invitation as returned from API (list my invitations / board invitations). */
export interface BoardInvitation {
  id: string;
  board_id: string;
  board_title: string;
  inviter_email: string;
  invitee_email: string;
  role: BoardMemberRole;
  status: string;
  invited_at: string;
}

/** Paginated response for GET /api/boards/invitations/ */
export interface MyInvitationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BoardInvitation[];
}

export interface CreateBoardPayload {
  title: string;
  description?: string;
}

/** Payload to send a board invitation. POST /api/boards/:id/invitations/ */
export interface CreateInvitationPayload {
  email: string;
  role: BoardMemberRole;
}

export interface UpdateBoardPayload {
  title?: string;
  description?: string;
}
