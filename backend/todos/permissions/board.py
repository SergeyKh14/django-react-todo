"""
Board access permissions.
"""

from rest_framework import permissions

from ..models import BoardMembership


class IsBoardOwnerOrMember(permissions.BasePermission):
    """
    List/create: allowed (IsAuthenticated already enforced globally).
    Retrieve: allow if user is board owner or accepted member.
    Update/partial_update: allow if user is board owner or accepted admin member.
    Destroy: allow only if user is board owner.
    """

    def _is_accepted_member(self, board, user):
        """Use prefetched memberships when available (e.g. on retrieve), else one query."""
        return any(
            m.user_id == user.pk and m.status == BoardMembership.Status.ACCEPTED for m in board.memberships.all()
        )

    def _is_accepted_admin(self, board, user):
        """Use prefetched memberships when available (e.g. on retrieve), else one query."""
        return any(
            m.user_id == user.pk
            and m.status == BoardMembership.Status.ACCEPTED
            and m.role == BoardMembership.Role.ADMIN
            for m in board.memberships.all()
        )

    def has_object_permission(self, request, view, obj):
        action = getattr(view, "action", None)
        user = request.user

        if action == "destroy":
            return obj.owner_id == user.pk

        if action in ("update", "partial_update"):
            if obj.owner_id == user.pk:
                return True
            return self._is_accepted_admin(obj, user)

        if action == "retrieve":
            if obj.owner_id == user.pk:
                return True
            return self._is_accepted_member(obj, user)

        if obj.owner_id == user.pk:
            return True
        return self._is_accepted_member(obj, user)
