"""
ASGI config for core project.

Routes HTTP to Django and WebSocket to Channels. The ASGI callable is
exposed as ``application``.
"""

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from core.middleware import JWTWebsocketAuthMiddleware
from core.routing import websocket_urlpatterns

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

# Django ASGI application for HTTP
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": JWTWebsocketAuthMiddleware(URLRouter(websocket_urlpatterns)),
    }
)
