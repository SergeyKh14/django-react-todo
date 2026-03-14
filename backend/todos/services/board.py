"""
Board-related queries and business logic.
"""

from django.db.models import Prefetch, Q

from todos.models import Board, BoardMembership


def get_boards_for_user(user):
    """Boards the user owns or is an accepted member of, ordered by updated_at."""
    accepted_memberships = BoardMembership.objects.filter(
        status=BoardMembership.Status.ACCEPTED,
    ).select_related("user")

    return (
        Board.objects.filter(
            Q(owner=user)
            | Q(
                memberships__user=user,
                memberships__status=BoardMembership.Status.ACCEPTED,
            )
        )
        .select_related("owner")
        .prefetch_related(
            Prefetch("memberships", queryset=accepted_memberships, to_attr="_accepted_memberships"),
        )
        .distinct()
        .order_by("-updated_at")
    )


class BoardService:
    """Namespace for board-related service functions."""

    get_boards_for_user = get_boards_for_user
