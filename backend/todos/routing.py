"""
WebSocket URL routing for the todos app.

Mount under ws/ in core.routing (e.g. ws/boards/<board_id>/).
"""

from django.urls import path

from .consumers import BoardTaskConsumer

websocket_urlpatterns = [
    # channels' ASGI application signature does not match Django's HttpRequest-based
    # view type hints, so we ignore the type error here.
    path(
        "boards/<uuid:board_id>/",
        BoardTaskConsumer.as_asgi(),  # type: ignore[arg-type]
    ),
]
