from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Read/write serializer for User (me, register response). Email is read-only."""

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name")
        read_only_fields = ("id", "email")

    def update(self, instance, validated_data):
        """Update user; email is never changed (enforced in addition to read_only_fields)."""
        validated_data.pop("email", None)
        return super().update(instance, validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for registration: first_name, last_name, email, password."""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "password")
        read_only_fields = ("id",)

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT serializer that accepts 'email' and 'password', returns user + token."""

    def validate(self, attrs):
        token_data = super().validate(attrs)
        return {
            "user": UserSerializer(self.user).data,
            "token": token_data["access"],
        }
