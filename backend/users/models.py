import uuid
from typing import Any, ClassVar

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Manager for custom User with email as the unique identifier."""

    def create_user(
        self,
        *,
        email: str,
        password: str,
        **extra_fields: Any,
    ) -> "User":
        """Create and save a user with the given email and password."""
        if not email:
            raise ValueError("Users must have an email address.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(
        self,
        *,
        email: str,
        password: str,
        **extra_fields: Any,
    ) -> "User":
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email=email, password=password, **extra_fields)


class User(AbstractUser):
    """Custom user with email as the unique identifier."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None
    email = models.EmailField("email address", unique=True)

    first_name = models.CharField("first name", max_length=150)
    last_name = models.CharField("last name", max_length=150)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects: ClassVar[UserManager] = UserManager()  # type: ignore[assignment]

    def __str__(self):
        """Return the user's email address."""
        return self.email

    @property
    def full_name(self) -> str:
        """Return the user's full name (first_name + last_name)."""
        return f"{self.first_name} {self.last_name}".strip()
