"""
WebSocket URL routing for the core project.

HTTP stays with Django; WebSocket is routed by path prefix (e.g. ws/ -> todos).
"""

from channels.routing import URLRouter
from django.urls import path

from todos.routing import websocket_urlpatterns as todos_ws

websocket_urlpatterns = [
    path("ws/", URLRouter(todos_ws)),
]
