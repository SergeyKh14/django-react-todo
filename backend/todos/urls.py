from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"", views.BoardViewSet, basename="board")

urlpatterns = [
    path(
        "task-summary/",
        views.TaskSummaryView.as_view(),
        name="board-task-summary",
    ),
    path(
        "invitations/",
        views.BoardViewSet.as_view({"get": "invitations"}),
        name="board-my-invitations",
    ),
    path(
        "<uuid:board_pk>/invitations/",
        views.InvitationViewSet.as_view({"get": "list", "post": "create"}),
        name="board-invitations-list",
    ),
    path(
        "<uuid:board_pk>/invitations/<uuid:pk>/<str:action>/",
        views.InvitationViewSet.as_view({"post": "respond"}),
        name="board-invitation-respond",
    ),
    path(
        "<uuid:board_pk>/invitations/<uuid:pk>/",
        views.InvitationViewSet.as_view({"get": "retrieve"}),
        name="board-invitation-detail",
    ),
    path("", include(router.urls)),
]
