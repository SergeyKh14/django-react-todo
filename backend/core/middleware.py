"""
ASGI middleware for WebSocket authentication.

Populates scope["user"] based on the JWT access token so that WebSocket
consumers can rely on the same user model as REST views.

Token source:
- Query string: ?token=<token>
"""

from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication


class JWTWebsocketAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)
        self.jwt_auth = JWTAuthentication()

    async def __call__(self, scope, receive, send):
        scope["user"] = await self._get_user_from_scope(scope)
        return await super().__call__(scope, receive, send)

    async def _get_user_from_scope(self, scope):
        raw_token = self._get_token_from_query(scope.get("query_string", b""))

        if not raw_token:
            return AnonymousUser()

        try:
            validated = self.jwt_auth.get_validated_token(raw_token.encode("utf-8"))
            user = await database_sync_to_async(self.jwt_auth.get_user)(validated)
            return user
        except Exception:  # type: ignore[too-general-exception]
            # Invalid or expired token -> anonymous user
            return AnonymousUser()

    def _get_token_from_query(self, query_string: bytes | str):
        if not query_string:
            return None
        if isinstance(query_string, bytes):
            query_string = query_string.decode("utf-8")
        params = parse_qs(query_string)
        values = params.get("token")
        if values:
            return values[0]
        return None
