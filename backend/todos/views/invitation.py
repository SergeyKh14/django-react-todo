"""
Board invitation view set (nested under boards).
"""

from typing import cast

from django.db.models import QuerySet
from django.http import Http404
from rest_framework import status as http_status
from rest_framework import viewsets
from rest_framework.response import Response

from todos.models import Board, BoardMembership
from todos.permissions import IsBoardInvitationParticipant
from todos.serializers import CreateInvitationSerializer, InvitationListSerializer
from todos.services import InvitationService


class InvitationViewSet(viewsets.ModelViewSet):
    """
    Nested under api/boards/<board_pk>/invitations/:
    list: Pending invitations for this board (owner/admin only).
    create: Send invitation (owner/admin only; body: email, role).
    retrieve: Get one invitation (owner/admin or invitee).
    accept (POST .../<pk>/accept/): Accept (invitee only).
    decline (POST .../<pk>/decline/): Decline (invitee only).
    """

    permission_classes = [IsBoardInvitationParticipant]
    lookup_url_kwarg = "pk"
    lookup_value_regex = "[0-9a-f-]+"

    def get_board(self):
        """Board from URL board_pk; raises Http404 if not found. Cached on the view instance."""
        if not hasattr(self, "_board"):
            board_pk = self.kwargs.get("board_pk")
            if not board_pk:
                raise Http404("Board not found.")
            board = Board.objects.filter(pk=board_pk).prefetch_related("memberships").first()
            if not board:
                raise Http404("Board not found.")
            self._board = board  # pylint: disable=attribute-defined-outside-init
        return self._board

    def get_queryset(self) -> QuerySet[BoardMembership, BoardMembership]:
        board_pk = self.kwargs.get("board_pk")
        if not board_pk:
            return cast(
                QuerySet[BoardMembership, BoardMembership],
                BoardMembership.objects.none(),
            )
        return cast(
            QuerySet[BoardMembership, BoardMembership],
            InvitationService.get_invitations_for_board(board_pk, pending_only=(self.action == "list")),
        )

    def get_serializer_class(self):
        if self.action == "create":
            return CreateInvitationSerializer
        return InvitationListSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["board"] = self.get_board()
        return context

    def create(self, request, *args, **kwargs):
        """Create invitation and return it serialized with InvitationListSerializer."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        output_serializer = InvitationListSerializer(instance)
        return Response(
            output_serializer.data,
            status=http_status.HTTP_201_CREATED,
            headers=self.get_success_headers(output_serializer.data),
        )

    def respond(self, request, board_pk=None, pk=None, action=None):  # pylint: disable=unused-argument
        """
        Accept or decline the invitation via URL action segment.
        POST .../invitations/<id>/accept/ or .../invitations/<id>/decline/
        """
        membership = self.get_object()
        action_val = (action or "").lower()

        try:
            if action_val == "accept":
                InvitationService.accept_invitation(membership)
            elif action_val == "decline":
                InvitationService.decline_invitation(membership)
            else:
                return Response(
                    {"detail": "Invalid action. Use 'accept' or 'decline'."},
                    status=http_status.HTTP_400_BAD_REQUEST,
                )
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        return Response(status=http_status.HTTP_204_NO_CONTENT)
