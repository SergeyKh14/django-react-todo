"""
Board invitation access permissions.
"""

from django.http import Http404
from rest_framework import permissions

from ..models import BoardMembership


class IsBoardInvitationParticipant(permissions.BasePermission):
    """
    For board invitations nested under api/boards/<id>/invitations/:
    - list / create: board owner or accepted admin only.
    - retrieve: board owner, accepted admin, or the invitee (membership.user).
    - accept / decline: only the invitee (membership.user).
    """

    def has_permission(self, request, view):
        # IsAuthenticated is enforced globally; user is authenticated here.
        action = getattr(view, "action", None)
        if action in ("list", "create"):
            try:
                board = view.get_board()  # type: ignore[union-attr]
            except Http404:
                return False
            if board.owner_id == request.user.pk:
                return True
            return any(
                m.user_id == request.user.pk
                and m.status == BoardMembership.Status.ACCEPTED
                and m.role == BoardMembership.Role.ADMIN
                for m in board.memberships.all()
            )
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        action = getattr(view, "action", None)
        if action == "respond":
            return obj.user_id == user.pk
        if action == "retrieve":
            if obj.user_id == user.pk:
                return True
            if obj.board.owner_id == user.pk:
                return True
            return any(
                m.user_id == user.pk
                and m.status == BoardMembership.Status.ACCEPTED
                and m.role == BoardMembership.Role.ADMIN
                for m in obj.board.memberships.all()
            )
        return False
