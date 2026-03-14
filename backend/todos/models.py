import uuid

from django.conf import settings
from django.db import models


class Board(models.Model):
    """A workspace board owned by one user and shared with members."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_boards",
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="BoardMembership",
        related_name="boards",
        blank=True,
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        """Return the board title."""
        return str(self.title)


class BoardMembership(models.Model):
    """Through model storing a user's role and invite status on a board."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Role(models.TextChoices):
        """Available membership roles."""

        ADMIN = "admin", "Admin"  # type: ignore[assignment]
        MEMBER = "member", "Member"  # type: ignore[assignment]

    class Status(models.TextChoices):
        """Invitation acceptance states."""

        PENDING = "pending", "Pending"  # type: ignore[assignment]
        ACCEPTED = "accepted", "Accepted"  # type: ignore[assignment]

    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="board_memberships",
    )
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Enforce one membership record per user per board."""

        unique_together = ("board", "user")

    def __str__(self) -> str:
        """Return a readable representation of the membership."""
        return f"{self.user} – {self.board} ({self.role}, {self.status})"


class Task(models.Model):
    """A task belonging to a board."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Priority(models.TextChoices):
        """Task urgency levels."""

        LOW = "low", "Low"  # type: ignore[assignment]
        MEDIUM = "medium", "Medium"  # type: ignore[assignment]
        HIGH = "high", "High"  # type: ignore[assignment]

    class Status(models.TextChoices):
        """Task workflow stages."""

        TODO = "todo", "To Do"  # type: ignore[assignment]
        IN_PROGRESS = "in_progress", "In Progress"  # type: ignore[assignment]
        DONE = "done", "Done"  # type: ignore[assignment]

    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="tasks")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_tasks",
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tasks",
    )
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.TODO)
    order = models.PositiveIntegerField(default=0)  # type: ignore[arg-type]
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        """Return the task title."""
        return str(self.title)
