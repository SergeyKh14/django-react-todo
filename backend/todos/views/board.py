"""
Board list/detail and tasks view set.
"""

from typing import cast

from django.db.models import QuerySet
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from todos.models import BoardMembership
from todos.permissions import IsBoardOwnerOrMember
from todos.serializers import BoardListSerializer, BoardSerializer, InvitationListSerializer, TaskSerializer
from todos.services import BoardService, InvitationService


class BoardPagination(PageNumberPagination):
    """Pagination for board list."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class BoardViewSet(viewsets.ModelViewSet):
    """
    list: boards the user owns or is an accepted member of.
    create: create a board (owner = request.user).
    retrieve / update / partial_update / destroy: by id; update/destroy only for owner.
    """

    permission_classes = [IsBoardOwnerOrMember]
    pagination_class = BoardPagination

    def get_queryset(self):
        return BoardService.get_boards_for_user(self.request.user)

    def get_serializer_class(self):
        if self.action == "list":
            return BoardListSerializer
        return BoardSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, url_path="invitations", methods=["get"])
    def invitations(self, request):
        """List current user's pending board invitations (invitations sent to me)."""
        qs = cast(
            QuerySet[BoardMembership, BoardMembership],
            InvitationService.get_pending_invitations_for_user(request.user),
        )
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = InvitationListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = InvitationListSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="tasks")
    def tasks(self, request, pk=None):
        """
        List all current tasks for this board.

        Permissions: same as board retrieve (owner or accepted member).
        """
        board = self.get_object()  # Triggers IsBoardOwnerOrMember object check.
        qs = board.tasks.select_related("created_by", "assigned_to").order_by("status", "order", "created_at")
        serializer = TaskSerializer(qs, many=True)
        return Response(serializer.data)
