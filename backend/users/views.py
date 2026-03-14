from typing import cast

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import CustomTokenObtainPairSerializer, RegisterSerializer, UserSerializer


class LoginView(TokenObtainPairView):
    """POST /auth/login/ – accept email + password, return user + access token."""

    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(APIView):
    """POST /auth/register/ – create user, return user + access & refresh tokens."""

    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        """Handle user registration."""
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = cast(User, serializer.save())
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "token": str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /auth/me/ – current user profile."""

    serializer_class = UserSerializer

    def get_object(self):
        """Return the currently authenticated user."""
        return self.request.user
