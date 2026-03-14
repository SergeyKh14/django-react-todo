"""
Invitation (BoardMembership) creation and state changes.
"""

from typing import Callable

from django.contrib.auth import get_user_model

from todos.models import BoardMembership

User = get_user_model()


class InvitationServiceError(Exception):
    """Raised when invitation business rules are violated. Use for validation in serializers."""

    def __init__(self, message: str, field: str = "email"):
        self.message = message
        self.field = field
        super().__init__(message)


def get_pending_invitations_for_user(user):
    """Pending board invitations for the given user (invitations sent to them)."""
    return (
        BoardMembership.objects.filter(
            user=user,
            status=BoardMembership.Status.PENDING,
        )
        .select_related("board", "board__owner", "user")
        .order_by("-joined_at")
    )


def get_invitations_for_board(board_pk, pending_only=False):
    """Invitations (memberships) for a board. Optionally filter to pending only."""
    qs = (
        BoardMembership.objects.filter(board_id=board_pk)
        .select_related("board", "board__owner", "user")
        .prefetch_related("board__memberships")
        .order_by("-joined_at")
    )
    if pending_only:
        qs = qs.filter(status=BoardMembership.Status.PENDING)
    return qs


def send_invitation(board, email: str, role: str = BoardMembership.Role.MEMBER) -> BoardMembership:
    """
    Create a pending invitation for a user by email.
    Raises InvitationServiceError with field for validation errors.
    """
    email = (email or "").lower().strip()
    if not email:
        raise InvitationServiceError("Email is required.", field="email")

    try:
        invitee = User.objects.get(email__iexact=email)
    except User.DoesNotExist as exc:
        raise InvitationServiceError("No user found with this email address.", field="email") from exc

    if getattr(invitee, "pk", None) == board.owner_id:
        raise InvitationServiceError("Cannot invite the board owner.", field="email")

    if BoardMembership.objects.filter(board=board, user=invitee).exists():
        raise InvitationServiceError(
            "This user is already a member or has a pending invitation.",
            field="email",
        )

    return BoardMembership.objects.create(
        board=board,
        user=invitee,
        role=role or BoardMembership.Role.MEMBER,
        status=BoardMembership.Status.PENDING,
    )


def accept_invitation(membership: BoardMembership) -> None:
    """Accept a pending invitation. Raises ValueError if not pending."""
    if membership.status != BoardMembership.Status.PENDING:
        raise ValueError("Invitation is not pending.")
    membership.status = BoardMembership.Status.ACCEPTED
    membership.save(update_fields=["status"])


def decline_invitation(membership: BoardMembership) -> None:
    """Decline a pending invitation (delete membership). Raises ValueError if not pending."""
    if membership.status != BoardMembership.Status.PENDING:
        raise ValueError("Invitation is not pending.")
    membership.delete()


class InvitationService:
    """Namespace for invitation-related service functions. Use for consistent API with BoardService."""

    get_pending_invitations_for_user: Callable[..., object] = get_pending_invitations_for_user
    get_invitations_for_board: Callable[..., object] = get_invitations_for_board
    send_invitation: Callable[..., BoardMembership] = send_invitation
    accept_invitation: Callable[[BoardMembership], None] = accept_invitation
    decline_invitation: Callable[[BoardMembership], None] = decline_invitation
