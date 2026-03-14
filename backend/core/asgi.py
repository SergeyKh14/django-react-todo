"""
ASGI config for core project.

Routes HTTP to Django and WebSocket to Channels. The ASGI callable is
exposed as ``application``.
"""

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
from django.core.asgi import get_asgi_application  # noqa: E402

from core.middleware import JWTWebsocketAuthMiddleware  # noqa: E402
from core.routing import websocket_urlpatterns  # noqa: E402

# Django ASGI application for HTTP
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": JWTWebsocketAuthMiddleware(URLRouter(websocket_urlpatterns)),
    }
)
